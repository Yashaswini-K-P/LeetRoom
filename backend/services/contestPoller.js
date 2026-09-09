const { getContestState, removeContestState } = require("./roomManager.js");
const Room = require("../models/room.js");

async function fetchUserSubmissions(username) {
  try {
    const response = await fetch(`${process.env.LEETCODE_API_URL}/${username}`);
    const text = await response.text();

    if (
      !response.ok ||
      text.startsWith("<") ||
      text.startsWith("Too many requests")
    ) {
      return [];
    }
    const data = JSON.parse(text);
    return Array.isArray(data) ? data : data.recentSubmissions || [];
  } catch (err) {
    console.log(`Failed fetching submissions for ${username}:`, err.message);
    return [];
  }
}

async function runPollCycle(io, roomCode) {
  const contest = getContestState(roomCode);
  if (!contest) return;

  const now = Date.now();
  console.log(
    "Poller fired at:",
    new Date().toLocaleTimeString(),
    "for room:",
    roomCode,
  );
  const gracePeriod = contest.endTime + 15 * 60 * 1000;

  if (now > gracePeriod) {
    await finalizeContest(io, roomCode);
    return;
  }
  console.log(`Polling leaderboard updates for room: ${roomCode}`);

  let delay = 0;
  for (const [username, userData] of contest.participants.entries()) {
    setTimeout(async () => {
      const submissions = await fetchUserSubmissions(username);

      submissions.forEach((sub) => {
        const subTimeStamp = Number(sub.timestamp) * 1000;
        const slug = sub.titleSlug;
        const subId = sub.id;

        if (subTimeStamp >= contest.startTime && subTimeStamp <= gracePeriod) {
          const matchedProblem = contest.adminProblems.find(
            (p) => p.titleSlug == slug,
          );
          if (matchedProblem) {
            if (!userData.solvedProblems.has(slug)) {
              userData.solvedProblems.set(slug, {
                submissionId: subId,
                timestamp: subTimeStamp,
              });
              userData.totalScore += matchedProblem.points;

              if (
                userData.tieBreakerTime === 0 ||
                subTimeStamp < userData.tieBreakerTime
              ) {
                userData.tieBreakerTime = subTimeStamp;
              }
            }
          }
        }
      });
    }, delay);
    delay += 1500;
  }
  setTimeout(() => {
    broadcastLeaderboard(io, roomCode);
  }, delay + 1000);
}

function startContestPolling(io, roomCode) {
  const contest = getContestState(roomCode);
  console.log(
    `Looking up contest for room ${roomCode}:`,
    contest ? "Found!" : "Not found in memory!",
  );

  if (!contest) return;

  if (contest.intervalId) {
    console.log(`Polling is already running for room: ${roomCode}`);
    return;
  }

  console.log(
    `🚀 Polling function initialized and starting for room: ${roomCode}`,
  );

  // Run immediately upon starting instead of waiting for the first interval tick
  runPollCycle(io, roomCode);

  const INTERVAL_TIME = 15 *60* 1000;

  contest.intervalId = setInterval(() => {
    runPollCycle(io, roomCode);
  }, INTERVAL_TIME);
}

async function broadcastLeaderboard(io, roomCode) {
  const contest = getContestState(roomCode);
  if (!contest) return;

  console.log(
    `Broadcasting for room ${contest.participants.size} participants tracked in memory.`,
  );

  const room = await Room.findOne({ roomCode });
  if (!room) return;

  const leaderboard = Array.from(contest.participants.values()).map((p) => ({
    leetcodeUsername: p.leetcodeUsername,
    totalScore: p.totalScore,
    lastSubmitted: p.tieBreakerTime,
    solvedCount: p.solvedProblems.size,
    solvedSlugs: Array.from(p.solvedProblems.keys()),
  }));

  leaderboard.sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    return a.lastSubmitted - b.lastSubmitted;
  });

  const usersWithScores = room.participants.map((p) => {
    const contestData = contest.participants.get(p.leetcodeUsername);
    const solvedMap = contestData?.solvedProblems || new Map();

    return {
      ...(typeof p.toObject === "function" ? p.toObject() : p),
      totalScore: contestData?.totalScore || 0,
      solvedCount: solvedMap.size,
      solvedProblems: Object.fromEntries(solvedMap),
      tieBreakerTime: contestData?.tieBreakerTime || 0,
      lastSubmitted: contestData?.tieBreakerTime || 0,
    };
  });

  // 👉 Sort usersWithScores too so frontend gets it pre-sorted
  usersWithScores.sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    return (a.tieBreakerTime || Infinity) - (b.tieBreakerTime || Infinity);
  });

  io.to(roomCode).emit("leaderboard-update", leaderboard);
  io.to(roomCode).emit("room-update", {
    users: usersWithScores,
    status: room.status || "ACTIVE",
    startTime: room.startTime,
    endTime: room.endTime,
    problems: room.adminProblems,
  });
}

async function finalizeContest(io, roomCode) {
  const contest = getContestState(roomCode);
  if (!contest) return;

  console.log(`Finalizing contest for room: ${roomCode}`);

  const finalLeaderboard = Array.from(contest.participants.values())
    .map((p) => ({
      leetcodeUsername: p.leetcodeUsername,
      totalScore: p.totalScore,
      tieBreakerTime: p.tieBreakerTime,
      solvedCount: p.solvedProblems.size,
    }))
    .sort(
      (a, b) =>
        b.totalScore - a.totalScore || a.tieBreakerTime - b.tieBreakerTime,
    );

  await Room.findOneAndUpdate(
    { roomCode },
    {
      status: "Ended",
      finalLeaderboard: finalLeaderboard,
    },
  );
  io.to(roomCode).emit("contest-ended", { leaderboard: finalLeaderboard });
  removeContestState(roomCode);
}

module.exports = { startContestPolling };

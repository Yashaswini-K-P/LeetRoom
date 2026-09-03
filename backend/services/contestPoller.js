import { getContestState, removeContestState } from "./roomManager.js";
import Room from "../models/room.js";

async function fetchUserSubmissions(username) {
  try {
    const response = await fetch(
      `${process.env.LEETCODE_API_URL}/${username}/acSubmission?limit=10`,
    );
    console.log(response);
    const text = await response.text();

    if (
      !response.ok ||
      text.startsWith("<") ||
      text.startsWith("Too many requests")
    ) {
      return [];
    }
    const data = JSON.parse(text);
    return Array.isArray(data) ? data : data.submission || [];
  } catch (err) {
    console.log(`Failed fetching submissions for ${username}:`, err.message);
    return [];
  }
}

export function startContestPolling(io, roomCode) {
  const contest = getContestState(roomCode);
  if (!contest) return;

  const INTERVAL_TIME = 5 * 60 * 1000;

  contest.intervalId = setInterval(async () => {
    const now = Date.now();
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

          if (
            subTimeStamp >= contest.startTime &&
            subTimeStamp <= gracePeriod
          ) {
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

                if (subTimeStamp > userData.tieBreakerTime) {
                  userData.tieBreakerTime = subTimestamp;
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
  }, INTERVAL_TIME);
}

function broadcastLeaderboard(io, roomCode) {
  const contest = getContestState(roomCode);
  if (!contest) return;

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

  io.to(roomCode).emit("leaderboard-update", leaderboard);
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

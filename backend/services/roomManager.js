const activeContests = new Map();

const initializeContest = (room) => {
  const participantsMap = new Map();

  room.participants.forEach((p) => {
    participantsMap.set(p.leetcodeUsername, {
      leetcodeUsername: p.leetcodeUsername,
      totalScore: 0,
      solvedProblems: new Map(),
      tieBreakerTime: 0,
    });
  });

  activeContests.set(room.roomCode, {
    startTime: new Date(room.startTime).getTime(),
    endTime: new Date(room.endTime).getTime(),
    adminProblems: room.adminProblems || [],
    participants: participantsMap,
    intervalId: null,
  });
};

const getContestState = (roomCode) => activeContests.get(roomCode);

const removeContestState = (roomCode) => {
  const contest = activeContests.get(roomCode);
  if (contest && contest.intervalId) {
    clearInterval(contest.intervalId);
  }
  activeContests.delete(roomCode);
};

module.exports = {
  initializeContest,
  getContestState,
  removeContestState,
};

const activeContests = new Map();

export const initializeContest = (room) => {
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

export const getContestState = (roomCode) => activeContests.get(roomCode);

export const removeContestState = (roomCode) => {
  const contest = activeContests.get(roomCode);
  if (contest && contest.intervalId) {
    clearInterval(contest.intervalId);
  }
  activeContests.delete(roomCode);
};

const { roomState } = require("../storage/roomStore.js");

const createRoom = (req, res) => {
  const { problems, startTime, endTime } = req.body;
  const roomCode = Math.random().toString(36).substring(2, 8);

  roomState.set(roomCode, {
    adminProblems: problems || [],
    startTime: startTime || null,
    endTime: endTime || null,
    participants: new Map(),
  });

  res.status(201).json({
    success: true,
    roomCode: roomCode,
  });
};

const checkRoom = (req, res) => {
  const { roomCode } = req.params;
  const exists = roomState.has(roomCode);
  res.status(200).json({
    exists: exists,
  });
};

module.exports = {
  createRoom,
  checkRoom,
};

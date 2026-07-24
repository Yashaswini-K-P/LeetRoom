const createRoom = (req, res) => {
  const roomCode = Math.random().toString(36).substring(2, 8);
  res.status(201).json({
    success: true,
    roomCode: roomCode,
  });
};

module.exports = {
  createRoom,
};

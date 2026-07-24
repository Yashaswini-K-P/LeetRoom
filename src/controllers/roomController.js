const activeRooms = new Set();

const createRoom = (req, res) => {
  const roomCode = Math.random().toString(36).substring(2, 8);
  activeRooms.add(roomCode);
  res.status(201).json({
    success: true,
    roomCode: roomCode,
  });
};

const checkRoom = (req, res)=>{
  const { roomCode } = req.params;
  const exists = activeRooms.has(roomCode);
  res.status(200).json({
    exists:exists
  });
}
module.exports = {
  createRoom,
  checkRoom,
};

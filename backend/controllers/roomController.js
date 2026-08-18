const Room = require("../models/room.js");

const createRoom = async (req, res) => {
  try {
    const { problems, startTime, endTime } = req.body;
    const roomCode = Math.random().toString(36).substring(2, 8);

    const formattedProblems = (problems || []).map((p) => ({
      titleSlug: p.name.trim().toLowerCase().replace(/\s+/g, "-"),
      points: Number(p.points) || 10,
    }));

    const newRoom = await Room.create({
      roomCode,
      adminProblems: formattedProblems,
      startTime,
      endTime,
      currentStatus: "upcoming",
      participants: [],
    });

    return res.status(201).json({
      success: true,
      roomCode: newRoom.roomCode,
      message: "Room created successfully in MongoDB",
    });
  } catch (err) {
    console.error("Error creating room:", err);
    return res.status(500).json({ error: "Failed to create room" });
  }
};

const checkRoom = async (req, res) => {
  try {
    const { roomCode } = req.params;
    const exists = await Room.findOne({ roomCode });
    if (exists) {
      return res.status(200).json({ exists: true });
    }
    return res.status(404).json({ exists: false, error: "Room not found" });
  } catch (err) {
    console.error("Error checking room:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

async function verifyLeetcodeUser(username) {
  if (!username || username === "Anonymous") return false;
  try {
    const baseUrl = process.env.LEETCODE_API_URL;
    const response = await fetch(`${baseUrl}/${username}`);
    const data = await response.json();

    if (data && data.errors) return false;
    return true;
  } catch (err) {
    console.log("Error verifying leetcode username:", err);
    return false;
  }
}

module.exports = {
  createRoom,
  checkRoom,
  verifyLeetcodeUser,
};

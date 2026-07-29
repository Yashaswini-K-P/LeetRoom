const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema({
  socketId: { type: String, required: true },
  leetcodeUsername: { type: String, required: true },
});

const roomSchema = new mongoose.Schema({
  roomCode: { type: String, required: true, unique: true },
  adminProblems: { type: [String], default: [] },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  currentStatus: {
    type: String,
    enum: ["upcoming", "ongoing", "ended"],
    default: "upcoming",
  },
  participants: [participantSchema],
});

module.exports = mongoose.model("Room", roomSchema);

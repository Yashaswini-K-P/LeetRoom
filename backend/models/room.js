const mongoose = require("mongoose");

const solvedProblemSchema = new mongoose.Schema(
  {
    titleSlug: { type: String, required: true },
    submissionId: { type: String, required: true },
    timestamp: { type: Number, required: true },
  },
  { _id: false },
);

const participantSchema = new mongoose.Schema({
  socketId: { type: String, required: true },
  leetcodeUsername: { type: String, required: true },
  totalScore: { type: Number, default: 0 },
  tieBreakerTime: { type: Number, default: 0 },
  solvedProblems: {
    type: Map,
    of: solvedProblemSchema,
    default: new Map(),
  },
});

const roomSchema = new mongoose.Schema({
  roomCode: { type: String, required: true, unique: true },
  adminProblems: [
    {
      titleSlug: { type: String, required: true },
      points: { type: Number, required: true, default: 10 },
    },
  ],
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

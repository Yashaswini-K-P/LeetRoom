const Room = require("../models/room.js");
const { getContestStatus } = require("../controllers/contest.js");
const { verifyLeetcodeUser } = require("../controllers/roomController.js");
const { startContestPolling } = require("../services/contestPoller.js");
const {
  initializeContest,
  getContestState,
} = require("../services/roomManager.js");

const setupSocketHandlers = (io) => {
  io.on("connection", (client) => {
    console.log("A user connected:", client.id);
    client.on("join-room", async ({ roomCode, leetcodeUsername }, callback) => {
      const safeCallback = typeof callback === "function" ? callback : () => {};
      try {
        const room = await Room.findOne({ roomCode });
        if (!room) {
          return safeCallback({
            success: false,
            message:
              "Room does not exist. Please ask the admin for a valid room code.",
          });
        }
        client.join(roomCode);
        const username = leetcodeUsername ? leetcodeUsername.trim() : "";
        const isViewer = !username || username === "Viewer";

        if (!isViewer) {
          const isValidUser = await verifyLeetcodeUser(username);
          if (!isValidUser) {
            return safeCallback({
              success: false,
              message: "Invalid Leetcode Username!",
            });
          }

          const existingParticipant = room.participants.find(
            (p) => p.leetcodeUsername === leetcodeUsername,
          );

          if (!existingParticipant) {
            room.participants.push({
              socketId: client.id,
              leetcodeUsername: leetcodeUsername,
            });
            await room.save();
          } else {
            existingParticipant.socketId = client.id;
            await room.save();
          }

          console.log(`User ${client.id} joined room: ${roomCode}`);

          let contest = getContestState(roomCode);
          if (!contest) {
            initializeContest(room);
            contest = getContestState(roomCode);
          } else {
            // Add user to active poll map if they just joined dynamically
            if (!contest.participants.has(leetcodeUsername)) {
              contest.participants.set(leetcodeUsername, {
                leetcodeUsername: leetcodeUsername,
                totalScore: 0,
                solvedProblems: new Map(),
                tieBreakerTime: 0,
              });
            }
          }
          startContestPolling(io, roomCode);
        }

        const contestStatus = getContestStatus(room.startTime, room.endTime);
        const contest = getContestState(roomCode);

        // Enrich database participants with live memory score metrics
        const usersWithScores = room.participants.map((p) => {
          const contestData = contest?.participants?.get(p.leetcodeUsername);
          return {
            ...(typeof p.toObject === "function" ? p.toObject() : p),
            totalScore: contestData?.totalScore || 0,
            solvedProblems: contestData?.solvedProblems
              ? Object.fromEntries(contestData.solvedProblems)
              : {},
            tieBreakerTime: contestData?.tieBreakerTime || 0,
          };
        });

        io.to(roomCode).emit("room-update", {
          users: usersWithScores,
          status: contestStatus,
          startTime: room.startTime,
          endTime: room.endTime,
          problems: room.adminProblems,
        });
        safeCallback({ success: true });
      } catch (err) {
        console.error("Error joining room via socket:", err);
        safeCallback({ success: false, message: "Server error" });
      }
    });

    client.on("disconnect", async () => {
      console.log("A user disconnected (retaining room state):", client.id);
      // Room deletion and participant removal logic removed entirely
      // Rooms will stay persistent in the database regardless of user connections.
    });
  });

  setInterval(async () => {
    try {
      const rooms = await Room.find({});
      for (const room of rooms) {
        const newStatus = getContestStatus(room.startTime, room.endTime);
        if (room.currentStatus != newStatus) {
          room.currentStatus = newStatus;
          await room.save();

          console.log(`Room ${room.roomCode} status changed to: ${newStatus}`);

          const contest = getContestState(room.roomCode);
          const usersWithScores = room.participants.map((p) => {
            const contestData = contest?.participants?.get(p.leetcodeUsername);
            return {
              ...(typeof p.toObject === "function" ? p.toObject() : p),
              totalScore: contestData?.totalScore || 0,
              solvedProblems: contestData?.solvedProblems
                ? Object.fromEntries(contestData.solvedProblems)
                : {},
              tieBreakerTime: contestData?.tieBreakerTime || 0,
            };
          });

          io.to(room.roomCode).emit("room-update", {
            users: usersWithScores,
            status: newStatus,
            startTime: room.startTime,
            endTime: room.endTime,
            problems: room.adminProblems,
          });
        }
      }
    } catch (err) {
      console.log("Error in status check interval:", err);
    }
  }, 5000);
};

module.exports = { setupSocketHandlers };

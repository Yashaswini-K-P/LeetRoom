const Room = require("../models/room.js");
const { getContestStatus } = require("../controllers/contest.js");
const { verifyLeetcodeUser } = require("../controllers/roomController.js");

const setupSocketHandlers = (io) => {
  io.on("connection", (client) => {
    console.log("A user connected:", client.id);
    client.on("join-room", async ({ roomCode, leetcodeUsername }, callback) => {
      const safeCallback = typeof callback === "function" ? callback : () => {};
      try {
        const username = leetcodeUsername ? leetcodeUsername.trim() : "";
        const isValidUser = await verifyLeetcodeUser(username);

        if (!isValidUser) {
          return safeCallback({
            success: false,
            message: "Invalid Leetcode Username!",
          });
        }
        const room = await Room.findOne({ roomCode });
        if (!room) {
          return safeCallback({
            success: false,
            message:
              "Room does not exist. Please ask the admin for a valid room code.",
          });
        }
        client.join(roomCode);

        const existingParticipantIndex = room.participants.findIndex(
          (p) => p.socketId === client.id,
        );

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

        const contestStatus = getContestStatus(room.startTime, room.endTime);
        const usersInRoom = room.participants;

        io.to(roomCode).emit("room-update", {
          users: usersInRoom,
          status: contestStatus,
          startTime: room.startTime,
          endTime: room.endTime,
        });
        safeCallbackcallback({ success: true });
      } catch (err) {
        console.error("Error joining room via socket:", err);
        safeCallback({ success: false, message: "Server error" });
      }
    });
    client.on("disconnect", async () => {
      console.log("A user disconnected", client.id);
      try {
        const rooms = await Room.find({ "participants.socketId": client.id });
        for (const room of rooms) {
          room.participants = room.participants.filter(
            (p) => p.socketId !== client.id,
          );
          if (room.participants.length === 0) {
            await Room.deleteOne({ roomCode: room.roomCode });
            continue;
          }
          await room.save();
          const usersInRoom = room.participants;
          io.to(room.roomCode).emit("room-update", {
            users: usersInRoom,
            status: room.currentStatus,
            startTime: room.startTime,
            endTime: room.endTime,
          });
        }
      } catch (err) {
        console.log("Error handling disconnect:", err);
      }
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
          const usersInRoom = room.participants;
          io.to(room.roomCode).emit("room-update", {
            users: usersInRoom,
            status: newStatus,
            startTime: room.startTime,
            endTime: room.endTime,
          });
        }
      }
    } catch (err) {
      console.log("Error in status check interval:", err);
    }
  }, 5000);
};
module.exports = { setupSocketHandlers };

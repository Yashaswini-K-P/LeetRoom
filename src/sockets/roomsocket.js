const { roomState } = require("./storage/roomStore.js");
const { getContestStatus } = require("./controllers/contest.js");

const setupSocketHandlers = (io) => {
  io.on("connection", (client) => {
    console.log("A user connected:", client.id);
    client.on("join-room", ({ roomCode, leetcodeUsername }) => {
      if (!roomState.has(roomCode)) {
        client.emit(
          "error-message",
          "Room does not exist. Please ask the admin for a valid room code.",
        );
        return;
      }
      client.join(roomCode);
      const room = roomState.get(roomCode);

      room.participants.set(client.id, {
        socketId: client.id,
        leetcodeUsername: leetcodeUsername,
      });

      console.log(`User ${client.id} joined room: ${roomCode}`);

      const contestStatus = getContestStatus(room.startTime, room.endTime);
      const usersInRoom = Array.from(room.participants.values());

      io.to(roomCode).emit("room-update", {
        users: usersInRoom,
        status: contestStatus,
        startTime: room.startTime,
        endTime: room.endTime,
      });
    });
    client.on("disconnect", () => {
      console.log("A user disconnected", client.id);

      roomState.forEach((room, roomCode) => {
        const participants = room.participants;
        if (participants.has(client.id)) {
          participants.delete(client.id);
          if (participants.size == 0) {
            roomState.delete(roomCode);
          } else {
            const usersInRoom = Array.from(participants.values());
            io.to(roomCode).emit("room-update", {
              users: usersInRoom,
              status: room.currentStatus,
              startTime: room.startTime,
              endTime: room.endTime,
            });
          }
        }
      });
    });
  });

  setInterval(() => {
    roomState.forEach((room, roomCode) => {
      const newStatus = getContestStatus(room.startTime, room.endTime);

      if (room.currentStatus != newStatus) {
        room.currentStatus = newStatus;
        console.log(`Room ${roomCode} status changed to: ${newStatus}`);
        const usersInRoom = Array.from(room.participants.values());

        io.to(roomCode).emit("room-update", {
          users: usersInRoom,
          status: newStatus,
          startTime: room.startTime,
          endTime: room.endTime,
        });
      }
    });
  }, 5000);
};

module.exports = { setupSocketHandlers };

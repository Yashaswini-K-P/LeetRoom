const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const roomRoutes = require("./routes/roomRoutes.js");
const { roomState } = require('./storage/roomStore.js');
const { getContestStatus } = require('./controllers/contest.js');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

app.use("/api/rooms", roomRoutes);

io.on("connection", (client) => {
  console.log("A user connected:", client.id);
  client.on('join-room', ({roomCode, leetcodeUsername}) => {

    if(!roomState.has(roomCode)){
      client.emit('error-message', 'Room does not exist. Please ask the admin for a valid room code.');
      return;
    }
    client.join(roomCode);
    const room = roomState.get(roomCode);

    room.participants.set(client.id, {
      socketId: client.id, 
      leetcodeUsername: leetcodeUsername, 
    })

    console.log(`User ${client.id} joined room: ${roomCode}`);

    const contestStatus = getContestStatus(room.startTime, room.endTime);

    const usersInRoom = Array.from(room.participants.values());
    io.to(roomCode).emit('room-update', {
      users: usersInRoom,
      status: contestStatus,
      startTime: room.startTime,
      endTime: room.endTime,
      });
  });
  client.on("disconnect", () => {
    console.log("A user disconnected", client.id);

    roomState.forEach((room, roomCode)=>{
      const participants = room.participants;
      if(participants.has(client.id)){
        participants.delete(client.id);
        if(participants.size==0){
          roomState.delete(roomCode);
        }else{
          const usersInRoom = Array.from(participants.values());
          io.to(roomCode).emit("room-update", usersInRoom);
        }
      }
    })
  });
});

server.listen(5000, () => {
  console.log("server running in port 5000");
});

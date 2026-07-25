const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const roomRoutes = require("./routes/roomRoutes.js");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

app.use("api/rooms", roomRoutes);

const roomParticipants = new Map();

io.on("connection", (client) => {
  console.log("A user connected:", client.id);
  client.on('join-room', ({roomCode, leetcodeUsername}) => {

    if(!roomParticipants.has(roomCode)){
      client.emit('error-message', 'Room does not exist. Please ask the admin for a valid room code.');
      return;
    }
    client.join(roomCode);
    console.log(`User ${client.id} joined room: ${roomCode}`);

    const usersInRoom = Array.from(roomParticipants.get(roomCode).values());
    io.to(roomCode).emit('room-update', usersInRoom);
  });
  client.on("disconnect", () => {
    console.log("A user disconnected", client.id);

    roomParticipants.forEach((participants, roomCode)=>{
      if(participants.has(client.id)){
        participants.delete(client.id);
        if(participants.size()==0){
          roomParticipants.delete(roomCode);
        }else{
          const usersInRoom = Array.from(participants.values);
          io.to(roomCode).emit("room-update", usersInRoom);
        }
      }
    })
  });
});

server.listen(5000, () => {
  console.log("server running in port 5000");
});

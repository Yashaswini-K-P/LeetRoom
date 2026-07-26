const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const roomRoutes = require("./routes/roomRoutes.js");
const { roomState } = require("./storage/roomStore.js");
const { getContestStatus } = require("./controllers/contest.js");
const { setupSocketHandlers } = require("./sockets/roomSocket.js");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

app.use("/api/rooms", roomRoutes);

// Initialize all socket logic from the separate file
setupSocketHandlers(io);

server.listen(5000, () => {
  console.log("server running in port 5000");
});

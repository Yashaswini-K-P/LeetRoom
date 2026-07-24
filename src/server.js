const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const roomRoutes = require("./routes/roomRoutes.js");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

app.use("api/rooms", roomRoutes);

io.on("connection", (client) => {
  console.log("A user connected:", client.id);
  client.on("event", (data) => {});
  client.on("disconnect", () => {
    console.log("A user disconnected", client.id);
  });
});
server.listen(5000, () => {
  console.log("server running in port 5000");
});

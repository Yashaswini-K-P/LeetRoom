import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import CreateRoom from "./components/CreateRoom";
import JoinRoom from "./components/joinRoom.jsx";
import Room from "./components/Room";
import { socket } from "./socket.js";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/create" element={<CreateRoom />} />
      <Route path="/join" element={<JoinRoom />} />
      <Route path="/room/:roomCode" element={<Room socket={socket} />} />
    </Routes>
  );
}
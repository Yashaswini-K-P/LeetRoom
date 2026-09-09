import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import CreateRoom from "./components/CreateRoom";
import JoinRoom from "./components/JoinRoom";
import Room from "./components/Room";
import Leaderboard from "./components/LeaderboardModal";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/create" element={<CreateRoom />} />
      <Route path="/join" element={<JoinRoom />} />
      <Route path="/room/:roomCode" element={<Room />} />
      <Route path="/room/:roomCode/leaderboard" element={<Leaderboard />} />
    </Routes>
  );
}

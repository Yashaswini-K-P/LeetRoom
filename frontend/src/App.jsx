import React, { useState } from "react";
import Home from "./components/Home";
import Room from "./components/Room";
import { socket } from "./socket.js";

export default function App() {
  // Tracks active room data. If null, user is on the Home screen.
  const [roomSession, setRoomSession] = useState(null);

  // Called when a room is successfully created or joined
  const handleEnterRoom = ({ roomCode, leetcodeUsername }) => {
    setRoomSession({ roomCode, leetcodeUsername });
  };

  return (
    <div>
      {!roomSession ? (
        <Home
          socket={socket}
          onRoomCreated={handleEnterRoom}
          onRoomJoined={handleEnterRoom}
        />
      ) : (
        <Room
          roomCode={roomSession.roomCode}
          leetcodeUsername={roomSession.leetcodeUsername}
        />
      )}
    </div>
  );
}

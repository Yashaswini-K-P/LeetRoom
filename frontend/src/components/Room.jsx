import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Container,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
} from "@mui/material";
import { socket } from "../socket.js";
import LeaderboardModal from "./LeaderboardModal.jsx";

export default function Room({ roomCode, leetcodeUsername }) {
  const [status, setStatus] = useState("Loading...");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [participants, setParticipants] = useState([]);
  const [problems, setProblems] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  useEffect(() => {
    const onConnect = () => {
      console.log("Socket connected! Joining room:", roomCode);
      socket.emit("join-room", { roomCode, leetcodeUsername });
    };

    socket.on("connect", onConnect);

    socket.on("room-update", (data) => {
      console.log("Received room update:", data);
      if (data.status) setStatus(data.status);
      if (data.startTime) setStartTime(data.startTime);
      if (data.endTime) setEndTime(data.endTime);
      if (data.users) setParticipants(data.users);
      if (data.problems) setProblems(data.problems);
    });

    socket.on("leaderboard-update", (leaderboardData) => {
      console.log("Received live leaderboard update:", leaderboardData);
      setParticipants(leaderboardData);
    });

    socket.on("error-message", (msg) => {
      setErrorMessage(msg);
    });

    socket.connect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("room-update");
      socket.off("error-message");
      socket.disconnect();
    };
  }, [roomCode, leetcodeUsername]);

  const canViewLeaderboard = status === "ongoing" || status === "ended";
  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
          Contest Room: {roomCode}
        </Typography>

        {errorMessage && (
          <Typography color="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Typography>
        )}

        {/* Contest Status & Details */}
        <Box sx={{ my: 3, display: "flex", gap: 2, alignItems: "center" }}>
          <Typography variant="h6">Status:</Typography>
          <Chip
            label={status.toUpperCase()}
            color={
              status === "ongoing"
                ? "success"
                : status === "upcoming"
                  ? "warning"
                  : "default"
            }
            fontWeight="bold"
          />
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body1">
            <strong>Start Time:</strong>{" "}
            {startTime ? new Date(startTime).toLocaleString() : "N/A"}
          </Typography>
          <Typography variant="body1">
            <strong>End Time:</strong>{" "}
            {endTime ? new Date(endTime).toLocaleString() : "N/A"}
          </Typography>
        </Box>

        {canViewLeaderboard && (
          <Button
            variant="contained"
            color="secondary"
            fullWidth
            sx={{ mb: 3, py: 1.5, fontWeight: "bold" }}
            onClick={() => setShowLeaderboard(true)}
          >
            View Leaderboard
          </Button>
        )}

        {/* Live Participants List */}
        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
          {status === "upcoming"
            ? "Waiting Participants"
            : status === "ongoing"
              ? "Live Participants"
              : "Participants"}
          ({participants.length})
        </Typography>

        <Paper
          variant="outlined"
          sx={{ maxHeight: 200, overflow: "auto", p: 1 }}
        >
          <List>
            {participants.map((user, index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={user.leetcodeUsername}
                  secondary={`Socket ID: ${user.socketId}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Paper>

      <LeaderboardModal
        open={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        roomCode={roomCode}
        problems={problems}
        participants={participants}
      />
    </Container>
  );
}

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
} from "@mui/material";
import { socket } from "../socket.js";

export default function Room({ roomCode, leetcodeUsername }) {
  const [status, setStatus] = useState("Loading...");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [participants, setParticipants] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

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

        {/* Live Participants List */}
        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
          Live Participants ({participants.length})
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
    </Container>
  );
}

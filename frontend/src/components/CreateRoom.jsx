import React, { useState } from "react";
import { Container, Paper, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../config.js";

export default function CreateRoom() {
  const navigate = useNavigate();
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [problemInputs, setProblemInputs] = useState([{ name: "", points: 10 }]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BACKEND_URL}/api/rooms/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problems: problemInputs, startTime, endTime }),
      });
      const data = await response.json();
      if (data.success) {
        navigate(`/room/${data.roomCode}`, { state: { leetcodeUsername } });
      } else {
        setErrorMessage("Failed to create room.");
      }
    } catch (err) {
      setErrorMessage("Server error while creating room.");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0b0f19", display: "flex", alignItems: "center", justifyContent: "center", py: 4 }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ p: 4, bgcolor: "rgba(18, 24, 38, 0.85)", borderRadius: "24px", color: "#f8fafc" }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Configure Contest Room</Typography>
          {errorMessage && <Typography color="error">{errorMessage}</Typography>}
          <Box component="form" onSubmit={handleCreateSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <input placeholder="LeetCode Username" value={leetcodeUsername} onChange={(e) => setLeetcodeUsername(e.target.value)} required />
            <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
            <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
            <Button type="submit" variant="contained">Generate & Enter Room</Button>
            <Button onClick={() => navigate("/")} sx={{ color: "#94a3b8" }}>Back to Home</Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
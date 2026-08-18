import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
} from "@mui/material";
import { BACKEND_URL } from "../config.js";

export default function Home({ onRoomCreated, onRoomJoined }) {
  const [view, setView] = useState("home");

  const [problems, setProblems] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [numQuestions, setNumQuestions] = useState(1);
  const [problemInputs, setProblemInputs] = useState([
    { name: "", points: 10 },
  ]);

  const handleNumQuestionsChange = (val) => {
    if (val === "") {
      setNumQuestions("");
      setProblemInputs([]);
      return;
    }
    const parsed = parseInt(val, 10);
    if (isNaN(parsed)) return;

    const count = Math.min(Math.max(1, parsed), 10);
    setNumQuestions(count);
    setProblemInputs((prev) => {
      const updated = [...prev];
      if (count > updated.length) {
        for (let i = updated.length; i < count; i++) {
          updated.push({ name: "", points: 10 });
        }
      } else {
        updated.length = count;
      }
      return updated;
    });
  };

  const handleProblemFieldChange = (index, field, value) => {
    const updated = [...problemInputs];
    updated[index][field] = value;
    setProblemInputs(updated);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      alert("Error: End time must be later than the start time");
      return;
    }
    if (!numQuestions || numQuestions < 1) {
      setErrorMessage("Please enter a valid number of questions.");
      return;
    }

    for (let i = 0; i < problemInputs.length; i++) {
      if (!problemInputs[i].name.trim()) {
        setErrorMessage(`Please enter the name for Problem ${i + 1}.`);
        return;
      }
    }

    try {
      const problemArray = problems
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);

      const response = await fetch(`${BACKEND_URL}/api/rooms/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problems: problemArray, startTime, endTime }),
      });
      const data = await response.json();

      if (data.success) {
        onRoomCreated({ roomCode: data.roomCode, leetcodeUsername });
      } else {
        setErrorMessage("Failed to create room.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Server error while creating room.");
    }
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/rooms/check/${roomCode}`,
      );
      const data = await response.json();

      if (data.exists) {
        onRoomJoined({ roomCode, leetcodeUsername });
      } else {
        setErrorMessage("Room does not exist. Please check the code.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Server error while checking room.");
    }
  };
  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
          LeetCode Room App
        </Typography>

        {errorMessage && (
          <Typography color="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Typography>
        )}

        {/* VIEW 1: HOME SELECTION */}
        {view === "home" && (
          <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => setView("create")}
            >
              Create Room (Admin)
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => setView("join")}
            >
              Join Room
            </Button>
          </Box>
        )}

        {/* VIEW 2: CREATE ROOM FORM */}
        {view === "create" && (
          <Box
            component="form"
            onSubmit={handleCreateSubmit}
            sx={{
              width: "100%",
              mt: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography variant="h6">Create Contest Room</Typography>

            <TextField
              label="Your LeetCode Username (Admin)"
              variant="outlined"
              fullWidth
              required
              value={leetcodeUsername}
              onChange={(e) => setLeetcodeUsername(e.target.value)}
              placeholder="e.g. admin_coder"
            />

            <TextField
              label="Number of Questions"
              type="number"
              fullWidth
              required
              value={numQuestions}
              onChange={(e) => handleNumQuestionsChange(e.target.value)}
              inputProps={{ min: 1, max: 10 }}
            />

            {problemInputs.map((prob, index) => (
              <Box key={index} sx={{ display: "flex", gap: 2 }}>
                <TextField
                  label={`Problem ${index + 1} Name (e.g. Two Sum)`}
                  fullWidth
                  required
                  value={prob.name}
                  onChange={(e) =>
                    handleProblemFieldChange(index, "name", e.target.value)
                  }
                />
                <TextField
                  label="Points"
                  type="number"
                  sx={{ width: "120px" }}
                  required
                  value={prob.points}
                  onChange={(e) =>
                    handleProblemFieldChange(index, "points", e.target.value)
                  }
                />
              </Box>
            ))}

            <TextField
              label="Start Time"
              type="datetime-local"
              inputlabelprops={{ shrink: true }}
              fullWidth
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />

            <TextField
              label="End Time"
              type="datetime-local"
              inputlabelprops={{ shrink: true }}
              fullWidth
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />

            <Button type="submit" variant="contained" size="large" fullWidth>
              Generate & Enter Room
            </Button>
            <Button variant="text" onClick={() => setView("home")}>
              Back
            </Button>
          </Box>
        )}

        {/* VIEW 3: JOIN ROOM FORM */}
        {view === "join" && (
          <Box
            component="form"
            onSubmit={handleJoinSubmit}
            sx={{
              width: "100%",
              mt: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography variant="h6">Join Contest Room</Typography>

            <TextField
              label="LeetCode Username"
              variant="outlined"
              fullWidth
              required
              value={leetcodeUsername}
              onChange={(e) => setLeetcodeUsername(e.target.value)}
              placeholder="e.g. yashu_coder"
            />

            <TextField
              label="Room Code"
              variant="outlined"
              fullWidth
              required
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="e.g. ab34xy"
            />

            <Button type="submit" variant="contained" size="large" fullWidth>
              Join Room
            </Button>
            <Button variant="text" onClick={() => setView("home")}>
              Back
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
}

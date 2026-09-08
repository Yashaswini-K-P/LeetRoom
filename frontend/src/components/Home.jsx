import React, { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
} from "@mui/material";
import { BACKEND_URL } from "../config.js";
import { socket } from "../socket.js";

export default function Home({ socket, onRoomCreated, onRoomJoined }) {
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
      const response = await fetch(`${BACKEND_URL}/api/rooms/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problems: problemInputs, startTime, endTime }),
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

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!leetcodeUsername.trim()) {
      setErrorMessage("Please enter a valid LeetCode username.");
      return;
    }

    if (!roomCode.trim()) {
      setErrorMessage("Please enter a room code.");
      return;
    }

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit(
      "join-room",
      { roomCode: roomCode.trim(), leetcodeUsername: leetcodeUsername.trim() },
      (response) => {
        if (!response || !response.success) {
          setErrorMessage(response?.message || "Failed to join room.");
          return;
        }

        onRoomJoined({
          roomCode: roomCode.trim(),
          leetcodeUsername: leetcodeUsername.trim(),
        });
      },
    );
  };
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#0b0f19",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Sleek Developer Grid & Ambient Animation Styles */}
      <style>
        {`
        @keyframes gridShift {
          0% { background-position: 0 0; }
          100% { background-position: 40px 40px; }
        }
        @keyframes pulseGlow {
          0% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.15); opacity: 0.6; }
          100% { transform: scale(1); opacity: 0.3; }
        }
        .tech-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(to right, rgba(56, 189, 248, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(56, 189, 248, 0.05) 1px, transparent 1px);
          background-size: 40px 40px;
          animation: gridShift 20s linear infinite;
          pointer-events: none;
        }
      `}
        .
      </style>

      {/* Tech Engineering Grid Background */}
      <div className="tech-grid" />

      {/* Ambient Glowing Gradient Orbs */}
      <Box
        sx={{
          position: "absolute",
          width: "500px",
          height: "500px",
          bgcolor: "rgba(56, 189, 248, 0.09)",
          borderRadius: "50%",
          filter: "blur(90px)",
          top: "-10%",
          left: "-10%",
          animation: "pulseGlow 10s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: "450px",
          height: "450px",
          bgcolor: "rgba(129, 140, 248, 0.09)",
          borderRadius: "50%",
          filter: "blur(90px)",
          bottom: "-10%",
          right: "-10%",
          animation: "pulseGlow 8s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="sm" sx={{ zIndex: 1 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            bgcolor: "rgba(18, 24, 38, 0.85)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "24px",
            boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.5)",
            color: "#f8fafc",
          }}
        >
          <Typography
            variant="h4"
            fontWeight="800"
            sx={{
              background: "linear-gradient(45deg, #38bdf8 30%, #818cf8 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.5px",
              mb: 1,
            }}
          >
            LeetCode Room
          </Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8", mb: 3 }}>
            Host or join synchronized coding competitive rooms
          </Typography>

          {errorMessage && (
            <Typography color="error" sx={{ mb: 2, fontSize: "0.875rem" }}>
              {errorMessage}
            </Typography>
          )}

          {/* VIEW 1: HOME SELECTION */}
          {view === "home" && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                gap: 2,
                mt: 2,
              }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => setView("create")}
                sx={{
                  bgcolor: "#38bdf8",
                  color: "#0b0f19",
                  fontWeight: "bold",
                  borderRadius: "12px",
                  py: 1.5,
                  textTransform: "none",
                  fontSize: "1rem",
                  "&:hover": { bgcolor: "#0ea5e9" },
                }}
              >
                Create Room (Admin)
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => setView("join")}
                sx={{
                  borderColor: "rgba(255, 255, 255, 0.2)",
                  color: "#f8fafc",
                  fontWeight: "bold",
                  borderRadius: "12px",
                  py: 1.5,
                  textTransform: "none",
                  fontSize: "1rem",
                  "&:hover": {
                    borderColor: "#38bdf8",
                    bgcolor: "rgba(56, 189, 248, 0.04)",
                  },
                }}
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
                mt: 1,
                display: "flex",
                flexDirection: "column",
                gap: 2.5,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, fontSize: "1.1rem", color: "#e2e8f0" }}
              >
                Configure Contest Room
              </Typography>

              <CustomTextField
                label="Your LeetCode Username (Admin)"
                required
                value={leetcodeUsername}
                onChange={(e) => setLeetcodeUsername(e.target.value)}
                placeholder="e.g. admin_coder"
              />

              <CustomTextField
                label="Number of Questions"
                type="number"
                required
                value={numQuestions}
                onChange={(e) => handleNumQuestionsChange(e.target.value)}
                inputProps={{ min: 1, max: 10 }}
              />

              {problemInputs.map((prob, index) => (
                <Box key={index} sx={{ display: "flex", gap: 2 }}>
                  <CustomTextField
                    label={`Problem ${index + 1} Name`}
                    required
                    value={prob.name}
                    onChange={(e) =>
                      handleProblemFieldChange(index, "name", e.target.value)
                    }
                  />
                  <CustomTextField
                    label="Points"
                    type="number"
                    sx={{ width: "130px" }}
                    required
                    value={prob.points}
                    onChange={(e) =>
                      handleProblemFieldChange(index, "points", e.target.value)
                    }
                  />
                </Box>
              ))}

              <CustomTextField
                label="Start Time"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />

              <CustomTextField
                label="End Time"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                sx={{
                  bgcolor: "#38bdf8",
                  color: "#0b0f19",
                  fontWeight: "bold",
                  borderRadius: "12px",
                  py: 1.5,
                  textTransform: "none",
                  "&:hover": { bgcolor: "#0ea5e9" },
                }}
              >
                Generate & Enter Room
              </Button>
              <Button
                variant="text"
                onClick={() => setView("home")}
                sx={{
                  color: "#94a3b8",
                  textTransform: "none",
                  alignSelf: "center",
                }}
              >
                Back to Home
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
                mt: 1,
                display: "flex",
                flexDirection: "column",
                gap: 2.5,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, fontSize: "1.1rem", color: "#e2e8f0" }}
              >
                Enter Contest Credentials
              </Typography>

              <CustomTextField
                label="LeetCode Username"
                required
                value={leetcodeUsername}
                onChange={(e) => setLeetcodeUsername(e.target.value)}
                placeholder="e.g. yashu_coder"
              />

              <CustomTextField
                label="Room Code"
                required
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="e.g. ab34xy"
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                sx={{
                  bgcolor: "#38bdf8",
                  color: "#0b0f19",
                  fontWeight: "bold",
                  borderRadius: "12px",
                  py: 1.5,
                  textTransform: "none",
                  "&:hover": { bgcolor: "#0ea5e9" },
                }}
              >
                Join Room
              </Button>
              <Button
                variant="text"
                onClick={() => setView("home")}
                sx={{
                  color: "#94a3b8",
                  textTransform: "none",
                  alignSelf: "center",
                }}
              >
                Back to Home
              </Button>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}

function CustomTextField(props) {
  return (
    <TextField
      fullWidth
      variant="outlined"
      {...props}
      sx={{
        "& .MuiOutlinedInput-root": {
          color: "#f8fafc",
          borderRadius: "12px",
          bgcolor: "rgba(11, 15, 25, 0.6)",
          "& fieldset": { borderColor: "rgba(255, 255, 255, 0.12)" },
          "&:hover fieldset": { borderColor: "rgba(56, 189, 248, 0.5)" },
          "&.Mui-focused fieldset": { borderColor: "#38bdf8" },
        },
        "& .MuiInputLabel-root": { color: "#94a3b8" },
        "& .MuiInputLabel-root.Mui-focused": { color: "#38bdf8" },
        ...props.sx,
      }}
    />
  );
}

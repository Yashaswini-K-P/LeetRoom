import React, { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket.js";

export default function JoinRoom() {
  const navigate = useNavigate();
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!leetcodeUsername.trim() || !roomCode.trim()) {
      setErrorMessage("Please fill in all fields.");
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

        navigate(`/room/${roomCode.trim()}`, {
          state: { leetcodeUsername: leetcodeUsername.trim() },
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
      <Container maxWidth="sm" sx={{ zIndex: 1 }}>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            bgcolor: "rgba(18, 24, 38, 0.85)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "24px",
            boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.5)",
            color: "#f8fafc",
          }}
        >
          <Typography
            variant="h5"
            fontWeight="800"
            sx={{ mb: 1, color: "#f8fafc" }}
          >
            Enter Contest Credentials
          </Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8", mb: 3 }}>
            Join an existing synchronized coding room
          </Typography>

          {errorMessage && (
            <Typography color="error" sx={{ mb: 2, fontSize: "0.875rem" }}>
              {errorMessage}
            </Typography>
          )}

          <Box
            component="form"
            onSubmit={handleJoinSubmit}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
              width: "100%",
            }}
          >
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
                fontSize: "1rem",
                "&:hover": { bgcolor: "#0ea5e9" },
              }}
            >
              Join Room
            </Button>
            <Button
              variant="text"
              onClick={() => navigate("/")}
              sx={{
                color: "#94a3b8",
                textTransform: "none",
                alignSelf: "center",
              }}
            >
              Back to Home
            </Button>
          </Box>
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

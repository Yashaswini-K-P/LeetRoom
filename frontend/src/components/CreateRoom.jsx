import React, { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  TextField,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../config.js";

export default function CreateRoom() {
  const navigate = useNavigate();
  const [leetcodeUsername, setLeetcodeUsername] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [problemInputs, setProblemInputs] = useState([
    { name: "", points: 10 },
  ]);

  const handleProblemFieldChange = (index, field, value) => {
    const updated = [...problemInputs];
    updated[index][field] = value;
    setProblemInputs(updated);
  };

  const handleAddProblem = () => {
    setProblemInputs([...problemInputs, { name: "", points: 10 }]);
  };

  const handleRemoveProblem = (index) => {
    const updated = problemInputs.filter((_, i) => i !== index);
    setProblemInputs(updated);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      setErrorMessage("Error: End time must be later than the start time");
      return;
    }

    if (!leetcodeUsername.trim()) {
      setErrorMessage("Please enter your LeetCode username.");
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
        navigate(`/room/${data.roomCode}`, { state: { leetcodeUsername } });
      } else {
        setErrorMessage(data.message || "Failed to create room.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Server error while creating room.");
    }
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
        /* Make native datetime inputs easier to click to open pickers */
        input[type="datetime-local"]::-webkit-calendar-picker-indicator {
          cursor: pointer;
          filter: invert(1);
          opacity: 0.7;
        }
        input[type="datetime-local"]::-webkit-calendar-picker-indicator:hover {
          opacity: 1;
        }
      `}
      </style>

      <div className="tech-grid" />

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
            Create Room
          </Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8", mb: 3 }}>
            Configure your synchronized coding contest session
          </Typography>

          {errorMessage && (
            <Typography color="error" sx={{ mb: 2, fontSize: "0.875rem" }}>
              {errorMessage}
            </Typography>
          )}

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
            <CustomTextField
              label="Your LeetCode Username (Admin)"
              required
              value={leetcodeUsername}
              onChange={(e) => setLeetcodeUsername(e.target.value)}
              placeholder="e.g. admin_coder"
            />

            <Box>
              <Typography
                variant="subtitle2"
                sx={{ color: "#e2e8f0", mb: 1.5, fontWeight: 600 }}
              >
                Contest Problems
              </Typography>
              {problemInputs.map((prob, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    gap: 2,
                    mb: 1.5,
                    alignItems: "center",
                  }}
                >
                  <CustomTextField
                    label={`Problem ${index + 1} Name / Slug`}
                    required
                    value={prob.name}
                    onChange={(e) =>
                      handleProblemFieldChange(index, "name", e.target.value)
                    }
                    placeholder="e.g. two-sum"
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
                  {problemInputs.length > 1 && (
                    <IconButton
                      onClick={() => handleRemoveProblem(index)}
                      sx={{ color: "#f87171" }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddProblem}
                variant="outlined"
                sx={{
                  color: "#38bdf8",
                  borderColor: "rgba(56, 189, 248, 0.3)",
                  textTransform: "none",
                  borderRadius: "10px",
                  mt: 0.5,
                  "&:hover": {
                    borderColor: "#38bdf8",
                    bgcolor: "rgba(56, 189, 248, 0.05)",
                  },
                }}
              >
                Add Problem
              </Button>
            </Box>

            <CustomTextField
              label="Start Time"
              type="datetime-local"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              onClick={(e) => {
                if (typeof e.target.showPicker === "function") {
                  e.target.showPicker();
                }
              }}
            />

            <CustomTextField
              label="End Time"
              type="datetime-local"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              onClick={(e) => {
                if (typeof e.target.showPicker === "function") {
                  e.target.showPicker();
                }
              }}
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
  const isDateTime = props.type === "datetime-local";

  return (
    <TextField
      fullWidth
      variant="outlined"
      {...props}
      InputLabelProps={{
        ...(isDateTime ? { shrink: true } : {}),
        ...props.InputLabelProps,
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          color: "#f8fafc",
          borderRadius: "12px",
          bgcolor: "rgba(11, 15, 25, 0.6)",
          cursor: isDateTime ? "pointer" : "default",
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

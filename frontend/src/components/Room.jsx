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
      <style>{`
        @keyframes gridShift {
          0% { background-position: 0 0; }
          100% { background-position: 50px 50px; }
        }
        @keyframes pulseGlow1 {
          0% { transform: scale(1) translate(0px, 0px); opacity: 0.3; }
          50% { transform: scale(1.2) translate(30px, -20px); opacity: 0.5; }
          100% { transform: scale(1) translate(0px, 0px); opacity: 0.3; }
        }
        @keyframes pulseGlow2 {
          0% { transform: scale(1) translate(0px, 0px); opacity: 0.25; }
          50% { transform: scale(1.15) translate(-30px, 20px); opacity: 0.45; }
          100% { transform: scale(1) translate(0px, 0px); opacity: 0.25; }
        }
        .tech-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(to right, rgba(168, 85, 247, 0.07) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(168, 85, 247, 0.07) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: gridShift 15s linear infinite;
          pointer-events: none;
        }
      `}</style>

      <div className="tech-grid" />

      <Box
        sx={{
          position: "absolute",
          width: "450px",
          height: "450px",
          bgcolor: "rgba(168, 85, 247, 0.12)",
          borderRadius: "50%",
          filter: "blur(100px)",
          top: "10%",
          left: "10%",
          animation: "pulseGlow1 10s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: "400px",
          height: "400px",
          bgcolor: "rgba(236, 72, 153, 0.12)",
          borderRadius: "50%",
          filter: "blur(100px)",
          bottom: "10%",
          right: "10%",
          animation: "pulseGlow2 8s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="md" sx={{ zIndex: 1 }}>
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
            color: "#ffffff",
          }}
        >
          <Typography
            variant="h4"
            gutterBottom
            fontWeight="800"
            sx={{
              background: "linear-gradient(45deg, #c084fc 30%, #ec4899 90%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.5px",
            }}
          >
            Contest Room: {roomCode}
          </Typography>

          {errorMessage && (
            <Typography sx={{ mb: 2, fontSize: "0.875rem", color: "#f87171" }}>
              {errorMessage}
            </Typography>
          )}

          {/* Contest Status & Details */}
          <Box sx={{ my: 3, display: "flex", gap: 2, alignItems: "center" }}>
            <Typography
              variant="h6"
              sx={{ color: "#ffffff", fontSize: "1rem" }}
            >
              Status:
            </Typography>
            <Chip
              label={status.toUpperCase()}
              sx={{
                fontWeight: "bold",
                bgcolor:
                  status === "ongoing"
                    ? "rgba(34, 197, 94, 0.2)"
                    : status === "upcoming"
                      ? "rgba(234, 179, 8, 0.2)"
                      : "rgba(148, 163, 184, 0.2)",
                color:
                  status === "ongoing"
                    ? "#4ade80"
                    : status === "upcoming"
                      ? "#facc15"
                      : "#cbd5e1",
                border: `1px solid ${
                  status === "ongoing"
                    ? "rgba(34, 197, 94, 0.4)"
                    : status === "upcoming"
                      ? "rgba(234, 179, 8, 0.4)"
                      : "rgba(148, 163, 184, 0.4)"
                }`,
              }}
            />
          </Box>

          <Box
            sx={{
              mb: 3,
              display: "flex",
              flexDirection: "column",
              gap: 1,
              color: "#ffffff",
            }}
          >
            <Typography variant="body1">
              <strong style={{ color: "#ffffff" }}>Start Time:</strong>{" "}
              {startTime ? new Date(startTime).toLocaleString() : "N/A"}
            </Typography>
            <Typography variant="body1">
              <strong style={{ color: "#ffffff" }}>End Time:</strong>{" "}
              {endTime ? new Date(endTime).toLocaleString() : "N/A"}
            </Typography>
          </Box>

          {canViewLeaderboard && (
            <Button
              variant="contained"
              fullWidth
              sx={{
                mb: 3,
                py: 1.5,
                fontWeight: "bold",
                background: "linear-gradient(45deg, #c084fc 30%, #ec4899 90%)",
                color: "#ffffff",
                borderRadius: "12px",
                textTransform: "none",
                fontSize: "1rem",
                boxShadow: "0 4px 14px rgba(192, 132, 252, 0.4)",
                "&:hover": {
                  background:
                    "linear-gradient(45deg, #a855f7 30%, #db2777 90%)",
                },
              }}
              onClick={() => setShowLeaderboard(true)}
            >
              View Leaderboard
            </Button>
          )}

          {/* Live Participants List */}
          <Typography
            variant="h6"
            sx={{
              mt: 2,
              mb: 2,
              color: "#ffffff",
              fontSize: "1.1rem",
              fontWeight: 600,
            }}
          >
            {status === "upcoming"
              ? "Waiting Participants"
              : status === "ongoing"
                ? "Live Participants"
                : "Participants"}{" "}
            ({participants.length})
          </Typography>

          <Paper
            variant="outlined"
            sx={{
              maxHeight: 220,
              overflow: "auto",
              p: 1,
              bgcolor: "rgba(11, 15, 25, 0.85)",
              borderColor: "rgba(255, 255, 255, 0.15)",
              borderRadius: "12px",
            }}
          >
            <List>
              {participants.map((user, index) => (
                <ListItem
                  key={index}
                  divider
                  sx={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
                >
                  <ListItemText
                    primary={user.leetcodeUsername}
                    secondary={`Socket ID: ${user.socketId}`}
                    slotProps={{
                      primary: {
                        style: {
                          color: "#ffffff",
                          fontWeight: 700,
                          fontSize: "1.05rem",
                        },
                      },
                      secondary: {
                        style: { color: "#94a3b8", fontSize: "0.85rem" },
                      },
                    }}
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
    </Box>
  );
}

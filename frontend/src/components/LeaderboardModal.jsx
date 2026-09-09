import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Container,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { socket } from "../socket.js";
import { useParams, useLocation, useNavigate } from "react-router-dom";

export default function Leaderboard() {
  const { roomCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const leetcodeUsername = location.state?.leetcodeUsername || "Viewer";

  const [problems, setProblems] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const onConnect = () => {
      socket.emit("join-room", { roomCode, leetcodeUsername });
    };

    if (socket.connected) {
      socket.emit("join-room", { roomCode, leetcodeUsername });
    } else {
      socket.connect();
    }

    socket.on("connect", onConnect);

    socket.on("room-update", (data) => {
      console.log("Received room-update data from server:", data);
      if (data.problems) setProblems(data.problems);
      if (data.users) setParticipants(data.users);
    });

    socket.on("leaderboard-update", (leaderboardData) => {
      setParticipants(leaderboardData);
    });

    socket.on("error-message", (msg) => {
      setErrorMessage(msg);
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("room-update");
      socket.off("leaderboard-update");
      socket.off("error-message");
    };
  }, [roomCode, leetcodeUsername]);
  console.log("Current React state - Problems:", problems);
  console.log("Current React state - Participants:", participants);
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
            }}
          >
            Contest Leaderboard — {roomCode}
          </Typography>

          {errorMessage && (
            <Typography sx={{ mb: 2, fontSize: "0.875rem", color: "#f87171" }}>
              {errorMessage}
            </Typography>
          )}

          {/* Assigned Problems Section */}
          <Box sx={{ mb: 4, mt: 2 }}>
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              sx={{ color: "#c084fc", mb: 1.5 }}
            >
              Assigned Problems
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                gap: 1.5,
              }}
            >
              {problems && problems.length > 0 ? (
                problems.map((prob, idx) => (
                  <Paper
                    key={idx}
                    variant="outlined"
                    sx={{
                      p: 2,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      bgcolor: "rgba(11, 15, 25, 0.6)",
                      borderColor: "rgba(255, 255, 255, 0.1)",
                      borderRadius: "12px",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "#ffffff" }}
                    >
                      {prob.titleSlug || prob.name || `Problem ${idx + 1}`}
                    </Typography>
                    <Chip
                      label={`${prob.points || 10} pts`}
                      size="small"
                      sx={{
                        bgcolor: "rgba(192, 132, 252, 0.1)",
                        color: "#c084fc",
                        borderColor: "rgba(192, 132, 252, 0.3)",
                        fontWeight: "bold",
                      }}
                      variant="outlined"
                    />
                  </Paper>
                ))
              ) : (
                <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                  No problems available
                </Typography>
              )}
            </Box>
          </Box>

          {/* Official Leaderboard Rankings Table */}
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            sx={{ color: "#c084fc", mb: 1.5 }}
          >
            Rankings
          </Typography>
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{
              bgcolor: "rgba(11, 15, 25, 0.85)",
              borderColor: "rgba(255, 255, 255, 0.15)",
              borderRadius: "12px",
              mb: 4,
            }}
          >
            <Table size="small">
              <TableHead sx={{ backgroundColor: "rgba(168, 85, 247, 0.1)" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold", color: "#c084fc" }}>
                    Rank
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#c084fc" }}>
                    Username
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", color: "#c084fc" }}>
                    Last Submitted
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ fontWeight: "bold", color: "#c084fc" }}
                  >
                    Solved
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: "bold", color: "#c084fc" }}
                  >
                    Points
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {participants && participants.length > 0 ? (
                  participants.map((user, index) => {
                    const score = user.totalScore ?? user.score ?? 0;
                    const lastSub = user.lastSubmitted ?? 0;
                    const solvedCount = user.solvedCount ?? 0;

                    return (
                      <TableRow
                        key={index}
                        sx={{ "&:last-child td": { border: 0 } }}
                      >
                        <TableCell
                          sx={{ fontWeight: "bold", color: "#ffffff" }}
                        >
                          #{index + 1}
                        </TableCell>
                        <TableCell sx={{ color: "#ffffff" }}>
                          {user.leetcodeUsername}
                        </TableCell>
                        <TableCell sx={{ color: "#94a3b8" }}>
                          {lastSub > 0
                            ? new Date(lastSub).toLocaleTimeString()
                            : "No submissions"}
                        </TableCell>
                        <TableCell align="center" sx={{ color: "#ffffff" }}>
                          {solvedCount}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: "bold", color: "#4ade80" }}
                        >
                          {score}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      align="center"
                      sx={{ color: "#94a3b8", py: 3 }}
                    >
                      No participants found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Button
            variant="contained"
            onClick={() => navigate(`/room/${roomCode}`)}
            sx={{
              alignSelf: "flex-start",
              py: 1.25,
              px: 3,
              fontWeight: "bold",
              background: "linear-gradient(45deg, #c084fc 30%, #ec4899 90%)",
              color: "#ffffff",
              borderRadius: "12px",
              textTransform: "none",
              boxShadow: "0 4px 14px rgba(192, 132, 252, 0.4)",
              "&:hover": {
                background: "linear-gradient(45deg, #a855f7 30%, #db2777 90%)",
              },
            }}
          >
            Back to Room
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}

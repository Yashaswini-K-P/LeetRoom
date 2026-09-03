import React from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

export default function LeaderboardModal({
  open,
  onClose,
  roomCode,
  problems,
  participants,
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, fontWeight: "bold" }}>
        Contest Leaderboard - {roomCode}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          ✕
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {/* Assigned Problems Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Assigned Problems
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 1.5,
            }}
          >
            {problems && problems.length > 0 ? (
              problems.map((prob, idx) => (
                <Paper
                  key={idx}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {prob.titleSlug}
                  </Typography>
                  <Chip
                    label={`${prob.points} pts`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Paper>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                No problems available
              </Typography>
            )}
          </Box>
        </Box>

        {/* Official Leaderboard Rankings Table */}
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Rankings
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead sx={{ backgroundColor: "grey.100" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Rank</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Username</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>
                  Last Submitted
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                  Solved
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: "bold" }}>
                  Points
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {participants && participants.length > 0 ? (
                participants.map((user, index) => {
                  const score = user.totalScore ?? 0;
                  const lastSub = user.lastSubmitted ?? 0;
                  const solvedCount = user.solvedCount ?? 0;

                  return (
                    <TableRow key={index} hover>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        #{index + 1}
                      </TableCell>
                      <TableCell>{user.leetcodeUsername}</TableCell>
                      <TableCell>
                        {lastSub > 0
                          ? new Date(lastSub).toLocaleTimeString()
                          : "No submissions"}
                      </TableCell>
                      <TableCell align="center">{solvedCount}</TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: "bold", color: "primary.main" }}
                      >
                        {score}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No participants found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </Dialog>
  );
}

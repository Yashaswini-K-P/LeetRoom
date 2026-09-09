import React from "react";
import { Container, Paper, Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0b0f19", display: "flex", alignItems: "center", justifyContent: "center", py: 4 }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ p: 4, display: "flex", flexDirection: "column", alignItems: "center", bgcolor: "rgba(18, 24, 38, 0.85)", borderRadius: "24px", color: "#f8fafc" }}>
          <Typography variant="h4" fontWeight="800" sx={{ mb: 1 }}>LeetCode Room</Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8", mb: 3 }}>Host or join synchronized coding competitive rooms</Typography>

          <Box sx={{ display: "flex", flexDirection: "column", width: "100%", gap: 2, mt: 2 }}>
            <Button variant="contained" size="large" onClick={() => navigate("/create")} sx={{ bgcolor: "#38bdf8", color: "#0b0f19", fontWeight: "bold", borderRadius: "12px", py: 1.5 }}>
              Create Room (Admin)
            </Button>
            <Button variant="outlined" size="large" onClick={() => navigate("/join")} sx={{ borderColor: "rgba(255, 255, 255, 0.2)", color: "#f8fafc", fontWeight: "bold", borderRadius: "12px", py: 1.5 }}>
              Join Room
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
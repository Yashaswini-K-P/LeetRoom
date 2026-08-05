import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Container} from '@mui/material';
import { BACKEND_URL } from '../config.js';

export default function Home({onRoomCreated, onRoomJoined}){
    const [view, setView] = useState('home');
    
    const[problems, setProblems] = useState('');
    const[startTime, setStartTime] = useState('');
    const[endTime, setEndTime] = useState('');

    const [leetcodeUsername, setLeetcodeUsername] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleCreateSubmit = async(e) =>{
        e.preventDefault();
        setErrorMessage('');

        try{
            const problemArray = problems.split(',').map(p => p.trim()).filter(Boolean);

            const response = await fetch(`${BACKEND_URL}/api/rooms/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ problems: problemArray, startTime, endTime })
            });
            const data = await response.json();

            if(data.success){
                onRoomCreated({ roomCode: data.roomCode, leetcodeUsername: 'Admin' });
            }else{
                setErrorMessage('Failed to create room.');
            }
        }catch (err) {
      console.error(err);
      setErrorMessage('Server error while creating room.');
    }
    };

    const handleJoinSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try{
        const response = await fetch(`${BACKEND_URL}/api/rooms/check/${roomCode}`);
      const data = await response.json();

      if (data.exists) {
        onRoomJoined({ roomCode, leetcodeUsername });
      } else {
        setErrorMessage('Room does not exist. Please check the code.');
      }
    }catch(err) {
      console.error(err);
      setErrorMessage('Server error while checking room.');
    }
}
return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
          LeetCode Room App
        </Typography>

        {errorMessage && (
          <Typography color="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Typography>
        )}

        {/* VIEW 1: HOME SELECTION */}
        {view === 'home' && (
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button 
              variant="contained" 
              size="large" 
              onClick={() => setView('create')}
            >
              Create Room (Admin)
            </Button>
            <Button 
              variant="outlined" 
              size="large" 
              onClick={() => setView('join')}
            >
              Join Room
            </Button>
          </Box>
        )}

        {/* VIEW 2: CREATE ROOM FORM */}
        {view === 'create' && (
          <Box component="form" onSubmit={handleCreateSubmit} sx={{ width: '100%', mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6">Create Contest Room</Typography>
            
            <TextField 
              label="Problems (comma-separated)" 
              variant="outlined" 
              fullWidth 
              required
              value={problems}
              onChange={(e) => setProblems(e.target.value)}
              placeholder="e.g. two-sum, valid-parentheses"
            />

            <TextField 
              label="Start Time" 
              type="datetime-local" 
              InputLabelProps={{ shrink: true }} 
              fullWidth 
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />

            <TextField 
              label="End Time" 
              type="datetime-local" 
              InputLabelProps={{ shrink: true }} 
              fullWidth 
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />

            <Button type="submit" variant="contained" size="large" fullWidth>
              Generate & Enter Room
            </Button>
            <Button variant="text" onClick={() => setView('home')}>
              Back
            </Button>
          </Box>
        )}

        {/* VIEW 3: JOIN ROOM FORM */}
        {view === 'join' && (
          <Box component="form" onSubmit={handleJoinSubmit} sx={{ width: '100%', mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
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
            <Button variant="text" onClick={() => setView('home')}>
              Back
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};
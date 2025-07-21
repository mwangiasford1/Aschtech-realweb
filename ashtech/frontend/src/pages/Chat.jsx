import React, { useEffect, useState, useRef, useContext } from 'react';
import { useSocket } from '../context/SocketContext.jsx';
import { AuthContext } from '../context/AuthContext.jsx';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';

// For demo: hardcode a recipient userId (replace with real user selection in production)
const DEMO_RECIPIENT_ID = 2; // Replace with actual recipient userId

function Chat() {
  const socket = useSocket();
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket || !user) return;
    socket.emit('register', user.id); // Register this user's socket

    const handlePrivateMessage = (msg) => {
      // Only show messages where this user is sender or recipient
      if (msg.from === user.id || msg.to === user.id) {
        setMessages((prev) => [...prev, msg]);
      }
    };
    socket.on('private message', handlePrivateMessage);
    return () => {
      socket.off('private message', handlePrivateMessage);
    };
  }, [socket, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !user) return;
    const msg = {
      from: user.id,
      to: DEMO_RECIPIENT_ID, // Replace with selected recipient
      text: input,
      time: new Date().toLocaleTimeString()
    };
    socket.emit('private message', msg);
    setInput('');
  };

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', padding: '32px 5vw', background: 'rgba(30,40,60,0.85)', color: '#fff', borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.15)', textAlign: 'center' }}>
      <Typography variant="h5" mb={2}>Private Chat</Typography>
      <Paper sx={{ height: 300, overflowY: 'auto', p: 2, mb: 2, bgcolor: '#f5f5f5' }}>
        {messages.map((msg, i) => (
          <Box key={i} sx={{ mb: 1 }}>
            <Typography variant="body2">
              <b>{msg.from === user.id ? 'Me' : `User ${msg.from}`}</b>
              <span style={{ color: '#888', fontSize: 12 }}> {msg.time}</span>
            </Typography>
            <Typography variant="body1">{msg.text}</Typography>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Paper>
      <form onSubmit={handleSend} style={{ display: 'flex', gap: 8 }}>
        <TextField
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          fullWidth
          size="small"
          InputLabelProps={{ style: { color: '#fff' } }}
          InputProps={{ style: { color: '#fff' } }}
        />
        <Button type="submit" variant="contained" disabled={!input.trim() || !user}>Send</Button>
      </form>
    </div>
  );
}

export default Chat; 
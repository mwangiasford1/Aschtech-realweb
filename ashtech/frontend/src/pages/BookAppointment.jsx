import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, TextField, Button, CircularProgress, Alert } from '@mui/material';
import api from '../config/axios';

export default function BookAppointment() {
  const [form, setForm] = useState({ name: '', email: '', datetime: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setConfirmation('');
    try {
      const res = await api.post('/api/appointments', {
        name: form.name,
        email: form.email,
        datetime: form.datetime,
        message: form.message
      });
      setConfirmation('Appointment request sent!');
      setForm({ name: '', email: '', datetime: '', message: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <Card sx={{ maxWidth: 480, width: '100%', boxShadow: 4, borderRadius: 4, p: 2 }}>
        <CardContent>
          <Typography variant="h5" align="center" mb={3} sx={{ fontWeight: 700, letterSpacing: 1 }}>
            Book Appointment
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              required
            />
            <TextField
              label="Preferred Date & Time"
              name="datetime"
              type="datetime-local"
              value={form.datetime}
              onChange={handleChange}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Message"
              name="message"
              value={form.message}
              onChange={handleChange}
              fullWidth
              multiline
              minRows={2}
            />
            <Button type="submit" variant="contained" color="primary" sx={{ mt: 2, fontWeight: 600 }} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Book Appointment'}
            </Button>
          </Box>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          {confirmation && (
            <Typography color="success.main" align="center" sx={{ mt: 2 }}>{confirmation}</Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
} 
import React, { useState, useContext } from 'react';
import api from '../config/axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { useSnackbar } from '../context/SnackbarContext.jsx';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { showSnackbar } = useSnackbar();
  const [show2FA, setShow2FA] = useState(false);
  const [twoFAUserId, setTwoFAUserId] = useState(null);
  const [twoFACode, setTwoFACode] = useState('');
  const [verifying2FA, setVerifying2FA] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      if (res.data.require2FA) {
        setTwoFAUserId(res.data.userId);
        setShow2FA(true);
      } else {
        // Fetch full profile after login
        const profileRes = await api.get('/api/users/me', {
          headers: { Authorization: `Bearer ${res.data.token}` }
        });
        login(profileRes.data, res.data.token);
        showSnackbar('Login successful!', 'success');
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      showSnackbar(err.response?.data?.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handle2FAVerify = async () => {
    setVerifying2FA(true);
    try {
      const res = await api.post('/api/auth/2fa/verify', { userId: twoFAUserId, code: twoFACode });
      // Fetch full profile after 2FA login
      const profileRes = await api.get('/api/users/me', {
        headers: { Authorization: `Bearer ${res.data.token}` }
      });
      login(profileRes.data, res.data.token);
      showSnackbar('Login successful!', 'success');
      setShow2FA(false);
      setTwoFACode('');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid 2FA code');
      showSnackbar(err.response?.data?.message || 'Invalid 2FA code', 'error');
    } finally {
      setVerifying2FA(false);
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        backgroundImage: 'url("https://cdn.leonardo.ai/users/1fab88cf-561d-436b-8728-8fe2f04717f3/generations/304894e0-a445-48c1-813c-d4ab42054f96/GPT_Image_1_remove_content_and_leave_the_colors_0.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        textShadow: '0 2px 8px #000',
        margin: 0,
        padding: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 0
      }}
    >
      <div style={{ background: 'rgba(0,0,0,0.5)', padding: 32, borderRadius: 8 }}>
        <Typography variant="h5" mb={2}>Login</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            fullWidth
            required
            margin="normal"
            InputLabelProps={{ style: { color: '#fff' } }}
            InputProps={{ style: { color: '#fff' } }}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
            required
            margin="normal"
            InputLabelProps={{ style: { color: '#fff' } }}
            InputProps={{ style: { color: '#fff' } }}
          />
          <Box sx={{ textAlign: 'right', mt: 1 }}>
            <Button variant="text" size="small" sx={{ color: '#90caf9' }} onClick={() => navigate('/forgot-password')}>
              Forgot password?
            </Button>
          </Box>
          <Box sx={{ position: 'relative' }}>
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }} disabled={loading}>
              Login
            </Button>
            {loading && <CircularProgress size={24} sx={{ position: 'absolute', top: '50%', left: '50%', mt: '-12px', ml: '-12px' }} />}
          </Box>
        </form>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        <Dialog open={show2FA} onClose={() => setShow2FA(false)}>
          <DialogTitle>Two-Factor Authentication</DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2 }}>Enter the 6-digit code from your authenticator app.</Typography>
            <TextField
              label="2FA Code"
              value={twoFACode}
              onChange={e => setTwoFACode(e.target.value)}
              fullWidth
              autoFocus
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShow2FA(false)}>Cancel</Button>
            <Button onClick={handle2FAVerify} variant="contained" disabled={verifying2FA || !twoFACode}>{verifying2FA ? 'Verifying...' : 'Verify'}</Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
} 
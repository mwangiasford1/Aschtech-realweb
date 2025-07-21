import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import axios from 'axios';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Switch from '@mui/material/Switch';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '@mui/material/Tooltip';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import GitHubIcon from '@mui/icons-material/GitHub';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LinearProgress from '@mui/material/LinearProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Slide from '@mui/material/Slide';
import Fade from '@mui/material/Fade';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CakeIcon from '@mui/icons-material/Cake';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import LockIcon from '@mui/icons-material/Lock';
import PaletteIcon from '@mui/icons-material/Palette';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import dayjs from 'dayjs';

export default function Profile() {
  const { user, setUser } = useContext(AuthContext);
  const [form, setForm] = useState({
    username: '', email: '', password: '', bio: '', phone: '', location: '', birthday: '', gender: '', github: '', twitter: '', linkedin: ''
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [theme, setTheme] = useState('light');
  const [color, setColor] = useState('#1976d2');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [twoFA, setTwoFA] = useState(false);
  const [tab, setTab] = useState(0);
  const [banner, setBanner] = useState('');
  const [bannerFile, setBannerFile] = useState(null);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [qr, setQr] = useState('');
  const [otpUrl, setOtpUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(user?.twoFactorEnabled || false);

  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        phone: user.phone || '',
        location: user.location || '',
        birthday: user.birthday && typeof user.birthday === 'string' && user.birthday !== '' ? dayjs(user.birthday) : (user.birthday && dayjs.isDayjs(user.birthday) ? user.birthday : null),
        gender: user.gender || '',
        github: user.github || '',
        twitter: user.twitter || '',
        linkedin: user.linkedin || '',
      }));
      setPreview(user.profileImage || '');
      setBanner(user.bannerImage || '');
    }
  }, [user]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = e => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(file ? URL.createObjectURL(file) : (user?.profileImage || ''));
  };

  const handleBannerChange = e => {
    const file = e.target.files[0];
    setBannerFile(file);
    setBanner(file ? URL.createObjectURL(file) : '');
  };

  const handleThemeToggle = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleColorChange = (e) => setColor(e.target.value);
  const handleTwoFASwitch = async (e) => {
    if (e.target.checked) {
      await handleEnable2FA();
    } else {
      try {
        const res = await axios.post('/api/users/me/2fa/disable', {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setTwoFAEnabled(false);
        setUser(res.data.user);
        setSnackbar({ open: true, message: '2FA disabled', severity: 'info' });
      } catch (err) {
        setSnackbar({ open: true, message: 'Failed to disable 2FA', severity: 'error' });
      }
    }
  };
  const handleDeleteAccount = async () => {
    // Call backend to delete account (implement endpoint as needed)
    setShowDeleteDialog(false);
    setSnackbar({ open: true, message: 'Account deleted (demo only)', severity: 'info' });
    // Optionally, log out user
  };

  const handleEnable2FA = async () => {
    try {
      const res = await axios.post('/api/users/me/2fa/enable', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setQr(res.data.qr);
      setOtpUrl(res.data.otpauth_url);
      setSecret(res.data.otpauth_url.split('secret=')[1]);
      setShow2FADialog(true);
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to enable 2FA', severity: 'error' });
    }
  };
  const handleVerify2FA = async () => {
    setVerifying(true);
    try {
      const res = await axios.post('/api/users/me/2fa/verify', { code }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSnackbar({ open: true, message: '2FA enabled!', severity: 'success' });
      setTwoFAEnabled(true);
      setShow2FADialog(false);
      setCode('');
      setUser(res.data.user);
    } catch (err) {
      setSnackbar({ open: true, message: err?.response?.data?.message || 'Invalid code', severity: 'error' });
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('username', form.username);
    formData.append('email', form.email);
    if (form.password) formData.append('password', form.password);
    if (form.bio) formData.append('bio', form.bio);
    if (form.phone) formData.append('phone', form.phone);
    if (form.location) formData.append('location', form.location);
    const birthdayStr = form.birthday && dayjs.isDayjs(form.birthday) ? form.birthday.format('YYYY-MM-DD') : '';
    if (birthdayStr) formData.append('birthday', birthdayStr);
    if (form.gender) formData.append('gender', form.gender);
    if (form.github) formData.append('github', form.github);
    if (form.twitter) formData.append('twitter', form.twitter);
    if (form.linkedin) formData.append('linkedin', form.linkedin);
    if (image) formData.append('profileImage', image);
    if (bannerFile) formData.append('bannerImage', bannerFile);
    try {
      const res = await axios.put('/api/users/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('Profile update response:', res.data);
      if (res.data.user) {
        setUser(res.data.user);
        setBanner(res.data.user.bannerImage || '');
      } else {
        setUser(res.data);
        setBanner(res.data.bannerImage || '');
      }
      setSnackbar({ open: true, message: 'Profile updated!', severity: 'success' });
    } catch (err) {
      console.error('Profile update error:', err, err?.response);
      const msg = err?.response?.data?.message || 'Update failed';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  // Profile completion calculation
  const fields = [form.username, form.email, form.bio, form.phone, form.location, form.birthday, form.gender, form.github, form.twitter, form.linkedin];
  const completion = Math.round((fields.filter(Boolean).length / fields.length) * 100);

  const modernCardSx = {
    borderRadius: 4,
    boxShadow: 6,
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    p: 3,
    mb: 4,
    maxWidth: 600,
    mx: 'auto',
  };
  const sectionHeaderSx = {
    fontWeight: 800,
    letterSpacing: 1,
    color: '#222',
    mb: 2,
    textShadow: '0 2px 8px #fff8',
    display: 'flex',
    alignItems: 'center',
    gap: 1,
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', py: 4 }}>
      <Card sx={modernCardSx}>
        <CardContent>
          <Typography variant="h5" sx={sectionHeaderSx}>Profile</Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
            <Avatar
              src={preview ? (preview.startsWith('data:') || preview.startsWith('blob:') ? preview : `data:image/*;base64,${preview}`) : '/default-avatar.png'}
              alt="Profile"
              sx={{ width: 100, height: 100, mr: 3, boxShadow: 2, border: '3px solid #fff', bgcolor: '#1976d2', fontSize: 40 }}
            />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{form.username}</Typography>
              <Typography color="text.secondary">{form.email}</Typography>
            </Box>
          </Box>
          <form onSubmit={handleSubmit}>
            {/* All profile fields, styled with modern spacing and fullWidth */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
              <TextField name="username" label="Username" value={form.username} onChange={handleChange} fullWidth />
              <TextField name="email" label="Email" value={form.email} onChange={handleChange} fullWidth />
              <TextField name="bio" label="Bio" value={form.bio} onChange={handleChange} fullWidth multiline minRows={2} />
              <TextField name="phone" label="Phone" value={form.phone} onChange={handleChange} fullWidth />
              <TextField name="location" label="Location" value={form.location} onChange={handleChange} fullWidth />
              <DatePicker
                label="Birthday"
                value={form.birthday && typeof form.birthday === 'string' ? dayjs(form.birthday) : (form.birthday && dayjs.isDayjs(form.birthday) ? form.birthday : null)}
                onChange={date => setForm(f => ({ ...f, birthday: date }))}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
              <TextField
                name="gender"
                label="Gender"
                value={form.gender}
                onChange={handleChange}
                select
                fullWidth
              >
                <MenuItem value="">Select</MenuItem>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
                <MenuItem value="prefer_not_to_say">Prefer not to say</MenuItem>
              </TextField>
              <TextField name="github" label="GitHub URL" value={form.github} onChange={handleChange} fullWidth InputProps={{ startAdornment: <InputAdornment position="start"><GitHubIcon sx={{ color: '#333' }} /></InputAdornment> }} />
              <TextField name="twitter" label="Twitter URL" value={form.twitter} onChange={handleChange} fullWidth InputProps={{ startAdornment: <InputAdornment position="start"><TwitterIcon sx={{ color: '#1da1f2' }} /></InputAdornment> }} />
              <TextField name="linkedin" label="LinkedIn URL" value={form.linkedin} onChange={handleChange} fullWidth InputProps={{ startAdornment: <InputAdornment position="start"><LinkedInIcon sx={{ color: '#0077b5' }} /></InputAdornment> }} />
              <TextField
                label="Theme Color"
                type="color"
                value={color}
                onChange={handleColorChange}
                fullWidth
                sx={{ width: 120, mt: 1 }}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Button type="submit" variant="contained" color="primary" sx={{ mt: 2, fontWeight: 700, borderRadius: 3, boxShadow: 2, px: 4, py: 1.5 }}>
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
} 
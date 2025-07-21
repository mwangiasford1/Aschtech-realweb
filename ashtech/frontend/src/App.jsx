import React, { useContext } from 'react';
import { Routes, Route, Link as RouterLink } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profile from './pages/Profile.jsx';
import Tutorials from './pages/Tutorials.jsx';
import Questions from './pages/Questions.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Chat from './pages/Chat.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import { AuthContext } from './context/AuthContext.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Badge from '@mui/material/Badge';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import { useNotifications } from './context/NotificationContext.jsx';
import Avatar from '@mui/material/Avatar';
import BookAppointment from './pages/BookAppointment.jsx';

function Home() {
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
        flexDirection: 'column',
        textShadow: '0 2px 8px #000',
        margin: 0,
        padding: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 0
      }}
    >
      <img
        src="https://cdn.leonardo.ai/users/1fab88cf-561d-436b-8728-8fe2f04717f3/generations/852b967e-107f-4ade-916e-453c4247cfea/Leonardo_Lightning_XL_create_a_logo_titled_ASHTECH_DESIGNS_w_1.jpg?w=512"
        alt="AshTech Logo"
        style={{ display: 'block', margin: '0 auto 32px auto', height: 100, borderRadius: 14, background: '#fff' }}
      />
      <h1>Welcome to ASHTECH!</h1>
      <p style={{ fontSize: '1.5rem', maxWidth: 600, textAlign: 'center' }}>
        Your one-stop solution for web design and more.
      </p>
    </div>
  );
}

function App() {
  const { user, logout } = useContext(AuthContext);
  const { notifications, unread, markAllRead } = useNotifications();
  const [notifOpen, setNotifOpen] = React.useState(false);
  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          {user && (
            <Avatar
              src={user.profileImage ? (user.profileImage.startsWith('http') ? user.profileImage : `data:image/*;base64,${user.profileImage}`) : undefined}
              alt={user.username}
              sx={{ width: 40, height: 40, mr: 2, bgcolor: '#1976d2', border: '2px solid #fff', objectFit: 'cover' }}
            >
              {!user.profileImage && user.username ? user.username[0].toUpperCase() : ''}
            </Avatar>
          )}
          <Button color="inherit" component={RouterLink} to="/">Home</Button>
          <Button color="inherit" component={RouterLink} to="/dashboard">Dashboard</Button>
          <Button color="inherit" component={RouterLink} to="/profile">Profile</Button>
          <Button color="inherit" component={RouterLink} to="/tutorials">Tutorials</Button>
          <Button color="inherit" component={RouterLink} to="/questions">Q&A</Button>
          {user && (
            <Button color="inherit" component={RouterLink} to="/book-appointment">Book Appointment</Button>
          )}
          {user && user.role === 'admin' && (
            <Button color="inherit" component={RouterLink} to="/admin">Admin</Button>
          )}
          <Box sx={{ flexGrow: 1 }} />
          {user && (
            <>
              <IconButton color="inherit" onClick={() => { setNotifOpen(true); markAllRead(); }} sx={{ mr: 1 }}>
                <Badge badgeContent={unread} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              <Typography variant="body1" sx={{ mr: 2 }}>Welcome, {user.username}!</Typography>
              <Button color="inherit" onClick={logout}>Logout</Button>
            </>
          )}
          {!user && (
            <>
              <Button color="inherit" component={RouterLink} to="/login">Login</Button>
              <Button color="inherit" component={RouterLink} to="/register">Register</Button>
            </>
          )}
          <Box sx={{ flexGrow: 0, ml: 2, display: 'flex', alignItems: 'center' }}>
            <img
              src="https://cdn.leonardo.ai/users/1fab88cf-561d-436b-8728-8fe2f04717f3/generations/852b967e-107f-4ade-916e-453c4247cfea/Leonardo_Lightning_XL_create_a_logo_titled_ASHTECH_DESIGNS_w_1.jpg?w=512"
              alt="AshTech Logo"
              style={{ height: 40, width: 'auto', borderRadius: 8, background: '#fff' }}
            />
          </Box>
        </Toolbar>
      </AppBar>
      <Dialog open={notifOpen} onClose={() => setNotifOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Notifications</DialogTitle>
        <DialogContent>
          {notifications.length === 0 ? (
            <Typography>No notifications yet.</Typography>
          ) : (
            notifications.map((n, i) => (
              <Typography key={i} sx={{ mb: 1 }}>{n.message || n}</Typography>
            ))
          )}
        </DialogContent>
      </Dialog>
      <Container maxWidth="md">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/tutorials" element={
            <ProtectedRoute>
              <Tutorials />
            </ProtectedRoute>
          } />
          <Route path="/questions" element={
            <ProtectedRoute>
              <Questions />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/book-appointment" element={
            <ProtectedRoute>
              <BookAppointment />
            </ProtectedRoute>
          } />
        </Routes>
      </Container>
    </>
  );
}

export default App; 
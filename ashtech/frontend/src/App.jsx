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
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

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
        style={{ display: 'block', margin: '0 auto 32px auto', height: 200, borderRadius: '50%', background: '#fff' }}
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
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Profile', to: '/profile' },
    { label: 'Tutorials', to: '/tutorials' },
    { label: 'Q&A', to: '/questions' },
    ...(user ? [{ label: 'Book Appointment', to: '/book-appointment' }] : []),
    ...(user && user.role === 'admin' ? [{ label: 'Admin', to: '/admin' }] : []),
  ];
  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          {isSmall && (
            <IconButton color="inherit" edge="start" onClick={() => setDrawerOpen(true)} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
          )}
          {/* Logo on far left */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <img
              src="https://cdn.leonardo.ai/users/1fab88cf-561d-436b-8728-8fe2f04717f3/generations/852b967e-107f-4ade-916e-453c4247cfea/Leonardo_Lightning_XL_create_a_logo_titled_ASHTECH_DESIGNS_w_1.jpg?w=512"
              alt="AshTech Logo"
              style={{ height: 80, width: 'auto', borderRadius: 8, background: '#fff' }}
            />
          </Box>
          {/* Nav links (desktop only) */}
          {!isSmall && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {navLinks.map(link => (
                <Button key={link.to} color="inherit" component={RouterLink} to={link.to} sx={{ fontWeight: 600 }}>
                  {link.label}
                </Button>
              ))}
            </Box>
          )}
          <Box sx={{ flexGrow: 1 }} />
          {/* Right side: notification, welcome, avatar/logout */}
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton color="inherit" onClick={() => { setNotifOpen(true); markAllRead(); }}>
                <Badge badgeContent={unread} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              {!isSmall && (
                <Typography variant="body1" sx={{ mx: 1 }}>Welcome, {user.username}!</Typography>
              )}
              <Button color="inherit" onClick={logout}>Logout</Button>
              {!isSmall && (
                <Avatar
                  src={user.profileImage ? (user.profileImage.startsWith('http') ? user.profileImage : `data:image/*;base64,${user.profileImage}`) : undefined}
                  alt={user.username}
                  sx={{ width: 40, height: 40, ml: 1, bgcolor: '#1976d2', border: '2px solid #fff', objectFit: 'cover' }}
                >
                  {!user.profileImage && user.username ? user.username[0].toUpperCase() : ''}
                </Avatar>
              )}
            </Box>
          )}
          {!user && !isSmall && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button color="inherit" component={RouterLink} to="/login">Login</Button>
              <Button color="inherit" component={RouterLink} to="/register">Register</Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 220 }} role="presentation" onClick={() => setDrawerOpen(false)}>
          <List>
            {navLinks.map(link => (
              <ListItem button key={link.to} component={RouterLink} to={link.to}>
                <ListItemText primary={link.label} />
              </ListItem>
            ))}
            {!user && (
              <>
                <ListItem button component={RouterLink} to="/login">
                  <ListItemText primary="Login" />
                </ListItem>
                <ListItem button component={RouterLink} to="/register">
                  <ListItemText primary="Register" />
                </ListItem>
              </>
            )}
            {user && (
              <ListItem button onClick={logout}>
                <ListItemText primary="Logout" />
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>
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
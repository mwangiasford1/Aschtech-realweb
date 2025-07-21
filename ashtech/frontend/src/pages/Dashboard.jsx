import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { useNotifications } from '../context/NotificationContext.jsx';
import axios from 'axios';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import WebIcon from '@mui/icons-material/Web';
import CodeIcon from '@mui/icons-material/Code';
import LaunchIcon from '@mui/icons-material/Launch';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const { notifications } = useNotifications();
  const [recentQuestions, setRecentQuestions] = useState([]);
  const [recentTutorials, setRecentTutorials] = useState([]);
  const [showAppointment, setShowAppointment] = useState(false);
  const [appointment, setAppointment] = useState({
    name: user?.username || '',
    email: user?.email || '',
    datetime: '',
    message: ''
  });
  const [confirmation, setConfirmation] = useState('');

  // Debug log for user
  console.log("DASHBOARD USER:", user);

  // Remove minimal render, restore full dashboard

  useEffect(() => {
    // Fetch recent questions
    axios.get('/api/questions?limit=3')
      .then(res => setRecentQuestions(res.data.questions || []));
    // Fetch recent tutorials
    axios.get('/api/tutorials?limit=3')
      .then(res => setRecentTutorials(res.data.tutorials || []));
  }, []);

  const handleAppointmentChange = e => {
    setAppointment({ ...appointment, [e.target.name]: e.target.value });
  };

  const handleAppointmentSubmit = async e => {
    e.preventDefault();
    // Here you would send to backend
    setConfirmation('Appointment request sent!');
    setShowAppointment(false);
  };

  const testimonials = [
    {
      name: "Jane Doe",
      text: "AshTech transformed our online presence! The team is creative, responsive, and truly understands modern web design.",
      role: "Startup Founder"
    },
    {
      name: "John Smith",
      text: "The real-time features and beautiful UI made our platform stand out. Highly recommended for any ambitious project.",
      role: "Community Manager"
    },
    {
      name: "Mary W.",
      text: "From ideation to launch, AshTech was a true partner. The MERN stack expertise is top-notch.",
      role: "Entrepreneur"
    }
  ];

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
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
        <img
          src="https://cdn.leonardo.ai/users/1fab88cf-561d-436b-8728-8fe2f04717f3/generations/852b967e-107f-4ade-916e-453c4247cfea/Leonardo_Lightning_XL_create_a_logo_titled_ASHTECH_DESIGNS_w_1.jpg?w=512"
          alt="AshTech Logo"
          style={{ display: 'block', margin: '40px auto 20px auto', height: 80, borderRadius: 12, background: '#fff', boxShadow: '0 4px 24px rgba(0,0,0,0.10)' }}
        />
        <Typography variant="h4" sx={sectionHeaderSx}>Welcome to AshTech</Typography>
        <Typography sx={{ fontSize: '1.1rem', mb: 2, textAlign: 'center', maxWidth: 600 }}>
          At AshTech, we don't just build websites—we engineer digital experiences. Using cutting-edge technologies like MongoDB, Express, React, and Node.js (MERN), we transform your ideas into fast, scalable, and visually stunning web applications.
        </Typography>
      </Box>
      <Card sx={modernCardSx}>
        <CardContent>
          <Typography variant="h5" sx={sectionHeaderSx}>Your Dashboard</Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
            <img
              src={user?.profileImage ? `data:image/*;base64,${user.profileImage}` : '/default-avatar.png'}
              alt="Profile"
              style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', marginRight: 24, boxShadow: '0 2px 8px #aaa' }}
            />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{user?.username}</Typography>
              <Typography color="text.secondary">{user?.email}</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Recent Notifications</Typography>
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                {notifications.slice(0, 3).map((n, i) => (
                  <li key={n.id || n._id || i}>{n.message}</li>
                ))}
                {notifications.length === 0 && <li>No notifications yet.</li>}
              </ul>
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Recent Questions</Typography>
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                {recentQuestions.map(q => (
                  <li key={q._id || q.id}>{q.title}</li>
                ))}
                {recentQuestions.length === 0 && <li>No recent questions.</li>}
              </ul>
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Recent Tutorials</Typography>
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                {recentTutorials.map(t => (
                  <li key={t._id || t.id}>{t.title}</li>
                ))}
                {recentTutorials.length === 0 && <li>No recent tutorials.</li>}
              </ul>
            </Box>
          </Box>
          <Divider sx={{ my: 3 }} />
          <Button
            variant="contained"
            color="primary"
            onClick={() => setShowAppointment(true)}
            sx={{ fontWeight: 700, borderRadius: 3, boxShadow: 2, px: 4, py: 1.5 }}
          >
            Book Appointment
          </Button>
        </CardContent>
      </Card>
      <Card sx={modernCardSx}>
        <CardContent>
          <Typography variant="h5" sx={sectionHeaderSx}>About AshTech Web Design</Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography sx={{ mb: 2 }}>
            <b>AshTech</b> is a modern web design and development agency specializing in full-stack solutions, UI/UX, and real-time web applications. We combine creativity, technical expertise, and a passion for innovation to deliver digital experiences that delight users and drive business growth.
          </Typography>
          <Typography sx={{ mb: 2 }}>
            <b>What we do:</b> <br/>
          </Typography>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>⚡ Full-stack web development (React, Node.js, MySQL, MongoDB, Express)</li>
            <li>🎨 UI/UX design and prototyping</li>
            <li>🔗 API integration and backend engineering</li>
            <li>💬 Real-time chat, notifications, and collaboration tools</li>
            <li>📱 Responsive, mobile-first design</li>
            <li>🛡️ Security, authentication, and 2FA</li>
            <li>📊 Analytics dashboards and admin panels</li>
          </ul>
          <Typography variant="h6" sx={{ mt: 3, mb: 2, fontWeight: 700 }}>Current & Recent Projects</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ p: 2, borderRadius: 3, boxShadow: 2, minHeight: 160 }}>
                <WebIcon sx={{ fontSize: 36, color: '#6a82fb', mb: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Asford Portfolio</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>A modern portfolio website for showcasing projects, skills, and contact information. Built with React and Vite.</Typography>
                <Link href="https://asfordmwangi-portfolio1-com.onrender.com" target="_blank" rel="noopener" sx={{ display: 'flex', alignItems: 'center', fontWeight: 600, mb: 0.5 }}>
                  Live Demo <LaunchIcon sx={{ fontSize: 18, ml: 0.5 }} />
                </Link>
                <Link href="https://github.com/mwangiasford1/Asford-portfolio.ke.git" target="_blank" rel="noopener" sx={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                  GitHub Repo <LaunchIcon sx={{ fontSize: 18, ml: 0.5 }} />
                </Link>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ p: 2, borderRadius: 3, boxShadow: 2, minHeight: 160 }}>
                <WebIcon sx={{ fontSize: 36, color: '#43cea2', mb: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Flutter FarmApp</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>A cross-platform farm management app built with Flutter and MongoDB. Features financial tracking, task scheduling, analytics, and more.</Typography>
                <Link href="https://github.com/mwangiasford1/my-flutter-project-farmapp.git" target="_blank" rel="noopener" sx={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                  GitHub Repo <LaunchIcon sx={{ fontSize: 18, ml: 0.5 }} />
                </Link>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ p: 2, borderRadius: 3, boxShadow: 2, minHeight: 160 }}>
                <WebIcon sx={{ fontSize: 36, color: '#fc5c7d', mb: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Pesante Enterprises</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>A business management platform for Pesante Enterprises. Includes inventory, sales, and analytics modules.</Typography>
                <Link href="https://pesante-enterprices-main.vercel.app/" target="_blank" rel="noopener" sx={{ display: 'flex', alignItems: 'center', fontWeight: 600, mb: 0.5 }}>
                  Live Demo <LaunchIcon sx={{ fontSize: 18, ml: 0.5 }} />
                </Link>
                <Link href="https://github.com/mwangiasford1/PESANTE-ENTERPRICES-MAIN.git" target="_blank" rel="noopener" sx={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                  GitHub Repo <LaunchIcon sx={{ fontSize: 18, ml: 0.5 }} />
                </Link>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ p: 2, borderRadius: 3, boxShadow: 2, minHeight: 160 }}>
                <WebIcon sx={{ fontSize: 36, color: '#1976d2', mb: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Barber App</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>A barber shop management and booking app. Features appointment scheduling, customer management, and more.</Typography>
                <Link href="https://github.com/mwangiasford1/barber_app.git" target="_blank" rel="noopener" sx={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                  GitHub Repo <LaunchIcon sx={{ fontSize: 18, ml: 0.5 }} />
                </Link>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Dialog open={showAppointment} onClose={() => setShowAppointment(false)} PaperProps={{ sx: { borderRadius: 4, boxShadow: 6, p: 2 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Book Appointment</DialogTitle>
        <DialogContent>
          <form onSubmit={handleAppointmentSubmit}>
            <TextField
              label="Name"
              name="name"
              value={appointment.name}
              onChange={handleAppointmentChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Email"
              name="email"
              value={appointment.email}
              onChange={handleAppointmentChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Preferred Date & Time"
              name="datetime"
              type="datetime-local"
              value={appointment.datetime}
              onChange={handleAppointmentChange}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Message"
              name="message"
              value={appointment.message}
              onChange={handleAppointmentChange}
              fullWidth
              margin="normal"
              multiline
              minRows={2}
            />
            <Button type="submit" variant="contained" color="primary" sx={{ mt: 2, fontWeight: 600, borderRadius: 2 }}>
              Book Appointment
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      {confirmation && <Alert severity="success">{confirmation}</Alert>}
    </Box>
  );
} 
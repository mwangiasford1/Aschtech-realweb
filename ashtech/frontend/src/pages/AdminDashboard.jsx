import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  ListItemButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
} from '@mui/material';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import PeopleIcon from '@mui/icons-material/People';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HistoryIcon from '@mui/icons-material/History';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { useSnackbar } from '../context/SnackbarContext';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

export default function AdminDashboard() {
  const [sidebarSection, setSidebarSection] = useState('analytics');
  const [analytics, setAnalytics] = useState({
    users: 0,
    tutorials: 0,
    questions: 0,
    activeUsers: 0,
    totalAnswers: 0,
    answerRate: 0,
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const { socket, connected } = useSocket();
  const { showSnackbar } = useSnackbar();
  const [onlineUserIds, setOnlineUserIds] = useState([]);

  // Add state for users, tutorials, questions, notifications, audit logs
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [actionUser, setActionUser] = useState(null);
  const [actionType, setActionType] = useState('');
  const [processing, setProcessing] = useState(false);

  const [tutorials, setTutorials] = useState([]);
  const [tutorialsLoading, setTutorialsLoading] = useState(false);
  const [deleteTutorialId, setDeleteTutorialId] = useState(null);
  const [showAddTutorial, setShowAddTutorial] = useState(false);
  const [addTutorialForm, setAddTutorialForm] = useState({ title: '', content: '', tags: '', link: '', thumbnail: '', caption: '' });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [addTutorialLoading, setAddTutorialLoading] = useState(false);
  const [addTutorialError, setAddTutorialError] = useState('');

  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [deleteQuestionId, setDeleteQuestionId] = useState(null);
  const [deletingQuestion, setDeletingQuestion] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [notificationSending, setNotificationSending] = useState(false);

  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLogsLoading, setAuditLogsLoading] = useState(false);

  const [answerDialogOpen, setAnswerDialogOpen] = useState(false);
  const [answerQuestionId, setAnswerQuestionId] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [answerSubmitting, setAnswerSubmitting] = useState(false);

  // Notification edit/delete state
  const [editNotifId, setEditNotifId] = useState(null);
  const [editNotifMsg, setEditNotifMsg] = useState('');
  const [editNotifLoading, setEditNotifLoading] = useState(false);
  const [deleteNotifId, setDeleteNotifId] = useState(null);
  const [deleteNotifLoading, setDeleteNotifLoading] = useState(false);

  // Add state for bookForm and bookConfirmation at the top of the component
  // Remove bookForm and bookConfirmation state
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState('');

  useEffect(() => {
    if (socket && connected) {
      // Listen for user online/offline events
      socket.on('userOnline', (userId) => {
        console.log('User online:', userId);
        setOnlineUserIds(prev => [...new Set([...prev, userId])]);
      });

      socket.on('userOffline', (userId) => {
        console.log('User offline:', userId);
        setOnlineUserIds(prev => prev.filter(id => id !== userId));
      });

      // Get initial online users
      socket.emit('getOnlineUsers', (users) => {
        if (Array.isArray(users)) {
          setOnlineUserIds(users);
        }
      });

      return () => {
        socket.off('userOnline');
        socket.off('userOffline');
      };
    }
  }, [socket, connected]);

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const [usersRes, tutorialsRes, questionsRes] = await Promise.all([
        axios.get('/api/users'),
        axios.get('/api/tutorials'),
        axios.get('/api/questions')
      ]);

      const usersArr = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data.users || []);
      const tutorialsArr = Array.isArray(tutorialsRes.data) ? tutorialsRes.data : (tutorialsRes.data.tutorials || []);
      const questionsArr = Array.isArray(questionsRes.data) ? questionsRes.data : (questionsRes.data.questions || []);

      const answeredQuestions = questionsArr.filter(q => q.answers && q.answers.length > 0);
      const totalAnswers = questionsArr.reduce((sum, q) => sum + (q.answers?.length || 0), 0);
      const answerRate = questionsArr.length ? (answeredQuestions.length / questionsArr.length * 100).toFixed(1) : 0;

      setAnalytics({
        users: usersArr.length,
        tutorials: tutorialsArr.length,
        questions: questionsArr.length,
        activeUsers: onlineUserIds.length,
        totalAnswers,
        answerRate,
      });
    } catch (err) {
      console.error('Analytics Error:', err);
      showSnackbar('Failed to load analytics', 'error');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Fetch functions
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data.users || res.data);
    } catch (err) {
      showSnackbar('Failed to load users', 'error');
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchTutorials = async () => {
    setTutorialsLoading(true);
    try {
      const res = await axios.get('/api/tutorials');
      setTutorials(res.data.tutorials || res.data);
    } catch (err) {
      showSnackbar('Failed to load tutorials', 'error');
    } finally {
      setTutorialsLoading(false);
    }
  };

  const fetchQuestions = async () => {
    setQuestionsLoading(true);
    try {
      const res = await axios.get('/api/questions');
      setQuestions(res.data.questions || res.data);
    } catch (err) {
      showSnackbar('Failed to load questions', 'error');
    } finally {
      setQuestionsLoading(false);
    }
  };

  const fetchNotifications = async () => {
    setNotificationsLoading(true);
    try {
      const res = await axios.get('/api/notifications');
      setNotifications(res.data);
    } catch (err) {
      showSnackbar('Failed to load notifications', 'error');
    } finally {
      setNotificationsLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    setAuditLogsLoading(true);
    try {
      const res = await axios.get('/api/audit-logs');
      setAuditLogs(res.data);
    } catch (err) {
      showSnackbar('Failed to load audit logs', 'error');
    } finally {
      setAuditLogsLoading(false);
    }
  };

  // Action handlers
  const handleAction = (user, type) => {
    setActionUser(user);
    setActionType(type);
  };

  const handleConfirm = async () => {
    if (!actionUser || !actionType) return;
    setProcessing(true);
    try {
      if (actionType === 'promote') {
        await axios.put(`/api/users/${actionUser.id}/promote`);
        showSnackbar('User promoted to admin!', 'success');
      } else if (actionType === 'demote') {
        await axios.put(`/api/users/${actionUser.id}/demote`);
        showSnackbar('User demoted to regular user.', 'success');
      } else if (actionType === 'delete') {
        await axios.delete(`/api/users/${actionUser.id}`);
        showSnackbar('User deleted.', 'success');
      }
      setActionUser(null);
      setActionType('');
      fetchUsers();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Action failed', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteTutorial = async () => {
    if (!deleteTutorialId) return;
    setTutorialsLoading(true);
    try {
      await axios.delete(`/api/tutorials/${deleteTutorialId}`);
      showSnackbar('Tutorial deleted!', 'success');
      setDeleteTutorialId(null);
      fetchTutorials();
    } catch (err) {
      showSnackbar('Failed to delete tutorial', 'error');
    } finally {
      setTutorialsLoading(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!deleteQuestionId) return;
    setDeletingQuestion(true);
    try {
      await axios.delete(`/api/questions/${deleteQuestionId}`);
      showSnackbar('Question deleted!', 'success');
      setDeleteQuestionId(null);
      fetchQuestions();
    } catch (err) {
      showSnackbar('Failed to delete question', 'error');
    } finally {
      setDeletingQuestion(false);
    }
  };

  const handleAddTutorialChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'thumbnail' && files && files[0]) {
      setThumbnailFile(files[0]);
      setThumbnailPreview(URL.createObjectURL(files[0]));
      setAddTutorialForm({ ...addTutorialForm, thumbnail: '' });
    } else {
      setAddTutorialForm({ ...addTutorialForm, [name]: value });
    }
  };

  const handleAddTutorialSubmit = async (e) => {
    e.preventDefault();
    setAddTutorialError('');
    if (!addTutorialForm.title.trim() || !addTutorialForm.content.trim()) {
      setAddTutorialError('Title and content are required.');
      return;
    }
    setAddTutorialLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', addTutorialForm.title);
      formData.append('content', addTutorialForm.content);
      formData.append('tags', addTutorialForm.tags);
      formData.append('link', addTutorialForm.link);
      formData.append('caption', addTutorialForm.caption);
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }
      await axios.post('/api/tutorials', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showSnackbar('Tutorial added successfully!', 'success');
      setAddTutorialForm({ title: '', content: '', tags: '', link: '', thumbnail: '', caption: '' });
      setThumbnailFile(null);
      setThumbnailPreview('');
      setShowAddTutorial(false);
      fetchTutorials();
    } catch (err) {
      setAddTutorialError(err.response?.data?.message || 'Failed to add tutorial');
      showSnackbar('Failed to add tutorial', 'error');
    } finally {
      setAddTutorialLoading(false);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setNotificationSending(true);
    try {
      await axios.post('/api/notifications', { message: notificationMsg });
      showSnackbar('Notification sent!', 'success');
      setNotificationMsg('');
      fetchNotifications();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to send notification', 'error');
    } finally {
      setNotificationSending(false);
    }
  };

  const handleOpenAnswerDialog = (questionId) => {
    setAnswerQuestionId(questionId);
    setAnswerText('');
    setAnswerDialogOpen(true);
  };

  const handleCloseAnswerDialog = () => {
    setAnswerDialogOpen(false);
    setAnswerQuestionId(null);
    setAnswerText('');
  };

  const handleSubmitAnswer = async () => {
    if (!answerText.trim()) return;
    setAnswerSubmitting(true);
    try {
      await axios.post(`/api/questions/${answerQuestionId}/answers`, { body: answerText });
      showSnackbar('Answer submitted!', 'success');
      handleCloseAnswerDialog();
      fetchQuestions();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to submit answer', 'error');
    } finally {
      setAnswerSubmitting(false);
    }
  };

  const handleOpenEditNotif = (notif) => {
    setEditNotifId(notif.id);
    setEditNotifMsg(notif.message);
  };
  const handleCloseEditNotif = () => {
    setEditNotifId(null);
    setEditNotifMsg('');
  };
  const handleEditNotif = async () => {
    if (!editNotifMsg.trim()) return;
    setEditNotifLoading(true);
    try {
      await axios.put(`/api/notifications/${editNotifId}`, { message: editNotifMsg });
      showSnackbar('Notification updated!', 'success');
      handleCloseEditNotif();
      fetchNotifications();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to update notification', 'error');
    } finally {
      setEditNotifLoading(false);
    }
  };
  const handleDeleteNotif = async () => {
    if (!deleteNotifId) return;
    setDeleteNotifLoading(true);
    try {
      await axios.delete(`/api/notifications/${deleteNotifId}`);
      showSnackbar('Notification deleted!', 'success');
      setDeleteNotifId(null);
      fetchNotifications();
    } catch (err) {
      showSnackbar('Failed to delete notification', 'error');
    } finally {
      setDeleteNotifLoading(false);
    }
  };

  // Effect hooks for fetching data
  useEffect(() => {
    if (sidebarSection === 'analytics') {
      fetchAnalytics();
    }
    switch (sidebarSection) {
      case 'users':
        fetchUsers();
        break;
      case 'tutorials':
        fetchTutorials();
        break;
      case 'qa':
        fetchQuestions();
        break;
      case 'notifications':
        fetchNotifications();
        break;
      case 'appointment':
        fetchAppointments();
        break;
      case 'audit':
        fetchAuditLogs();
        break;
      default:
        break;
    }
    // eslint-disable-next-line
  }, [sidebarSection]);

  const fetchAppointments = async () => {
    setAppointmentsLoading(true);
    setAppointmentsError('');
    try {
      const res = await axios.get('/api/appointments');
      setAppointments(res.data);
    } catch (err) {
      setAppointmentsError(err.response?.data?.message || 'Failed to load appointments');
    } finally {
      setAppointmentsLoading(false);
    }
  };

  // Modern table styles
  const modernTableSx = {
    borderRadius: 4,
    boxShadow: 3,
    overflow: 'hidden',
    background: '#fff',
    '& th': {
      position: 'sticky',
      top: 0,
      background: 'linear-gradient(90deg, #6a82fb 0%, #fc5c7d 100%)',
      color: '#fff',
      fontWeight: 700,
      zIndex: 1,
    },
    '& tbody tr:nth-of-type(odd)': {
      background: 'rgba(106,130,251,0.06)',
    },
    '& tbody tr:hover': {
      background: 'rgba(252,92,125,0.10)',
      transition: 'background 0.2s',
    },
  };

  const renderContent = () => {
    switch (sidebarSection) {
      case 'analytics':
        return (
          <Box sx={{ p: 0 }}>
            <Typography variant="h5" mb={4} sx={{ fontWeight: 800, letterSpacing: 1, color: '#222', textShadow: '0 2px 8px #fff8' }}>
              Analytics Dashboard
            </Typography>
            {analyticsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
                gap: 4,
                mb: 4,
              }}>
                <Card sx={{
                  borderRadius: 4,
                  boxShadow: 6,
                  background: 'linear-gradient(135deg, #6a82fb 0%, #fc5c7d 100%)',
                  color: '#fff',
                  p: 2,
                  minHeight: 160,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                }}>
                  <AnalyticsIcon sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Total Users</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 900 }}>{String(analytics.users)}</Typography>
                  <Typography variant="body2" color="#e0e0e0">
                    {String(analytics.activeUsers)} online
                  </Typography>
                </Card>
                <Card sx={{
                  borderRadius: 4,
                  boxShadow: 6,
                  background: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
                  color: '#fff',
                  p: 2,
                  minHeight: 160,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                }}>
                  <MenuBookIcon sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Total Tutorials</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 900 }}>{String(analytics.tutorials)}</Typography>
                </Card>
                <Card sx={{
                  borderRadius: 4,
                  boxShadow: 6,
                  background: 'linear-gradient(135deg, #fc5c7d 0%, #6a82fb 100%)',
                  color: '#fff',
                  p: 2,
                  minHeight: 160,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                }}>
                  <QuestionAnswerIcon sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Total Questions</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 900 }}>{String(analytics.questions)}</Typography>
                  <Typography variant="body2" color="#e0e0e0">
                    {String(analytics.answerRate)}% answered
                  </Typography>
                </Card>
                <Card sx={{
                  borderRadius: 4,
                  boxShadow: 6,
                  background: 'linear-gradient(135deg, #185a9d 0%, #43cea2 100%)',
                  color: '#fff',
                  p: 2,
                  minHeight: 160,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                }}>
                  <PeopleIcon sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Total Answers</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 900 }}>{String(analytics.totalAnswers)}</Typography>
                </Card>
              </Box>
            )}
          </Box>
        );
      case 'users':
        return (
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '80vh', justifyContent: 'center', bgcolor: 'rgba(245,247,250,0.7)' }}>
            <Card sx={{ width: '100%', maxWidth: 1200, boxShadow: 4, borderRadius: 4, p: 2, mb: 4 }}>
              <CardContent>
                <Typography variant="h5" align="center" mb={3} sx={{ fontWeight: 700, letterSpacing: 1 }}>
                  User Management
                </Typography>
                {usersLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <TableContainer component={Paper} sx={modernTableSx}>
                    <Table sx={{ minWidth: 900 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Username</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Role</TableCell>
                          <TableCell>Bio</TableCell>
                          <TableCell>Phone</TableCell>
                          <TableCell>Location</TableCell>
                          <TableCell>Birthday</TableCell>
                          <TableCell>Gender</TableCell>
                          <TableCell>GitHub</TableCell>
                          <TableCell>Twitter</TableCell>
                          <TableCell>LinkedIn</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {users.map(u => (
                          <TableRow key={u.id} hover sx={{ transition: 'background 0.2s', '&:hover': { background: 'rgba(25, 118, 210, 0.07)' } }}>
                            <TableCell style={{ whiteSpace: 'nowrap', fontWeight: 500 }}>{u.username}</TableCell>
                            <TableCell style={{ whiteSpace: 'nowrap' }}>{u.email}</TableCell>
                            <TableCell style={{ whiteSpace: 'nowrap', color: u.role === 'admin' ? '#1976d2' : '#333', fontWeight: u.role === 'admin' ? 600 : 400 }}>{u.role}</TableCell>
                            <TableCell style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {u.bio ? (
                                <Tooltip title={u.bio} arrow>
                                  <span>{u.bio.length > 100 ? u.bio.slice(0, 100) + '...' : u.bio}</span>
                                </Tooltip>
                              ) : ''}
                            </TableCell>
                            <TableCell style={{ whiteSpace: 'nowrap' }}>{u.phone || ''}</TableCell>
                            <TableCell style={{ whiteSpace: 'nowrap' }}>{u.location || ''}</TableCell>
                            <TableCell style={{ whiteSpace: 'nowrap' }}>{u.birthday || ''}</TableCell>
                            <TableCell style={{ whiteSpace: 'nowrap' }}>{u.gender || ''}</TableCell>
                            <TableCell>{u.github ? <a href={u.github} target="_blank" rel="noopener noreferrer">GitHub</a> : ''}</TableCell>
                            <TableCell>{u.twitter ? <a href={u.twitter} target="_blank" rel="noopener noreferrer">Twitter</a> : ''}</TableCell>
                            <TableCell>{u.linkedin ? <a href={u.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a> : ''}</TableCell>
                            <TableCell align="right">
                              {u.role === 'user' && (
                                <Button size="small" onClick={() => handleAction(u, 'promote')} variant="outlined" sx={{ mr: 1 }}>
                                  Promote
                                </Button>
                              )}
                              {u.role === 'admin' && (
                                <Button size="small" onClick={() => handleAction(u, 'demote')} variant="outlined" color="secondary" sx={{ mr: 1 }}>
                                  Demote
                                </Button>
                              )}
                              <Button size="small" color="error" onClick={() => handleAction(u, 'delete')} variant="contained">
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
                <Dialog open={!!actionUser} onClose={() => setActionUser(null)} PaperProps={{ sx: { borderRadius: 4, boxShadow: 6, p: 2 } }}>
                  <DialogTitle>Confirm Action</DialogTitle>
                  <DialogContent>
                    <Typography>
                      Are you sure you want to {actionType} {actionUser?.username}?
                    </Typography>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={() => setActionUser(null)} disabled={processing}>Cancel</Button>
                    <Button onClick={handleConfirm} color="primary" disabled={processing} variant="contained">
                      {processing ? <CircularProgress size={24} /> : 'Confirm'}
                    </Button>
                  </DialogActions>
                </Dialog>
              </CardContent>
            </Card>
          </Box>
        );
      case 'tutorials':
        return (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Tutorial Management</Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setShowAddTutorial(!showAddTutorial)}
              >
                {showAddTutorial ? 'Cancel' : 'Add Tutorial'}
              </Button>
            </Box>
            {showAddTutorial && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Add New Tutorial</Typography>
                <Box component="form" onSubmit={handleAddTutorialSubmit}>
                  <TextField
                    name="title"
                    label="Title"
                    value={addTutorialForm.title}
                    onChange={handleAddTutorialChange}
                    fullWidth
                    required
                    margin="normal"
                  />
                  <TextField
                    name="content"
                    label="Content"
                    value={addTutorialForm.content}
                    onChange={handleAddTutorialChange}
                    fullWidth
                    required
                    multiline
                    rows={4}
                    margin="normal"
                  />
                  <TextField
                    name="tags"
                    label="Tags (comma separated)"
                    value={addTutorialForm.tags}
                    onChange={handleAddTutorialChange}
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    name="link"
                    label="Tutorial Link (URL)"
                    value={addTutorialForm.link}
                    onChange={handleAddTutorialChange}
                    fullWidth
                    margin="normal"
                  />
                  <Box sx={{ mt: 2, mb: 2 }}>
                    <input
                      accept="image/*"
                      type="file"
                      id="thumbnail-upload"
                      name="thumbnail"
                      onChange={handleAddTutorialChange}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="thumbnail-upload">
                      <Button variant="outlined" component="span">
                        Upload Thumbnail
                      </Button>
                    </label>
                    {thumbnailPreview && (
                      <Box sx={{ mt: 2 }}>
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail preview"
                          style={{ maxWidth: 200, maxHeight: 120, objectFit: 'cover', borderRadius: 4 }}
                        />
                      </Box>
                    )}
                  </Box>
                  <TextField
                    name="caption"
                    label="Thumbnail Caption"
                    value={addTutorialForm.caption}
                    onChange={handleAddTutorialChange}
                    fullWidth
                    margin="normal"
                  />
                  {addTutorialError && (
                    <Typography color="error" sx={{ mt: 2 }}>
                      {addTutorialError}
                    </Typography>
                  )}
                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={addTutorialLoading}
                    >
                      {addTutorialLoading ? <CircularProgress size={24} /> : 'Add Tutorial'}
                    </Button>
                  </Box>
                </Box>
              </Paper>
            )}
            {tutorialsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper} sx={modernTableSx}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Thumbnail</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Author</TableCell>
                      <TableCell>Tags</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tutorials.map(tutorial => (
                      <TableRow key={tutorial.id}>
                        <TableCell>
                          {tutorial.thumbnail && (
                            <img
                              src={tutorial.thumbnail.startsWith('http')
                                ? tutorial.thumbnail
                                : `/${tutorial.thumbnail.replace(/\\/g, '/')}`
                              }
                              alt="Thumbnail"
                              style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 4 }}
                            />
                          )}
                        </TableCell>
                        <TableCell>{tutorial.title}</TableCell>
                        <TableCell>{tutorial.author?.username || 'Unknown'}</TableCell>
                        <TableCell>{Array.isArray(tutorial.tags) ? tutorial.tags.join(', ') : tutorial.tags}</TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => setDeleteTutorialId(tutorial.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            <Dialog open={!!deleteTutorialId} onClose={() => setDeleteTutorialId(null)} PaperProps={{ sx: { borderRadius: 4, boxShadow: 6, p: 2 } }}>
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogContent>
                <Typography>Are you sure you want to delete this tutorial?</Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDeleteTutorialId(null)} disabled={tutorialsLoading}>
                  Cancel
                </Button>
                <Button onClick={handleDeleteTutorial} color="error" disabled={tutorialsLoading}>
                  {tutorialsLoading ? <CircularProgress size={24} /> : 'Delete'}
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        );
      case 'qa':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" mb={3}>Q&A Management</Typography>
            {questionsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper} sx={modernTableSx}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Author</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {questions.map(question => (
                      <TableRow key={question.id}>
                        <TableCell>{question.title}</TableCell>
                        <TableCell>{question.author?.username || 'Unknown'}</TableCell>
                        <TableCell>
                          {question.answers?.length > 0 ? 'Answered' : 'Unanswered'}
                        </TableCell>
                        <TableCell>
                          {question.answers?.length === 0 && (
                            <Button
                              size="small"
                              color="primary"
                              onClick={() => handleOpenAnswerDialog(question.id)}
                            >
                              Answer
                            </Button>
                          )}
                          <Button
                            size="small"
                            color="error"
                            onClick={() => setDeleteQuestionId(question.id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            <Dialog open={!!deleteQuestionId} onClose={() => setDeleteQuestionId(null)} PaperProps={{ sx: { borderRadius: 4, boxShadow: 6, p: 2 } }}>
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogContent>
                <Typography>Are you sure you want to delete this question?</Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDeleteQuestionId(null)} disabled={deletingQuestion}>
                  Cancel
                </Button>
                <Button onClick={handleDeleteQuestion} color="error" disabled={deletingQuestion}>
                  {deletingQuestion ? <CircularProgress size={24} /> : 'Delete'}
                </Button>
              </DialogActions>
            </Dialog>
            {/* Answer Dialog */}
            <Dialog open={answerDialogOpen} onClose={handleCloseAnswerDialog} PaperProps={{ sx: { borderRadius: 4, boxShadow: 6, p: 2 } }}>
              <DialogTitle>Answer Question</DialogTitle>
              <DialogContent>
                <TextField
                  label="Your Answer"
                  value={answerText}
                  onChange={e => setAnswerText(e.target.value)}
                  fullWidth
                  multiline
                  minRows={3}
                  autoFocus
                  margin="normal"
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseAnswerDialog} disabled={answerSubmitting}>Cancel</Button>
                <Button onClick={handleSubmitAnswer} color="primary" disabled={answerSubmitting || !answerText.trim()}>
                  {answerSubmitting ? <CircularProgress size={24} /> : 'Submit'}
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        );
      case 'notifications':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" mb={3}>Notifications Management</Typography>
            <Box component="form" onSubmit={handleSendNotification} sx={{ mb: 4 }}>
              <TextField
                fullWidth
                label="Notification Message"
                value={notificationMsg}
                onChange={(e) => setNotificationMsg(e.target.value)}
                disabled={notificationSending}
                sx={{ mb: 2 }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={notificationSending || !notificationMsg.trim()}
              >
                {notificationSending ? <CircularProgress size={24} /> : 'Send Notification'}
              </Button>
            </Box>
            {notificationsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper} sx={modernTableSx}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Message</TableCell>
                      <TableCell>Sender</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {notifications.map((notification) => (
                      <TableRow key={notification._id || notification.id}>
                        <TableCell>{notification.message}</TableCell>
                        <TableCell>{notification.senderUser?.username || 'System'}</TableCell>
                        <TableCell>{notification.createdAt ? new Date(notification.createdAt).toLocaleString() : ''}</TableCell>
                        <TableCell>
                          <IconButton size="small" color="primary" onClick={() => handleOpenEditNotif(notification)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => setDeleteNotifId(notification.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            {/* Edit Notification Dialog */}
            <Dialog open={!!editNotifId} onClose={handleCloseEditNotif} PaperProps={{ sx: { borderRadius: 4, boxShadow: 6, p: 2 } }}>
              <DialogTitle>Edit Notification</DialogTitle>
              <DialogContent>
                <TextField
                  label="Notification Message"
                  value={editNotifMsg}
                  onChange={e => setEditNotifMsg(e.target.value)}
                  fullWidth
                  multiline
                  minRows={2}
                  margin="normal"
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseEditNotif} disabled={editNotifLoading}>Cancel</Button>
                <Button onClick={handleEditNotif} color="primary" disabled={editNotifLoading || !editNotifMsg.trim()}>
                  {editNotifLoading ? <CircularProgress size={24} /> : 'Update'}
                </Button>
              </DialogActions>
            </Dialog>
            {/* Delete Notification Dialog */}
            <Dialog open={!!deleteNotifId} onClose={() => setDeleteNotifId(null)} PaperProps={{ sx: { borderRadius: 4, boxShadow: 6, p: 2 } }}>
              <DialogTitle>Delete Notification</DialogTitle>
              <DialogContent>
                <Typography>Are you sure you want to delete this notification?</Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDeleteNotifId(null)} disabled={deleteNotifLoading}>Cancel</Button>
                <Button onClick={handleDeleteNotif} color="error" disabled={deleteNotifLoading}>
                  {deleteNotifLoading ? <CircularProgress size={24} /> : 'Delete'}
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        );
      case 'appointment':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" mb={3}>Appointments</Typography>
            {appointmentsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : appointmentsError ? (
              <Typography color="error" sx={{ mt: 2 }}>{appointmentsError}</Typography>
            ) : (
              <TableContainer component={Paper} sx={modernTableSx}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Date & Time</TableCell>
                      <TableCell>Message</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {appointments.map((appt) => (
                      <TableRow key={appt.id}>
                        <TableCell>{appt.name}</TableCell>
                        <TableCell>{appt.email}</TableCell>
                        <TableCell>{new Date(appt.datetime).toLocaleString()}</TableCell>
                        <TableCell>{appt.message}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        );
      case 'audit':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" mb={3}>Audit Logs</Typography>
            {auditLogsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper} sx={modernTableSx}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Action</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Details</TableCell>
                      <TableCell>Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log._id || log.id}>
                        <TableCell>{log.action}</TableCell>
                        <TableCell>{log.user?.username || 'System'}</TableCell>
                        <TableCell>{log.details}</TableCell>
                        <TableCell>{log.createdAt ? new Date(log.createdAt).toLocaleString() : ''}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            top: '64px',
            height: 'calc(100% - 64px)',
            bgcolor: 'rgba(30,34,54,0.98)',
            color: '#fff',
            borderRight: 'none',
            boxShadow: 4,
          },
        }}
      >
        <List sx={{ pt: 2 }}>
          {[
            { text: 'Analytics', icon: <AnalyticsIcon />, value: 'analytics' },
            { text: 'Users', icon: <PeopleIcon />, value: 'users' },
            { text: 'Tutorials', icon: <MenuBookIcon />, value: 'tutorials' },
            { text: 'Q&A', icon: <QuestionAnswerIcon />, value: 'qa' },
            { text: 'Notifications', icon: <NotificationsIcon />, value: 'notifications' },
            { text: 'Appointment', icon: <EventAvailableIcon />, value: 'appointment' },
            { text: 'Audit Log', icon: <HistoryIcon />, value: 'audit' },
          ].map((item) => (
            <ListItem disablePadding key={item.value} selected={sidebarSection === item.value}>
              <ListItemButton
                onClick={() => setSidebarSection(item.value)}
                selected={sidebarSection === item.value}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  my: 0.5,
                  color: sidebarSection === item.value ? '#fff' : 'rgba(255,255,255,0.8)',
                  bgcolor: sidebarSection === item.value ? 'linear-gradient(90deg, #6a82fb 0%, #fc5c7d 100%)' : 'transparent',
                  '&:hover': {
                    bgcolor: 'rgba(106,130,251,0.12)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                <ListItemIcon sx={{ color: '#fff', minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: sidebarSection === item.value ? 700 : 500 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 0, minHeight: '100vh', bgcolor: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto', p: { xs: 2, md: 4 } }}>
          {renderContent()}
        </Box>
      </Box>
    </Box>
  );
}
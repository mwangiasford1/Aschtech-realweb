import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';
import { useSnackbar } from '../context/SnackbarContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Pagination from '@mui/material/Pagination';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { useRef } from 'react';
import dayjs from 'dayjs';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';

function Questions() {
  const { user } = useContext(AuthContext);
  const { showSnackbar } = useSnackbar();
  const socket = useSocket();
  const [questions, setQuestions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', tags: [] });
  const [message, setMessage] = useState('');
  const [selected, setSelected] = useState(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answering, setAnswering] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'question'|'answer', id, answerId? }
  const [deleting, setDeleting] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuQuestionId, setMenuQuestionId] = useState(null);
  const [answerMenuAnchor, setAnswerMenuAnchor] = useState(null);
  const [answerMenuIndex, setAnswerMenuIndex] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 5;
  const [search, setSearch] = useState('');
  const [allTags, setAllTags] = useState([]);
  const [filterTags, setFilterTags] = useState([]);
  const [showAppointment, setShowAppointment] = useState(false);
  const [appointment, setAppointment] = useState({
    name: user?.username || '',
    email: user?.email || '',
    datetime: '',
    message: ''
  });
  const [confirmation, setConfirmation] = useState('');
  const tagInputRef = useRef();
  const [tagInput, setTagInput] = useState('');
  const [showAskDialog, setShowAskDialog] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [quickQuestion, setQuickQuestion] = useState('');
  const [quickSubmitting, setQuickSubmitting] = useState(false);

  useEffect(() => {
    fetchQuestions(page, search, filterTags);
    // eslint-disable-next-line
  }, [page, search, filterTags]);

  useEffect(() => {
    // Fetch all tags for chips
    axios.get('/api/questions/tags').then(res => setAllTags(res.data));
  }, []);

  const fetchQuestions = async (pageNum = 1, searchVal = '', tagsArr = []) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', pageNum);
      params.append('limit', limit);
      if (searchVal) params.append('search', searchVal);
      if (tagsArr.length > 0) params.append('tags', tagsArr.join(','));
      const res = await axios.get(`/api/questions?${params.toString()}`);
      setQuestions(res.data.questions);
      setTotal(res.data.total);
    } catch (err) {
      setMessage('Failed to load questions');
      showSnackbar('Failed to load questions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Advanced tag input handlers
  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/,$/, '');
      if (newTag && !form.tags.includes(newTag)) {
        setForm({ ...form, tags: [...form.tags, newTag] });
      }
      setTagInput('');
    }
  };

  const handleTagDelete = (tagToDelete) => {
    setForm({ ...form, tags: form.tags.filter(tag => tag !== tagToDelete) });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    setSubmitting(true);
    try {
      await axios.post('/api/questions', {
        ...form,
        tags: form.tags,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMessage('Question posted!');
      showSnackbar('Question posted!', 'success');
      if (socket) socket.emit('notify', `New question posted: ${form.title}`);
      setForm({ title: '', body: '', tags: [] });
      setShowForm(false);
      fetchQuestions();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to post question');
      showSnackbar(err.response?.data?.message || 'Failed to post question', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnswer = async (id) => {
    setMessage('');
    setAnswering(true);
    try {
      await axios.post(`/api/questions/${id}/answers`, { body: answer }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMessage('Answer posted!');
      showSnackbar('Answer posted!', 'success');
      setAnswer('');
      fetchQuestions();
      setSelected(null);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to post answer');
      showSnackbar(err.response?.data?.message || 'Failed to post answer', 'error');
    } finally {
      setAnswering(false);
    }
  };

  // Menu handlers for questions
  const handleMenuOpen = (event, questionId) => {
    setMenuAnchor(event.currentTarget);
    setMenuQuestionId(questionId);
  };
  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuQuestionId(null);
  };

  // Menu handlers for answers
  const handleAnswerMenuOpen = (event, idx) => {
    setAnswerMenuAnchor(event.currentTarget);
    setAnswerMenuIndex(idx);
  };
  const handleAnswerMenuClose = () => {
    setAnswerMenuAnchor(null);
    setAnswerMenuIndex(null);
  };

  const handleTagClick = (tag) => {
    setFilterTags((prev) => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    setPage(1);
  };

  // Delete logic
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.type === 'question') {
        await axios.delete(`/api/questions/${deleteTarget.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        showSnackbar('Question deleted!', 'success');
        setSelected(null);
      } else if (deleteTarget.type === 'answer') {
        await axios.delete(`/api/questions/${deleteTarget.id}/answers/${deleteTarget.answerId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        showSnackbar('Answer deleted!', 'success');
      }
      setDeleteTarget(null);
      fetchQuestions();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to delete', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleAppointmentChange = e => {
    setAppointment({ ...appointment, [e.target.name]: e.target.value });
  };

  const handleAppointmentSubmit = async e => {
    e.preventDefault();
    // Here you would send to backend
    setConfirmation('Appointment request sent!');
    setShowAppointment(false);
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // Dialog form submission (with image upload)
  const handleDialogSubmit = async e => {
    e.preventDefault();
    setMessage('');
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('body', form.body);
      form.tags.forEach(tag => formData.append('tags', tag));
      if (imageFile) formData.append('image', imageFile);
      await axios.post('/api/questions', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage('Question posted!');
      showSnackbar('Question posted!', 'success');
      if (socket) socket.emit('notify', `New question posted: ${form.title}`);
      setForm({ title: '', body: '', tags: [] });
      setImageFile(null);
      setShowAskDialog(false);
      fetchQuestions();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to post question');
      showSnackbar(err.response?.data?.message || 'Failed to post question', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickQuestion = async (e) => {
    e.preventDefault();
    if (!quickQuestion.trim()) return;
    setQuickSubmitting(true);
    try {
      await axios.post('/api/questions', {
        title: quickQuestion.slice(0, 40) + (quickQuestion.length > 40 ? '...' : ''),
        body: quickQuestion,
        tags: [],
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setQuickQuestion('');
      fetchQuestions();
      showSnackbar('Question posted!', 'success');
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to post question', 'error');
    } finally {
      setQuickSubmitting(false);
    }
  };

  const modernCardSx = {
    borderRadius: 4,
    boxShadow: 6,
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    p: 2,
    mb: 3,
    maxWidth: 700,
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

  const glassCardSx = {
    borderRadius: 4,
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
    background: 'rgba(255,255,255,0.18)',
    backdropFilter: 'blur(12px)',
    border: '1.5px solid rgba(255,255,255,0.25)',
    p: 2,
    mb: 3,
    maxWidth: 700,
    mx: 'auto',
  };
  const glassBubbleSx = (answered) => ({
    borderRadius: 4,
    boxShadow: '0 2px 12px 0 rgba(31, 38, 135, 0.10)',
    background: answered
      ? 'linear-gradient(135deg, rgba(200,255,200,0.35) 0%, rgba(255,255,255,0.25) 100%)'
      : 'linear-gradient(135deg, rgba(200,220,255,0.35) 0%, rgba(255,255,255,0.25) 100%)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.18)',
    p: 2,
    mb: 2,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 2,
  });
  const glassInputBarSx = {
    position: 'sticky',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    background: 'rgba(255,255,255,0.45)',
    backdropFilter: 'blur(10px)',
    borderTop: '1.5px solid rgba(255,255,255,0.18)',
    boxShadow: '0 -2px 12px 0 rgba(31, 38, 135, 0.10)',
    p: 2,
    display: 'flex',
    gap: 2,
  };

  // Filter questions to only show those belonging to the current user
  const myQuestions = user ? questions.filter(q => q.authorUser && (q.authorUser._id === user._id || q.authorUser.id === user._id || q.authorUser._id === user.id || q.authorUser.id === user.id)) : [];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)', py: 4 }}>
      <Paper elevation={0} sx={glassCardSx}>
        <Typography variant="h5" sx={sectionHeaderSx}>Q&A</Typography>
        <Divider sx={{ mb: 2 }} />
        <Button variant="contained" onClick={() => setShowAskDialog(true)} sx={{ mb: 2 }}>
          Ask Question
        </Button>
        <Dialog open={showAskDialog} onClose={() => setShowAskDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Ask a Question</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleDialogSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                name="title"
                label="Title"
                value={form.title}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{ style: { color: '#000' } }}
                InputProps={{ style: { color: '#000' } }}
                inputProps={{ style: { color: '#000' } }}
              />
              <TextField
                name="body"
                label="Question"
                value={form.body}
                onChange={handleChange}
                fullWidth
                required
                multiline
                minRows={3}
                InputLabelProps={{ style: { color: '#000' } }}
                InputProps={{ style: { color: '#000' } }}
                inputProps={{ style: { color: '#000' } }}
              />
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Tags</Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 1 }}>
                  {form.tags.map((tag, idx) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => handleTagDelete(tag)}
                      sx={{ mb: 0.5 }}
                    />
                  ))}
                </Stack>
                <TextField
                  inputRef={tagInputRef}
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Add tag and press Enter"
                  size="small"
                  sx={{ minWidth: 180 }}
                  InputLabelProps={{ style: { color: '#000' } }}
                  InputProps={{ style: { color: '#000' } }}
                  inputProps={{ style: { color: '#000' } }}
                />
              </Box>
              <Button variant="contained" component="label" sx={{ mt: 1 }}>
                {imageFile ? 'Change Image' : 'Upload Image'}
                <input type="file" accept="image/*" hidden onChange={handleImageChange} />
              </Button>
              {imageFile && <Typography variant="caption">Selected: {imageFile.name}</Typography>}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowAskDialog(false)}>Cancel</Button>
            <Button onClick={handleDialogSubmit} variant="contained" disabled={submitting}>
              {submitting ? <CircularProgress size={20} /> : 'Submit'}
            </Button>
          </DialogActions>
        </Dialog>
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search questions..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            size="small"
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
              style: { color: '#fff' }
            }}
            InputLabelProps={{ style: { color: '#000' } }}
            inputProps={{ style: { color: '#000' } }}
          />
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            {allTags.map(tag => (
              <Chip
                key={tag}
                label={tag}
                color={filterTags.includes(tag) ? 'primary' : 'default'}
                onClick={() => handleTagClick(tag)}
                sx={{ cursor: 'pointer' }}
              />
            ))}
          </Box>
        </Box>
        {message && <Alert severity={message.includes('posted') ? 'success' : 'error'} sx={{ mb: 2 }}>{message}</Alert>}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
        ) : (
          <Box sx={{ maxWidth: 700, margin: '0 auto', mt: 4, p: 3, bgcolor: 'background.paper', borderRadius: 3, boxShadow: 2 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>Q&amp;A Chat</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {myQuestions.length === 0 && <Typography>No questions yet.</Typography>}
              {myQuestions.map((q, qIdx) => {
                const isAnswered = q.answers && q.answers.length > 0;
                return (
                  <Box key={q._id || q.id} sx={{ mb: 4 }}>
                    <Box
                      sx={{
                        alignSelf: 'flex-start',
                        bgcolor: isAnswered ? 'rgba(200,255,200,0.4)' : 'rgba(200,220,255,0.4)',
                        p: 3,
                        borderRadius: 3,
                        mb: 1,
                        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                        border: isAnswered ? '1.5px solid #7ecb8f' : '1.5px solid #90caf9',
                        minWidth: 250,
                        maxWidth: 600,
                        mx: 'auto',
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ color: '#222', fontWeight: 600, fontSize: '1.15rem', mb: 0.5 }}>{q.title}</Typography>
                      <Typography variant="body1" sx={{ color: '#222', fontSize: '1.05rem', mb: 1 }}>{q.body}</Typography>
                      {q.image && (
                        <Box sx={{ mt: 1 }}>
                          <img
                            src={`https://aschtech-backend.onrender.com/${q.image}`}
                            alt="Question attachment"
                            style={{ maxWidth: 300, maxHeight: 200, borderRadius: 8 }}
                          />
                        </Box>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        by {q.authorUser && q.authorUser.username && q.authorUser.email
                          ? `${q.authorUser.username} (${q.authorUser.email})`
                          : 'Unknown'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        {q.createdAt ? dayjs(q.createdAt).format('YYYY-MM-DD HH:mm:ss') : ''}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 8 }}>
                      {isAnswered ? (
                        q.answers.map((ans, idx) => (
                          <Box key={ans._id || ans.id || idx} sx={{
                            alignSelf: 'flex-end',
                            bgcolor: 'rgba(255,249,196,0.7)',
                            p: 2,
                            borderRadius: 2,
                            mb: 1,
                            boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
                            minWidth: 180,
                            maxWidth: 500,
                          }}>
                            <Typography sx={{ color: '#222', fontSize: '1rem' }}>{ans.body}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              by {ans.authorUser && ans.authorUser.username && ans.authorUser.email
                                ? `${ans.authorUser.username} (${ans.authorUser.email})`
                                : 'Unknown'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                              {ans.createdAt ? dayjs(ans.createdAt).format('YYYY-MM-DD HH:mm:ss') : ''}
                            </Typography>
                          </Box>
                        ))
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>No answer yet.</Typography>
                        )}
                      </Box>
                  </Box>
                );
              })}
            </Box>
            {/* Quick question textarea at the bottom */}
            {user && user.role !== 'admin' && (
              <Box component="form" onSubmit={handleQuickQuestion} sx={{ mt: 4, display: 'flex', gap: 2, alignItems: 'flex-end' }}>
                <TextField
                  label="Ask a quick question..."
                  value={quickQuestion}
                  onChange={e => setQuickQuestion(e.target.value)}
                  fullWidth
                  multiline
                  minRows={2}
                  InputLabelProps={{ style: { color: '#000' } }}
                  InputProps={{ style: { color: '#000' } }}
                  inputProps={{ style: { color: '#000' } }}
                />
                <Button type="submit" variant="contained" disabled={quickSubmitting || !quickQuestion.trim()}>
                  {quickSubmitting ? <CircularProgress size={20} /> : 'Send'}
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Paper>
      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{selected?.title}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ alignSelf: 'flex-start', bgcolor: '#e3f2fd', p: 2, borderRadius: 2 }}>
              <Typography variant="body1">{selected?.body}</Typography>
              <Typography variant="caption" color="text.secondary">Author: {selected?.author || 'Unknown'}</Typography>
            </Box>
          <Typography variant="h6" sx={{ mt: 2 }}>Answers</Typography>
          {selected?.answers && selected.answers.length > 0 ? (
              selected.answers.map((ans, idx) => (
                <Box key={ans._id || ans.id || idx} sx={{ alignSelf: 'flex-end', bgcolor: '#f1f8e9', p: 2, borderRadius: 2, mb: 1 }}>
                  <Typography>{ans.body}</Typography>
              <Typography variant="caption" color="text.secondary">
                    by {ans.authorUser && ans.authorUser.username && ans.authorUser.email
                      ? `${ans.authorUser.username} (${ans.authorUser.email})`
                      : 'Unknown'}
              </Typography>
            </Box>
              ))
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>No answer yet.</Typography>
          )}
            </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this {deleteTarget?.type}? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" disabled={deleting}>
            {deleting ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <div style={{
        marginTop: 40,
        padding: 24,
        background: 'rgba(30,40,60,0.85)',
        borderRadius: 12,
        color: '#fff',
        textAlign: 'center',
        boxShadow: '0 4px 24px rgba(0,0,0,0.15)'
      }}>
        <h2>Contact AshTech</h2>
        <p>
          Have a question, suggestion, or want to work with us?<br />
          Reach out any time!
        </p>
        <div style={{ fontSize: '1.1rem', margin: '12px 0' }}>
          <b>📧 Email:</b> Ashtech@gmail.com<br />
          <b>📞 Phone:</b> +254 740 953 975
        </div>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setShowAppointment(true)}
          style={{ marginTop: 16 }}
        >
          Book Appointment
        </Button>
        <Dialog open={showAppointment} onClose={() => setShowAppointment(false)}>
          <DialogTitle>Book Appointment</DialogTitle>
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
              <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
                Submit
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        {confirmation && <Alert severity="success">{confirmation}</Alert>}
        <div style={{ fontWeight: 'bold', marginTop: 8 }}>
          Let's build something brilliant together.
        </div>
      </div>
    </Box>
  );
}

export default Questions; 
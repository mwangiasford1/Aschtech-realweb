import React, { useEffect, useRef, useState, useContext } from 'react';
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
import Pagination from '@mui/material/Pagination';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Divider from '@mui/material/Divider';

function Tutorials() {
  const { user } = useContext(AuthContext);
  const { showSnackbar } = useSnackbar();
  const socket = useSocket();
  const [tutorials, setTutorials] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', tags: '' });
  const [message, setMessage] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 5;
  const [search, setSearch] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [filterTags, setFilterTags] = useState([]);
  const videoRefs = useRef({});
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);

  useEffect(() => {
    videoRefs.current = {};
  }, [tutorials]);

  // Clean up stale refs and re-attach listeners after every render
  useEffect(() => {
    // Remove refs for videos that no longer exist
    const validKeys = new Set(tutorials.map((tut, idx) => String(tut._id || tut.id || idx)));
    Object.keys(videoRefs.current).forEach(key => {
      if (!validKeys.has(key)) {
        delete videoRefs.current[key];
      }
    });

    // Attach play event listeners
    const handlePlay = (event) => {
      const refs = videoRefs.current;
      const playingKey = Object.keys(refs).find(key => refs[key] === event.target);
      Object.entries(refs).forEach(([key, video]) => {
        if (video && key !== playingKey) {
          video.pause();
        }
      });
    };
    const attached = [];
    Object.entries(videoRefs.current).forEach(([key, video]) => {
      if (video) {
        video.removeEventListener('play', handlePlay); // Remove any previous
        video.addEventListener('play', handlePlay);
        attached.push([video, handlePlay]);
      }
    });
    return () => {
      attached.forEach(([video, handler]) => {
        if (video) video.removeEventListener('play', handler);
      });
    };
  }, [tutorials, Object.keys(videoRefs.current).join(",")]);

  useEffect(() => {
    fetchTutorials(page, search, filterTags);
    // eslint-disable-next-line
  }, [page, search, filterTags]);

  const fetchTutorials = async (pageNum = 1, searchVal = '', tagsArr = []) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', pageNum);
      params.append('limit', limit);
      if (searchVal) params.append('search', searchVal);
      if (tagsArr.length > 0) params.append('tags', tagsArr.join(','));
      const res = await axios.get(`/api/tutorials?${params.toString()}`);
      setTutorials(res.data.tutorials);
      setTotal(res.data.total);
    } catch (err) {
      setMessage('Failed to load tutorials');
      showSnackbar('Failed to load tutorials', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    setSubmitting(true);
    try {
      await axios.post('/api/tutorials', {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMessage('Tutorial added!');
      showSnackbar('Tutorial added!', 'success');
      if (socket) socket.emit('notify', `New tutorial posted: ${form.title}`);
      setForm({ title: '', content: '', tags: '' });
      setShowForm(false);
      fetchTutorials();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add tutorial');
      showSnackbar(err.response?.data?.message || 'Failed to add tutorial', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/tutorials/${deleteId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      showSnackbar('Tutorial deleted!', 'success');
      setDeleteId(null);
      fetchTutorials();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to delete tutorial', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleTagAdd = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !filterTags.includes(tagInput.trim())) {
      setFilterTags([...filterTags, tagInput.trim()]);
      setTagInput('');
    }
  };
  const handleTagRemove = (tag) => {
    setFilterTags(filterTags.filter(t => t !== tag));
  };

  const handleVideoPlay = (id) => {
    setCurrentlyPlaying(id);
    Object.entries(videoRefs.current).forEach(([key, video]) => {
      if (video && key !== String(id)) {
        video.pause();
      }
    });
  };

  const handleVideoPause = (id) => {
    if (currentlyPlaying === id) {
      setCurrentlyPlaying(null);
    }
  };

  const modernCardSx = {
    borderRadius: 4,
    boxShadow: 6,
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    p: 3,
    mb: 4,
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

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', py: 4 }}>
      <Card sx={modernCardSx}>
        <CardContent>
          <Typography variant="h5" sx={sectionHeaderSx}>Tutorials</Typography>
          <Divider sx={{ mb: 2 }} />
          {/* Remove Add Tutorial button and form from user tutorials page */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              placeholder="Search tutorials..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              size="small"
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                style: { color: '#fff' }
              }}
              InputLabelProps={{ style: { color: '#fff' } }}
            />
            <form onSubmit={handleTagAdd} style={{ display: 'flex', gap: 4 }}>
              <TextField
                placeholder="Add tag filter"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                size="small"
                InputLabelProps={{ style: { color: '#fff' } }}
                InputProps={{ style: { color: '#fff' } }}
              />
              <Button type="submit" variant="outlined" size="small">Add</Button>
            </form>
            {filterTags.map(tag => (
              <Button key={tag} size="small" variant="contained" color="secondary" onClick={() => handleTagRemove(tag)} sx={{ ml: 1 }}>
                {tag} ×
              </Button>
            ))}
          </Box>
          {message && <Alert severity={message.includes('added') ? 'success' : 'error'} sx={{ mb: 2 }}>{message}</Alert>}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
          ) : (
            <>
              <List>
                {tutorials.map((tut, idx) => (
                  <ListItem key={tut._id || tut.id || idx} disablePadding sx={{ mb: 2 }}>
                    <Card sx={{ width: '100%' }}>
                      <CardContent>
                        <Typography variant="h6">{tut.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          by {tut.authorUser ? tut.authorUser.username : 'Unknown'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Tags: {Array.isArray(tut.tags) ? tut.tags.join(', ') : (tut.tags || '').split(',').join(', ')}
                        </Typography>
                        {/* Display content based on link type */}
                        {tut.link && tut.link.match(/\.(mp4|webm)$/i) && (
                          <video
                            ref={el => {
                              const key = String(tut._id || tut.id || idx);
                              if (el) {
                                videoRefs.current[key] = el;
                              } else {
                                delete videoRefs.current[key];
                              }
                            }}
                            src={tut.link.startsWith('http') ? tut.link : `/${tut.link.replace(/\\/g, '/')}`}
                            controls
                            style={{ maxWidth: '100%', marginTop: 8 }}
                            poster={tut.thumbnail ? (tut.thumbnail.startsWith('http') ? tut.thumbnail : `/${tut.thumbnail.replace(/\\/g, '/')}`) : undefined}
                          >
                            Your browser does not support the video tag.
                          </video>
                        )}
                        {tut.link && tut.link.match(/(youtube\.com|youtu\.be|vimeo\.com)/i) && (
                          <iframe
                            src={tut.link.replace('watch?v=', 'embed/')}
                            frameBorder="0"
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                            title="video"
                            style={{ width: '100%', height: 300, marginTop: 8 }}
                          />
                        )}
                        {tut.link && tut.link.match(/\.pdf$/i) && (
                          <iframe src={tut.link} style={{ width: '100%', height: 400, marginTop: 8 }} title="PDF" />
                        )}
                        {tut.link && tut.link.match(/\.(jpg|jpeg|png|gif|svg)$/i) && (
                          <img src={tut.link} alt="Tutorial" style={{ maxWidth: 200, maxHeight: 120, marginTop: 8 }} />
                        )}
                        {!tut.link && (
                          <Typography variant="body1" sx={{ mt: 1 }}>{tut.content}</Typography>
                        )}
                      </CardContent>
                      <CardActions>
                        <Button size="small" onClick={() => setSelected(tut)}>View</Button>
                        {/* Delete button removed for all users */}
                      </CardActions>
                    </Card>
                  </ListItem>
                ))}
              </List>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination
                  count={Math.ceil(total / limit)}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                />
              </Box>
            </>
          )}
        </CardContent>
      </Card>
      {/* Modernize dialogs: add rounded corners, shadow, and padding */}
      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, boxShadow: 6, p: 2 } }}>
        <DialogTitle>{selected?.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>{selected?.content}</Typography>
          <Typography variant="body2" color="text.secondary">Tags: {selected?.tags.join(', ')}</Typography>
          <Typography variant="body2" color="text.secondary">Author: {selected?.author?.username || 'Unknown'}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)} PaperProps={{ sx: { borderRadius: 4, boxShadow: 6, p: 2 } }}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this tutorial? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} disabled={deleting}>Cancel</Button>
          <Button onClick={handleDelete} color="error" disabled={deleting}>
            {deleting ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Tutorials; 
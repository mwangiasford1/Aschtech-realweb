import React, { createContext, useState, useEffect, useContext } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { useSnackbar } from './SnackbarContext';
import { useSocket } from './SocketContext';
import axios from 'axios';

export const AuthContext = createContext();

function getTokenExpiration(token) {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null; // exp in ms
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [logoutTimer, setLogoutTimer] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showSnackbar } = useSnackbar();
  const socket = useSocket();

  const logout = (expired) => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (logoutTimer) clearTimeout(logoutTimer);
    showSnackbar(expired ? 'Session expired. Please log in again.' : 'Logged out successfully.', expired ? 'warning' : 'info');
  };

  // Restore auth state from localStorage on load
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      // Always fetch the latest profile on load
      axios.get('/api/users/me', {
        headers: { Authorization: `Bearer ${storedToken}` }
      }).then(res => {
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
        setLoading(false); // <-- Only set loading to false after fetch
      }).catch(() => {
        setLoading(false); // <-- Also set loading to false on error
      });
    } else {
      setLoading(false); // <-- If no token/user, set loading to false
    }
    return () => { if (logoutTimer) clearTimeout(logoutTimer); };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!socket || typeof socket.on !== 'function') return;
    const handleForceLogout = (msg) => {
      showSnackbar(msg || 'You have been logged out because your account was logged in elsewhere.', 'warning');
      logout();
      window.location.href = '/login';
    };
    socket.on('force logout', handleForceLogout);
    return () => {
      socket.off('force logout', handleForceLogout);
    };
  }, [socket]);

  const login = (user, token) => {
    setUser(user);
    setToken(token);
    console.log('Saving token to localStorage:', token); // Debug log
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    showSnackbar('Login successful!', 'success');
    const exp = getTokenExpiration(token);
    if (exp) {
      const timer = setTimeout(() => logout(true), exp - Date.now());
      setLogoutTimer(timer);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress size={60} thickness={5} />
    </div>
  );

  return (
    <AuthContext.Provider value={{ user, setUser, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 
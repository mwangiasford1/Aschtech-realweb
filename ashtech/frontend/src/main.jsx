import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { SnackbarProvider } from './context/SnackbarContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { BrowserRouter } from 'react-router-dom';
import './index.css'; // Import global styles
import axios from 'axios';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.withCredentials = true;

// Add request interceptor for auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <SocketProvider>
        <NotificationProvider>
          <SnackbarProvider>
            <AuthProvider>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <App />
              </LocalizationProvider>
            </AuthProvider>
          </SnackbarProvider>
        </NotificationProvider>
      </SocketProvider>
    </BrowserRouter>
  </React.StrictMode>
);

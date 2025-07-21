import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useSocket } from './SocketContext';
import { useNotifications } from './NotificationContext';

const SnackbarContext = createContext();

export function SnackbarProvider({ children }) {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const socket = useSocket();
  const { addNotification } = useNotifications();

  const showSnackbar = useCallback((message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleClose = () => {
    setSnackbar(s => ({ ...s, open: false }));
  };

  useEffect(() => {
    if (!socket || typeof socket.on !== 'function') return;
    const handleNotify = (notification) => {
      setSnackbar({ open: true, message: notification, severity: 'info' });
      addNotification(notification);
    };
    socket.on('notify', handleNotify);
    return () => {
      socket.off('notify', handleNotify);
    };
  }, [socket, addNotification]);

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  return useContext(SnackbarContext);
} 
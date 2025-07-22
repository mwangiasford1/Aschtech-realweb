import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../config/axios';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [notification, ...prev]);
    setUnread((u) => u + 1);
  }, []);

  const markAllRead = useCallback(() => {
    setUnread(0);
  }, []);

  // Fetch notifications on mount
  useEffect(() => {
    api.get('/api/notifications')
      .then(res => {
        setNotifications(res.data);
        setUnread(res.data.length); // Mark all as unread initially
      })
      .catch(() => setNotifications([]));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unread, addNotification, markAllRead, setNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
} 
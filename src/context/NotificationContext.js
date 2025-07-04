import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import notificationService from '../services/notificationService';
import authService from '../services/auth';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(() => {
    // Load cached notifications from localStorage if available to improve UX
    try {
      const cached = localStorage.getItem('admin_notifications');
      return cached ? JSON.parse(cached) : [];
    } catch (err) {
      console.error('Failed to parse cached notifications:', err);
      return [];
    }
  });
  const [unreadCount, setUnreadCount] = useState(() => {
    const cachedCount = localStorage.getItem('admin_unread_count');
    return cachedCount ? Number(cachedCount) : 0;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const subscriptionRef = useRef(null);

  // Helper to append new notifications safely
  const addNotification = (notification) => {
    setNotifications((prev) => {
      if (prev.some((n) => n.id === notification.id)) {
        return prev;
      }
      return [notification, ...prev];
    });
  };

  // Fetch initial notifications & count
  useEffect(() => {
    const initialise = async () => {
      try {
        // Redirect if not authenticated
        if (!authService.isAuthenticated()) {
          navigate('/login');
          return;
        }

        setLoading(true);
        const [notifData, count] = await Promise.all([
          notificationService.getAllNotifications(100),
          notificationService.getUnreadCount(),
        ]);

        setNotifications(notifData || []);
        setUnreadCount(typeof count === 'number' ? count : 0);
      } catch (err) {
        console.error('Error loading notifications:', err);
        setError(err.message || 'Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    initialise();
  }, [navigate]);

  // Setup SSE subscription once
  useEffect(() => {
    if (!authService.isAuthenticated()) return;
    // Subscribe once
    if (!subscriptionRef.current) {
      subscriptionRef.current = notificationService.subscribeToNotifications((n) => {
        addNotification(n);
        if (n.type !== 'connected') {
          setUnreadCount((prev) => prev + 1);
        }
      });
    }

    return () => {
      // Clean up when provider unmounts (should rarely happen)
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, []);

  // Periodic polling fallback in case SSE misses any events or is disconnected
  useEffect(() => {
    const POLL_INTERVAL = 60000; // 1 minute
    let poller;

    const poll = async () => {
      try {
        const [all, unread] = await Promise.all([
          notificationService.getAllNotifications(100),
          notificationService.getUnreadCount(),
        ]);

        if (all) {
          setNotifications(all);
        }
        if (typeof unread === 'number') {
          setUnreadCount(unread);
        }
      } catch (err) {
        console.error('Polling notifications failed:', err);
      }
    };

    poller = setInterval(poll, POLL_INTERVAL);

    return () => {
      if (poller) clearInterval(poller);
    };
  }, []);

  // Persist notifications and unread count to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('admin_notifications', JSON.stringify(notifications));
      localStorage.setItem('admin_unread_count', unreadCount.toString());
    } catch (err) {
      console.error('Failed to cache notifications:', err);
    }
  }, [notifications, unreadCount]);

  // Actions
  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking as read:', err);
      setError(err.message || 'Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
      setError(err.message || 'Failed to mark all as read');
    }
  };

  const deleteAllNotifications = async () => {
    try {
      await notificationService.deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('Error deleting all notifications:', err);
      setError(err.message || 'Failed to delete notifications');
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteAllNotifications,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export default NotificationContext; 
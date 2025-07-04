import React, { useState, useEffect, useRef } from 'react';
import { 
  FaBell, 
  FaEnvelope, 
  FaUser,
  FaSignOutAlt,
  FaCheckCircle,
  FaStar,
  FaUserTie,
  FaHome,
  FaAddressCard,
  FaUserPlus
} from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/auth';
import notificationService from '../services/notificationService';
import { useNotifications } from '../context/NotificationContext';
import '../css/style.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Static reference to track initialization across all component instances
const globalInitStatus = {
  notificationsInitialized: false,
  notificationsDataLoaded: false,
  lastLoadTimestamp: 0,
  currentUser: null,
  DEBUG: false, // Set to true only during development to see logs
  cachedNotifications: [],
  cachedUnreadCount: 0
};

/**
 * Topbar Component
 * Renders the top navigation bar of the admin panel
 */
const Topbar = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(globalInitStatus.currentUser);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  
  const userDropdownRef = useRef(null);
  const alertsDropdownRef = useRef(null);
  const hasLoggedUser = useRef(false);

  // Pull values from NotificationContext
  const {
    notifications: ctxNotifications,
    unreadCount: ctxUnread,
    markAsRead: ctxMarkAsRead,
    markAllAsRead: ctxMarkAllAsRead,
    deleteAllNotifications: ctxDeleteAllNotifications
  } = useNotifications();

  // Conditionally log message only in debug mode
  const debugLog = (message, ...args) => {
    if (globalInitStatus.DEBUG) {
      console.log(message, ...args);
    }
  };

  // Load initial notifications and set up subscription
  const initializeNotifications = async () => {
    // Check global status first
    if (globalInitStatus.notificationsInitialized) {
      debugLog('Notifications already initialized globally, skipping setup');
      
      // Check if notification data should be refreshed (every 5 minutes)
      const now = Date.now();
      const fiveMinutesAgo = now - 300000; // 5 minutes in ms
      
      if (!globalInitStatus.notificationsDataLoaded || globalInitStatus.lastLoadTimestamp < fiveMinutesAgo) {
        debugLog('Data is stale or not loaded, refreshing notification data');
        await loadNotificationData();
        globalInitStatus.lastLoadTimestamp = now;
        globalInitStatus.notificationsDataLoaded = true;
      } else {
        debugLog('Using cached notification data from global state');
      }
      return;
    }

    try {
      // Set up notification subscription first
      debugLog('Setting up real-time notification subscription');
      notificationService.subscribeToNotifications(handleNewNotification);
      globalInitStatus.notificationsInitialized = true;
      debugLog('Notification subscription established');
      
      // Load initial data
      await loadNotificationData();
      globalInitStatus.lastLoadTimestamp = Date.now();
      globalInitStatus.notificationsDataLoaded = true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  };
  
  // Load notification data without recreating subscription
  const loadNotificationData = async () => {
    try {
      debugLog('Loading notifications and unread count...');
      const [notificationData, unreadCount] = await Promise.all([
        notificationService.getAllNotifications(100),
        notificationService.getUnreadCount()
      ]);
      
      if (notificationData !== null) {
        debugLog('Loaded notifications count:', notificationData?.length);
        setNotifications(notificationData);
        // Cache globally for reuse across component mounts
        globalInitStatus.cachedNotifications = notificationData;
      } else {
        debugLog('Skipped updating notifications due to fetch error');
      }

      debugLog('Unread count:', unreadCount);
      const safeUnread = typeof unreadCount === 'number' ? unreadCount : 0;
      setUnreadNotifications(safeUnread);
      globalInitStatus.cachedUnreadCount = safeUnread;
    } catch (error) {
      console.error('Error loading notification data:', error);
    }
  };

  // Handle new notifications received
  const handleNewNotification = (notification) => {
    if (!notification) {
      return;
    }

    // Show browser notification if applicable
    if (Notification.permission === 'granted' && !document.hidden) {
      new Notification(notification.title || 'New Notification', {
        body: notification.message,
        icon: '/favicon.ico'
      });
    }
    
    // Update notifications list
    setNotifications(prev => {
      // Check if notification already exists to prevent duplicates
      if (prev.some(n => n.id === notification.id)) {
        return prev;
      }
      const updated = [notification, ...prev];
      // Update global cache
      globalInitStatus.cachedNotifications = updated;
      return updated;
    });
    
    // Only increment unread count for real notifications (not connection status messages)
    if (notification.type !== 'connected') {
      setUnreadNotifications(prev => {
        const updatedCount = prev + 1;
        globalInitStatus.cachedUnreadCount = updatedCount;
        return updatedCount;
      });
    }
  };

  useEffect(() => {
    // Load cached notifications and unread count if available
    if (globalInitStatus.cachedNotifications && globalInitStatus.cachedNotifications.length > 0) {
      setNotifications(globalInitStatus.cachedNotifications);
      setUnreadNotifications(globalInitStatus.cachedUnreadCount || 0);
    }

    // Get current user data when component mounts
    const user = authService.getCurrentUser();
    if (!user || !authService.getToken()) {
      console.error('No user or token found, redirecting to login');
      navigate('/login');
      return;
    }
    
    // Only log user info once per session
    if (!hasLoggedUser.current && globalInitStatus.DEBUG) {
      hasLoggedUser.current = true;
    }
    
    // Store user in global state to avoid redundant state updates
    if (!globalInitStatus.currentUser) {
      globalInitStatus.currentUser = user;
    }
    
    setCurrentUser(user);

    // NotificationProvider already handles fetching and SSE, mark as initialized
    globalInitStatus.notificationsInitialized = true;

    // Add click event listener to close dropdowns when clicking outside
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
      if (alertsDropdownRef.current && !alertsDropdownRef.current.contains(event.target)) {
        setShowAlertsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [navigate]);

  // Keep local state in sync with context state
  useEffect(() => {
    setNotifications(ctxNotifications || []);
    setUnreadNotifications(ctxUnread || 0);
  }, [ctxNotifications, ctxUnread]);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      // Reset global caches
      globalInitStatus.notificationsInitialized = false;
      globalInitStatus.notificationsDataLoaded = false;
      globalInitStatus.lastLoadTimestamp = 0;
      globalInitStatus.currentUser = null;
      globalInitStatus.cachedNotifications = [];
      globalInitStatus.cachedUnreadCount = 0;
      
      await authService.logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Check if notification and ID exist
      if (!notification || !notification.id) {
        console.error('Invalid notification:', notification);
        return;
      }

      if (!notification.read) {
        await ctxMarkAsRead(notification.id);
      }
      
      // Handle navigation based on notification type
      if (notification.action_url) {
        navigate(notification.action_url);
        setShowAlertsDropdown(false);
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  // Toggle dropdown functions
  const toggleUserDropdown = (e) => {
    e.preventDefault();
    setShowUserDropdown(!showUserDropdown);
    setShowAlertsDropdown(false);
  };

  const toggleAlertsDropdown = async (e) => {
    e.preventDefault();
    setShowAlertsDropdown(!showAlertsDropdown);
    setShowUserDropdown(false);

    // If we're opening the dropdown and there are unread notifications
    if (!showAlertsDropdown && unreadNotifications > 0) {
      try {
        await ctxMarkAllAsRead();
      } catch (error) {
        console.error('Error marking notifications as read:', error);
      }
    }
  };

  const handleClearAllNotifications = async (e) => {
    e.preventDefault();
    try {
      await ctxDeleteAllNotifications();
      setNotifications([]);
      setUnreadNotifications(0);
      setShowAlertsDropdown(false);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  // Helper function to get notification icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'testimonial':
        return <FaStar />;
      case 'agent':
        return <FaUserTie />;
      case 'property':
        return <FaHome />;
      case 'inquiry':
        return <FaEnvelope />;
      case 'contact':
        return <FaAddressCard />;
      case 'user':
        return <FaUserPlus />;
      default:
        return <FaBell />;
    }
  };

  // Helper function to get notification background color
  const getNotificationBgColor = (type) => {
    switch (type) {
      case 'testimonial':
        return 'bg-warning';
      case 'agent':
        return 'bg-info';
      case 'property':
        return 'bg-success';
      case 'inquiry':
        return 'bg-primary';
      case 'contact':
        return 'bg-secondary';
      case 'user':
        return 'bg-info';
      default:
        return 'bg-primary';
    }
  };

  // Don't render anything if user is not loaded
  if (!currentUser) {
    return null;
  }

  return (
    <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 shadow-sm animate__animated animate__fadeInDown fixed-top" style={{zIndex: 1030}}>
      {/* Right-side Navigation Items */}
      <ul className="navbar-nav ms-auto me-0 me-md-3 my-2 my-md-0">
        {/* Alerts Dropdown */}
        <li className="nav-item dropdown no-arrow mx-1" ref={alertsDropdownRef}>
          <a 
            className="nav-link" 
            href="#" 
            onClick={toggleAlertsDropdown}
          >
            <FaBell />
            {/* Notification Counter Badge */}
            {unreadNotifications > 0 && (
              <span className="badge badge-danger badge-counter">
                {unreadNotifications > 99 ? '99+' : unreadNotifications}
              </span>
            )}
          </a>
          {/* Alerts Dropdown Menu */}
          <div className={`dropdown-menu dropdown-menu-end shadow animated--grow-in ${showAlertsDropdown ? 'show' : ''}`}>
            <div className="d-flex justify-content-between align-items-center dropdown-header">
              <span>Alerts Center</span>
              {notifications && notifications.length > 0 && (
                <a 
                  href="#" 
                  className="text-danger text-decoration-none small"
                  onClick={handleClearAllNotifications}
                >
                  Clear All
                </a>
              )}
            </div>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {notifications && notifications.length > 0 ? (
                notifications
                  // Filter out connection status notifications from the UI
                  .filter(notification => notification.type !== 'connected')
                  .map(notification => (
                    <a 
                      key={notification.id || `notification-${Math.random()}`}
                      className="dropdown-item d-flex align-items-center" 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleNotificationClick(notification);
                      }}
                    >
                      <div className="me-3">
                        <div className={`icon-circle ${getNotificationBgColor(notification.type)}`}>
                          {notification.read ? 
                            <FaCheckCircle className="text-white" /> : 
                            getNotificationIcon(notification.type)
                          }
                        </div>
                      </div>
                      <div>
                        <div className="small text-gray-500">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </div>
                        <span className={`${notification.read ? 'text-gray-500' : 'font-weight-bold'}`}>
                          {notification.message}
                        </span>
                      </div>
                    </a>
                  ))
              ) : (
                <div className="dropdown-item text-center small text-gray-500">
                  No notifications
                </div>
              )}
            </div>
          </div>
        </li>

        {/* Vertical Divider */}
        <div className="topbar-divider d-none d-sm-block"></div>

        {/* User Profile Dropdown */}
        <li className="nav-item dropdown no-arrow" ref={userDropdownRef}>
          <a 
            className="nav-link" 
            href="#" 
            onClick={toggleUserDropdown}
          >
            <span className="me-2 d-none d-lg-inline text-gray-600 small">
              {currentUser.firstname ? `${currentUser.firstname} ${currentUser.lastname}` : currentUser.email}
            </span>
            {/* User Profile Picture */}
            <img 
              className="img-profile rounded-circle" 
              src={currentUser.profile_photo || "https://source.unsplash.com/QAB-WJcbgJk/60x60"} 
              alt="Profile" 
            />
          </a>
          {/* User Dropdown Menu */}
          <div className={`dropdown-menu dropdown-menu-end shadow animated--grow-in ${showUserDropdown ? 'show' : ''}`}>
            {/* Profile Link */}
            <Link className="dropdown-item" to="/profile" onClick={() => setShowUserDropdown(false)}>
              <FaUser className="fa-sm fa-fw me-2 text-gray-400" />
              Profile
            </Link>
            <div className="dropdown-divider"></div>
            {/* Logout Link */}
            <a 
              className="dropdown-item" 
              href="#"
              onClick={handleLogout}
            >
              <FaSignOutAlt className="fa-sm fa-fw me-2 text-gray-400" />
              Logout
            </a>
          </div>
        </li>
      </ul>
    </nav>
  );
};

export default Topbar;
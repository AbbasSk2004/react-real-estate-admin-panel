import api from './api';

const TOKEN_KEY = 'admin_token';
const API_URL = process.env.REACT_APP_API_BASE_URL || 'https://realestate-admin-backend.onrender.com/api';

// Store last authentication status globally
const serviceState = {
  isAuthenticated: false,
  hasTestedAuth: false,
  lastAuthTest: null,
  authTestPromise: null,
  fetchesInProgress: {}
};

class NotificationService {
  constructor() {
    this.eventSource = null;
    this.retryCount = 0;
    this.maxRetries = 5;
    this.retryDelay = 1000; // Start with 1 second delay
    this.isConnecting = false;
    this.activeSubscription = null;
    this.subscribers = [];
    this.initialConnectionAttempted = false;
    this.subscriberLogsSuppressed = false;
  }

  // Get user's unread notifications count - with deduplication
  async getUnreadCount() {
    const cacheKey = 'unread_count';
    
    // Don't make duplicate requests
    if (serviceState.fetchesInProgress[cacheKey]) {
      try {
        return await serviceState.fetchesInProgress[cacheKey];
      } catch (error) {
        console.error('Cached unread count request failed:', error);
      }
    }
    
    try {
      // Set up promise for potential duplicate calls
      const promise = api.get(`/notifications/unread/count?_=${Date.now()}`);
      serviceState.fetchesInProgress[cacheKey] = promise;
      
      const response = await promise;
      const result = response.data?.count || 0;
      
      // Clear from in-progress tracking
      delete serviceState.fetchesInProgress[cacheKey];
      
      return result;
    } catch (error) {
      // Log error but don't spam console
      if (!error.isLogged) {
        console.error('Error fetching unread count:', error);
        error.isLogged = true;
      }
      
      delete serviceState.fetchesInProgress[cacheKey];
      return 0;
    }
  }

  // Get user's notifications - with deduplication
  async getNotifications(limit = 10, offset = 0) {
    const cacheKey = `notifications_${limit}_${offset}`;
    
    // Don't make duplicate requests
    if (serviceState.fetchesInProgress[cacheKey]) {
      try {
        return await serviceState.fetchesInProgress[cacheKey];
      } catch (error) {
        console.error('Cached notifications request failed:', error);
      }
    }
    
    try {
      // Set up promise for potential duplicate calls
      const promise = api.get(`/notifications?limit=${limit}&offset=${offset}&_=${Date.now()}`);
      serviceState.fetchesInProgress[cacheKey] = promise;
      
      const response = await promise;
      const result = response.data || [];
      
      // Clear from in-progress tracking
      delete serviceState.fetchesInProgress[cacheKey];
      
      return result;
    } catch (error) {
      // Log error but don't spam console
      if (!error.isLogged) {
        console.error('Error fetching notifications:', error);
        error.isLogged = true;
      }
      
      delete serviceState.fetchesInProgress[cacheKey];
      // Return null to indicate failure so callers can decide whether to keep existing data
      return null;
    }
  }

  // Fetch all notifications in a single request (no pagination)
  async getAllNotifications() {
    try {
      const response = await api.get(`/notifications?_=${Date.now()}`);
      return response.data || [];
    } catch (error) {
      if (!error.isLogged) {
        console.error('Error fetching all notifications:', error);
        error.isLogged = true;
      }
      return [];
    }
  }

  // Mark notification as read
  async markAsRead(id) {
    if (!id) {
      throw new Error('Notification ID is required');
    }
    try {
      const response = await api.put(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error('Failed to mark notification as read');
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      const response = await api.put('/notifications/read/all');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw new Error('Failed to mark all notifications as read');
    }
  }

  // Delete a notification
  async deleteNotification(notificationId) {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Delete all notifications
  async deleteAllNotifications() {
    try {
      const response = await api.delete('/notifications/all');
      return response.data;
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      throw error;
    }
  }

  // Subscribe to Server-Sent Events for real-time notifications
  subscribeToNotifications(onNotification) {
    // Check if we already have an active subscription
    if (this.activeSubscription) {
      // Only log the first time in a session
      if (!this.subscriberLogsSuppressed) {
        console.log('Using existing notification subscription');
        this.subscriberLogsSuppressed = true;
      }
      
      // Register this subscriber
      this.subscribers.push(onNotification);
      
      // Return unsubscribe function specific to this subscriber
      return {
        unsubscribe: () => {
          // Log only if we're actually removing something
          const beforeCount = this.subscribers.length;
          this.subscribers = this.subscribers.filter(sub => sub !== onNotification);
          if (beforeCount !== this.subscribers.length) {
            console.log('Unsubscribing individual subscriber');
          }
          
          // If no more subscribers, clean up the connection
          if (this.subscribers.length === 0) {
            this._cleanupConnection();
          }
        }
      };
    }
    
    // No active subscription exists, create a new one
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      console.error('No authentication token found');
      return null;
    }

    // Register this subscriber
    this.subscribers.push(onNotification);
    
    // Create the connection if not already connecting
    if (!this.isConnecting && !this.eventSource) {
      this._initializeConnection(token);
    }
    
    // Create subscription object
    this.activeSubscription = {
      unsubscribe: () => {
        console.log('Unsubscribing from notifications');
        this.subscribers = this.subscribers.filter(sub => sub !== onNotification);
        
        // If no more subscribers, clean up the connection
        if (this.subscribers.length === 0) {
          this._cleanupConnection();
        }
      }
    };
    
    return this.activeSubscription;
  }
  
  // Initialize the SSE connection
  _initializeConnection(token) {
    if (this.isConnecting) return;
    
    this.isConnecting = true;
    console.log('Attempting to connect to notification stream...');
    
    try {
      // Create the URL with token as query parameter
      const url = new URL('/api/notifications/stream', API_URL);
      url.searchParams.append('token', token);
      
      if (this.eventSource) {
        this.eventSource.close();
      }

      this.eventSource = new EventSource(url.toString());

      // Success handler
      this.eventSource.onopen = () => {
        console.log('SSE Connection established successfully');
        this.retryCount = 0;
        this.isConnecting = false;
        this.initialConnectionAttempted = true;
        serviceState.isAuthenticated = true;
      };

      // Message handler
      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data) {
            // Format notification based on type
            const formattedData = {
              ...data,
              icon: this.getNotificationIcon(data.type),
              color: this.getNotificationColor(data.type),
              read: false,
              created_at: data.created_at || new Date().toISOString()
            };
            
            // Notify all subscribers
            this.subscribers.forEach(subscriber => {
              if (typeof subscriber === 'function') {
                subscriber(formattedData);
              }
            });
          }
        } catch (error) {
          console.error('Error parsing notification:', error, 'Raw data:', event.data);
        }
      };

      // Error handler with improved retry logic
      this.eventSource.onerror = (error) => {
        console.error('SSE Error:', error);
        
        // Always close the connection on error
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }
        
        this.isConnecting = false;
        
        if (this.retryCount < this.maxRetries) {
          this.retryCount++;
          // Use exponential backoff with jitter to prevent thundering herd
          const baseDelay = this.retryDelay * Math.pow(2, this.retryCount - 1);
          const jitter = Math.random() * 1000; // Add up to 1 second of jitter
          const delay = baseDelay + jitter;
          
          console.log(`Retrying connection in ${Math.round(delay)}ms... (Attempt ${this.retryCount}/${this.maxRetries})`);
          
          // Use a timeout reference so we can clear it if needed
          this.retryTimeout = setTimeout(() => {
            this.retryTimeout = null;
            this._initializeConnection(token);
          }, delay);
        } else {
          console.error('Max retry attempts reached');
          this.activeSubscription = null;
          
          // Try one final reconnection after a longer delay (30 seconds)
          setTimeout(() => {
            console.log('Making final reconnection attempt after cooldown period');
            this.retryCount = 0; // Reset retry count for fresh attempts
            this._initializeConnection(token);
          }, 30000);
        }
      };
    } catch (error) {
      console.error('Error setting up SSE:', error);
      this.isConnecting = false;
      this.activeSubscription = null;
      
      // Try again after a delay
      setTimeout(() => {
        if (this.subscribers.length > 0) {
          this._initializeConnection(token);
        }
      }, 5000);
    }
  }
  
  // Clean up the connection
  _cleanupConnection() {
    console.log('Cleaning up notification connection');
    
    // Clear any pending retry timeouts
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
    
    if (this.eventSource) {
      try {
        this.eventSource.close();
      } catch (err) {
        console.error('Error closing event source:', err);
      }
      this.eventSource = null;
    }
    
    this.isConnecting = false;
    this.activeSubscription = null;
    this.subscribers = [];
    this.subscriberLogsSuppressed = false;
    this.retryCount = 0;
  }

  // Debug method to test authentication - with caching for better performance
  async testAuthentication() {
    // Use cached result if available and less than 5 minutes old
    const now = Date.now();
    if (serviceState.hasTestedAuth && 
        serviceState.lastAuthTest && 
        now - serviceState.lastAuthTest < 300000) { // 5 minutes in ms
      return {
        success: serviceState.isAuthenticated,
        data: { cached: true, timestamp: serviceState.lastAuthTest }
      };
    }
    
    // If there's already a test in progress, wait for it to complete
    if (serviceState.authTestPromise) {
      return serviceState.authTestPromise;
    }

    try {
      // Create new promise and store it
      serviceState.authTestPromise = (async () => {
        try {
          const response = await api.get('/notifications/debug-auth');
          
          // Update global state
          serviceState.isAuthenticated = true;
          serviceState.hasTestedAuth = true;
          serviceState.lastAuthTest = now;
          
          return { 
            success: true, 
            data: response.data 
          };
        } catch (error) {
          // Update global state
          serviceState.isAuthenticated = false;
          serviceState.hasTestedAuth = true;
          serviceState.lastAuthTest = now;
          
          return { 
            success: false, 
            error: error.response?.data || error.message 
          };
        } finally {
          // Clear promise reference
          serviceState.authTestPromise = null;
        }
      })();
      
      // Wait for the promise to resolve
      return await serviceState.authTestPromise;
    } catch (error) {
      console.error('Authentication test failed:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  // Helper method to get notification icon based on type
  getNotificationIcon(type) {
    switch (type) {
      case 'testimonial':
        return 'star';
      case 'agent':
        return 'user-tie';
      case 'property':
        return 'home';
      case 'inquiry':
        return 'envelope';
      case 'contact':
        return 'address-card';
      case 'user':
        return 'user-plus';
      default:
        return 'bell';
    }
  }

  // Helper method to get notification color based on type
  getNotificationColor(type) {
    switch (type) {
      case 'testimonial':
        return 'warning';
      case 'agent':
        return 'info';
      case 'property':
        return 'success';
      case 'inquiry':
        return 'primary';
      case 'contact':
        return 'secondary';
      case 'user':
        return 'info';
      default:
        return 'primary';
    }
  }
}

export default new NotificationService(); 
import api from './api';
import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = 'admin_token';
const USER_KEY = 'admin_user';

const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.token) {
        // Store the token and user data
        localStorage.setItem(TOKEN_KEY, response.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
        
        // Call status endpoint to ensure active status is set
        try {
          await api.get('/auth/status');
        } catch (statusError) {
          console.error('Failed to update active status:', statusError);
          // Continue anyway
        }
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      // Get the token before removing it
      const token = localStorage.getItem(TOKEN_KEY);
      
      // First try to call the logout API if we have a token
      if (token) {
        try {
          await api.post('/auth/logout');
        } catch (apiError) {
          console.error('API logout error:', apiError);
          // Continue with local logout even if API call fails
        }
      }
      
      // Then clear local storage
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      
      // Only redirect if we're not already on the login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Force reload as a last resort
      window.location.reload();
    }
  },

  getCurrentUser: () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const userStr = localStorage.getItem(USER_KEY);

      if (!token || !userStr) {
        return null;
      }

      // Verify token expiration
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        authService.logout();
        return null;
      }

      return JSON.parse(userStr);
    } catch (error) {
      console.error('User validation error:', error);
      authService.logout();
      return null;
    }
  },

  updateCurrentUser: (userData) => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        return false;
      }

      // Update user data with new values
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      return true;
    } catch (error) {
      console.error('Error updating current user:', error);
      return false;
    }
  },

  getToken: () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        return null;
      }

      // Verify token expiration
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        authService.logout();
        return null;
      }

      return token;
    } catch (error) {
      console.error('Token validation error:', error);
      authService.logout();
      return null;
    }
  },

  isAuthenticated: () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        return false;
      }

      // Verify token expiration
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch (error) {
      console.error('Token validation error:', error);
      authService.logout();
      return false;
    }
  },
  
  isTokenExpired: () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        return false; // No token present ⇒ nothing to expire
      }

      // Verify token expiration
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 < Date.now();
    } catch (error) {
      console.error('Token expiration check error:', error);
      return true; // If there's an error, consider it expired
    }
  }
};

export default authService;

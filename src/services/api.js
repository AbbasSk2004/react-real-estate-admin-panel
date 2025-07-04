import axios from 'axios';
import authService from './auth';

const TOKEN_KEY = 'admin_token';

// Error handling utility
export class APIError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.details = details;
  }
}

// Define API endpoints
export const endpoints = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
    profile: '/auth/profile',
    status: '/auth/status'
  },
  users: {
    base: '/users',
    uploadImage: '/users/upload-profile-image',
    deleteImage: '/users/delete-profile-image'
  },
  agents: {
    approved: '/agents/approved',
    applications: '/agents/applications'
  },
  contactSubmissions: {
    base: '/contact-submissions',
    updateStatus: (id) => `/contact-submissions/${id}/status`
  },
  propertyInquiries: {
    base: '/property-inquiries',
    getAll: '/property-inquiries',
    updateStatus: (id) => `/property-inquiries/${id}/status`,
    delete: (id) => `/property-inquiries/${id}`,
    reply: (id) => `/property-inquiries/${id}/reply`
  },
  faqs: {
    base: '/faqs',
    getAll: '/faqs',
    update: (uuid) => `/faqs/${uuid}`,
    delete: (uuid) => `/faqs/${uuid}`
  },
  blogs: {
    base: '/blogs',
    getAll: '/blogs',
    getById: (id) => `/blogs/${id}`,
    update: (id) => `/blogs/${id}`,
    delete: (id) => `/blogs/${id}`,
    uploadImage: '/blogs/upload-image',
    deleteImage: (filename) => `/blogs/delete-image/${filename}`
  },
  settings: {
    all: '/settings',
    section: (section) => `/settings/${section}`,
    backup: {
      list: '/settings/backup/list',
      create: '/settings/backup/create',
      restore: (id) => `/settings/backup/restore/${id}`,
      delete: (id) => `/settings/backup/delete/${id}`,
      download: (id) => `/settings/backup/download/${id}`
    },
    email: {
      test: '/settings/email/test'
    },
    api: {
      regenerateKey: '/settings/api/regenerate-key'
    }
  },
  system: {
    info: '/system/system-info',
    securityScan: '/system/security-scan',
    clearCache: '/system/clear-cache'
  },
  analytics: {
    overview: '/analytics/overview',
    propertyViews: '/analytics/property-views',
    propertyListings: '/analytics/property-listings',
    propertyTypes: '/analytics/property-types',
    topPerforming: '/analytics/top-performing',
    userActivity: '/analytics/user-activity'
  }
};

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'https://realestate-admin-backend.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Track if we're already redirecting to prevent loops
let isRedirecting = false;

// Add request interceptor to add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (token) {
      // Ensure token is properly formatted with Bearer prefix
      config.headers.Authorization = `Bearer ${token}`;
      console.log('API request to:', config.url, '- Token added to headers');
    } else {
      console.log('API request to:', config.url, '- No token available');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    console.error('API Error:', error);
    
    // Handle 401 Unauthorized errors globally
    if (error.response && error.response.status === 401) {
      console.error('Authentication error', error.response.data);
      
      // Don't redirect to login for endpoints that might be called during login
      if (!error.config.url.includes('/auth/login') && 
          !error.config.url.includes('/auth/status')) {
        // Clear token and redirect to login page
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('admin_user');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Reset redirect flag when navigation completes
if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    isRedirecting = false;
  });
}

// Attach endpoints to the api object for easy access
api.endpoints = endpoints;

export default api;

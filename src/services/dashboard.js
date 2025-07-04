import api from './api';

// Keep track of ongoing requests to prevent duplicates
let activeRequest = null;

const getRecentVerifiedProperties = async () => {
  try {
    const response = await api.get('/dashboard/recent-properties');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching recent verified properties:', error);
    return [];
  }
};

const getRecentInquiries = async () => {
  try {
    const response = await api.get('/dashboard/recent-inquiries');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching recent inquiries:', error);
    return [];
  }
};

const getDashboardStats = async () => {
  try {
    // If there's already an active request, wait for it to complete
    if (activeRequest) {
      return await activeRequest;
    }
    
    // Add timeout to API request to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    // Create a new request and store the promise
    activeRequest = api.get('/dashboard/stats', {
      signal: controller.signal
    })
      .then(response => {
        clearTimeout(timeoutId);
        return response.data;
      })
      .catch(error => {
        console.error('Error fetching dashboard stats:', error);
        
        // Handle specific error cases
        if (error.name === 'AbortError' || error.code === 'ECONNABORTED') {
          return {
            totalProperties: 0,
            activeUsers: 0,
            pendingInquiries: 0,
            error: 'Request timed out. Server may be under heavy load.'
          };
        }

        // For network errors
        if (!navigator.onLine || error.message === 'Network Error') {
          return {
            totalProperties: 0,
            activeUsers: 0,
            pendingInquiries: 0,
            error: 'No internet connection. Please check your network.'
          };
        }
        
        // For authentication errors
        if (error.response?.status === 401) {
          return {
            totalProperties: 0,
            activeUsers: 0,
            pendingInquiries: 0,
            error: 'Authentication error. Please log in again.'
          };
        }
        
        // Return default values on error to ensure UI doesn't break
        return {
          totalProperties: 0,
          activeUsers: 0,
          pendingInquiries: 0,
          error: error.message || 'Failed to fetch dashboard statistics'
        };
      })
      .finally(() => {
        // Clear the active request reference when done
        activeRequest = null;
      });
      
    // Return the promise result
    return await activeRequest;
  } catch (error) {
    console.error('Unexpected error in getDashboardStats:', error);
    return {
      totalProperties: 0,
      activeUsers: 0,
      pendingInquiries: 0,
      error: 'An unexpected error occurred'
    };
  }
};

const getMonthlyEarnings = async () => {
  try {
    const response = await api.get('/dashboard/monthly-earnings');
    const amount = response.data;
    return typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  } catch (error) {
    console.error('Error fetching monthly earnings:', error);
    return 0;
  }
};

const getEarningsOverview = async () => {
  try {
    const response = await api.get('/dashboard/earnings-overview');
    const data = response.data;
    if (data && Array.isArray(data.months) && Array.isArray(data.earnings)) {
      return data;
    }
    return { months: [], earnings: [] };
  } catch (error) {
    console.error('Error fetching earnings overview:', error);
    return { months: [], earnings: [] };
  }
};

export const dashboardService = {
  getDashboardStats,
  getRecentVerifiedProperties,
  getRecentInquiries,
  getMonthlyEarnings,
  getEarningsOverview
};

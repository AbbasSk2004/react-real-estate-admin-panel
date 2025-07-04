import api from './api';

// Function to get analytics overview data
export const getAnalyticsOverview = async (startDate, endDate) => {
  try {
    const response = await api.get('/analytics/overview', {
      params: { startDate, endDate }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    throw error;
  }
};

// Function to get property views data
export const getPropertyViewsData = async (startDate, endDate) => {
  try {
    const response = await api.get('/analytics/property-views', {
      params: { startDate, endDate }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching property views data:', error);
    throw error;
  }
};

// Function to get property listings data
export const getPropertyListingsData = async (startDate, endDate) => {
  try {
    const response = await api.get('/analytics/property-listings', {
      params: { startDate, endDate }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching property listings data:', error);
    throw error;
  }
};

// Function to get property types distribution
export const getPropertyTypesData = async (startDate, endDate) => {
  try {
    const response = await api.get('/analytics/property-types', {
      params: { startDate, endDate }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching property types data:', error);
    throw error;
  }
};

// Function to get top performing properties
export const getTopPerformingProperties = async (limit = 5, startDate, endDate) => {
  try {
    const response = await api.get('/analytics/top-performing', {
      params: { limit, startDate, endDate }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching top performing properties:', error);
    throw error;
  }
};

// Function to get user activity metrics
export const getUserActivityMetrics = async () => {
  try {
    const response = await api.get('/analytics/user-activity');
    return response.data;
  } catch (error) {
    console.error('Error fetching user activity metrics:', error);
    throw error;
  }
};

// Calculate conversion rate from property views and inquiries
export const calculateConversionRate = (views, inquiries) => {
  if (!views || views === 0) return 0;
  return ((inquiries / views) * 100).toFixed(2);
};

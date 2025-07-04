import api from './api';

const _cache = {};

const recordView = async (propertyId) => {
  try {
    const response = await api.post(`/property-views/${propertyId}`);
    if (response.data?.data?.count !== undefined) {
      _cache[propertyId] = response.data.data.count;
    }
    return response.data;
  } catch (error) {
    console.error('PropertyViewsService - recordView error:', error);
    throw error;
  }
};

const getViewCount = async (propertyId) => {
  if (_cache[propertyId] !== undefined) {
    return { success: true, data: { count: _cache[propertyId] } };
  }
  try {
    const response = await api.get(`/property-views/${propertyId}`);
    if (response.data?.data?.count !== undefined) {
      _cache[propertyId] = response.data.data.count;
    }
    return response.data;
  } catch (error) {
    console.error('PropertyViewsService - getViewCount error:', error);
    throw error;
  }
};

const clearCache = (propertyId) => {
  if (propertyId) {
    delete _cache[propertyId];
  } else {
    Object.keys(_cache).forEach((key) => delete _cache[key]);
  }
};

export default {
  getViewCount,
  clearCache,
}; 
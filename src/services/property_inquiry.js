import api from './api';

const PROPERTY_INQUIRIES_URL = '/property-inquiries';

export const propertyInquiryService = {
  // Get all inquiries with optional filters
  getAllInquiries: async (searchTerm = '', status = 'all') => {
    try {
      const response = await api.get(PROPERTY_INQUIRIES_URL, {
        params: { searchTerm, status }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update inquiry status
  updateStatus: async (id, status) => {
    try {
      const response = await api.patch(`${PROPERTY_INQUIRIES_URL}/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Delete inquiry
  deleteInquiry: async (id) => {
    try {
      const response = await api.delete(`${PROPERTY_INQUIRIES_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reply to inquiry
  replyToInquiry: async (id, message) => {
    try {
      const response = await api.post(`${PROPERTY_INQUIRIES_URL}/${id}/reply`, { message });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default propertyInquiryService;

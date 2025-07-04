import api from './api';

const TESTIMONIALS_BASE_URL = '/testimonials';

export const testimonialsService = {
  // Get all testimonials
  getAllTestimonials: async () => {
    const response = await api.get(TESTIMONIALS_BASE_URL);
    return response.data;
  },

  // Update testimonial approval status
  updateApprovalStatus: async (id, approved) => {
    const response = await api.patch(`${TESTIMONIALS_BASE_URL}/${id}/approve`, { approved });
    return response.data;
  },

  // Delete testimonial
  deleteTestimonial: async (id) => {
    const response = await api.delete(`${TESTIMONIALS_BASE_URL}/${id}`);
    return response.data;
  }
};

export default testimonialsService;

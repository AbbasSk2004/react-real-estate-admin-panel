import api from './api';

const FAQ_ENDPOINT = '/faqs';

export const faqService = {
  // Get all FAQs
  getAllFaqs: async () => {
    const response = await api.get(FAQ_ENDPOINT);
    return response.data;
  },

  // Get FAQ categories
  getCategories: async () => {
    const response = await api.get(`${FAQ_ENDPOINT}/categories`);
    return response.data;
  },

  // Create new FAQ
  createFaq: async (faqData) => {
    const response = await api.post(FAQ_ENDPOINT, faqData);
    return response.data;
  },

  // Update FAQ
  updateFaq: async (id, faqData) => {
    const response = await api.put(`${FAQ_ENDPOINT}/${id}`, faqData);
    return response.data;
  },

  // Delete FAQ
  deleteFaq: async (id) => {
    const response = await api.delete(`${FAQ_ENDPOINT}/${id}`);
    return response.data;
  }
};

export default faqService;

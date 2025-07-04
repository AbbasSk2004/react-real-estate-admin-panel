import api from './api';

const CONTACT_SUBMISSIONS_URL = '/contact-submissions';

export const contactSubmissionService = {
  // Get all contact submissions
  getAllSubmissions: async () => {
    const response = await api.get(CONTACT_SUBMISSIONS_URL);
    return response.data;
  },

  // Create a new contact submission
  createSubmission: async (submissionData) => {
    const response = await api.post(CONTACT_SUBMISSIONS_URL, submissionData);
    return response.data;
  },

  // Update a contact submission status
  updateSubmissionStatus: async (id, status) => {
    const response = await api.patch(`${CONTACT_SUBMISSIONS_URL}/${id}/status`, { status });
    return response.data;
  },

  // Delete a contact submission
  deleteSubmission: async (id) => {
    const response = await api.delete(`${CONTACT_SUBMISSIONS_URL}/${id}`);
    return response.data;
  }
};

export default contactSubmissionService;

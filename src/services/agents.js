import api from './api';

const AGENTS_BASE_URL = '/agents';

export const agentsService = {
  // Get all approved agents
  getApprovedAgents: async () => {
    const response = await api.get(`${AGENTS_BASE_URL}/approved`);
    return response.data;
  },

  // Get all agent applications
  getAgentApplications: async () => {
    const response = await api.get(`${AGENTS_BASE_URL}/applications`);
    return response.data;
  },

  // Update agent application status
  updateAgentApplication: async (id, data) => {
    const response = await api.patch(`${AGENTS_BASE_URL}/applications/${id}`, data);
    return response.data;
  },

  // Update agent feature status - using PUT instead of PATCH to avoid CORS issues
  updateAgentFeature: async (id, isFeatured) => {
    const response = await api.put(`${AGENTS_BASE_URL}/agents/${id}/feature`, { is_featured: isFeatured });
    return response.data;
  },

  // Update agent details
  updateAgent: async (id, data) => {
    const response = await api.put(`${AGENTS_BASE_URL}/agents/${id}`, data);
    return response.data;
  },

  // Delete agent
  deleteAgent: async (id) => {
    const response = await api.delete(`${AGENTS_BASE_URL}/agents/${id}`);
    return response.data;
  }
};

export default agentsService;

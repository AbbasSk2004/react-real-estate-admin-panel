import api from './api';

class ProfileService {
  async getProfile() {
    try {
      const response = await api.get('/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  async updateProfile(profileData) {
    try {
      const response = await api.put('/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async changePassword(currentPassword, newPassword) {
    try {
      console.log('ProfileService: Sending password change request');
      const response = await api.post('/profile/change-password', { currentPassword, newPassword });
      console.log('ProfileService: Password change response received:', response.status);
      return response.data;
    } catch (error) {
      console.error('ProfileService: Error changing password:', error);
      
      // Extract more detailed error information if available
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Unknown error';
      console.error('ProfileService: Error details:', errorMessage);
      
      // Return structured error information
      return {
        success: false,
        error: errorMessage,
        status: error.response?.status || 500
      };
    }
  }

  async uploadProfilePhoto(file) {
    try {
      const formData = new FormData();
      formData.append('profilePhoto', file);
      
      const response = await api.post('/profile/upload-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      throw error;
    }
  }
}

export default new ProfileService();

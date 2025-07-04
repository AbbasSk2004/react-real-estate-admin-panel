import api from './api';

const usersService = {
  // Get all users with optional search and filter
  getAllUsers: async (queryString = '') => {
    try {
      const response = await api.get(`/users${queryString ? `?${queryString}` : ''}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get a single user
  getUser: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Create a new user
  createUser: async (userData) => {
    try {
      console.log('Creating user with data:', {
        ...userData,
        password: userData.password ? '[REDACTED]' : undefined
      });
      
      const response = await api.post('/users', userData);
      console.log('User created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', {
        error: error,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  // Update a user
  updateUser: async (id, userData) => {
    try {
      // Only include the fields that can be updated
      const allowedFields = ['firstname', 'lastname', 'email', 'phone', 'profile_photo', 'role'];
      const cleanedData = allowedFields.reduce((acc, field) => {
        if (userData[field] !== undefined && userData[field] !== null) {
          acc[field] = userData[field];
        }
        return acc;
      }, {});

      console.log('Updating user with data:', { id, cleanedData });
      
      const response = await api.put(`/users/${id}`, cleanedData);
      console.log('Update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', {
        error,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  // Delete a user
  deleteUser: async (id) => {
    try {
      await api.delete(`/users/${id}`);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Upload profile image
  uploadProfileImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append('profile_image', file);
      const response = await api.post('/users/upload-profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  },

  // Delete profile image
  deleteProfileImage: async (filename) => {
    try {
      await api.delete(`/users/delete-profile-image/${filename}`);
    } catch (error) {
      console.error('Error deleting profile image:', error);
      throw error;
    }
  }
};

export default usersService;

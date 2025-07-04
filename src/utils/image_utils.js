import api from '../services/api';

const BUCKET_NAME = 'property-images';
const PROFILE_FOLDER = 'profiles';
const BLOG_FOLDER = 'blogs';
const SETTINGS_FOLDER = 'settings';
const BASE_PATH = 'https://mmgfvjfgstcpqmlhctlw.supabase.co/storage/v1/object/public/property-images/blogs/';

// Validate file before upload
export const validateImage = (file) => {
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('File size must be less than 5MB');
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/x-icon', 'image/vnd.microsoft.icon'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('File must be an image (JPEG, PNG, GIF, or ICO)');
  }

  return true;
};

export const uploadProfileImage = async (file) => {
  try {
    validateImage(file);

    // Create form data
    const formData = new FormData();
    formData.append('profile_image', file);

    // Upload through backend API
    const response = await api.post('/users/upload-profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });

    // Return the full URL from the server response
    return response.data.imageUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const deleteProfileImage = async (imageUrl, isCleanup = false) => {
  try {
    if (!imageUrl) return;

    // Extract filename from the full URL
    let filename;
    
    // Check if it's a Supabase storage URL
    if (imageUrl.includes('supabase.co/storage')) {
      // For Supabase URLs, get everything after 'public/'
      const match = imageUrl.match(/public\/([^?#]+)/);
      if (match) {
        const fullPath = match[1];
        // If the path contains 'property-images/profiles/', get the filename
        if (fullPath.includes('property-images/profiles/')) {
          filename = fullPath.split('property-images/profiles/').pop();
        } else {
          // Otherwise, just get the last segment
          filename = fullPath.split('/').pop();
        }
      }
    }

    if (!filename) {
      console.warn('Could not extract filename from URL:', imageUrl);
      return;
    }

    if (isCleanup) {
      console.log('Cleaning up unused image:', filename);
    } else {
      console.log('Deleting old profile image:', filename);
    }
    
    // Delete through backend API
    await api.delete(`/users/delete-profile-image/${filename}`);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

export const uploadBlogImage = async (file) => {
  try {
    validateImage(file);

    // Create form data
    const formData = new FormData();
    formData.append('blog_image', file);

    // Upload through backend API
    const response = await api.post('/blogs/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });

    // Return the full URL from the server response
    return response.data.imageUrl;
  } catch (error) {
    console.error('Error uploading blog image:', error);
    throw error;
  }
};

export const deleteBlogImage = async (imageUrl) => {
  try {
    if (!imageUrl) return;

    // Extract filename from the full URL
    let filename;
    
    // Check if it's a Supabase storage URL
    if (imageUrl.includes('supabase.co/storage')) {
      // For Supabase URLs, get everything after 'public/'
      const match = imageUrl.match(/public\/([^?#]+)/);
      if (match) {
        const fullPath = match[1];
        // If the path contains 'property-images/blogs/', get the filename
        if (fullPath.includes('property-images/blogs/')) {
          filename = fullPath.split('property-images/blogs/').pop();
        } else {
          // Otherwise, just get the last segment
          filename = fullPath.split('/').pop();
        }
      }
    } else {
      // For local uploads, get the filename from the path
      filename = imageUrl.split('/').pop();
    }

    if (!filename) {
      console.warn('Could not extract filename from URL:', imageUrl);
      return;
    }

    console.log('Deleting blog image:', filename);
    
    // Delete through backend API
    await api.delete(`/blogs/delete-image/${filename}`);
  } catch (error) {
    console.error('Error deleting blog image:', error);
    throw error;
  }
};

export const uploadSettingsImage = async (file, type) => {
  try {
    validateImage(file);

    // Create form data
    const formData = new FormData();
    formData.append('image', file);

    // Upload through backend API
    const response = await api.post(`/settings/upload-image/${type}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });

    // Return the full URL from the server response
    return response.data.imageUrl;
  } catch (error) {
    console.error('Error uploading settings image:', error);
    throw error;
  }
};

export const deleteSettingsImage = async (imageUrl) => {
  try {
    if (!imageUrl) return;

    // Extract filename from the full URL
    let filename;
    
    // Check if it's a Supabase storage URL
    if (imageUrl.includes('supabase.co/storage')) {
      // For Supabase URLs, get everything after 'public/'
      const match = imageUrl.match(/public\/([^?#]+)/);
      if (match) {
        const fullPath = match[1];
        // If the path contains 'property-images/settings/', get the filename
        if (fullPath.includes('property-images/settings/')) {
          filename = fullPath.split('property-images/settings/').pop();
        } else {
          // Otherwise, just get the last segment
          filename = fullPath.split('/').pop();
        }
      }
    }

    if (!filename) {
      console.warn('Could not extract filename from URL:', imageUrl);
      return;
    }

    console.log('Deleting settings image:', filename);
    
    // Delete through backend API
    await api.delete(`/settings/delete-image/${filename}`);
  } catch (error) {
    console.error('Error deleting settings image:', error);
    throw error;
  }
};

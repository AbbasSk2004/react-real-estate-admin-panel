import api from './api';

const blogService = {
  getAllBlogs: async () => {
    const response = await api.get('/blogs');
    return response.data;
  },

  getBlogById: async (id) => {
    const response = await api.get(`/blogs/${id}`);
    return response.data;
  },

  createBlog: async (blogData) => {
    const response = await api.post('/blogs', blogData);
    return response.data;
  },

  updateBlog: async (id, blogData) => {
    const response = await api.put(`/blogs/${id}`, blogData);
    return response.data;
  },

  deleteBlog: async (id) => {
    const response = await api.delete(`/blogs/${id}`);
    return response.data;
  },

  uploadBlogImage: async (file) => {
    const formData = new FormData();
    formData.append('blog_image', file);
    const response = await api.post('/blogs/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.imageUrl;
  },

  deleteBlogImage: async (imageUrl) => {
    // Extract filename from URL
    const filename = imageUrl.split('/').pop();
    const response = await api.delete(`/blogs/delete-image/${filename}`);
    return response.data;
  }
};

export default blogService;

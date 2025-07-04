import api from './api';

const propertiesService = {
  // Get all properties
  getAllProperties: async () => {
    const response = await api.get('/properties');
    return response.data;
  },

  // Get a single property
  getProperty: async (id) => {
    const response = await api.get(`/properties/${id}`);
    
    return response.data;
  },

  // Create a new property
  createProperty: async (propertyData) => {
    // For new properties, ensure required fields are present
    const requiredFields = ['title', 'price', 'status', 'property_type'];
    const missingFields = requiredFields.filter(field => !propertyData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Ensure numeric fields are properly formatted
    if (propertyData.property_type === 'Retail') {
      if (propertyData.shop_front_width) {
        propertyData.shop_front_width = parseFloat(propertyData.shop_front_width);
      }
      if (propertyData.storage_area) {
        propertyData.storage_area = parseFloat(propertyData.storage_area);
      }
    }

    const response = await api.post('/properties', propertyData);
    return response.data;
  },

  // Update a property - now handles partial updates
  updateProperty: async (id, propertyData) => {
    // Remove any undefined values but keep null values and zeros
    const updateData = {};
    Object.keys(propertyData).forEach(key => {
      if (propertyData[key] !== undefined) {
        updateData[key] = propertyData[key];
      }
    });

    // If no new images are provided, remove the images field to preserve existing images
    if (!updateData.images?.main && !updateData.images?.additional) {
      delete updateData.images;
    }

    // Ensure numeric fields are properly typed
    ['units', 'elevators', 'floor', 'bedrooms', 'bathrooms', 'livingrooms', 'parking_spaces', 'year_built', 'plot_size', 'shop_front_width', 'storage_area', 'ceiling_height', 'loading_docks'].forEach(field => {
      if (updateData[field] !== undefined && updateData[field] !== null && updateData[field] !== '') {
        if (['plot_size', 'shop_front_width', 'storage_area', 'ceiling_height'].includes(field)) {
          updateData[field] = parseFloat(updateData[field]);
        } else {
          updateData[field] = parseInt(updateData[field]);
        }
      }
    });

    // Ensure features are properly formatted
    if (updateData.features) {
      // Convert camelCase to snake_case for feature names
      const formattedFeatures = {};
      Object.entries(updateData.features).forEach(([key, value]) => {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        formattedFeatures[snakeKey] = value;
      });
      updateData.features = formattedFeatures;
    }

    // Ensure Land-specific fields are properly formatted
    if (updateData.property_type === 'Land') {
      if (updateData.plot_size) {
        updateData.plot_size = parseFloat(updateData.plot_size);
      }
      if (updateData.land_type === '') {
        updateData.land_type = null;
      }
      if (updateData.zoning === '') {
        updateData.zoning = null;
      }
    }

    const response = await api.put(`/properties/${id}`, updateData);
    return response.data;
  },

  // Delete a property
  deleteProperty: async (id) => {
    await api.delete(`/properties/${id}`);
  }
};

export default propertiesService;

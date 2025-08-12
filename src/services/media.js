import api from './api';

export const mediaService = {
  uploadProductMedia: async (productId, formData) => {
    const response = await api.post(`/media/products/${productId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getProductMedia: async (productId) => {
    const response = await api.get(`/media/products/${productId}`);
    return response.data;
  },

  updateMediaOrder: async (productId, data) => {
    const response = await api.patch(`/media/products/${productId}/order`, data);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/media/stats');
    return response.data;
  },
};
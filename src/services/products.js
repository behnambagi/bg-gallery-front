import api from './api';

export const productService = {
  create: async (data) => {
    const response = await api.post('/products', data);
    return response.data;
  },

  getAll: async (params) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.patch(`/products/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  getMyProducts: async (params) => {
    const response = await api.get('/products/my-products', { params });
    return response.data;
  },

  search: async (data) => {
    const response = await api.post('/products/search', data);
    return response.data;
  },

  markAsSold: async (id) => {
    const response = await api.patch(`/products/${id}/mark-sold`);
    return response.data;
  },

  getByCategory: async (categoryId, params) => {
    const response = await api.get(`/products/category/${categoryId}`, { params });
    return response.data;
  },

  getByJeweler: async (jewelerId, params) => {
    const response = await api.get(`/products/jeweler/${jewelerId}`, { params });
    return response.data;
  },

  getFeatured: async (limit) => {
    const response = await api.get('/products/featured/homepage', { params: { limit } });
    return response.data;
  },

  getTrending: async (limit) => {
    const response = await api.get('/products/trending/popular', { params: { limit } });
    return response.data;
  },
};
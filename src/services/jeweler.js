import api from './api';

export const jewelerService = {
  register: async (data) => {
    const response = await api.post('/jewelers', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/jewelers/profile');
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.patch('/jewelers/profile', data);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/jewelers/${id}`);
    return response.data;
  },

  getAll: async (params) => {
    const response = await api.get('/jewelers', { params });
    return response.data;
  },

  getActive: async (city) => {
    const response = await api.get('/jewelers/active', { params: { city } });
    return response.data;
  },

  getFeatured: async (limit) => {
    const response = await api.get('/jewelers/featured', { params: { limit } });
    return response.data;
  },
};
import api from './api';

export const inquiryService = {
  create: async (data) => {
    const response = await api.post('/inquiries', data);
    return response.data;
  },

  getUserInquiries: async (params) => {
    const response = await api.get('/inquiries', { params });
    return response.data;
  },

  getJewelerInquiries: async (params) => {
    const response = await api.get('/inquiries/jeweler', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/inquiries/${id}`);
    return response.data;
  },

  respond: async (id, data) => {
    const response = await api.patch(`/inquiries/${id}/respond`, data);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/inquiries/jeweler/stats');
    return response.data;
  },
};
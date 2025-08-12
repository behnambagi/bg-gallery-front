import api from './api';

export const subscriptionService = {
  getAllPlans: async () => {
    const response = await api.get('/subscriptions/plans');
    return response.data;
  },

  getPlanById: async (id) => {
    const response = await api.get(`/subscriptions/plans/${id}`);
    return response.data;
  },

  getCurrentSubscription: async () => {
    const response = await api.get('/subscriptions/current');
    return response.data;
  },

  getHistory: async () => {
    const response = await api.get('/subscriptions/history');
    return response.data;
  },

  checkLimits: async () => {
    const response = await api.get('/subscriptions/limits');
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/subscriptions', data);
    return response.data;
  },

  upgrade: async (data) => {
    const response = await api.patch('/subscriptions/upgrade', data);
    return response.data;
  },
};
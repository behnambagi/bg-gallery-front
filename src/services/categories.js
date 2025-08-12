import api from './api';

export const categoryService = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  getHierarchical: async () => {
    const response = await api.get('/categories/hierarchical');
    return response.data;
  },

  getPopular: async (limit) => {
    const response = await api.get('/categories/popular', { params: { limit } });
    return response.data;
  },

  search: async (q) => {
    const response = await api.get('/categories/search', { params: { q } });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  getBySlug: async (slug) => {
    const response = await api.get(`/categories/slug/${slug}`);
    return response.data;
  },
};
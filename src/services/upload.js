import api from './api';

export const uploadService = {
  // General Upload APIs
  async uploadSingle(file, category = 'general', altText = '') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    formData.append('altText', altText);

    const response = await api.post('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  async uploadMultiple(files, category = 'general', altText = '') {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('category', category);
    if (altText) {
      formData.append('altText', altText);
    }

    const response = await api.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  async getMyUploads(category = null, page = 1, limit = 20) {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await api.get(`/upload/my-uploads?${params}`);
    return response.data;
  },

  async deleteUpload(uploadId) {
    await api.delete(`/upload/${uploadId}`);
  },

  async getUploadStats() {
    const response = await api.get('/upload/stats');
    return response.data;
  },

  // Product Media APIs  
  async uploadProductMedia(productId, files, primaryIndex = 0, altTexts = []) {
    const formData = new FormData();
    
    if (Array.isArray(files)) {
      files.forEach(file => formData.append('files', file));
    } else {
      formData.append('files', files);
    }
    
    formData.append('primaryIndex', primaryIndex.toString());
    
    if (altTexts.length > 0) {
      formData.append('altTexts', JSON.stringify(altTexts));
    }

    const response = await api.post(`/media/products/${productId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  async getProductMedia(productId) {
    const response = await api.get(`/media/products/${productId}`);
    return response.data;
  },

  async updateMediaOrder(productId, mediaOrder) {
    const response = await api.patch(`/media/products/${productId}/order`, mediaOrder);
    return response.data;
  },

  async deleteMedia(mediaId) {
    await api.delete(`/media/${mediaId}`);
  },

  async getMediaStats() {
    const response = await api.get('/media/stats');
    return response.data;
  },

  // Helper methods for specific categories
  async uploadProfile(file, altText = 'تصویر پروفایل کاربر') {
    return this.uploadSingle(file, 'profile', altText);
  },

  async uploadLogo(file, altText = 'لوگو فروشگاه') {
    return this.uploadSingle(file, 'logo', altText);
  },

  async uploadCover(file, altText = 'تصویر کاور') {
    return this.uploadSingle(file, 'cover', altText);
  },

  async getProfileImages() {
    return this.getMyUploads('profile');
  },

  async getLogos() {
    return this.getMyUploads('logo');
  },

  async getCovers() {
    return this.getMyUploads('cover');
  },
};

export default uploadService;
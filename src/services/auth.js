import api from './api';

export const authService = {
  sendOtp: async (phoneNumber) => {
    const response = await api.post('/auth/send-otp', { phoneNumber });
    return response.data;
  },

  verifyOtp: async (phoneNumber, otpCode) => {
    const response = await api.post('/auth/verify-otp', {
      phoneNumber,
      otpCode,
      userType: 'jeweler'
    });
    return response.data;
  },

  refreshToken: async (refreshToken) => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },
};
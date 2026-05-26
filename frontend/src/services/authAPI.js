import api from './api';

export const requestSignupOTP = (email) => api.post('/auth/signup', { email });

export const requestLoginOTP = (email) => api.post('/auth/login', { email });

export const verifyOTPSignup = (email, otp_code) =>
  api.post('/auth/verify-otp', { email, otp_code, mode: 'signup' });

export const verifyOTPLogin = (email, otp_code) =>
  api.post('/auth/verify-otp', { email, otp_code, mode: 'login' });

export const logout = () => api.post('/auth/logout');

export const getProfile = () => api.get('/user/profile');

export const updateProfile = (data) => api.put('/user/profile', data);

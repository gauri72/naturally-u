import axiosClient from './axiosClient';

// Storefront shopper accounts. axiosClient attaches the customer token
// (not the admin one) to every /customers request - see axiosClient.js.
export const getCustomerConfig = () => axiosClient.get('/customers/config');
export const registerCustomer = (data) => axiosClient.post('/customers/register', data);
export const loginCustomer = (data) => axiosClient.post('/customers/login', data);
export const googleSignIn = (credential) => axiosClient.post('/customers/google', { credential });
export const getMyProfile = () => axiosClient.get('/customers/me');
export const updateMyProfile = (data) => axiosClient.put('/customers/me', data);
export const changeMyPassword = (data) => axiosClient.put('/customers/me/password', data);
export const verifyEmail = (token) => axiosClient.post('/customers/verify-email', { token });
export const resendVerification = () => axiosClient.post('/customers/me/resend-verification');
export const forgotPassword = (email) => axiosClient.post('/customers/forgot-password', { email });
export const resetPassword = (data) => axiosClient.post('/customers/reset-password', data);
export const getMyOrders = () => axiosClient.get('/customers/me/orders');
export const getMyOrder = (id) => axiosClient.get(`/customers/me/orders/${id}`);
export const getReorderItems = (id) => axiosClient.get(`/customers/me/orders/${id}/reorder`);

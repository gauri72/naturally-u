import axiosClient from './axiosClient';

// Re-validates prices/stock server-side right before checkout
export const validateCart = (items) => axiosClient.post('/cart/validate', { items });

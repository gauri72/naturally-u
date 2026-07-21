import axiosClient from './axiosClient';

// Creates the order (server-priced/validated) AND its Payment Intent in one
// call. Response: { order, clientSecret, paymentIntentId, paymentMode }.
export const createOrder = (data) => axiosClient.post('/orders', data);
export const getOrderById = (id) => axiosClient.get(`/orders/${id}`);
export const listOrders = () => axiosClient.get('/orders');
export const updateOrderStatus = (id, orderStatus) => axiosClient.put(`/orders/${id}/status`, { orderStatus });

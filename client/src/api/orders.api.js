import axiosClient from './axiosClient';

export const createOrder = (data) => axiosClient.post('/orders', data);
export const getOrderById = (id) => axiosClient.get(`/orders/${id}`);
export const listOrders = () => axiosClient.get('/orders');
export const updateOrderStatus = (id, orderStatus) => axiosClient.put(`/orders/${id}/status`, { orderStatus });

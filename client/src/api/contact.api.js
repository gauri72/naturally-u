import axiosClient from './axiosClient';

export const submitContactMessage = (data) => axiosClient.post('/contact', data);

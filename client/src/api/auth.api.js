import axiosClient from './axiosClient';

export const loginRequest = (credentials) => axiosClient.post('/auth/login', credentials);
export const logoutRequest = () => axiosClient.post('/auth/logout');
export const getMeRequest = () => axiosClient.get('/auth/me');

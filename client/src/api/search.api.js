import axiosClient from './axiosClient';

// Site-wide search across products and CMS pages
export const searchSite = (q) => axiosClient.get('/search', { params: { q } });

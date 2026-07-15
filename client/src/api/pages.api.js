import axiosClient from './axiosClient';

// Public
export const getPageBySlug = (slug) => axiosClient.get(`/pages/${slug}`);

// Admin (page builder)
export const listPages = () => axiosClient.get('/pages');
export const getPageForAdmin = (slug) => axiosClient.get(`/pages/${slug}/admin`);
export const createPage = (data) => axiosClient.post('/pages', data);
export const deletePage = (slug) => axiosClient.delete(`/pages/${slug}`);
export const setPageStatus = (slug, status) => axiosClient.put(`/pages/${slug}/status`, { status });
export const addBlock = (slug, block) => axiosClient.post(`/pages/${slug}/blocks`, block);
export const updateBlock = (slug, blockId, data) => axiosClient.put(`/pages/${slug}/blocks/${blockId}`, data);
export const reorderBlocks = (slug, order) => axiosClient.put(`/pages/${slug}/reorder`, { order });
export const deleteBlock = (slug, blockId) => axiosClient.delete(`/pages/${slug}/blocks/${blockId}`);

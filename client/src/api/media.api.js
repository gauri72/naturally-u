import axiosClient from './axiosClient';

export const getMedia = () => axiosClient.get('/media');
export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return axiosClient.post('/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const deleteImage = (id) => axiosClient.delete(`/media/${id}`);

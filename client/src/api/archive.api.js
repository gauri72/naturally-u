import axiosClient from './axiosClient';

export const listArchivePages = () => axiosClient.get('/archive/pages');
export const getArchivePage = (slug) => axiosClient.get(`/archive/pages/${slug}`);
export const updateArchivePage = (slug, data) => axiosClient.put(`/archive/pages/${slug}`, data);

export const addSection = (slug, data) => axiosClient.post(`/archive/pages/${slug}/sections`, data);
export const updateSection = (slug, sectionId, data) =>
  axiosClient.put(`/archive/pages/${slug}/sections/${sectionId}`, data);
export const deleteSection = (slug, sectionId) =>
  axiosClient.delete(`/archive/pages/${slug}/sections/${sectionId}`);
export const reorderSections = (slug, order) =>
  axiosClient.put(`/archive/pages/${slug}/sections/reorder`, { order });

export const addSectionImage = (slug, sectionId, file, caption = '') => {
  const formData = new FormData();
  formData.append('image', file);
  if (caption) formData.append('caption', caption);
  return axiosClient.post(`/archive/pages/${slug}/sections/${sectionId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const updateSectionImage = (slug, sectionId, imageId, data) =>
  axiosClient.put(`/archive/pages/${slug}/sections/${sectionId}/images/${imageId}`, data);
export const deleteSectionImage = (slug, sectionId, imageId) =>
  axiosClient.delete(`/archive/pages/${slug}/sections/${sectionId}/images/${imageId}`);

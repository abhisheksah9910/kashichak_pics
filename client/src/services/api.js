import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('apna-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ==========================================
// Announcements
// ==========================================

export const getAnnouncement = async () => {
  const res = await api.get('/announcement');
  return res.data;
};

export const updateAnnouncement = async (data) => {
  const res = await api.put('/announcement', data);
  return res.data;
};

// ==========================================
// Local Ads
// ==========================================

export const getAds = async () => {
  const res = await api.get('/ads');
  return res.data;
};

export const createAd = async (formData) => {
  const res = await api.post('/ads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const updateAd = async (id, data) => {
  const res = await api.put(`/ads/${id}`, data);
  return res.data;
};

export const deleteAd = async (id) => {
  const res = await api.delete(`/ads/${id}`);
  return res.data;
};

// Normalizes error messages so components can just do err.message
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || 'Something went wrong. Please try again.';
    return Promise.reject({ ...err, message });
  }
);

export default api;

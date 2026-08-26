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

// Normalizes error messages so components can just do err.message
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || 'Something went wrong. Please try again.';
    return Promise.reject({ ...err, message });
  }
);

export default api;

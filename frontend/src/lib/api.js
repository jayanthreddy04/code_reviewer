import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const reviewApi = {
  reviewCode: (data) => api.post('/review/code', data),
  reviewFile: (formData) =>
    api.post('/review/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  reviewGithub: (data) => api.post('/review/github', data),
  getHistory: (params) => api.get('/review/history', { params }),
  getReview: (id) => api.get(`/review/${id}`),
  search: (data) => api.post('/review/search', data),
  exportReview: async (id, format = 'txt') => {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `${API_URL}/review/${id}/export?format=${format}`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Export failed');
    }
    return response.blob();
  },
};

export default api;

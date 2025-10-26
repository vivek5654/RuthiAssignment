import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
};

export const issueAPI = {
  getIssues: () => api.get('/issues'),
  createIssue: (issueData) => api.post('/issues', issueData),
  updateIssue: (id, updateData) => api.put(`/issues/${id}`, updateData),
  assignIssue: (id, assigneeId) => api.put(`/issues/${id}/assign`, { assigneeId }),
  addComment: (issueId, data) => api.post(`/issues/${issueId}/comment`, data),
  getDevelopers: () => api.get('/auth/developers'),
};
export const userAPI = {
  getDevelopers: () => api.get('/auth/developers'),
};

export default api;

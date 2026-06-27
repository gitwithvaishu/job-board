import api from './axios';

// ---- Auth ----
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// ---- Users / Profile ----
export const userApi = {
  updateProfile: (data) => api.put('/users/profile', data),
  uploadResume: (formData) =>
    api.put('/users/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getPublicProfile: (id) => api.get(`/users/${id}`),
};

// ---- Jobs ----
export const jobApi = {
  getFeatured: () => api.get('/jobs/featured'),
  getAll: (params) => api.get('/jobs', { params }),
  getById: (id) => api.get(`/jobs/${id}`),
  create: (data) => api.post('/jobs', data),
  update: (id, data) => api.put(`/jobs/${id}`, data),
  remove: (id) => api.delete(`/jobs/${id}`),
  getMine: () => api.get('/jobs/employer/mine'),
};

// ---- Applications ----
export const applicationApi = {
  apply: (jobId, formData) =>
    api.post(`/applications/${jobId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getMine: () => api.get('/applications/mine'),
  getForJob: (jobId) => api.get(`/applications/job/${jobId}`),
  updateStatus: (id, status) => api.put(`/applications/${id}/status`, { status }),
};

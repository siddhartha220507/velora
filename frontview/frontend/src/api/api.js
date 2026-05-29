import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://51.20.250.181:3000/api';

/** Socket.IO server origin (no /api suffix). */
export const SOCKET_ORIGIN =
  import.meta.env.VITE_SOCKET_URL ||
  API_BASE_URL.replace(/\/api\/?$/, '') ||
  'http://51.20.250.181:3000';

/** Full URL for browser redirect (Passport OAuth). */
export const githubAuthUrl = `${API_BASE_URL}/auth/github`;
export const googleAuthUrl = `${API_BASE_URL}/auth/google`;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// JWT INTERCEPTOR — Automatically attaches
// the Bearer token from localStorage to
// every outgoing request.
// ==========================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const workspaceId = localStorage.getItem('activeWorkspaceId');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (workspaceId) {
      config.headers['x-workspace-id'] = workspaceId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================================
// RESPONSE INTERCEPTOR — Handles 401
// (expired/invalid token) globally.
// ==========================================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid — clear token
      localStorage.removeItem('token');
      // Emit an event so AuthContext can handle the logout/redirect gracefully
      window.dispatchEvent(new Event('auth-unauthorized'));
    }
    return Promise.reject(error);
  }
);

// ==========================================
// AUTH APIs
// ==========================================
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);
export const logout = () => api.get('/auth/logout');
export const getCurrentUser = () => api.get('/auth/me');
export const updateCurrentUser = (payload) => api.put('/auth/me', payload);

// PROJECT APIs
// ==========================================
export const getUserRepos = (search = '') =>
  api.get(`/projects/repos${search ? `?search=${search}` : ''}`);

export const getUserProjects = () => api.get('/projects');
export const getDashboardStats = () => api.get('/projects/stats');

export const createProject = (projectData) => api.post('/projects', projectData);
export const createProjectFromFolder = (formData) => api.post('/projects/upload', formData);

export const getProjectById = (id) => api.get(`/projects/${id}`);

export const deleteProject = (id) => api.delete(`/projects/${id}`);

export const updateProject = (id, data) => api.put(`/projects/${id}`, data);

// ==========================================
// DEPLOYMENT APIs
// ==========================================
export const getDeploymentStatus = (deploymentId) =>
  api.get(`/deployments/${deploymentId}`);

export const stopDeployment = (deploymentId) =>
  api.post(`/deployments/${deploymentId}/stop`);

export const analyzeDeploymentLogs = (deploymentId, logs) =>
  api.post(`/deployments/${deploymentId}/analyze-logs`, { logs });

export const aiChat = (message, context) =>
  api.post('/ai/chat', { message, context });

export const rollbackDeployment = (projectId, version) =>
  api.post(`/projects/${projectId}/rollback/${version}`);

// ==========================================
// ENVIRONMENT VARIABLE APIs (AES-256)
// ==========================================
export const getEnvVars = (projectId) =>
  api.get(`/projects/${projectId}/env`);

export const addEnvVar = (projectId, key, value) =>
  api.post(`/projects/${projectId}/env`, { key, value });

export const deleteEnvVar = (projectId, key) =>
  api.delete(`/projects/${projectId}/env/${key}`);

// ==========================================
// INTEGRATION APIs (Universal)
// ==========================================
export const getIntegrations = (projectId) =>
  api.get(`/projects/${projectId}/integrations`);

export const connectIntegration = (projectId, integrationData) =>
  api.post(`/projects/${projectId}/integrations`, integrationData);

export const disconnectIntegration = (projectId, integrationId) =>
  api.delete(`/projects/${projectId}/integrations/${integrationId}`);

// Aliases to support existing React components
export const getProjects = getUserProjects;
export const getProject = getProjectById;
export const getGithubRepos = getUserRepos;
export const listDeployments = (projectId) =>
  api.get('/deployments', { params: { projectId } });
export const getDeploymentsByProject = listDeployments;
export const getDeployment = getDeploymentStatus;
export const stopDeploymentRequest = stopDeployment;
export const rollbackProject = rollbackDeployment;
export const triggerDeployment = (projectId) => api.post(`/projects/${projectId}/deploy`);

// Teams
export const getProjectTeam = (projectId) => api.get(`/teams/${projectId}`);
export const inviteMember = (projectId, data) => api.post(`/teams/${projectId}/invite`, data);
export const removeMember = (projectId, memberId) => api.delete(`/teams/${projectId}/members/${memberId}`);

export default api;

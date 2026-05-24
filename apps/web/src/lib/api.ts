import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach token to every request
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(original);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── Typed API methods ───────────────────────────────────────

export const authApi = {
  register: (data: { username: string; email: string; password: string; language?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  socialLogin: (data: { firebaseUid: string; email: string; username?: string; avatarUrl?: string }) =>
    api.post('/auth/social', data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }),
};

export const matchesApi = {
  getAll: (params?: Record<string, string>) => api.get('/matches', { params }),
  getToday: () => api.get('/matches/today'),
  getUpcoming: () => api.get('/matches/upcoming'),
  getById: (id: string) => api.get(`/matches/${id}`),
  getWithPrediction: (id: string) => api.get(`/matches/${id}/prediction`),
};

export const predictionsApi = {
  submit: (matchId: string, prediction: string) => api.post('/predictions', { matchId, prediction }),
  update: (matchId: string, prediction: string) => api.put(`/predictions/${matchId}`, { prediction }),
  getMy: (params?: Record<string, string>) => api.get('/predictions/my', { params }),
};

export const leaderboardApi = {
  global: (params?: Record<string, string>) => api.get('/leaderboard/global', { params }),
  weekly: () => api.get('/leaderboard/weekly'),
  monthly: () => api.get('/leaderboard/monthly'),
  streak: () => api.get('/leaderboard/streak'),
  myRank: () => api.get('/leaderboard/my-rank'),
};

export const usersApi = {
  getProfile: (username: string) => api.get(`/users/profile/${username}`),
  updateProfile: (data: Record<string, unknown>) => api.put('/users/me', data),
  getStats: () => api.get('/users/me/stats'),
  getBadges: () => api.get('/users/me/badges'),
  getNotifications: () => api.get('/users/me/notifications'),
  markNotificationsRead: (id?: string) => api.post('/users/me/notifications/read', { notificationId: id }),
};

export const commentsApi = {
  getByMatch: (matchId: string) => api.get(`/comments/match/${matchId}`),
  create: (matchId: string, content: string, emoji?: string) =>
    api.post(`/comments/match/${matchId}`, { content, emoji }),
  like: (id: string) => api.post(`/comments/${id}/like`),
  delete: (id: string) => api.delete(`/comments/${id}`),
};

export const adminApi = {
  getAnalytics: () => api.get('/admin/analytics'),
  getUsers: (params?: Record<string, string>) => api.get('/users/admin/list', { params }),
  banUser: (id: string, reason: string) => api.post(`/users/admin/${id}/ban`, { reason }),
  unbanUser: (id: string) => api.post(`/users/admin/${id}/unban`),
  getAnnouncements: () => api.get('/admin/announcements'),
  createAnnouncement: (data: Record<string, unknown>) => api.post('/admin/announcements', data),
  deleteAnnouncement: (id: string) => api.delete(`/admin/announcements/${id}`),
  broadcast: (data: Record<string, unknown>) => api.post('/admin/notify', data),
  syncMatches: () => api.post('/admin/sync-matches'),
  syncResults: () => api.post('/admin/sync-results'),
};

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        const { data } = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });
        await AsyncStorage.setItem('accessToken', data.data.accessToken);
        await AsyncStorage.setItem('refreshToken', data.data.refreshToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(original);
      } catch {
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const authApi = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: { username: string; email: string; password: string }) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

export const matchesApi = {
  getToday: () => api.get('/matches/today'),
  getUpcoming: () => api.get('/matches/upcoming'),
  getAll: (params?: Record<string, string>) => api.get('/matches', { params }),
  getById: (id: string) => api.get(`/matches/${id}`),
};

export const predictionsApi = {
  submit: (matchId: string, prediction: string) => api.post('/predictions', { matchId, prediction }),
  update: (matchId: string, prediction: string) => api.put(`/predictions/${matchId}`, { prediction }),
  getMy: () => api.get('/predictions/my'),
};

export const leaderboardApi = {
  global: () => api.get('/leaderboard/global'),
  weekly: () => api.get('/leaderboard/weekly'),
  streak: () => api.get('/leaderboard/streak'),
};

export const usersApi = {
  getProfile: (username: string) => api.get(`/users/profile/${username}`),
  getStats: () => api.get('/users/me/stats'),
  getNotifications: () => api.get('/users/me/notifications'),
  getBadges: () => api.get('/users/me/badges'),
  markRead: () => api.post('/users/me/notifications/read'),
};

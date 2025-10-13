import { myConstants } from '@/constants/my-constants';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

let onTokenRefreshCallback: ((session: any) => void) | null = null;

export function setOnTokenRefresh(callback: (session: any) => void) {
  onTokenRefreshCallback = callback;
}

const api = axios.create({
  baseURL: myConstants.BASE_API_URL,
  withCredentials: true, // This is important to send cookies
});

// Add a request interceptor
api.interceptors.request.use(
  async (config) => {
    // Do not add token for auth routes
    if (config.url?.includes('/auth/')) {
      return config;
    }
    const sessionString = await SecureStore.getItemAsync('session');
    if (sessionString) {
      const session = JSON.parse(sessionString);
      if (session?.token?.accessToken) {
        config.headers.Authorization = `Bearer ${session.token.accessToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Token Refresh Logic ---

let isRefreshing = false;
let failedQueue: { resolve: (value: unknown) => void, reject: (reason?: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Check for the specific "Token expired" error
    if (error.response?.status === 401 && error.response.data.error === 'Token expired' && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return axios(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const sessionString = await SecureStore.getItemAsync('session');
        if (!sessionString) {
          return Promise.reject(error);
        }
        const session = JSON.parse(sessionString);
        const refreshToken = session?.token?.refreshToken;

        if (!refreshToken) {
          return Promise.reject(error);
        }

        const { data } = await api.post('/auth/refresh', {}, {
          headers: {
            'Authorization': `Bearer ${refreshToken}`
          }
        });
        const newAccessToken = data.accessToken;

        session.token.accessToken = newAccessToken;
        await SecureStore.setItemAsync('session', JSON.stringify(session));

        if (onTokenRefreshCallback) {
          onTokenRefreshCallback(session);
        }

        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await SecureStore.deleteItemAsync('session');
        if (onTokenRefreshCallback) {
          onTokenRefreshCallback(null);
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
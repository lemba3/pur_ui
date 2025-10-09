import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true, // This is important to send cookies
});

// Add a request interceptor
api.interceptors.request.use(
  async (config) => {
    // The Authorization header should be set externally (e.g., from useAuth hook)
    // If it's not set, it means the user is not authenticated or the token is not yet available.
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
          // If no session, we can't refresh. Reject.
          // TODO: Implement logout logic here
          return Promise.reject(error);
        }
        const session = JSON.parse(sessionString);
        const refreshToken = session?.token?.refreshToken;

        if (!refreshToken) {
          // If no refresh token, we can't refresh. Reject.
          // TODO: Implement logout logic here
          return Promise.reject(error);
        }

        // Call the refresh endpoint, sending the refreshToken in the Authorization header
        const { data } = await api.post('/auth/refresh', {}, {
          headers: {
            'Authorization': `Bearer ${refreshToken}`
          }
        });
        const newAccessToken = data.accessToken;

        // Update the session in secure store
        session.token.accessToken = newAccessToken;
        await SecureStore.setItemAsync('session', JSON.stringify(session));

        // Update the default and original request headers
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        
        // Retry all requests in the queue with the new token
        processQueue(null, newAccessToken);
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // If refresh fails, the refresh token is likely invalid.
        // TODO: Implement logout logic here (e.g., clear session, navigate to login)
        await SecureStore.deleteItemAsync('session');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
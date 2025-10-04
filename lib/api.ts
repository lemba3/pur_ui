import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true, // This is important to send cookies
});

// Add a request interceptor
api.interceptors.request.use(
  async (config) => {
    const sessionString = await SecureStore.getItemAsync('session');
    if (sessionString) {
      try {
        const session = JSON.parse(sessionString);
        const accessToken = session?.token?.accessToken;
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      } catch (e) {
        console.error("Failed to parse session from secure store", e);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

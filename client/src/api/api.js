// /client/src/api/api.js
import axios from 'axios';

const api = axios.create({
  // 👇 Use the environment variable
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

// 🔁 Optional: request interceptor to attach token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// 🔁 Optional: response interceptor for global error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;

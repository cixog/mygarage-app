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
    // --- THIS IS THE DEFINITIVE FIX ---
    const originalRequestUrl = error.config.url || ''; // Ensure the URL is a string to prevent errors

    // This check is now robust. It works if the url is '/users/login' or 'https://api.com/v1/users/login'.
    if (
      error.response?.status === 401 &&
      !originalRequestUrl.endsWith('/users/login')
    ) {
      // This is an expired session or unauthorized action on another page. Redirect.
      window.location.href = '/';
    }

    // For any other error, including a 401 on the login page, just pass the error along
    // so the component's catch block can handle it.
    return Promise.reject(error);
  }
);

export default api;

import axios from 'axios';

// Set default config
axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.withCredentials = true;

// Add request interceptor for auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Example for axios.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://aschtech-backend.onrender.com', // <-- Use your Render backend URL
  // ...other config
});

export default instance; 
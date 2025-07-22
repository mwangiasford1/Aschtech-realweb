import api from '../config/axios'; 

const instance = axios.create({
  baseURL: 'https://aschtech-backend.onrender.com', // <-- must be the full backend URL
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Add request interceptor for auth token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance; 
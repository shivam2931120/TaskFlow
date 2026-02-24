// Axios API client instance
// yeh file centralized API client banati hai - saare API calls yahan se jayenge

import axios from 'axios';

// Base API instance banao
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Cookies automatically bhejne ke liye zaroori hai
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - har request ke pehle kuch karna ho to yahan karo
api.interceptors.request.use(
  (config) => {
    // Token agar localStorage me hai to header me daal do (backup)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - har response ke baad kuch karna ho to yahan karo
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        // Login page pe redirect karo sirf agar already login pe nahi hain
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

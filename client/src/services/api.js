import axios from 'axios';

// In production (Vercel), VITE_API_URL points to the Render backend.
// In development, it's empty so Vite proxy handles '/api' locally.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api',
  // No default Content-Type — axios will auto-set multipart/form-data with the
  // correct boundary when sending FormData, and application/json for plain objects.
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vb_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('vb_token');
      localStorage.removeItem('vb_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('vb_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('vb_token', data.token);
      localStorage.setItem('vb_user', JSON.stringify(data.user));
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      return data.user;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
      throw err;
    } finally { setLoading(false); }
  };

  const register = async (name, email, password, phone) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { name, email, password, phone });
      localStorage.setItem('vb_token', data.token);
      localStorage.setItem('vb_user', JSON.stringify(data.user));
      setUser(data.user);
      toast.success(`Welcome to Smart Bazaar, ${data.user.name}!`);
      return data.user;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally { setLoading(false); }
  };

  const logout = () => {
    localStorage.removeItem('vb_token');
    localStorage.removeItem('vb_user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

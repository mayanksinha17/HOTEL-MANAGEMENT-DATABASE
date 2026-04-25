/**
 * AuthContext — manages user authentication state across the app.
 * Provides login, register, logout functions and current user data.
 */
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check for existing token and load user
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { access_token, user: userData } = res.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      toast.success(`Welcome back, ${userData.name}!`);
      return userData;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed';
      toast.error(msg);
      throw err;
    }
  };

  const register = async (name, email, phone, password, is_admin = false) => {
    try {
      const res = await api.post('/auth/register', { name, email, phone, password, is_admin });
      const { access_token, user: userData } = res.data;
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      toast.success('Account created successfully!');
      return userData;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed';
      toast.error(msg);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value = { user, loading, login, register, logout, setUser };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

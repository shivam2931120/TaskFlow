// Auth Context Provider
// yeh file global authentication state manage karti hai - poori app me user data available hota hai

'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

// Context banao
const AuthContext = createContext(null);

// Auth Provider component - saari app ko wrap karega
export function AuthProvider({ children }) {
  // User state - logged in user ki info
  const [user, setUser] = useState(null);
  // Loading state - auth check ho raha hai
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Auth status check karo - page load pe ya refresh pe
  const checkAuth = useCallback(async () => {
    try {
      const res = await api.get('/auth/check');
      if (res.data.success) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      // Token invalid ya expired hai
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Component mount hone pe auth check karo
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login function
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      setUser(res.data.user);
      // Token backup ke liye localStorage me bhi rakho
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      router.push('/dashboard');
    }
    return res.data;
  };

  // Register function
  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    if (res.data.success) {
      setUser(res.data.user);
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      router.push('/dashboard');
    }
    return res.data;
  };

  // Logout function
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Agar server pe error aaye to bhi client side se logout karo
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      router.push('/login');
    }
  };

  // Profile update karne ke baad user state refresh karo
  const refreshUser = async () => {
    try {
      const res = await api.get('/users/profile');
      if (res.data.success) {
        setUser(res.data.user);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  // Context value - yeh saare components ko available hoga
  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook - kisi bhi component me auth context use karo
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth ko AuthProvider ke andar use karo');
  }
  return context;
}

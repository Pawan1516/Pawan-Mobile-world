import { createContext, useState, useEffect } from 'react';
import axios from '../api/axios';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('userInfo');
      return saved ? JSON.parse(saved) : null;
    } catch (err) {
      localStorage.removeItem('userInfo');
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('userInfo', JSON.stringify(user));
    } else {
      localStorage.removeItem('userInfo');
    }
  }, [user]);

  // Auto Logout Logic (30 Minutes Inactivity)
  useEffect(() => {
    let inactivityTimer;

    const resetTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      if (user) {
        inactivityTimer = setTimeout(() => {
          logout();
          toast.error('Session expired due to inactivity. Please login again.');
        }, 30 * 60 * 1000); // 30 Minutes
      }
    };

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    if (user) {
      resetTimer();
      activityEvents.forEach(event => {
        window.addEventListener(event, resetTimer);
      });
    }

    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [user]);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const { data } = await axios.post('/auth/login', { username, password });
      setUser(data);
      toast.success(`Welcome back, ${data.name}!`);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    toast.success('Logged out successfully');
  };

  const isAdmin = () => user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

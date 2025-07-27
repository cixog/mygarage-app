// client/src/context/AuthContext.jsx

import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (token) {
      api
        .get('/users/me')
        .then(res => {
          setUser(res.data.data.user);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Define the `refreshUser` function that components can call.
  //    It simply re-runs the fetch logic.
  const refreshUser = () => {
    console.log('Context: Refreshing user data...(AC)');
    return fetchUser();
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/users/login', { email, password });
      const { token, data } = res.data;
      localStorage.setItem('token', token);
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    // Redirect to the homepage instead of the non-existent login page
    window.location.href = '/';
  };

  //  Add `refreshUser` to the value object provided by the context.
  const value = { user, setUser, login, logout, loading, refreshUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// This hook now correctly provides `refreshUser`
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

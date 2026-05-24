import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await authApi.getMe();
        setUser(res.data.user);
      } catch {
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res;
  };

  const register = async (name, email, password) => {
    const res = await authApi.register({ name, email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

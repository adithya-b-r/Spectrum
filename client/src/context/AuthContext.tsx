import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authApi, User } from '../services/api';
import { applyTheme, getStoredTheme } from '../utils/theme';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (data: { email: string; password: string }) => Promise<{ success: boolean; message?: string }>;
  register: (data: { fullName: string; email: string; password: string; confirmPassword?: string; username?: string }) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const getAuthErrorMessage = (err: any): string => {
  if (err?.response?.data) {
    const data = err.response.data;
    if (data.errors && typeof data.errors === 'object') {
      const errorValues = Object.values(data.errors);
      if (errorValues.length > 0 && typeof errorValues[0] === 'string') {
        return errorValues[0];
      }
    }
    if (typeof data.message === 'string' && data.message.trim().length > 0) {
      return data.message;
    }
  }
  if (!err?.response) {
    return 'Unable to connect to the server.';
  }
  return 'Something went wrong. Please try again.';
};

const normalizeUser = (u: any): User | null => {
  if (!u) return null;
  const id = u.id ?? u._id;
  return {
    ...u,
    id,
    _id: u._id ?? id,
  };
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const checkAuth = async () => {
    try {
      const res = await authApi.isAuth();
      if (res.data && res.data.authenticated && res.data.user) {
        const normalized = normalizeUser(res.data.user);
        setUser(normalized);
        setIsLoggedIn(true);
        if (normalized?.theme) {
          applyTheme(normalized.theme);
          localStorage.setItem('theme', normalized.theme);
        }
      } else {
        localStorage.removeItem('token');
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch {
      localStorage.removeItem('token');
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const stored = getStoredTheme();
    applyTheme(stored);
    checkAuth();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => {
      const current = getStoredTheme();
      if (current === 'SYSTEM') {
        applyTheme('SYSTEM');
      }
    };
    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, []);

  useEffect(() => {
    if (user?.theme) {
      applyTheme(user.theme);
      localStorage.setItem('theme', user.theme);
    }
  }, [user?.theme]);

  const login = async (data: { email: string; password: string }) => {
    try {
      const res = await authApi.login(data);
      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
      }
      if (res.data && res.data.user) {
        setUser(normalizeUser(res.data.user));
        setIsLoggedIn(true);
        return { success: true, message: res.data.message };
      }
      return { success: true, message: res.data?.message || 'Login successful' };
    } catch (err: any) {
      return { success: false, message: getAuthErrorMessage(err) };
    }
  };

  const register = async (data: { fullName: string; email: string; password: string; confirmPassword?: string; username?: string }) => {
    try {
      const res = await authApi.register(data);
      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
      }
      if (res.data && res.data.user) {
        setUser(normalizeUser(res.data.user));
        setIsLoggedIn(true);
        return { success: true, message: res.data.message };
      }
      return { success: true, message: res.data?.message || 'Registration successful' };
    } catch (err: any) {
      return { success: false, message: getAuthErrorMessage(err) };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('theme');
      applyTheme('LIGHT');
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

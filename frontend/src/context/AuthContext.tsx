import React, { createContext, useState, useEffect, useCallback } from 'react';
import { User, Role } from '../types/auth.types';
import { authApi } from '../api/auth.api';
import { getToken, setToken, removeToken } from '../utils/auth';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
  canEdit: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const restoreSession = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await authApi.me();
      setUser(res.data.data);
    } catch {
      removeToken();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    const { accessToken, user: userData } = res.data.data;
    setToken(accessToken);
    setUser(userData);
  };

  const logout = () => {
    removeToken();
    setUser(null);
    toast.success('Logged out successfully');
  };

  const hasRole = (...roles: Role[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const canEdit = !!user && user.role !== 'ACCOUNTS';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        hasRole,
        canEdit,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

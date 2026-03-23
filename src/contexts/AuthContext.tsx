'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'superadmin' | 'admin' | 'user' | null;

interface AuthContextType {
  token: string | null;
  role: UserRole;
  storeId: string | null;
  isAuthenticated: boolean;
  login: (token: string, role: UserRole, storeId?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    // Load auth data from localStorage on mount
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role') as UserRole;
    const storedStoreId = localStorage.getItem('storeId');

    if (storedToken && storedRole) {
      setToken(storedToken);
      setRole(storedRole);
      if (storedStoreId) {
        setStoreId(storedStoreId);
      }
    }
  }, []);

  const login = (newToken: string, newRole: UserRole, newStoreId?: string) => {
    setToken(newToken);
    setRole(newRole);
    if (newStoreId) {
      setStoreId(newStoreId);
      localStorage.setItem('storeId', newStoreId);
    }
    
    localStorage.setItem('token', newToken);
    if (newRole) {
      localStorage.setItem('role', newRole);
    }
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setStoreId(null);
    
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('storeId');
  };

  const value = {
    token,
    role,
    storeId,
    isAuthenticated: !!token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

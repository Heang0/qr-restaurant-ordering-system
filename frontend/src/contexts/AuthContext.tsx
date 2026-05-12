'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'superadmin' | 'admin' | 'user' | null;

interface AuthContextType {
  token: string | null;
  role: UserRole;
  storeId: string | null;
  userId: string | null;
  profileImage: string | null;
  isAuthenticated: boolean;
  login: (token: string, role: UserRole, userId: string, storeId?: string, profileImage?: string) => void;
  logout: () => void;
  updateProfileImage: (url: string) => void;
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
  const [userId, setUserId] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    // Load auth data from localStorage on mount
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role') as UserRole;
    const storedStoreId = localStorage.getItem('storeId');
    const storedUserId = localStorage.getItem('userId');
    const storedProfileImage = localStorage.getItem('profile_image');

    if (storedToken && storedRole) {
      setToken(storedToken);
      setRole(storedRole);
      setUserId(storedUserId);
      setProfileImage(storedProfileImage);
      if (storedStoreId) {
        setStoreId(storedStoreId);
      }
    }
  }, []);

  const login = (newToken: string, newRole: UserRole, newUserId: string, newStoreId?: string, newProfileImage?: string) => {
    setToken(newToken);
    setRole(newRole);
    setUserId(newUserId);
    
    localStorage.setItem('token', newToken);
    localStorage.setItem('userId', newUserId);
    if (newRole) {
      localStorage.setItem('role', newRole);
    }
    
    if (newStoreId) {
      setStoreId(newStoreId);
      localStorage.setItem('storeId', newStoreId);
    }

    if (newProfileImage) {
      setProfileImage(newProfileImage);
      localStorage.setItem('profile_image', newProfileImage);
    }
  };

  const updateProfileImage = (url: string) => {
    setProfileImage(url);
    localStorage.setItem('profile_image', url);
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setStoreId(null);
    setUserId(null);
    setProfileImage(null);
    
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('storeId');
    localStorage.removeItem('userId');
    localStorage.removeItem('profile_image');
  };

  const value = {
    token,
    role,
    storeId,
    userId,
    profileImage,
    isAuthenticated: !!token,
    login,
    logout,
    updateProfileImage
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

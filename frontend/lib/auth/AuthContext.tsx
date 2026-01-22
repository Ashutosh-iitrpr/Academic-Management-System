'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  entryNumber?: string;
  department?: string;
  branch?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, otp: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);

          // Fetch fresh user profile to ensure we have latest data
          fetchUserProfile(storedToken);
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const profileData = await response.json();
        const updatedUser: User = {
          id: profileData.id,
          email: profileData.email,
          name: profileData.name,
          role: profileData.role,
          entryNumber: profileData.entryNumber || undefined,
          branch: profileData.branch || undefined,
        };
        setUser(updatedUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      } else {
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, otp: string) => {
    try {
      // Call backend API to verify OTP
      const response = await fetch('http://localhost:3001/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid OTP');
      }

      const data = await response.json();
      
      const newToken = data.accessToken;
      
      // Store token immediately
      setToken(newToken);
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', newToken);
      }

      // Fetch complete user profile with /auth/me
      try {
        await fetchUserProfile(newToken);
      } catch (profileError) {
        console.error('Failed to fetch profile, but login token is valid:', profileError);
        // Even if profile fetch fails, token is valid so login continues
        // We'll use the basic user data from verify-otp response
        const basicUser: User = {
          id: data.user?.id || '',
          email: data.user?.email || email,
          name: data.user?.name || 'User',
          role: data.user?.role || 'STUDENT',
          entryNumber: data.user?.entryNumber,
        };
        setUser(basicUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(basicUser));
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

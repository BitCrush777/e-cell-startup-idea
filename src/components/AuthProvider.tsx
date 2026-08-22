'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, UserPlan } from '@/types';
import { useToast } from './ToastProvider';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (email: string, password: string, displayName: string) => Promise<User>;
  logout: () => Promise<void>;
  updatePlan: (plan: UserPlan) => Promise<User>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => { throw new Error('Auth not initialized'); },
  signup: async () => { throw new Error('Auth not initialized'); },
  logout: async () => {},
  updatePlan: async () => { throw new Error('Auth not initialized'); },
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });
      const data: any = await res.json();
      if (res.ok && data.success) {
        setUser(data.user || null);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data: any = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Invalid credentials');
    }

    setUser(data.user);
    toast(`Welcome back, ${data.user.displayName}!`, 'success');
    return data.user;
  };

  const signup = async (email: string, password: string, displayName: string): Promise<User> => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName }),
    });

    const data: any = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to create account');
    }

    setUser(data.user);
    toast(`Welcome to TempLink, ${data.user.displayName}!`, 'success');
    return data.user;
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch {}

    setUser(null);
    toast('Signed out successfully', 'info');
  };

  const updatePlan = async (plan: UserPlan): Promise<User> => {
    const res = await fetch('/api/auth/update-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    });

    const data: any = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to update plan');
    }

    setUser(data.user);
    toast(`Subscription plan updated to ${plan}!`, 'success');
    return data.user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        updatePlan,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

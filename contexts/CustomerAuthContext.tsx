'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  customerLogin as apiLogin,
  customerRegister as apiRegister,
  customerLogout as apiLogout,
  customerProfile,
  isCustomerAuthenticated,
  type CustomerUser,
} from '@/lib/api/customer-auth';

interface CustomerAuthContextValue {
  user: CustomerUser | null;
  loading: boolean;
  profileError: string;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<CustomerUser>;
  register: (data: { fullName: string; email: string; password: string; phone?: string }) => Promise<CustomerUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<CustomerUser | null>;
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const requestVersion = useRef(0);

  const refresh = useCallback(async () => {
    const version = ++requestVersion.current;
    setProfileError('');
    if (!isCustomerAuthenticated()) {
      setUser(null);
      setLoading(false);
      return null;
    }
    setLoading(true);
    try {
      const profile = await customerProfile();
      if (version !== requestVersion.current) return null;
      setUser(profile);
      return profile;
    } catch {
      if (version !== requestVersion.current) return null;
      setUser(null);
      if (isCustomerAuthenticated()) setProfileError('Could not load your profile. Please try again.');
      return null;
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const u = await apiLogin(email, password);
    await refresh();
    return u;
  }, [refresh]);

  const register = useCallback(async (data: { fullName: string; email: string; password: string; phone?: string }) => {
    const u = await apiRegister(data);
    await refresh();
    return u;
  }, [refresh]);

  const logout = useCallback(async () => {
    ++requestVersion.current;
    await apiLogout();
    setUser(null);
    setProfileError('');
    setLoading(false);
  }, []);

  return (
    <CustomerAuthContext.Provider value={{ user, loading, profileError, isAuthenticated: !!user, login, register, logout, refresh }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error('useCustomerAuth must be used inside CustomerAuthProvider');
  return ctx;
}

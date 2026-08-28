'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  customerLogin as apiLogin,
  customerRegister as apiRegister,
  customerLogout as apiLogout,
  customerMe,
  isCustomerAuthenticated,
  type CustomerUser,
} from '@/lib/api/customer-auth';

interface CustomerAuthContextValue {
  user: CustomerUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<CustomerUser>;
  register: (data: { fullName: string; email: string; password: string; phone?: string }) => Promise<CustomerUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!isCustomerAuthenticated()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      setUser(await customerMe());
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const u = await apiLogin(email, password);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (data: { fullName: string; email: string; password: string; phone?: string }) => {
    const u = await apiRegister(data);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  return (
    <CustomerAuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, register, logout, refresh }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error('useCustomerAuth must be used inside CustomerAuthProvider');
  return ctx;
}

'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Store, User, BusinessType, UserRole } from '@/lib/types';
import { mockStore, mockUser } from '@/lib/mock-data';

interface StoreContextValue {
  store: Store;
  user: User;
  businessType: BusinessType;
  userRole: UserRole;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  updateStore: (updates: Partial<Store>) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store>(mockStore);
  const [user] = useState<User>(mockUser);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync from localStorage on mount (persists demo changes)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('shoplink_store');
      if (saved) setStore({ ...mockStore, ...JSON.parse(saved) });
    } catch {
      // ignore
    }
  }, []);

  const updateStore = (updates: Partial<Store>) => {
    setStore(prev => {
      const next = { ...prev, ...updates };
      try { localStorage.setItem('shoplink_store', JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  return (
    <StoreContext.Provider value={{
      store,
      user,
      businessType: store.businessType,
      userRole: user.role,
      sidebarOpen,
      setSidebarOpen,
      updateStore,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

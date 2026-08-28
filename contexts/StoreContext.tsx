'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Store, User, BusinessType, UserRole } from '@/lib/types';
import { mockUser } from '@/lib/mock-data';
import { buildStoreFromSaved, readSavedStore } from '@/lib/utils/store-from-local';
import { isClothingTemplateId } from '@/lib/data/clothing-presets';
import { loadTemplateContentForSlug } from '@/lib/utils/clothing-content';

interface StoreContextValue {
  store: Store;
  user: User;
  businessType: BusinessType;
  userRole: UserRole;
  dashboardSlug: string;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  updateStore: (updates: Partial<Store>) => void;
  storeNotSynced: boolean;
  syncStoreNow: () => Promise<void>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

function mapApiStore(
  s: Awaited<ReturnType<typeof import('@/lib/api/stores').getMyStores>>[0],
  urlSlug: string,
): Store {
  const catSlug = s.categorySlug ?? '';
  const derivedType: BusinessType =
    catSlug.includes('restaurant') || catSlug.includes('cafe') || catSlug.includes('food') || catSlug.includes('bakery') || catSlug.includes('sweets') ? 'restaurant'
    : catSlug.includes('cloth') || catSlug.includes('fashion') ? 'clothing'
    : catSlug.includes('cleaning') || catSlug.includes('beauty') || catSlug.includes('salon') ? 'services'
    : 'retail';

  const local = readSavedStore();

  return buildStoreFromSaved({
    id: s.id,
    name: s.name,
    slug: urlSlug,
    businessType: derivedType,
    category: s.categorySlug ?? 'retail',
    description: s.description ?? '',
    phone: s.phone ?? s.whatsappNumber ?? '',
    email: s.email ?? local?.email ?? '',
    address: s.address ?? local?.address ?? '',
    currency: local?.currency ?? 'MYR',
    timezone: local?.timezone ?? 'Asia/Kuala_Lumpur',
    status: (s.status?.toLowerCase() ?? 'active') as Store['status'],
    acceptingOrders: local?.acceptingOrders ?? true,
    theme: s.templateKey ?? local?.theme ?? 'retail-classic',
    logo: s.logoUrl,
    coverImage: s.coverImageUrl ?? local?.coverImage,
    templateContent: isClothingTemplateId(s.templateKey ?? '')
      ? loadTemplateContentForSlug(urlSlug, s.templateKey!)
      : local?.slug === urlSlug
        ? local?.templateContent
        : undefined,
    createdAt: s.createdAt ?? local?.createdAt,
  });
}

function storeForSlug(urlSlug: string): Store {
  const local = readSavedStore();
  if (local?.slug === urlSlug) {
    return buildStoreFromSaved(local);
  }
  if (local) {
    return buildStoreFromSaved({ ...local, slug: urlSlug });
  }
  return buildStoreFromSaved({ slug: urlSlug, name: urlSlug });
}

async function tryCreateInBackend(savedLocal: Partial<Store>, slug: string) {
  const { createStore } = await import('@/lib/api/stores');
  return createStore({
    name: savedLocal.name || 'My Store',
    slug: savedLocal.slug || slug,
    categorySlug: savedLocal.category || 'general-store',
    description: savedLocal.description || undefined,
    phone: savedLocal.phone || undefined,
    whatsappNumber: savedLocal.phone || undefined,
    address: savedLocal.address || undefined,
    templateKey: savedLocal.theme || undefined,
    logoUrl: savedLocal.logo || undefined,
  });
}

interface StoreProviderProps {
  children: ReactNode;
  slug: string;
}

export function StoreProvider({ children, slug }: StoreProviderProps) {
  const [store, setStore] = useState<Store>(() => storeForSlug(slug));
  const [user, setUser] = useState<User>(mockUser);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [storeNotSynced, setStoreNotSynced] = useState(false);

  useEffect(() => {
    setStore(storeForSlug(slug));
    setStoreNotSynced(false);

    const token = localStorage.getItem('sl_access_token') ?? localStorage.getItem('authToken');
    if (!token) return;

    (async () => {
      // 1. Load user
      try {
        const { getMe } = await import('@/lib/api/auth');
        const apiUser = await getMe();
        setUser({
          id: apiUser.id,
          name: apiUser.name,
          email: apiUser.email,
          role: apiUser.role.toLowerCase().includes('owner') ? 'owner'
            : apiUser.role.toLowerCase().includes('staff') ? 'staff'
            : 'owner',
        });
      } catch { /* keep mock user */ }

      // 2. Load stores — separate try/catch so failure here doesn't skip sync check
      let apiMatch: Awaited<ReturnType<typeof import('@/lib/api/stores').getMyStores>>[0] | null = null;

      try {
        const { getMyStores } = await import('@/lib/api/stores');
        const stores = await getMyStores();
        apiMatch = stores.find(s => s.slug === slug) ?? stores[0] ?? null;
      } catch {
        // network / auth error — apiMatch stays null
      }

      // 3. If not found in backend, try auto-creating from localStorage
      if (!apiMatch) {
        const savedLocal = readSavedStore();
        if (savedLocal?.name) {
          try {
            const created = await tryCreateInBackend(savedLocal, slug);
            apiMatch = created;
            setStoreNotSynced(false);
          } catch (e) {
            console.warn('[ShopLink] store auto-sync failed:', e);
            setStoreNotSynced(true);
          }
        } else {
          // No local data either — mark unsynced so banner shows
          setStoreNotSynced(true);
        }
      }

      if (!apiMatch) return;

      const nextStore = mapApiStore(apiMatch, slug);
      setStore(nextStore);
      setStoreNotSynced(false);
      try { localStorage.setItem('shoplink_store', JSON.stringify(nextStore)); } catch { /* ignore */ }
    })();
  }, [slug]);

  const updateStore = (updates: Partial<Store>) => {
    setStore(prev => {
      const next = { ...prev, ...updates, slug };
      try { localStorage.setItem('shoplink_store', JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  const syncStoreNow = async () => {
    const savedLocal = readSavedStore();
    if (!savedLocal?.name) throw new Error('No local store data found.');
    const created = await tryCreateInBackend(savedLocal, slug);
    const nextStore = mapApiStore(created, slug);
    setStore(nextStore);
    setStoreNotSynced(false);
    try { localStorage.setItem('shoplink_store', JSON.stringify(nextStore)); } catch { /* ignore */ }
  };

  return (
    <StoreContext.Provider value={{
      store,
      user,
      businessType: store.businessType,
      userRole: user.role,
      dashboardSlug: slug,
      sidebarOpen,
      setSidebarOpen,
      updateStore,
      storeNotSynced,
      syncStoreNow,
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

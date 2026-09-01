'use client';

import { type ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { EmptyState } from '@/components/ui/EmptyState';
import { useStore } from '@/contexts/StoreContext';
import { dashboardPath } from '@/lib/utils/dashboard-path';

interface OwnerOnlyGateProps {
  pageTitle: string;
  description?: string;
  children: ReactNode;
}

// Reusable page-level access guard for owner-only sections (Billing, Store Settings). Hiding the
// nav item (see Sidebar's `roles` filter) keeps most staff from ever landing here, but a direct
// link still needs to be turned away honestly rather than rendering real owner-only content.
export function OwnerOnlyGate({ pageTitle, description, children }: OwnerOnlyGateProps) {
  const { store, userRole, dashboardSlug } = useStore();

  if (userRole !== 'owner') {
    return (
      <>
        <Header title={pageTitle} subtitle={store.name || 'Dashboard'} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <EmptyState
            icon={<Lock size={28} />}
            title="Owner access required"
            description={description ?? `${pageTitle} is only visible to the store owner.`}
            action={{ label: 'Back to Dashboard', onClick: () => { window.location.href = dashboardPath(dashboardSlug); } }}
          />
        </main>
      </>
    );
  }

  return <>{children}</>;
}

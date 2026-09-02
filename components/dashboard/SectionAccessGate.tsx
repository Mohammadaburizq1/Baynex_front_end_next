'use client';

import { type ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { EmptyState } from '@/components/ui/EmptyState';
import { useStore } from '@/contexts/StoreContext';
import { dashboardPath } from '@/lib/utils/dashboard-path';
import type { DashboardSection } from '@/lib/api/permissions';

interface SectionAccessGateProps {
  section: DashboardSection;
  pageTitle: string;
  description?: string;
  children: ReactNode;
}

// Page-level access guard for staff-accessible sections gated by the per-staff permission grid
// (see StoreContext's `permissions`). Owners are always ALL_EDIT_GRID so this is a no-op for
// them. Mirrors OwnerOnlyGate's shape/empty-state — kept as a separate component rather than
// merged, since OwnerOnlyGate's owner-vs-staff check is unrelated to this section grid (Store
// Settings/Billing aren't part of it at all).
export function SectionAccessGate({ section, pageTitle, description, children }: SectionAccessGateProps) {
  const { store, permissions, dashboardSlug } = useStore();

  if (permissions[section] === 'NONE') {
    return (
      <>
        <Header title={pageTitle} subtitle={store.name || 'Dashboard'} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <EmptyState
            icon={<Lock size={28} />}
            title="Access required"
            description={description ?? `You don't have access to ${pageTitle}. Ask the store owner to grant it.`}
            action={{ label: 'Back to Dashboard', onClick: () => { window.location.href = dashboardPath(dashboardSlug); } }}
          />
        </main>
      </>
    );
  }

  return <>{children}</>;
}

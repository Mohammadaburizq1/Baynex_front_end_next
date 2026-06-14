import type { ReactNode } from 'react';
import { StoreProvider } from '@/contexts/StoreContext';
import { ToastProvider } from '@/components/ui/Toast';
import { DesktopSidebar, MobileSidebar } from '@/components/dashboard/Sidebar';

export const metadata = { title: 'Dashboard — ShopLink' };

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <ToastProvider>
        <div className="flex h-screen overflow-hidden bg-surface-50 font-jakarta">
          {/* Desktop sidebar */}
          <DesktopSidebar />

          {/* Mobile drawer */}
          <MobileSidebar />

          {/* Main content */}
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            {children}
          </div>
        </div>
      </ToastProvider>
    </StoreProvider>
  );
}

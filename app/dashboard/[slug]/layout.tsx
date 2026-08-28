import type { ReactNode } from 'react';
import { StoreProvider } from '@/contexts/StoreContext';
import { ToastProvider } from '@/components/ui/Toast';
import { DesktopSidebar, MobileSidebar } from '@/components/dashboard/Sidebar';

export const metadata = { title: 'Dashboard — ShopLink' };

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function DashboardSlugLayout({ children, params }: LayoutProps) {
  const { slug } = await params;

  return (
    <StoreProvider slug={slug}>
      <ToastProvider>
        <div className="flex h-screen overflow-hidden bg-surface-50 font-jakarta">
          <DesktopSidebar />
          <MobileSidebar />
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            {children}
          </div>
        </div>
      </ToastProvider>
    </StoreProvider>
  );
}

import type { ReactNode } from 'react';
import { ToastProvider } from '@/components/ui/Toast';

interface LayoutProps {
  children: ReactNode;
}

export default function StoreSlugLayout({ children }: LayoutProps) {
  return <ToastProvider>{children}</ToastProvider>;
}

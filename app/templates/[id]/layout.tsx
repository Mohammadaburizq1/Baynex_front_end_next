import type { ReactNode } from 'react';
import { ToastProvider } from '@/components/ui/Toast';

interface LayoutProps {
  children: ReactNode;
}

// Same providers as the real /store/[slug] route: the commerce templates' checkout uses toasts, so
// without this every checkout-capable template preview crashed on render.
export default function TemplatePreviewLayout({ children }: LayoutProps) {
  return <ToastProvider>{children}</ToastProvider>;
}

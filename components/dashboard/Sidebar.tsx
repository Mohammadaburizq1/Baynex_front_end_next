'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, ShoppingBag, ClipboardList, Truck, Package,
  BarChart2, Users, Settings, ChevronLeft, Store, CalendarDays,
  Home, X, Palette, LogOut, Loader2, CreditCard, Lightbulb, Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/contexts/StoreContext';
import { signOut } from '@/lib/auth/session';
import { dashboardPath } from '@/lib/utils/dashboard-path';
import type { BusinessType, UserRole } from '@/lib/types';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  // Omit to show to every merchant role. Present = visible only to the listed roles.
  roles?: UserRole[];
}

type NavSection = { label: string; section?: string; icon: React.ElementType };

const NAV_SECTIONS: Record<BusinessType, NavSection[]> = {
  restaurant: [
    { label: 'Home', icon: LayoutDashboard },
    { label: 'Menu', section: 'products', icon: ShoppingBag },
    { label: 'Orders', section: 'orders', icon: ClipboardList },
    { label: 'Delivery', section: 'delivery', icon: Truck },
    { label: 'Inventory', section: 'inventory', icon: Package },
    { label: 'Customers', section: 'customers', icon: Users },
    { label: 'Reports', section: 'reports', icon: BarChart2 },
    { label: 'Insights', section: 'insights', icon: Lightbulb },
    { label: 'Offers', section: 'offers', icon: Tag },
  ],
  retail: [
    { label: 'Home', icon: LayoutDashboard },
    { label: 'Products', section: 'products', icon: ShoppingBag },
    { label: 'Orders', section: 'orders', icon: ClipboardList },
    { label: 'Delivery', section: 'delivery', icon: Truck },
    { label: 'Inventory', section: 'inventory', icon: Package },
    { label: 'Customers', section: 'customers', icon: Users },
    { label: 'Reports', section: 'reports', icon: BarChart2 },
    { label: 'Insights', section: 'insights', icon: Lightbulb },
    { label: 'Offers', section: 'offers', icon: Tag },
  ],
  real_estate: [
    { label: 'Home', icon: LayoutDashboard },
    { label: 'Listings', section: 'products', icon: Home },
    { label: 'Appointments', section: 'delivery', icon: CalendarDays },
    { label: 'Customers', section: 'customers', icon: Users },
    { label: 'Reports', section: 'reports', icon: BarChart2 },
    { label: 'Insights', section: 'insights', icon: Lightbulb },
    { label: 'Offers', section: 'offers', icon: Tag },
  ],
  services: [
    { label: 'Home', icon: LayoutDashboard },
    { label: 'Services', section: 'products', icon: ShoppingBag },
    { label: 'Appointments', section: 'delivery', icon: CalendarDays },
    { label: 'Orders', section: 'orders', icon: ClipboardList },
    { label: 'Customers', section: 'customers', icon: Users },
    { label: 'Reports', section: 'reports', icon: BarChart2 },
    { label: 'Insights', section: 'insights', icon: Lightbulb },
    { label: 'Offers', section: 'offers', icon: Tag },
  ],
  catalog: [
    { label: 'Home', icon: LayoutDashboard },
    { label: 'Products', section: 'products', icon: ShoppingBag },
    { label: 'Customers', section: 'customers', icon: Users },
    { label: 'Reports', section: 'reports', icon: BarChart2 },
    { label: 'Insights', section: 'insights', icon: Lightbulb },
    { label: 'Offers', section: 'offers', icon: Tag },
  ],
  clothing: [
    { label: 'Home', icon: LayoutDashboard },
    { label: 'Products', section: 'products', icon: ShoppingBag },
    { label: 'Orders', section: 'orders', icon: ClipboardList },
    { label: 'Customers', section: 'customers', icon: Users },
    { label: 'Reports', section: 'reports', icon: BarChart2 },
    { label: 'Insights', section: 'insights', icon: Lightbulb },
    { label: 'Offers', section: 'offers', icon: Tag },
  ],
};

function buildNavItems(businessType: BusinessType, slug: string): NavItem[] {
  const sections = NAV_SECTIONS[businessType] ?? NAV_SECTIONS.retail;
  return sections.map(({ label, section, icon }) => ({
    label,
    href: dashboardPath(slug, section),
    icon,
  }));
}

function bottomNavItems(businessType: BusinessType, slug: string): NavItem[] {
  const items: NavItem[] = [
    // Store Settings and Billing are owner-only — staff run day-to-day operations, not the
    // store's configuration or its plan/payment. See OwnerOnlyGate for the matching page guard.
    { label: 'Store Settings', href: dashboardPath(slug, 'store-settings'), icon: Settings, roles: ['owner'] },
    { label: 'Billing', href: dashboardPath(slug, 'billing'), icon: CreditCard, roles: ['owner'] },
  ];
  if (businessType === 'clothing') {
    items.unshift({
      label: 'Customize Storefront',
      href: dashboardPath(slug, 'customize-storefront'),
      icon: Palette,
    });
  }
  return items;
}

interface SidebarContentProps {
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

function SidebarContent({ onClose, collapsed, onToggleCollapse }: SidebarContentProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { store, businessType, dashboardSlug, userRole } = useStore();
  const [loggingOut, setLoggingOut] = useState(false);
  const navItems = buildNavItems(businessType, dashboardSlug);
  const homeHref = dashboardPath(dashboardSlug);

  const isActive = (href: string) =>
    href === homeHref ? pathname === homeHref : pathname.startsWith(href);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    onClose?.();
    try {
      await signOut();
    } finally {
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className={cn(
        'flex items-center justify-between px-4 py-4 border-b border-sidebar-border min-h-[64px]',
        collapsed && 'px-3 justify-center',
      )}>
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center shrink-0">
              <Store size={16} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{store.name}</p>
              <p className="text-2xs text-sidebar-text truncate">{dashboardSlug}</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
            <Store size={16} className="text-white" />
          </div>
        )}
        {onClose && (
          <button onClick={onClose} aria-label="Close sidebar" className="text-sidebar-text hover:text-white transition-colors cursor-pointer p-1">
            <X size={18} />
          </button>
        )}
        {onToggleCollapse && !onClose && (
          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="text-sidebar-text hover:text-white transition-colors cursor-pointer p-1 rounded-md hover:bg-sidebar-hover"
          >
            <ChevronLeft size={16} className={cn('transition-transform', collapsed && 'rotate-180')} />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg transition-colors duration-150 cursor-pointer',
                collapsed ? 'px-2 py-2.5 justify-center' : 'px-3 py-2.5',
                active
                  ? 'bg-sidebar-active text-white'
                  : 'text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-heading',
              )}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="py-3 px-2 border-t border-sidebar-border space-y-0.5">
        {bottomNavItems(businessType, dashboardSlug)
          .filter(item => !item.roles || item.roles.includes(userRole))
          .map(item => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg transition-colors duration-150 cursor-pointer',
                collapsed ? 'px-2 py-2.5 justify-center' : 'px-3 py-2.5',
                active
                  ? 'bg-sidebar-active text-white'
                  : 'text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-heading',
              )}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          title={collapsed ? 'Log out' : undefined}
          className={cn(
            'flex items-center gap-3 rounded-lg transition-colors duration-150 cursor-pointer w-full',
            'text-sidebar-text hover:bg-red-500/10 hover:text-red-300 disabled:opacity-60',
            collapsed ? 'px-2 py-2.5 justify-center' : 'px-3 py-2.5',
          )}
        >
          {loggingOut
            ? <Loader2 size={18} className="shrink-0 animate-spin" />
            : <LogOut size={18} className="shrink-0" />}
          {!collapsed && (
            <span className="text-sm font-medium">{loggingOut ? 'Logging out…' : 'Log out'}</span>
          )}
        </button>
      </div>
    </div>
  );
}

export function DesktopSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      'hidden lg:flex flex-col bg-sidebar-bg border-r border-sidebar-border',
      'transition-all duration-200 shrink-0 h-screen sticky top-0',
      collapsed ? 'w-16' : 'w-sidebar',
    )}>
      <SidebarContent
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(c => !c)}
      />
    </aside>
  );
}

export function MobileSidebar() {
  const { sidebarOpen, setSidebarOpen } = useStore();

  if (!sidebarOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-sidebar-bg lg:hidden animate-slide-down">
        <SidebarContent onClose={() => setSidebarOpen(false)} />
      </aside>
    </>
  );
}

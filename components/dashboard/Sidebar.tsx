'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, ShoppingBag, ClipboardList, Truck, Package,
  BarChart2, Users, Settings, ChevronLeft, Store, CalendarDays,
  Home, X, Palette, LogOut, Loader2, CreditCard, Lightbulb, Tag, FolderTree, MonitorSmartphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/contexts/StoreContext';
import { signOut } from '@/lib/auth/session';
import { dashboardPath } from '@/lib/utils/dashboard-path';
import { getStockAlerts } from '@/lib/api/inventory';
import { BUSINESS_TYPES_WITH_STOCK } from '@/lib/utils';
import type { BusinessType, UserRole } from '@/lib/types';
import type { DashboardSection, PermissionGrid } from '@/lib/api/permissions';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  // Omit to show to every merchant role. Present = visible only to the listed roles.
  roles?: UserRole[];
  // Present = hidden from staff whose grid level for this section is NONE (owners are always
  // ALL_EDIT_GRID, so this never hides anything from them).
  permission?: DashboardSection;
  // A count to show next to the label (e.g. items low or out of stock on Inventory).
  badge?: number;
}

type NavSection = { label: string; section?: string; icon: React.ElementType };

const NAV_SECTIONS: Record<BusinessType, NavSection[]> = {
  restaurant: [
    { label: 'Home', icon: LayoutDashboard },
    { label: 'Menu', section: 'products', icon: ShoppingBag },
    { label: 'Categories', section: 'categories', icon: FolderTree },
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
    { label: 'Categories', section: 'categories', icon: FolderTree },
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
    { label: 'Appointments', section: 'appointments', icon: CalendarDays },
    { label: 'Customers', section: 'customers', icon: Users },
    { label: 'Reports', section: 'reports', icon: BarChart2 },
    { label: 'Insights', section: 'insights', icon: Lightbulb },
    { label: 'Offers', section: 'offers', icon: Tag },
  ],
  services: [
    { label: 'Home', icon: LayoutDashboard },
    { label: 'Services', section: 'products', icon: ShoppingBag },
    { label: 'Categories', section: 'categories', icon: FolderTree },
    { label: 'Appointments', section: 'appointments', icon: CalendarDays },
    { label: 'Orders', section: 'orders', icon: ClipboardList },
    { label: 'Customers', section: 'customers', icon: Users },
    { label: 'Reports', section: 'reports', icon: BarChart2 },
    { label: 'Insights', section: 'insights', icon: Lightbulb },
    { label: 'Offers', section: 'offers', icon: Tag },
  ],
  catalog: [
    { label: 'Home', icon: LayoutDashboard },
    { label: 'Products', section: 'products', icon: ShoppingBag },
    { label: 'Categories', section: 'categories', icon: FolderTree },
    { label: 'Customers', section: 'customers', icon: Users },
    { label: 'Reports', section: 'reports', icon: BarChart2 },
    { label: 'Insights', section: 'insights', icon: Lightbulb },
    { label: 'Offers', section: 'offers', icon: Tag },
  ],
  clothing: [
    { label: 'Home', icon: LayoutDashboard },
    { label: 'Products', section: 'products', icon: ShoppingBag },
    { label: 'Categories', section: 'categories', icon: FolderTree },
    { label: 'Orders', section: 'orders', icon: ClipboardList },
    { label: 'Customers', section: 'customers', icon: Users },
    { label: 'Reports', section: 'reports', icon: BarChart2 },
    { label: 'Insights', section: 'insights', icon: Lightbulb },
    { label: 'Offers', section: 'offers', icon: Tag },
  ],
};

// Not every nav item is a distinct backend permission section — Inventory reads the same
// PRODUCTS data as Products, Insights reads the same REPORTS data as Reports (see the backend's
// DashboardSection enum / CatalogService.dashboardProducts, OrderService's analytics methods).
// 'Home' has no entry and is always visible.
const SECTION_FOR_NAV: Record<string, DashboardSection> = {
  products: 'PRODUCTS',
  categories: 'PRODUCTS',
  inventory: 'PRODUCTS',
  orders: 'ORDERS',
  delivery: 'DELIVERY',
  customers: 'CUSTOMERS',
  reports: 'REPORTS',
  insights: 'REPORTS',
  offers: 'OFFERS',
  appointments: 'APPOINTMENTS',
};

// permissions is only meaningfully consulted for staff — owners are always ALL_EDIT_GRID (see
// StoreContext), so this filter is a no-op for them.
function buildNavItems(businessType: BusinessType, slug: string, permissions: PermissionGrid, stockAlerts: number): NavItem[] {
  const sections = NAV_SECTIONS[businessType] ?? NAV_SECTIONS.retail;
  return sections
    .filter(({ section }) => {
      if (!section) return true;
      const permSection = SECTION_FOR_NAV[section];
      return !permSection || permissions[permSection] !== 'NONE';
    })
    .map(({ label, section, icon }) => ({
      label,
      href: dashboardPath(slug, section),
      icon,
      badge: section === 'inventory' ? stockAlerts : undefined,
    }));
}

function bottomNavItems(businessType: BusinessType, slug: string): NavItem[] {
  return [
    {
      label: 'Customize Storefront',
      href: dashboardPath(slug, 'customize-storefront'),
      icon: Palette,
      permission: 'STOREFRONT',
    },
    // Store Settings and Billing are owner-only — staff run day-to-day operations, not the
    // store's configuration or its plan/payment. See OwnerOnlyGate for the matching page guard.
    // POS devices are managed by the owner only (the backend's PosDeviceController is owner-only),
    // and only for store types that take orders — POS sales arrive as orders.
    ...(POS_BUSINESS_TYPES.includes(businessType)
      ? [{ label: 'POS Devices', href: dashboardPath(slug, 'pos-devices'), icon: MonitorSmartphone, roles: ['owner'] as UserRole[] }]
      : []),
    { label: 'Store Settings', href: dashboardPath(slug, 'store-settings'), icon: Settings, roles: ['owner'] },
    { label: 'Billing', href: dashboardPath(slug, 'billing'), icon: CreditCard, roles: ['owner'] },
  ];
}

const POS_BUSINESS_TYPES: BusinessType[] = ['restaurant', 'retail', 'services', 'clothing'];

interface SidebarContentProps {
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

function SidebarContent({ onClose, collapsed, onToggleCollapse }: SidebarContentProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { store, businessType, dashboardSlug, userRole, permissions } = useStore();
  const [loggingOut, setLoggingOut] = useState(false);
  const [stockAlerts, setStockAlerts] = useState(0);
  const canSeeStock = permissions.PRODUCTS !== 'NONE' && (BUSINESS_TYPES_WITH_STOCK[businessType] ?? false);
  useEffect(() => {
    // Items that are low or out of stock, so the merchant notices without opening Inventory.
    if (!canSeeStock || store.id.startsWith('local-')) {
      setStockAlerts(0);
      return;
    }
    let cancelled = false;
    const load = () => getStockAlerts(store.id)
      .then(a => { if (!cancelled) setStockAlerts(a.lowCount + a.outCount); })
      .catch(() => { /* the badge is a nicety */ });
    void load();
    const timer = setInterval(load, 120_000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [store.id, canSeeStock]);
  const navItems = buildNavItems(businessType, dashboardSlug, permissions, stockAlerts);
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
              <span className="relative shrink-0">
                <Icon size={18} />
                {collapsed && !!item.badge && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400" aria-hidden="true" />
                )}
              </span>
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              {!collapsed && !!item.badge && (
                <span
                  className="ml-auto min-w-5 h-5 px-1.5 rounded-full bg-amber-400 text-[11px] font-bold text-slate-900 flex items-center justify-center tabular-nums"
                  aria-label={`${item.badge} items need attention`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="py-3 px-2 border-t border-sidebar-border space-y-0.5">
        {bottomNavItems(businessType, dashboardSlug)
          .filter(item => !item.roles || item.roles.includes(userRole))
          .filter(item => !item.permission || permissions[item.permission] !== 'NONE')
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

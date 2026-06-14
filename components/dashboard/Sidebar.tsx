'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, ShoppingBag, ClipboardList, Truck, Package,
  BarChart2, Users, Settings, ChevronLeft, Store, CalendarDays,
  Home, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/contexts/StoreContext';
import type { BusinessType } from '@/lib/types';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: Record<BusinessType, NavItem[]> = {
  restaurant: [
    { label: 'Home',      href: '/dashboard',          icon: LayoutDashboard },
    { label: 'Menu',      href: '/dashboard/products', icon: ShoppingBag      },
    { label: 'Orders',    href: '/dashboard/orders',   icon: ClipboardList    },
    { label: 'Delivery',  href: '/dashboard/delivery', icon: Truck            },
    { label: 'Inventory', href: '/dashboard/inventory',icon: Package          },
    { label: 'Customers', href: '/dashboard/customers',icon: Users            },
    { label: 'Reports',   href: '/dashboard/reports',  icon: BarChart2        },
  ],
  retail: [
    { label: 'Home',      href: '/dashboard',          icon: LayoutDashboard },
    { label: 'Products',  href: '/dashboard/products', icon: ShoppingBag     },
    { label: 'Orders',    href: '/dashboard/orders',   icon: ClipboardList   },
    { label: 'Delivery',  href: '/dashboard/delivery', icon: Truck           },
    { label: 'Inventory', href: '/dashboard/inventory',icon: Package         },
    { label: 'Customers', href: '/dashboard/customers',icon: Users           },
    { label: 'Reports',   href: '/dashboard/reports',  icon: BarChart2       },
  ],
  real_estate: [
    { label: 'Home',         href: '/dashboard',          icon: LayoutDashboard },
    { label: 'Listings',     href: '/dashboard/products', icon: Home            },
    { label: 'Appointments', href: '/dashboard/delivery', icon: CalendarDays    },
    { label: 'Customers',    href: '/dashboard/customers',icon: Users           },
    { label: 'Reports',      href: '/dashboard/reports',  icon: BarChart2       },
  ],
  services: [
    { label: 'Home',         href: '/dashboard',          icon: LayoutDashboard },
    { label: 'Services',     href: '/dashboard/products', icon: ShoppingBag     },
    { label: 'Appointments', href: '/dashboard/delivery', icon: CalendarDays    },
    { label: 'Orders',       href: '/dashboard/orders',   icon: ClipboardList   },
    { label: 'Customers',    href: '/dashboard/customers',icon: Users           },
    { label: 'Reports',      href: '/dashboard/reports',  icon: BarChart2       },
  ],
  catalog: [
    { label: 'Home',      href: '/dashboard',          icon: LayoutDashboard },
    { label: 'Products',  href: '/dashboard/products', icon: ShoppingBag     },
    { label: 'Customers', href: '/dashboard/customers',icon: Users           },
    { label: 'Reports',   href: '/dashboard/reports',  icon: BarChart2       },
  ],
};

const BOTTOM_ITEMS: NavItem[] = [
  { label: 'Store Settings', href: '/dashboard/store-settings', icon: Settings },
];

interface SidebarContentProps {
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

function SidebarContent({ onClose, collapsed, onToggleCollapse }: SidebarContentProps) {
  const pathname = usePathname();
  const { store, businessType } = useStore();
  const navItems = NAV_ITEMS[businessType] ?? NAV_ITEMS.retail;

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  return (
    <div className="flex flex-col h-full">
      {/* Logo / Store name */}
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
              <p className="text-2xs text-sidebar-text truncate capitalize">{store.businessType.replace('_', ' ')}</p>
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

      {/* Main nav */}
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

      {/* Bottom: Settings */}
      <div className="py-3 px-2 border-t border-sidebar-border space-y-0.5">
        {BOTTOM_ITEMS.map(item => {
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
      </div>
    </div>
  );
}

// ── Desktop sidebar ───────────────────────────────────────────────────────────

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

// ── Mobile drawer ─────────────────────────────────────────────────────────────

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


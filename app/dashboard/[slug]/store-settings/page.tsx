'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Store, Tag, Globe, Power, Palette, Users, UserPlus, Mail, X, ShieldCheck, Clock } from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { OwnerOnlyGate } from '@/components/dashboard/OwnerOnlyGate';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input, Select, Textarea, Toggle } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import type { StaffList } from '@/lib/api/staff';
import { ALL_EDIT_GRID, type DashboardSection, type PermissionGrid, type PermissionLevel } from '@/lib/api/permissions';
import { useStore } from '@/contexts/StoreContext';
import { dashboardPath } from '@/lib/utils/dashboard-path';
import { cn } from '@/lib/utils';
import { getBusinessHours, updateBusinessHours, type BusinessHoursDay } from '@/lib/api/business-hours';
import { updateAcceptingOrders } from '@/lib/api/stores';

const BUSINESS_TYPE_OPTIONS = [
  { value: 'retail', label: 'Retail Store' },
  { value: 'restaurant', label: 'Restaurant / F&B' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'services', label: 'Services' },
  { value: 'catalog', label: 'Catalogue' },
];

const CURRENCY_OPTIONS = [
  { value: 'JOD', label: 'JOD — Jordanian Dinar' },
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'SAR', label: 'SAR — Saudi Riyal' },
  { value: 'AED', label: 'AED — UAE Dirham' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — Pound Sterling' },
  { value: 'MYR', label: 'MYR — Malaysian Ringgit' },
];

// Matches the backend's DashboardSection enum. Inventory/Insights aren't listed separately — they
// ride on PRODUCTS/REPORTS respectively (see Sidebar.tsx's SECTION_FOR_NAV for the same mapping).
const PERMISSION_SECTIONS: { section: DashboardSection; label: string }[] = [
  { section: 'PRODUCTS', label: 'Products & Inventory' },
  { section: 'ORDERS', label: 'Orders' },
  { section: 'DELIVERY', label: 'Delivery' },
  { section: 'CUSTOMERS', label: 'Customers' },
  { section: 'REPORTS', label: 'Reports & Insights' },
  { section: 'OFFERS', label: 'Offers' },
  { section: 'APPOINTMENTS', label: 'Appointments' },
  { section: 'STOREFRONT', label: 'Customize Storefront' },
];

const TIMEZONE_OPTIONS = [
  { value: 'Asia/Amman', label: 'Asia/Amman' },
  { value: 'Asia/Riyadh', label: 'Asia/Riyadh' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai' },
  { value: 'Europe/London', label: 'Europe/London' },
  { value: 'Asia/Kuala_Lumpur', label: 'Asia/Kuala_Lumpur' },
  { value: 'UTC', label: 'UTC (UTC+0)' },
];

const LOCALE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'Arabic' },
];

const BUSINESS_DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

function blankBusinessHours(): BusinessHoursDay[] {
  return BUSINESS_DAYS.map(dayOfWeek => ({ dayOfWeek, closed: true, open24Hours: false, openTime: null, closeTime: null }));
}

export default function StoreSettingsPage() {
  return (
    <OwnerOnlyGate pageTitle="Store Settings" description="Store settings are only visible to the store owner.">
      <StoreSettingsContent />
    </OwnerOnlyGate>
  );
}

function StoreSettingsContent() {
  const { store, updateStore, dashboardSlug } = useStore();
  const { success, error: toastError } = useToast();

  // Section 1: Store Information
  const [infoForm, setInfoForm] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    address: '',
  });

  // Section 2: Business Type & Category
  const [bizForm, setBizForm] = useState({
    businessType: 'retail',
    category: '',
    currency: 'JOD',
    timezone: 'UTC',
    locale: 'en',
  });

  // Section 3: Store Status
  const [storeOpen, setStoreOpen] = useState(false);
  const [published, setPublished] = useState(false);

  // Sync from store context when it changes
  useEffect(() => {
    setInfoForm({
      name: store.name ?? '',
      description: store.description ?? '',
      phone: store.phone ?? '',
      email: store.email ?? '',
      address: store.address ?? '',
    });
    setBizForm({
      businessType: store.businessType ?? 'retail',
      category: store.category ?? '',
      currency: store.currency ?? 'JOD',
      timezone: store.timezone ?? 'UTC',
      locale: store.locale ?? 'en',
    });
    setStoreOpen(store.acceptingOrders ?? true);
    setPublished(store.status === 'active');
  }, [store]);

  const [savingInfo, setSavingInfo] = useState(false);
  const [savingBiz, setSavingBiz] = useState(false);
  const [businessHours, setBusinessHours] = useState<BusinessHoursDay[]>(blankBusinessHours);
  const [businessHoursConfigured, setBusinessHoursConfigured] = useState(false);
  const [loadingBusinessHours, setLoadingBusinessHours] = useState(true);
  const [savingBusinessHours, setSavingBusinessHours] = useState(false);
  const [savingAcceptingOrders, setSavingAcceptingOrders] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [noProductsError, setNoProductsError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadBusinessHours() {
      if (store.id.startsWith('local-')) {
        setLoadingBusinessHours(false);
        return;
      }
      setLoadingBusinessHours(true);
      try {
        const response = await getBusinessHours(store.id);
        if (!cancelled) {
          setBusinessHours(response.days);
          setBusinessHoursConfigured(response.configured);
        }
      } catch {
        if (!cancelled) {
          setBusinessHours(blankBusinessHours());
          setBusinessHoursConfigured(false);
        }
      } finally {
        if (!cancelled) setLoadingBusinessHours(false);
      }
    }
    loadBusinessHours();
    return () => { cancelled = true; };
  }, [store.id]);

  const updateBusinessDay = (index: number, patch: Partial<BusinessHoursDay>) => {
    setBusinessHours(days => days.map((day, i) => i === index ? { ...day, ...patch } : day));
  };

  const handleSaveBusinessHours = async () => {
    if (store.id.startsWith('local-')) {
      toastError('Save the store to the backend before configuring business hours.');
      return;
    }
    setSavingBusinessHours(true);
    try {
      const response = await updateBusinessHours(store.id, { days: businessHours });
      setBusinessHours(response.days);
      setBusinessHoursConfigured(response.configured);
      success('Business hours saved.');
    } catch (e: any) {
      toastError(e?.message ?? 'Could not save business hours.');
    } finally {
      setSavingBusinessHours(false);
    }
  };

  // ── Team / staff ─────────────────────────────────────────────────────────
  const [staff, setStaff] = useState<StaffList | null>(null);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviting, setInviting] = useState(false);
  const [busyStaffId, setBusyStaffId] = useState<string | null>(null);

  // ── Team / staff — per-section permissions ─────────────────────────────────
  const [permTarget, setPermTarget] = useState<{ id: string; name: string } | null>(null);
  const [permGrid, setPermGrid] = useState<PermissionGrid>(ALL_EDIT_GRID);
  const [loadingPerm, setLoadingPerm] = useState(false);
  const [savingPerm, setSavingPerm] = useState(false);

  async function loadStaff() {
    if (store.id.startsWith('local-')) {
      setLoadingStaff(false);
      return;
    }
    setLoadingStaff(true);
    try {
      const { getStaff } = await import('@/lib/api/staff');
      setStaff(await getStaff(store.id));
    } catch {
      setStaff(null);
    }
    setLoadingStaff(false);
  }

  useEffect(() => {
    loadStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.id]);

  async function handleInviteStaff() {
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) {
      setInviteError('Enter a valid email address.');
      return;
    }
    setInviting(true);
    setInviteError('');
    try {
      const { inviteStaff } = await import('@/lib/api/staff');
      const result = await inviteStaff(store.id, inviteEmail.trim(), inviteName.trim() || undefined);
      success(`Invite sent to ${result.email}.`);
      setInviteModalOpen(false);
      setInviteEmail('');
      setInviteName('');
      await loadStaff();
    } catch (e) {
      setInviteError(e instanceof Error ? e.message : 'Could not send invite. Please try again.');
    }
    setInviting(false);
  }

  async function handleRevokeInvite(inviteId: string) {
    setBusyStaffId(inviteId);
    try {
      const { revokeStaffInvite } = await import('@/lib/api/staff');
      await revokeStaffInvite(inviteId);
      success('Invite revoked.');
      await loadStaff();
    } catch (e) {
      toastError(e instanceof Error ? e.message : 'Could not revoke the invite. Please try again.');
    }
    setBusyStaffId(null);
  }

  async function handleRemoveStaff(memberId: string, memberName: string) {
    setBusyStaffId(memberId);
    try {
      const { deactivateStaff } = await import('@/lib/api/staff');
      await deactivateStaff(memberId);
      success(`${memberName} removed from the team.`);
      await loadStaff();
    } catch (e) {
      toastError(e instanceof Error ? e.message : 'Could not remove this team member. Please try again.');
    }
    setBusyStaffId(null);
  }

  async function openPermissions(memberId: string, memberName: string) {
    setPermTarget({ id: memberId, name: memberName });
    setPermGrid(ALL_EDIT_GRID);
    setLoadingPerm(true);
    try {
      const { getStaffPermissions } = await import('@/lib/api/permissions');
      setPermGrid(await getStaffPermissions(memberId));
    } catch {
      toastError('Could not load permissions for this team member.');
    }
    setLoadingPerm(false);
  }

  async function handleSavePermissions() {
    if (!permTarget) return;
    setSavingPerm(true);
    try {
      const { updateStaffPermissions } = await import('@/lib/api/permissions');
      const grants = (Object.entries(permGrid) as [DashboardSection, PermissionLevel][])
        .map(([section, level]) => ({ section, level }));
      await updateStaffPermissions(permTarget.id, grants);
      success(`Permissions updated for ${permTarget.name}.`);
      setPermTarget(null);
    } catch (e) {
      toastError(e instanceof Error ? e.message : 'Could not save permissions. Please try again.');
    }
    setSavingPerm(false);
  }

  async function handleSaveInfo() {
    setSavingInfo(true);
    try {
      const { updateStore: apiUpdate } = await import('@/lib/api/stores');
      await apiUpdate(store.id, {
        name: infoForm.name,
        slug: store.slug,
        description: infoForm.description,
        phone: infoForm.phone,
        email: infoForm.email,
        address: infoForm.address,
        categorySlug: store.category || 'general-store',
      });
      // Only reflect the change locally once the server has actually accepted it — otherwise a
      // failed save (network error, validation) used to still claim success and leave the change
      // sitting only in local state/localStorage, silently lost on the next real store refresh.
      updateStore({
        name: infoForm.name,
        description: infoForm.description,
        phone: infoForm.phone,
        email: infoForm.email,
        address: infoForm.address,
      });
      success('Store information saved successfully');
    } catch (e) {
      toastError(e instanceof Error ? e.message : 'Could not save store information. Please try again.');
    }
    setSavingInfo(false);
  }

  async function handleSaveBiz() {
    setSavingBiz(true);
    try {
      const { updateStore: apiUpdate } = await import('@/lib/api/stores');
      await apiUpdate(store.id, {
        name: store.name,
        slug: store.slug,
        description: store.description,
        phone: store.phone,
        email: store.email,
        address: store.address,
        categorySlug: bizForm.category || store.category || 'general-store',
        templateKey: store.theme,
        currency: bizForm.currency,
        timezone: bizForm.timezone,
        locale: bizForm.locale,
      });
      updateStore({
        businessType: bizForm.businessType as any,
        category: bizForm.category,
        currency: bizForm.currency,
        timezone: bizForm.timezone,
        locale: bizForm.locale,
      });
      success('Business settings saved successfully');
    } catch (e) {
      toastError(e instanceof Error ? e.message : 'Could not save business settings. Please try again.');
    }
    setSavingBiz(false);
  }

  async function handleToggleOpen(open: boolean) {
    if (store.id.startsWith('local-')) {
      toastError('Save your store to the backend before changing order acceptance.');
      return;
    }
    setSavingAcceptingOrders(true);
    try {
      const saved = await updateAcceptingOrders(store.id, open);
      setStoreOpen(saved.acceptingOrders ?? open);
      updateStore({ acceptingOrders: saved.acceptingOrders ?? open });
      success(open ? 'Online ordering resumed' : 'New orders paused');
    } catch (e) {
      toastError(e instanceof Error ? e.message : 'Could not update order acceptance.');
    } finally {
      setSavingAcceptingOrders(false);
    }
  }

  async function handleTogglePublish(pub: boolean) {
    if (store.id.startsWith('local-')) {
      toastError('Save your store to the server first (see the banner on your dashboard home), then you can publish it.');
      return;
    }
    setPublished(pub);
    setPublishing(true);
    setNoProductsError(false);
    try {
      const { setStorePublished, isNoProductsPublishError } = await import('@/lib/utils/store-publish');
      try {
        await setStorePublished(store, pub);
        updateStore({ status: pub ? 'active' : 'draft' });
        success(pub ? 'Store published and visible to customers' : 'Store unpublished');
      } catch (e: any) {
        setPublished(!pub);
        if (isNoProductsPublishError(e)) {
          setNoProductsError(true);
          toastError('Add at least one product before you can publish your store.');
        } else {
          toastError(e?.message ?? 'Could not update publish status. Please try again.');
        }
      }
    } finally {
      setPublishing(false);
    }
  }

  return (
    <>
      <Header title="Store Settings" subtitle="Configure your store" />

      <main className="flex-1 overflow-y-auto bg-slate-50">
        <div className="p-5 lg:p-6 max-w-3xl mx-auto space-y-6 pb-8">

        {/* ── Section 1: Store Information ──────────────────────────── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-100 rounded-lg">
                <Store size={16} className="text-indigo-600" />
              </div>
              <CardTitle>Store Information</CardTitle>
            </div>
          </CardHeader>
          <div className="space-y-4">
            <Input
              label="Store Name"
              required
              value={infoForm.name}
              onChange={e => setInfoForm(p => ({ ...p, name: e.target.value }))}
              placeholder="My Awesome Store"
            />
            <Textarea
              label="Store Description"
              value={infoForm.description}
              onChange={e => setInfoForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Tell customers about your store..."
              rows={3}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone"
                type="tel"
                value={infoForm.phone}
                onChange={e => setInfoForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="+60 12-345 6789"
              />
              <Input
                label="Email"
                type="email"
                value={infoForm.email}
                onChange={e => setInfoForm(p => ({ ...p, email: e.target.value }))}
                placeholder="hello@mystore.com"
              />
            </div>
            <Textarea
              label="Address"
              value={infoForm.address}
              onChange={e => setInfoForm(p => ({ ...p, address: e.target.value }))}
              placeholder="123 Jalan Bukit Bintang, Kuala Lumpur, 55100"
              rows={2}
            />
            <div className="flex justify-end pt-1">
              <Button onClick={handleSaveInfo} loading={savingInfo}>Save Changes</Button>
            </div>
          </div>
        </Card>

        {/* ── Section 2: Business Type & Category ───────────────────── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-100 rounded-lg">
                <Tag size={16} className="text-emerald-600" />
              </div>
              <CardTitle>Business Type & Category</CardTitle>
            </div>
          </CardHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Business Type"
                options={BUSINESS_TYPE_OPTIONS}
                value={bizForm.businessType}
                onChange={e => setBizForm(p => ({ ...p, businessType: e.target.value }))}
              />
              <Input
                label="Category"
                value={bizForm.category}
                onChange={e => setBizForm(p => ({ ...p, category: e.target.value }))}
                placeholder="e.g. Fast Food, Clothing"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Currency"
                options={CURRENCY_OPTIONS}
                value={bizForm.currency}
                onChange={e => setBizForm(p => ({ ...p, currency: e.target.value }))}
              />
              <Select
                label="Timezone"
                options={TIMEZONE_OPTIONS}
                value={bizForm.timezone}
                onChange={e => setBizForm(p => ({ ...p, timezone: e.target.value }))}
              />
              <Select
                label="Default language"
                options={LOCALE_OPTIONS}
                value={bizForm.locale}
                onChange={e => setBizForm(p => ({ ...p, locale: e.target.value }))}
              />
            </div>
            <div className="flex justify-end pt-1">
              <Button onClick={handleSaveBiz} loading={savingBiz}>Save Changes</Button>
            </div>
          </div>
        </Card>

        {/* ── Section 3: Store Status ────────────────────────────────── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-sky-100 rounded-lg">
                <Clock size={16} className="text-sky-600" />
              </div>
              <CardTitle>Business Hours</CardTitle>
            </div>
            <Badge variant={businessHoursConfigured ? 'success' : 'default'}>
              {businessHoursConfigured ? 'Configured' : 'Not configured'}
            </Badge>
          </CardHeader>
          <CardDescription className="mb-4">
            Set the weekly schedule used to show open or closed status in your storefront. Times use your selected timezone.
          </CardDescription>
          {loadingBusinessHours ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {businessHours.map((day, index) => (
                <div key={day.dayOfWeek} className="grid grid-cols-[minmax(100px,1fr)_auto_minmax(105px,1fr)_auto_minmax(105px,1fr)] items-center gap-2 rounded-lg border border-surface-200 px-3 py-2">
                  <span className="text-sm font-medium text-slate-700 capitalize">{day.dayOfWeek.toLowerCase()}</span>
                  <Toggle
                    checked={!day.closed}
                    onChange={checked => updateBusinessDay(index, checked
                      ? { closed: false, open24Hours: false, openTime: day.openTime ?? '09:00', closeTime: day.closeTime ?? '17:00' }
                      : { closed: true, open24Hours: false, openTime: null, closeTime: null })}
                    aria-label={`${day.dayOfWeek} open`}
                  />
                  {day.closed ? (
                    <span className="col-span-3 text-sm text-slate-400">Closed</span>
                  ) : day.open24Hours ? (
                    <label className="col-span-3 flex items-center gap-1.5 text-sm text-slate-600">
                      <input type="checkbox" checked onChange={() => updateBusinessDay(index, { open24Hours: false, openTime: '09:00', closeTime: '17:00' })} />
                      Open 24 hours
                    </label>
                  ) : (
                    <>
                      <input aria-label={`${day.dayOfWeek} opening time`} type="time" value={day.openTime ?? ''} onChange={e => updateBusinessDay(index, { openTime: e.target.value })} className="h-9 rounded-lg border border-surface-300 px-2 text-sm text-slate-700" />
                      <span className="text-slate-400">to</span>
                      <input aria-label={`${day.dayOfWeek} closing time`} type="time" value={day.closeTime ?? ''} onChange={e => updateBusinessDay(index, { closeTime: e.target.value })} className="h-9 rounded-lg border border-surface-300 px-2 text-sm text-slate-700" />
                      <label className="col-span-2 flex items-center gap-1.5 text-xs text-slate-500">
                        <input type="checkbox" checked={day.open24Hours} onChange={e => updateBusinessDay(index, { open24Hours: e.target.checked, openTime: e.target.checked ? null : (day.openTime ?? '09:00'), closeTime: e.target.checked ? null : (day.closeTime ?? '17:00') })} />
                        24 hours
                      </label>
                    </>
                  )}
                </div>
              ))}
              <div className="flex justify-end pt-2">
                <Button onClick={handleSaveBusinessHours} loading={savingBusinessHours}>Save Business Hours</Button>
              </div>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-100 rounded-lg">
                <Power size={16} className="text-amber-600" />
              </div>
              <CardTitle>Store Status</CardTitle>
            </div>
          </CardHeader>
          <div className="space-y-4">
            {/* Open / Closed prominent toggle */}
            <div className={cn(
              'rounded-xl border-2 px-5 py-4 transition-colors duration-200',
              storeOpen
                ? 'border-emerald-200 bg-emerald-50/60'
                : 'border-slate-200 bg-slate-50/60',
            )}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className={cn(
                    'text-base font-bold transition-colors',
                    storeOpen ? 'text-emerald-700' : 'text-slate-600',
                  )}>
                    Store is{' '}
                    <span className={storeOpen ? 'text-emerald-600' : 'text-slate-500'}>
                      {storeOpen ? 'OPEN' : 'CLOSED'}
                    </span>
                  </p>
                  <p className="text-sm mt-0.5 text-slate-500">
                    {storeOpen
                      ? 'Your store is accepting orders'
                      : 'Online ordering is paused. Your storefront stays visible.'}
                  </p>
                </div>
                <Toggle
                  checked={storeOpen}
                  onChange={handleToggleOpen}
                  disabled={savingAcceptingOrders}
                  aria-label="Toggle store open/closed"
                />
              </div>
            </div>

            {/* Publish Store toggle */}
            <div className="flex items-start justify-between gap-4 px-1 py-2 border-t border-surface-200 pt-4">
              <div>
                <p className="text-sm font-medium text-slate-700">Publish Store</p>
                <p className="text-xs text-slate-500 mt-0.5 max-w-xs">
                  Make your store publicly accessible via your khanGates URL. Unpublishing hides it from all customers.
                </p>
                {noProductsError && (
                  <p className="text-xs text-red-600 mt-1.5">
                    Add at least one product before publishing —{' '}
                    <Link href={dashboardPath(dashboardSlug, 'products')} className="font-semibold underline">
                      go to Products
                    </Link>
                  </p>
                )}
              </div>
              <Toggle
                checked={published}
                onChange={handleTogglePublish}
                disabled={publishing}
                aria-label="Toggle store published"
              />
            </div>
          </div>
        </Card>

        {/* ── Team ───────────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary-100 rounded-lg">
                <Users size={16} className="text-primary-600" />
              </div>
              <CardTitle>Team</CardTitle>
            </div>
            <Button
              size="sm"
              icon={<UserPlus size={14} />}
              onClick={() => setInviteModalOpen(true)}
              disabled={store.id.startsWith('local-')}
            >
              Invite Staff
            </Button>
          </CardHeader>
          <CardDescription className="mb-4">
            Staff accounts can manage products, orders, and delivery for this store. They can&apos;t see Billing or Store Settings.
          </CardDescription>

          {loadingStaff ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              {(!staff || (staff.members.length === 0 && staff.pendingInvites.length === 0)) && (
                <p className="text-sm text-slate-500 py-2">No staff invited yet — you&apos;re the only one with access to this store.</p>
              )}
              {staff?.members.map(m => (
                <div key={m.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-surface-50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{m.fullName}</p>
                    <p className="text-xs text-slate-500 truncate">{m.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={m.active ? 'success' : 'default'}>{m.active ? 'Active' : 'Disabled'}</Badge>
                    {m.active && (
                      <button
                        onClick={() => openPermissions(m.id, m.fullName)}
                        aria-label={`Manage permissions for ${m.fullName}`}
                        className="h-7 w-7 flex items-center justify-center rounded-md text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                      >
                        <ShieldCheck size={14} />
                      </button>
                    )}
                    {m.active && (
                      <button
                        onClick={() => handleRemoveStaff(m.id, m.fullName)}
                        disabled={busyStaffId === m.id}
                        aria-label={`Remove ${m.fullName} from the team`}
                        className="h-7 w-7 flex items-center justify-center rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {staff?.pendingInvites.map(inv => (
                <div key={inv.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-amber-50">
                  <div className="min-w-0 flex items-center gap-2">
                    <Mail size={14} className="text-amber-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{inv.fullName || inv.email}</p>
                      <p className="text-xs text-slate-500 truncate">{inv.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="warning">Invite Pending</Badge>
                    <button
                      onClick={() => handleRevokeInvite(inv.id)}
                      disabled={busyStaffId === inv.id}
                      aria-label={`Revoke invite for ${inv.email}`}
                      className="h-7 w-7 flex items-center justify-center rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Modal
          open={!!permTarget}
          onClose={() => setPermTarget(null)}
          title={permTarget ? `Permissions — ${permTarget.name}` : 'Permissions'}
          description="Sections left unset default to full access, same as before this existed."
          footer={
            <>
              <Button variant="secondary" onClick={() => setPermTarget(null)} disabled={savingPerm}>Cancel</Button>
              <Button onClick={handleSavePermissions} loading={savingPerm} disabled={loadingPerm}>Save</Button>
            </>
          }
        >
          {loadingPerm ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {PERMISSION_SECTIONS.map(({ section, label }) => (
                <div key={section} className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-700">{label}</span>
                  <Select
                    className="w-32"
                    value={permGrid[section]}
                    onChange={e => setPermGrid(prev => ({ ...prev, [section]: e.target.value as PermissionLevel }))}
                    options={[
                      { value: 'NONE', label: 'No access' },
                      { value: 'VIEW', label: 'View only' },
                      { value: 'EDIT', label: 'Full access' },
                    ]}
                  />
                </div>
              ))}
            </div>
          )}
        </Modal>

        <Modal
          open={inviteModalOpen}
          onClose={() => { setInviteModalOpen(false); setInviteError(''); }}
          title="Invite a staff member"
          description="They'll get an email with a link to set their own password and join this store."
          footer={
            <>
              <Button variant="secondary" onClick={() => setInviteModalOpen(false)} disabled={inviting}>Cancel</Button>
              <Button onClick={handleInviteStaff} loading={inviting}>Send Invite</Button>
            </>
          }
        >
          <div className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              placeholder="teammate@example.com"
              autoFocus
            />
            <Input
              label="Name (optional)"
              value={inviteName}
              onChange={e => setInviteName(e.target.value)}
              placeholder="Their name"
            />
            {inviteError && <p className="text-sm text-red-600">{inviteError}</p>}
          </div>
        </Modal>

        {/* ── Section 4: Storefront customization (clothing) ───────── */}
        {(store.businessType === 'clothing' || store.theme?.startsWith('clothing-')) && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-violet-100 rounded-lg">
                  <Palette size={16} className="text-violet-600" />
                </div>
                <CardTitle>Storefront appearance</CardTitle>
              </div>
              <CardDescription>
                Edit hero text, images, testimonials, newsletter copy, and every section on your clothing template.
              </CardDescription>
            </CardHeader>
            <a href={dashboardPath(dashboardSlug, 'customize-storefront')}>
              <Button className="w-full">Customize template content</Button>
            </a>
          </Card>
        )}

        {/* ── Section 5: Appearance (other types) ───────────────────── */}
        {store.businessType !== 'clothing' && !store.theme?.startsWith('clothing-') && (
        <Card className="opacity-60 pointer-events-none select-none">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-slate-100 rounded-lg">
                <Palette size={16} className="text-slate-400" />
              </div>
              <CardTitle className="text-slate-400">Appearance</CardTitle>
            </div>
            <Badge variant="default">Coming Soon</Badge>
          </CardHeader>
          <CardDescription>
            Theme customization, brand colours, and logo uploads are coming soon. Stay tuned for updates.
          </CardDescription>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {['Default', 'Modern', 'Classic'].map(theme => (
              <div
                key={theme}
                className="h-16 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-end p-2"
              >
                <span className="text-xs text-slate-400 font-medium">{theme}</span>
              </div>
            ))}
          </div>
        </Card>
        )}

        </div>
      </main>
    </>
  );
}

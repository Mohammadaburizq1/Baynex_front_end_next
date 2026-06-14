'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, MapPin, Clock, ShoppingBag, Truck } from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input, Select, Toggle } from '@/components/ui/Input';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { mockDeliveryZones } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';
import type { DeliveryZone } from '@/lib/types';

const DEFAULT_ZONE: Omit<DeliveryZone, 'id'> = {
  name: '',
  areas: [],
  minOrder: 0,
  deliveryFee: 0,
  estimatedTime: '30-45 min',
  isActive: true,
};

export default function DeliveryPage() {
  const { success, error } = useToast();
  const [zones, setZones] = useState<DeliveryZone[]>(mockDeliveryZones);

  // General settings
  const [freeThreshold, setFreeThreshold] = useState('0');
  const [defaultTime, setDefaultTime] = useState('30-45 min');
  const [pickupAvailable, setPickupAvailable] = useState(true);

  // Zone modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);
  const [formData, setFormData] = useState<Omit<DeliveryZone, 'id'>>(DEFAULT_ZONE);
  const [areasText, setAreasText] = useState('');
  const [formErrors, setFormErrors] = useState<{ name?: string }>({});

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<DeliveryZone | null>(null);
  const [deleting, setDeleting] = useState(false);

  function openAddModal() {
    setEditingZone(null);
    setFormData(DEFAULT_ZONE);
    setAreasText('');
    setFormErrors({});
    setModalOpen(true);
  }

  function openEditModal(zone: DeliveryZone) {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      areas: zone.areas,
      minOrder: zone.minOrder,
      deliveryFee: zone.deliveryFee,
      estimatedTime: zone.estimatedTime,
      isActive: zone.isActive,
    });
    setAreasText(zone.areas.join(', '));
    setFormErrors({});
    setModalOpen(true);
  }

  function handleSaveZone() {
    const errors: { name?: string } = {};
    if (!formData.name.trim()) errors.name = 'Zone name is required';
    if (Object.keys(errors).length) { setFormErrors(errors); return; }

    const parsedAreas = areasText
      .split(',')
      .map(a => a.trim())
      .filter(Boolean);

    if (editingZone) {
      setZones(prev =>
        prev.map(z =>
          z.id === editingZone.id
            ? { ...editingZone, ...formData, areas: parsedAreas }
            : z,
        ),
      );
      success('Zone updated successfully');
    } else {
      const newZone: DeliveryZone = {
        id: `zone-${Date.now()}`,
        ...formData,
        areas: parsedAreas,
      };
      setZones(prev => [...prev, newZone]);
      success('Zone added successfully');
    }
    setModalOpen(false);
  }

  function handleToggleZone(id: string, active: boolean) {
    setZones(prev => prev.map(z => (z.id === id ? { ...z, isActive: active } : z)));
  }

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    setTimeout(() => {
      setZones(prev => prev.filter(z => z.id !== deleteTarget.id));
      setDeleteTarget(null);
      setDeleting(false);
      success('Zone deleted');
    }, 400);
  }

  function handleSaveSettings() {
    success('Settings saved successfully');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header title="Delivery" subtitle="Configure delivery zones and fees" />

      <div className="p-5 lg:p-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Left: Delivery Zones (2/3) ─────────────────────────────── */}
          <div className="flex-1 lg:w-0 min-w-0">
            <Card padding="none">
              <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Delivery Zones</h2>
                  <p className="text-sm text-slate-500 mt-0.5">{zones.length} zone{zones.length !== 1 ? 's' : ''} configured</p>
                </div>
                <Button
                  size="sm"
                  icon={<Plus size={15} />}
                  onClick={openAddModal}
                  aria-label="Add delivery zone"
                >
                  Add Zone
                </Button>
              </div>

              {zones.length === 0 ? (
                <EmptyState
                  icon={<Truck size={32} />}
                  title="No delivery zones"
                  description="Add a delivery zone to start accepting orders."
                  action={{ label: 'Add Zone', onClick: openAddModal }}
                />
              ) : (
                <ul className="divide-y divide-surface-200">
                  {zones.map(zone => {
                    const visibleAreas = zone.areas.slice(0, 3);
                    const extraCount = zone.areas.length - 3;
                    return (
                      <li key={zone.id} className="px-5 py-4 hover:bg-slate-50/60 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          {/* Name + toggle */}
                          <div className="flex items-center gap-3 min-w-0">
                            <Toggle
                              checked={zone.isActive}
                              onChange={active => handleToggleZone(zone.id, active)}
                              aria-label={`Toggle ${zone.name}`}
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900 truncate">{zone.name}</p>
                              <div className="flex flex-wrap items-center gap-1 mt-1">
                                {visibleAreas.map(area => (
                                  <Badge key={area} variant="default" className="text-xs">
                                    {area}
                                  </Badge>
                                ))}
                                {extraCount > 0 && (
                                  <Badge variant="primary" className="text-xs">+{extraCount} more</Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => openEditModal(zone)}
                              aria-label={`Edit ${zone.name}`}
                              className="h-8 w-8 flex items-center justify-center rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(zone)}
                              aria-label={`Delete ${zone.name}`}
                              className="h-8 w-8 flex items-center justify-center rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        {/* Info grid */}
                        <div className="grid grid-cols-3 gap-3 mt-3">
                          <div className="flex items-center gap-1.5">
                            <ShoppingBag size={13} className="text-slate-400 shrink-0" />
                            <div>
                              <p className="text-[10px] text-slate-400 leading-none mb-0.5">Min Order</p>
                              <p className="text-xs font-medium text-slate-700">{formatCurrency(zone.minOrder)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Truck size={13} className="text-slate-400 shrink-0" />
                            <div>
                              <p className="text-[10px] text-slate-400 leading-none mb-0.5">Delivery Fee</p>
                              <p className="text-xs font-medium text-slate-700">{formatCurrency(zone.deliveryFee)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock size={13} className="text-slate-400 shrink-0" />
                            <div>
                              <p className="text-[10px] text-slate-400 leading-none mb-0.5">Est. Time</p>
                              <p className="text-xs font-medium text-slate-700">{zone.estimatedTime}</p>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </div>

          {/* ── Right: General Settings (1/3) ──────────────────────────── */}
          <div className="lg:w-80 shrink-0">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <div className="space-y-5">
                <Input
                  label="Free Delivery Threshold"
                  type="number"
                  min="0"
                  step="0.01"
                  value={freeThreshold}
                  onChange={e => setFreeThreshold(e.target.value)}
                  hint="0 = disabled"
                  prefix={<span className="text-xs font-medium">RM</span>}
                />
                <Input
                  label="Default Estimated Time"
                  value={defaultTime}
                  onChange={e => setDefaultTime(e.target.value)}
                  placeholder="e.g. 30-45 min"
                />
                <div className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Pickup Available</p>
                    <p className="text-xs text-slate-500">Allow customers to collect orders</p>
                  </div>
                  <Toggle checked={pickupAvailable} onChange={setPickupAvailable} />
                </div>
                <Button fullWidth onClick={handleSaveSettings}>
                  Save Settings
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* ── Add / Edit Zone Modal ─────────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingZone ? 'Edit Zone' : 'Add Delivery Zone'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveZone}>
              {editingZone ? 'Save Changes' : 'Add Zone'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Zone Name"
            required
            value={formData.name}
            onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
            error={formErrors.name}
            placeholder="e.g. Zone A — City Centre"
          />
          <Input
            label="Areas"
            value={areasText}
            onChange={e => setAreasText(e.target.value)}
            hint="Comma separated, e.g. KLCC, Bangsar"
            placeholder="KLCC, Bangsar, Mont Kiara"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Min Order Amount (RM)"
              type="number"
              min="0"
              step="0.01"
              value={formData.minOrder}
              onChange={e => setFormData(p => ({ ...p, minOrder: parseFloat(e.target.value) || 0 }))}
            />
            <Input
              label="Delivery Fee (RM)"
              type="number"
              min="0"
              step="0.01"
              value={formData.deliveryFee}
              onChange={e => setFormData(p => ({ ...p, deliveryFee: parseFloat(e.target.value) || 0 }))}
            />
          </div>
          <Input
            label="Estimated Time"
            value={formData.estimatedTime}
            onChange={e => setFormData(p => ({ ...p, estimatedTime: e.target.value }))}
            placeholder="e.g. 30-45 min"
          />
          <div className="flex items-center justify-between py-1 border-t border-surface-200 pt-4">
            <div>
              <p className="text-sm font-medium text-slate-700">Active</p>
              <p className="text-xs text-slate-500">Enable this zone for orders</p>
            </div>
            <Toggle
              checked={formData.isActive}
              onChange={val => setFormData(p => ({ ...p, isActive: val }))}
            />
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirm ────────────────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Zone"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}

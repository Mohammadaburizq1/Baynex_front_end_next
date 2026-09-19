'use client';

import { useState, useMemo, useEffect } from 'react';
import { Plus, Trash2, CalendarDays, Check, X as XIcon } from 'lucide-react';
import { Header } from '@/components/dashboard/Header';
import { SectionAccessGate } from '@/components/dashboard/SectionAccessGate';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { useStore } from '@/contexts/StoreContext';
import { formatDateTime, formatRelativeTime } from '@/lib/utils';
import {
  getAppointmentSlots, createAppointmentSlot, deleteAppointmentSlot,
  getAppointments, updateAppointmentStatus,
  type ApiAppointmentSlot, type ApiAppointment, type AppointmentStatus,
} from '@/lib/api/appointments';

const STATUS_META: Record<AppointmentStatus, { label: string; colorClass: string }> = {
  CONFIRMED: { label: 'Confirmed', colorClass: 'bg-sky-100 text-sky-700' },
  CANCELLED: { label: 'Cancelled', colorClass: 'bg-red-100 text-red-600' },
  COMPLETED: { label: 'Completed', colorClass: 'bg-emerald-100 text-emerald-700' },
};

interface SlotForm {
  date: string;
  startTime: string;
  endTime: string;
  capacity: string;
}

const EMPTY_SLOT_FORM: SlotForm = { date: '', startTime: '', endTime: '', capacity: '1' };

function toStartsEndsAt(form: SlotForm): { startsAt: string; endsAt: string } {
  return {
    startsAt: new Date(`${form.date}T${form.startTime}`).toISOString(),
    endsAt: new Date(`${form.date}T${form.endTime}`).toISOString(),
  };
}

export default function AppointmentsPage() {
  const { store, permissions } = useStore();
  const { success, error: toastError } = useToast();
  const canEdit = permissions.APPOINTMENTS === 'EDIT';

  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [slots, setSlots] = useState<ApiAppointmentSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      const realStoreId = store.id.startsWith('local-') ? undefined : store.id;
      try {
        const [appts, slotList] = await Promise.all([
          getAppointments(realStoreId),
          getAppointmentSlots(realStoreId),
        ]);
        setAppointments(appts);
        setSlots(slotList);
      } catch {
        toastError('Failed to load appointments.');
      }
      setLoading(false);
    }
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.id]);

  // ── Slot modal ───────────────────────────────────────────────────────────────
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [slotForm, setSlotForm] = useState<SlotForm>(EMPTY_SLOT_FORM);
  const [slotFormError, setSlotFormError] = useState('');
  const [savingSlot, setSavingSlot] = useState(false);
  const [deleteSlotTarget, setDeleteSlotTarget] = useState<ApiAppointmentSlot | null>(null);
  const [deletingSlot, setDeletingSlot] = useState(false);

  function openAddSlot() {
    setSlotForm(EMPTY_SLOT_FORM);
    setSlotFormError('');
    setSlotModalOpen(true);
  }

  async function handleSaveSlot() {
    if (!slotForm.date || !slotForm.startTime || !slotForm.endTime) {
      setSlotFormError('Date, start time, and end time are required.');
      return;
    }
    const { startsAt, endsAt } = toStartsEndsAt(slotForm);
    if (new Date(endsAt) <= new Date(startsAt)) {
      setSlotFormError('End time must be after start time.');
      return;
    }
    setSavingSlot(true);
    setSlotFormError('');
    try {
      const created = await createAppointmentSlot(store.id, {
        startsAt, endsAt,
        capacity: Number(slotForm.capacity) || 1,
      });
      setSlots(prev => [...prev, created].sort((a, b) => a.startsAt.localeCompare(b.startsAt)));
      success('Availability slot added.');
      setSlotModalOpen(false);
    } catch (e) {
      setSlotFormError(e instanceof Error ? e.message : 'Failed to save slot.');
    }
    setSavingSlot(false);
  }

  async function handleDeleteSlot() {
    if (!deleteSlotTarget) return;
    setDeletingSlot(true);
    try {
      await deleteAppointmentSlot(deleteSlotTarget.id);
      setSlots(prev => prev.filter(s => s.id !== deleteSlotTarget.id));
      success('Slot deleted.');
      setDeleteSlotTarget(null);
    } catch (e) {
      toastError(e instanceof Error ? e.message : 'Failed to delete slot.');
    }
    setDeletingSlot(false);
  }

  // ── Appointment status actions ──────────────────────────────────────────────
  const [busyAppointmentId, setBusyAppointmentId] = useState<string | null>(null);

  async function handleStatusChange(id: string, status: AppointmentStatus) {
    setBusyAppointmentId(id);
    try {
      const updated = await updateAppointmentStatus(id, status);
      setAppointments(prev => prev.map(a => a.id === id ? updated : a));
      // Cancelling frees the slot back up server-side — reflect that locally too.
      if (status === 'CANCELLED') {
        setSlots(prev => prev.map(s => s.id === updated.slotId ? { ...s, bookedCount: Math.max(0, s.bookedCount - 1) } : s));
      }
    } catch (e) {
      toastError(e instanceof Error ? e.message : 'Could not update appointment.');
    }
    setBusyAppointmentId(null);
  }

  const upcomingSlots = useMemo(
    () => slots.filter(s => new Date(s.startsAt) >= new Date()),
    [slots],
  );

  return (
    <SectionAccessGate section="APPOINTMENTS" pageTitle="Appointments">
      <Header title="Appointments" subtitle="Manage bookings and available time slots" />

      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Left: Appointments ─────────────────────────────────────────── */}
          <div className="flex-1 lg:w-0 min-w-0">
            <Card padding="none">
              <div className="px-5 py-4 border-b border-surface-200">
                <h2 className="text-base font-semibold text-slate-900">Bookings</h2>
                <p className="text-sm text-slate-500 mt-0.5">{appointments.length} total</p>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
                </div>
              ) : appointments.length === 0 ? (
                <EmptyState
                  icon={<CalendarDays size={28} />}
                  title="No appointments yet"
                  description="Bookings customers make from your storefront will show up here."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-surface-200 text-left text-xs text-slate-500 uppercase tracking-wide">
                        <th className="px-4 py-3 font-medium">Customer</th>
                        <th className="px-4 py-3 font-medium">Time</th>
                        <th className="px-4 py-3 font-medium">For</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        {canEdit && <th className="px-4 py-3 font-medium text-right">Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.map(a => {
                        const meta = STATUS_META[a.status];
                        const busy = busyAppointmentId === a.id;
                        return (
                          <tr key={a.id} className="border-b border-surface-100 last:border-0">
                            <td className="px-4 py-3">
                              <p className="font-medium text-slate-900">{a.customerName}</p>
                              <p className="text-xs text-slate-500">{a.customerPhone}</p>
                            </td>
                            <td className="px-4 py-3 text-slate-700">
                              {formatDateTime(a.slotStartsAt)}
                            </td>
                            <td className="px-4 py-3 text-slate-500">{a.productName ?? '—'}</td>
                            <td className="px-4 py-3">
                              <StatusBadge colorClass={meta.colorClass} label={meta.label} />
                            </td>
                            {canEdit && (
                              <td className="px-4 py-3">
                                {a.status === 'CONFIRMED' && (
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => handleStatusChange(a.id, 'COMPLETED')}
                                      disabled={busy}
                                      aria-label={`Mark appointment with ${a.customerName} completed`}
                                      className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50 transition-colors duration-150 cursor-pointer disabled:opacity-50"
                                    >
                                      <Check size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleStatusChange(a.id, 'CANCELLED')}
                                      disabled={busy}
                                      aria-label={`Cancel appointment with ${a.customerName}`}
                                      className="p-1.5 rounded-md text-red-500 hover:bg-red-50 transition-colors duration-150 cursor-pointer disabled:opacity-50"
                                    >
                                      <XIcon size={14} />
                                    </button>
                                  </div>
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>

          {/* ── Right: Availability ─────────────────────────────────────────── */}
          <div className="lg:w-96 shrink-0">
            <Card padding="none">
              <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">Availability</h2>
                  <p className="text-sm text-slate-500 mt-0.5">{upcomingSlots.length} upcoming</p>
                </div>
                {canEdit && (
                  <Button size="sm" icon={<Plus size={15} />} onClick={openAddSlot} aria-label="Add slot">
                    Add Slot
                  </Button>
                )}
              </div>

              {loading ? (
                <div className="px-5 py-10 text-center text-sm text-slate-400">Loading…</div>
              ) : upcomingSlots.length === 0 ? (
                <EmptyState
                  icon={<CalendarDays size={28} />}
                  title="No upcoming slots"
                  description="Add a time slot so customers can book it from your storefront."
                  action={canEdit ? { label: 'Add Slot', onClick: openAddSlot } : undefined}
                />
              ) : (
                <ul className="divide-y divide-surface-200">
                  {upcomingSlots.map(slot => (
                    <li key={slot.id} className="px-5 py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900">{formatDateTime(slot.startsAt)}</p>
                        <p className="text-xs text-slate-500">
                          {slot.bookedCount}/{slot.capacity} booked · {formatRelativeTime(slot.startsAt)}
                        </p>
                      </div>
                      {canEdit && (
                        <button
                          onClick={() => setDeleteSlotTarget(slot)}
                          aria-label={`Delete slot on ${formatDateTime(slot.startsAt)}`}
                          className="h-8 w-8 shrink-0 flex items-center justify-center rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      </main>

      {/* ── Add Slot Modal ────────────────────────────────────────────────────── */}
      <Modal
        open={slotModalOpen}
        onClose={() => setSlotModalOpen(false)}
        title="Add Availability Slot"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setSlotModalOpen(false)} disabled={savingSlot}>
              Cancel
            </Button>
            <Button variant="primary" loading={savingSlot} onClick={handleSaveSlot}>
              Add Slot
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {slotFormError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-btn px-3 py-2">
              {slotFormError}
            </p>
          )}
          <Input
            label="Date"
            type="date"
            required
            value={slotForm.date}
            onChange={e => setSlotForm(p => ({ ...p, date: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start time"
              type="time"
              required
              value={slotForm.startTime}
              onChange={e => setSlotForm(p => ({ ...p, startTime: e.target.value }))}
            />
            <Input
              label="End time"
              type="time"
              required
              value={slotForm.endTime}
              onChange={e => setSlotForm(p => ({ ...p, endTime: e.target.value }))}
            />
          </div>
          <Input
            label="Capacity"
            type="number"
            min="1"
            step="1"
            value={slotForm.capacity}
            onChange={e => setSlotForm(p => ({ ...p, capacity: e.target.value }))}
            hint="How many customers can book this same slot"
          />
        </div>
      </Modal>

      {/* ── Delete Slot Confirm ───────────────────────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteSlotTarget}
        onClose={() => setDeleteSlotTarget(null)}
        onConfirm={handleDeleteSlot}
        title="Delete Slot"
        description={
          deleteSlotTarget
            ? `Are you sure you want to delete the slot on ${formatDateTime(deleteSlotTarget.startsAt)}?`
            : ''
        }
        confirmLabel="Delete"
        variant="danger"
        loading={deletingSlot}
      />
    </SectionAccessGate>
  );
}

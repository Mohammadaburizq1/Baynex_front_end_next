import { apiRequest } from './client';
import type { PosConflict } from './pos-sync';

// POS-24 till shifts (backend DashboardPosShiftController / PosShiftService). Tenant scoping and the
// ORDERS / POS permission checks happen on the backend; nothing here is trusted by it.
//
// Money arrives as JSON numbers from BigDecimal at scale 3 (JOD). Display only: this page never
// computes a financial figure itself — every total comes from the server.

export type PosShiftStatus = 'OPEN' | 'CLOSED' | 'CLOSED_WITH_VARIANCE' | 'FORCE_CLOSED';

// OPEN, NOT_COUNTED (force-closed), MATCHED / MISMATCH (the till's expected cash vs the server's, now).
export type PosShiftReconciliation = 'OPEN' | 'NOT_COUNTED' | 'MATCHED' | 'MISMATCH';

export interface PosShiftTotals {
  openingCash: number;
  cashSales: number;
  terminalSales: number;
  cashRefunds: number;
  terminalRefunds: number;
  cashIn: number;
  cashOut: number;
  expectedCash: number;
  orderCount: number;
  returnCount: number;
}

// Mirrors PosDtos.ShiftSummary. `totals` and `variance` are live (every synced record now);
// `expectedCashAtClose` / `varianceAtClose` are the server's figures when the close arrived;
// `deviceExpectedCash` / `deviceVariance` are what the till showed the cashier.
export interface PosShift {
  id: string;
  shiftNumber: string;
  deviceId: string | null;
  deviceName: string | null;
  cashierId: string | null;
  cashierName: string;
  currency: string;
  status: PosShiftStatus;
  openedAt: string;
  closedAt: string | null;
  totals: PosShiftTotals;
  countedCash: number | null;
  expectedCashAtClose: number | null;
  varianceAtClose: number | null;
  deviceExpectedCash: number | null;
  deviceVariance: number | null;
  variance: number | null;
  reconciliation: PosShiftReconciliation;
  lateRecords: boolean;
  longOpen: boolean;
  closedByName: string | null;
  closingManagerName: string | null;
  closeNote: string | null;
  forceClosedByName: string | null;
  forceCloseNote: string | null;
}

export interface PosShiftDetail {
  shift: PosShift;
  orders: { orderId: string; orderCode: string; receiptNumber: string | null; paymentMethod: 'CASH' | 'EXTERNAL_CARD'; total: number;
    exchangeCredit: number | null; drawerAmount: number; staffName: string | null; soldAt: string }[];
  returns: { returnId: string; returnNumber: string; kind: 'RETURN' | 'EXCHANGE'; originalOrderCode: string | null;
    refundMethod: 'CASH' | 'EXTERNAL_TERMINAL' | null; refundPaidOut: number; exchangeCredit: number; staffName: string | null; returnedAt: string }[];
  movements: { id: string; type: 'CASH_IN' | 'CASH_OUT'; reason: string; note: string | null; amount: number; staffName: string;
    managerName: string | null; movedAt: string }[];
  approvals: { action: string; managerName: string; actingStaffName: string | null; detail: string | null; verified: boolean; approvedAt: string }[];
  conflicts: PosConflict[];
}

export type PosShiftFilter = 'ALL' | 'OPEN' | 'CLOSED' | 'VARIANCE';

export interface PosShiftQuery {
  status?: PosShiftFilter;
  cashierId?: string;
  deviceId?: string;
  from?: string; // yyyy-mm-dd, store time zone
  to?: string;
}

export async function listPosShifts(storeId: string, q: PosShiftQuery = {}): Promise<PosShift[]> {
  const params = new URLSearchParams({ storeId });
  if (q.status && q.status !== 'ALL') params.set('status', q.status);
  if (q.cashierId) params.set('cashierId', q.cashierId);
  if (q.deviceId) params.set('deviceId', q.deviceId);
  if (q.from) params.set('from', q.from);
  if (q.to) params.set('to', q.to);
  return apiRequest<PosShift[]>(`/api/dashboard/pos-shifts?${params.toString()}`);
}

export async function getPosShift(id: string): Promise<PosShiftDetail> {
  return apiRequest<PosShiftDetail>(`/api/dashboard/pos-shifts/${encodeURIComponent(id)}`);
}

export async function forceClosePosShift(id: string, note: string): Promise<PosShiftDetail> {
  return apiRequest<PosShiftDetail>(`/api/dashboard/pos-shifts/${encodeURIComponent(id)}/force-close`, {
    method: 'POST',
    body: JSON.stringify({ note: note.trim() }),
  });
}

export const SHIFT_STATUS_LABEL: Record<PosShiftStatus, string> = {
  OPEN: 'Open',
  CLOSED: 'Closed',
  CLOSED_WITH_VARIANCE: 'Closed with variance',
  FORCE_CLOSED: 'Force-closed',
};

export const MOVEMENT_REASON_LABEL: Record<string, string> = {
  CHANGE_FLOAT: 'Change float',
  MANAGER_ADJUSTMENT: 'Manager adjustment',
  BANK_DEPOSIT: 'Bank deposit',
  PETTY_CASH: 'Petty cash',
  SAFE_DROP: 'Safe drop',
  OTHER: 'Other',
};

// JOD and the other POS currencies so far have 3 decimals; Intl knows each currency's own digits.
export function shiftMoney(value: number | null | undefined, currency: string): string {
  if (value === null || value === undefined) return '—';
  const digits = new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2;
  return `${currency} ${Math.abs(value).toLocaleString('en', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}

// The sign is always shown: "−1.500", "+2.000", "0.000".
export function signedShiftMoney(value: number | null | undefined, currency: string): string {
  if (value === null || value === undefined) return '—';
  const text = shiftMoney(value, currency);
  if (value === 0) return text;
  return value < 0 ? `−${text}` : `+${text}`;
}

import { apiRequest } from './client';

export interface ApiOrderItem {
  id?: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// UI-facing shape consumed by the dashboard Orders page (apiToOrder). `status` keeps the local
// 8-value vocabulary (including 'out_for_delivery'/'refunded') even though the real backend can
// only ever produce 6 of them — see STATUS_FROM_BACKEND/STATUS_TO_BACKEND below.
export interface ApiOrder {
  id: string;
  orderNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  items: ApiOrderItem[];
  subtotal: number;
  deliveryFee?: number;
  discount?: number;
  tax?: number;
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus?: string;
  paymentMethod?: string;
  fulfillmentType?: string;
  deliveryAddress?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

// Actual shape of com.byonix.shoplink.api.dto.OrderDtos.OrderResponse/OrderItemResponse.
// No orderNumber (it's orderCode), no per-item productName/totalPrice (productNameSnapshot/
// total), no tax, no customerId, no paymentStatus — the backend tracks a payment *method*
// chosen at checkout, not a payment status.
type BackendOrderStatus = 'NEW' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';

interface ApiOrderItemRaw {
  id: string;
  productId: string;
  productNameSnapshot: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface ApiOrderRaw {
  id: string;
  storeId: string;
  orderCode: string;
  customerName: string;
  customerEmail?: string | null;
  customerPhone: string;
  customerAddress?: string | null;
  deliveryMethod: 'DELIVERY' | 'PICKUP';
  paymentMethod: 'CASH' | 'CARD' | 'WHATSAPP_ONLY';
  status: BackendOrderStatus;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  notes?: string | null;
  createdAt: string;
  items: ApiOrderItemRaw[];
}

// The backend's order lifecycle is NEW -> CONFIRMED -> PREPARING -> READY -> DELIVERED (or
// CANCELLED from any state). The dashboard UI's status vocabulary additionally has
// 'out_for_delivery' (between ready and delivered) and 'refunded', neither of which the
// backend can ever produce or accept — see updateOrderStatus.
const STATUS_FROM_BACKEND: Record<BackendOrderStatus, ApiOrder['status']> = {
  NEW: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

const STATUS_TO_BACKEND: Partial<Record<ApiOrder['status'], BackendOrderStatus>> = {
  pending: 'NEW',
  confirmed: 'CONFIRMED',
  preparing: 'PREPARING',
  ready: 'READY',
  delivered: 'DELIVERED',
  cancelled: 'CANCELLED',
};

function mapOrder(raw: ApiOrderRaw): ApiOrder {
  return {
    id: raw.id,
    orderNumber: raw.orderCode,
    customerName: raw.customerName,
    customerPhone: raw.customerPhone,
    customerEmail: raw.customerEmail ?? undefined,
    items: raw.items.map(item => ({
      id: item.id,
      productId: item.productId,
      productName: item.productNameSnapshot,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.total,
    })),
    subtotal: raw.subtotal,
    deliveryFee: raw.deliveryFee,
    discount: raw.discount,
    total: raw.total,
    status: STATUS_FROM_BACKEND[raw.status],
    // 'WHATSAPP_ONLY' has no equivalent in the local cash/card/online/wallet vocabulary —
    // falls back to 'cash' (closest: no separate payment processor is involved either way).
    paymentMethod: raw.paymentMethod === 'CARD' ? 'card' : 'cash',
    fulfillmentType: raw.deliveryMethod === 'PICKUP' ? 'pickup' : 'delivery',
    deliveryAddress: raw.customerAddress ?? undefined,
    notes: raw.notes ?? undefined,
    createdAt: raw.createdAt,
    // Not sent by the backend at all: tax, customerId, paymentStatus. Left undefined —
    // callers already fall back sensibly (see orders/page.tsx's apiToOrder).
  };
}

export async function getOrders(): Promise<ApiOrder[]> {
  const raw = await apiRequest<ApiOrderRaw[]>('/api/dashboard/orders');
  return raw.map(mapOrder);
}

export async function getOrder(id: string): Promise<ApiOrder> {
  return mapOrder(await apiRequest<ApiOrderRaw>(`/api/dashboard/orders/${id}`));
}

export async function updateOrderStatus(id: string, status: ApiOrder['status']): Promise<ApiOrder> {
  const backendStatus = STATUS_TO_BACKEND[status];
  if (!backendStatus) {
    // 'out_for_delivery' / 'refunded': the backend's OrderStatus enum has no matching value,
    // so sending it would just 400. Fail fast client-side instead — callers (orders/page.tsx)
    // already catch and revert the optimistic UI update on any rejection.
    throw new Error(`Order status "${status}" is not supported by the backend.`);
  }
  const raw = await apiRequest<ApiOrderRaw>(`/api/dashboard/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status: backendStatus }),
  });
  return mapOrder(raw);
}

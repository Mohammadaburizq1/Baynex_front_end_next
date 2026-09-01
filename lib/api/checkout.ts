// Customer-authenticated order placement, built on customerApiRequest (handles
// Bearer auth + 401 refresh-and-retry for the customer session automatically).
//
// Reference implementation for wiring real checkout into a storefront template —
// see restaurant-default/RestaurantDefaultPage.tsx and street-food/StreetFoodPopTemplate.tsx.

import { customerApiRequest } from './customer-client';

export type DeliveryMethod = 'DELIVERY' | 'PICKUP';
export type PaymentMethod = 'CASH' | 'CARD' | 'WHATSAPP_ONLY';

export interface CreateOrderItemPayload {
  productId: string;
  quantity: number;
}

export interface CreateOrderPayload {
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  customerAddress?: string;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  deliveryFee: number;
  discountCode?: string;
  notes?: string;
  items: CreateOrderItemPayload[];
}

export interface OrderItemResponse {
  id: string;
  productId: string;
  productNameSnapshot: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface OrderResponse {
  id: string;
  storeId: string;
  orderCode: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  customerAddress: string | null;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  status: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  discountCode: string | null;
  total: number;
  notes: string | null;
  createdAt: string;
  items: OrderItemResponse[];
}

export async function createOrder(slug: string, payload: CreateOrderPayload): Promise<OrderResponse> {
  return customerApiRequest<OrderResponse>(`/api/public/stores/${slug}/orders`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

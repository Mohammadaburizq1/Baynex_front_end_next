// Shared guest/authenticated order placement. An available customer token is
// attached automatically; without one the same endpoint accepts a guest order.
//
// Reference implementation for wiring real checkout into a storefront template —
// see restaurant-default/RestaurantDefaultPage.tsx and street-food/StreetFoodPopTemplate.tsx.

import { customerApiRequest } from './customer-client';

export type DeliveryMethod = 'DELIVERY' | 'PICKUP';
export type PaymentMethod = 'CASH' | 'CARD' | 'WHATSAPP_ONLY';

export interface CreateOrderItemPayload {
  productId: string;
  quantity: number;
  /** Required for a product that has variants. */
  variantId?: string;
  /** The add-ons chosen for this line. */
  modifierOptionIds?: string[];
}

export interface CreateOrderPayload {
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  customerAddress?: string;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  deliveryFee: number;
  deliveryZoneId?: string;
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
  variantId?: string | null;
  variantLabel?: string | null;
  sku?: string | null;
  modifiers?: { groupName: string; optionName: string; priceDelta: number }[];
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
  currency?: string;
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

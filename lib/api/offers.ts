import { apiRequest } from './client';
import { customerApiRequest } from './customer-client';

export type DiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

// Mirrors com.byonix.shoplink.api.dto.OfferDtos.OfferResponse field-for-field — no UI-facing
// renaming needed here, unlike products/orders, since the backend shape is already what a
// dashboard table wants to show directly.
export interface ApiOffer {
  id: string;
  storeId: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number | null;
  maxUses: number | null;
  timesUsed: number;
  startsAt: string | null;
  expiresAt: string | null;
  active: boolean;
}

export interface OfferFormData {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount?: number | null;
  maxUses?: number | null;
  startsAt?: string | null;
  expiresAt?: string | null;
  active?: boolean;
}

function toOfferRequest(storeId: string, data: OfferFormData) {
  return {
    storeId,
    code: data.code.trim().toUpperCase(),
    discountType: data.discountType,
    discountValue: data.discountValue,
    minOrderAmount: data.minOrderAmount || undefined,
    maxUses: data.maxUses || undefined,
    startsAt: data.startsAt || undefined,
    expiresAt: data.expiresAt || undefined,
    active: data.active ?? true,
  };
}

export async function getOffers(storeId?: string): Promise<ApiOffer[]> {
  const query = storeId ? `?storeId=${encodeURIComponent(storeId)}` : '';
  return apiRequest<ApiOffer[]>(`/api/dashboard/offers${query}`);
}

export async function createOffer(storeId: string, data: OfferFormData): Promise<ApiOffer> {
  return apiRequest<ApiOffer>('/api/dashboard/offers', {
    method: 'POST',
    body: JSON.stringify(toOfferRequest(storeId, data)),
  });
}

export async function updateOffer(id: string, storeId: string, data: OfferFormData): Promise<ApiOffer> {
  return apiRequest<ApiOffer>(`/api/dashboard/offers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(toOfferRequest(storeId, data)),
  });
}

export async function deleteOffer(id: string): Promise<void> {
  return apiRequest(`/api/dashboard/offers/${id}`, { method: 'DELETE' });
}

export interface DiscountValidationResult {
  offerId: string;
  code: string;
  amount: number;
}

// Storefront-facing — no auth required on the backend (public endpoint), but routed through
// customerApiRequest for consistency with the rest of checkout.ts, which already uses it for the
// real createOrder call right after this. Throws (via customerApiRequest's !res.ok handling) with
// the backend's specific rejection message (bad code / expired / below minimum / exhausted) —
// callers should catch and show it inline rather than letting it bubble as a generic error.
export async function validateOfferCode(slug: string, code: string, subtotal: number): Promise<DiscountValidationResult> {
  return customerApiRequest<DiscountValidationResult>(`/api/public/stores/${slug}/offers/validate`, {
    method: 'POST',
    body: JSON.stringify({ code, subtotal }),
  });
}

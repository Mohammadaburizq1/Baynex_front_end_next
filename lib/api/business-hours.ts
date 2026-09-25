import { apiRequest } from './client';
import { customerApiRequest } from './customer-client';

export interface BusinessHoursDay {
  dayOfWeek: string;
  closed: boolean;
  open24Hours: boolean;
  openTime: string | null;
  closeTime: string | null;
}

export interface BusinessHoursResponse {
  status: 'OPEN' | 'CLOSED' | 'NOT_CONFIGURED';
  configured: boolean;
  timezone: string;
  currentDay: string;
  closesAt: string | null;
  opensAt: string | null;
  days: BusinessHoursDay[];
  acceptingOrders: boolean;
  canAcceptOrders: boolean;
}

export function getPublicBusinessHours(slug: string): Promise<BusinessHoursResponse> {
  return customerApiRequest<BusinessHoursResponse>(`/api/public/stores/${encodeURIComponent(slug)}/business-hours`);
}

export interface BusinessHoursPayload {
  days: BusinessHoursDay[];
}

export function getBusinessHours(storeId: string): Promise<BusinessHoursResponse> {
  return apiRequest<BusinessHoursResponse>(`/api/dashboard/stores/${storeId}/business-hours`);
}

export function updateBusinessHours(storeId: string, payload: BusinessHoursPayload): Promise<BusinessHoursResponse> {
  return apiRequest<BusinessHoursResponse>(`/api/dashboard/stores/${storeId}/business-hours`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

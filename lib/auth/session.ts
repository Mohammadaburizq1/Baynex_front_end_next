import { logout as apiLogout } from '@/lib/api/auth';

export async function signOut(): Promise<void> {
  await apiLogout();
}

export function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(
    localStorage.getItem('sl_access_token')
    || localStorage.getItem('authToken')
  );
}

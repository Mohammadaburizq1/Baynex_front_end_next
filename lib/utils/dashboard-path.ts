export function dashboardPath(slug: string, section?: string): string {
  const base = `/dashboard/${encodeURIComponent(slug)}`;
  if (!section) return base;
  return `${base}/${section}`;
}

export function resolveDashboardSlug(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('shoplink_store');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { slug?: string };
    return parsed.slug ?? null;
  } catch {
    return null;
  }
}

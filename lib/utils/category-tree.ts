import type { ApiCategory } from '@/lib/api/categories';

export interface CategoryRow {
  category: ApiCategory;
  depth: number;
}

function bySortThenName(a: ApiCategory, b: ApiCategory): number {
  return a.sortOrder - b.sortOrder || a.name.localeCompare(b.name);
}

/**
 * Depth-first flattening of a parent/child category list into display order (each parent followed
 * by its children). A category whose parent isn't in the list is shown at the top level rather than
 * dropped, and the visited set makes a corrupt parent cycle harmless instead of infinite.
 */
export function flattenCategories(categories: ApiCategory[]): CategoryRow[] {
  const ids = new Set(categories.map(c => c.id));
  const children = new Map<string | null, ApiCategory[]>();
  for (const c of categories) {
    const key = c.parentId && ids.has(c.parentId) ? c.parentId : null;
    const list = children.get(key) ?? [];
    list.push(c);
    children.set(key, list);
  }
  const rows: CategoryRow[] = [];
  const visited = new Set<string>();
  const walk = (parent: string | null, depth: number) => {
    for (const c of (children.get(parent) ?? []).sort(bySortThenName)) {
      if (visited.has(c.id)) continue;
      visited.add(c.id);
      rows.push({ category: c, depth });
      walk(c.id, depth + 1);
    }
  };
  walk(null, 0);
  return rows;
}

/** Ids of a category and everything beneath it — what can't be chosen as its own new parent. */
export function descendantIds(categories: ApiCategory[], rootId: string): Set<string> {
  const result = new Set<string>([rootId]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const c of categories) {
      if (c.parentId && result.has(c.parentId) && !result.has(c.id)) {
        result.add(c.id);
        grew = true;
      }
    }
  }
  return result;
}

/** "Parent › Child" label for selects and product cards. */
export function categoryPath(categories: ApiCategory[], id: string | undefined | null): string {
  if (!id) return '';
  const byId = new Map(categories.map(c => [c.id, c]));
  const parts: string[] = [];
  let current = byId.get(id);
  for (let hops = 0; current && hops < 20; hops++) {
    parts.unshift(current.name);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return parts.join(' › ');
}

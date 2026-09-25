// Cart lines that know about variants and add-ons. Storefront templates keep their cart in plain
// component state; this file is the one place that knows how a line is identified, priced, described
// and turned into an order — so every template that supports options behaves the same.
//
// A line is identified by product + variant + chosen add-ons: two burgers with different toppings
// are two lines, the same burger twice is one line with qty 2.

import type { PublicProduct } from '@/lib/types/store';
import type { CartDraftItem } from '@/lib/utils/cart-draft';

export interface LineSelection {
  variantId: string | null;
  variantLabel: string | null;
  modifierOptionIds: string[];
  modifierNames: string[];
  /** Final price of ONE unit: the variant's (or the product's) price plus the chosen add-ons. */
  unitPrice: number;
}

export interface CartLine {
  product: PublicProduct;
  qty: number;
  /** Absent for a plain product added with one tap. */
  selection?: LineSelection;
}

export interface OrderItemPayload {
  productId: string;
  quantity: number;
  variantId?: string;
  modifierOptionIds?: string[];
}

/** What a customer pays for one unit of a product with nothing chosen. */
export function basePrice(product: PublicProduct): number {
  return product.discountPrice ?? product.price;
}

/** True when adding this product needs the customer to choose something first. */
export function needsOptions(product: PublicProduct): boolean {
  return (product.hasVariants === true && (product.variants?.length ?? 0) > 0)
    || (product.addonGroups?.length ?? 0) > 0;
}

export function unitPriceOf(line: CartLine): number {
  return line.selection?.unitPrice ?? basePrice(line.product);
}

export function lineTotal(line: CartLine): number {
  return unitPriceOf(line) * line.qty;
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.qty, 0);
}

export function cartSubtotal(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + lineTotal(l), 0);
}

function keyOf(productId: string, variantId: string | null, modifierIds: string[]): string {
  return `${productId}|${variantId ?? ''}|${[...modifierIds].sort().join(',')}`;
}

export function lineKey(line: CartLine): string {
  return keyOf(String(line.product.id), line.selection?.variantId ?? null, line.selection?.modifierOptionIds ?? []);
}

/** "M / Black", "Extra cheese", … — what to print under the product name. */
export function describeSelection(line: CartLine): string[] {
  const parts: string[] = [];
  if (line.selection?.variantLabel) parts.push(line.selection.variantLabel);
  if (line.selection) parts.push(...line.selection.modifierNames);
  return parts;
}

export function addLine(lines: CartLine[], product: PublicProduct, qty: number, selection?: LineSelection): CartLine[] {
  const incoming: CartLine = { product, qty, selection };
  const key = lineKey(incoming);
  if (lines.some(l => lineKey(l) === key)) {
    return lines.map(l => (lineKey(l) === key ? { ...l, qty: l.qty + qty } : l));
  }
  return [...lines, incoming];
}

/** Changes a line's quantity; a line that reaches zero is removed. */
export function changeQty(lines: CartLine[], key: string, delta: number): CartLine[] {
  return lines
    .map(l => (lineKey(l) === key ? { ...l, qty: l.qty + delta } : l))
    .filter(l => l.qty > 0);
}

export function removeLine(lines: CartLine[], key: string): CartLine[] {
  return lines.filter(l => lineKey(l) !== key);
}

export function toOrderItems(lines: CartLine[]): OrderItemPayload[] {
  return lines.map(l => ({
    productId: String(l.product.id),
    quantity: l.qty,
    variantId: l.selection?.variantId ?? undefined,
    modifierOptionIds: l.selection && l.selection.modifierOptionIds.length > 0 ? l.selection.modifierOptionIds : undefined,
  }));
}

export function toDraft(lines: CartLine[]): CartDraftItem[] {
  return lines.map(l => ({
    productId: String(l.product.id),
    qty: l.qty,
    variantId: l.selection?.variantId ?? undefined,
    modifierOptionIds: l.selection?.modifierOptionIds.length ? l.selection.modifierOptionIds : undefined,
  }));
}

/**
 * Prices and labels a choice from the product's own data (the same data the customer picked from),
 * or null if any id no longer exists — the caller then drops the line rather than send a stale one.
 */
export function buildSelection(
  product: PublicProduct,
  variantId: string | null | undefined,
  modifierOptionIds: string[] | undefined,
): LineSelection | null {
  let unit = basePrice(product);
  let variantLabel: string | null = null;
  let chosenVariantId: string | null = null;

  const variants = product.variants ?? [];
  if (product.hasVariants && variants.length > 0) {
    const variant = variants.find(v => v.id === variantId);
    if (!variant) return null;
    unit = variant.discountPrice ?? variant.price;
    variantLabel = variant.label;
    chosenVariantId = variant.id;
  } else if (variantId) {
    return null;
  }

  const wanted = new Set(modifierOptionIds ?? []);
  const names: string[] = [];
  const ids: string[] = [];
  for (const group of product.addonGroups ?? []) {
    for (const option of group.options) {
      if (wanted.delete(option.id)) {
        unit += option.priceDelta;
        names.push(option.name);
        ids.push(option.id);
      }
    }
  }
  if (wanted.size > 0) return null; // an add-on that's no longer offered

  return { variantId: chosenVariantId, variantLabel, modifierOptionIds: ids, modifierNames: names, unitPrice: unit };
}

/** Rebuilds a saved cart (e.g. after logging in) against the current products, dropping anything gone. */
export function restoreFromDraft(draft: CartDraftItem[], products: PublicProduct[]): CartLine[] {
  const lines: CartLine[] = [];
  for (const d of draft) {
    const product = products.find(p => String(p.id) === d.productId);
    if (!product) continue;
    const qty = Math.max(1, Math.floor(d.qty || 1));
    if (needsOptions(product) || d.variantId || (d.modifierOptionIds?.length ?? 0) > 0) {
      const selection = buildSelection(product, d.variantId, d.modifierOptionIds);
      if (!selection) continue;
      lines.push({ product, qty, selection });
    } else {
      lines.push({ product, qty });
    }
  }
  return lines;
}

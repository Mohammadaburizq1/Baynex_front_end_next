// Bulk product import (Excel/CSV). The backend is authoritative: it parses and validates the file on
// preview (nothing saved), and again on confirm — the browser sends the same files a second time and
// the server checks they are the ones it previewed.
import { apiDownload, apiRequest } from './client';

export type ExistingStrategy = 'SKIP' | 'UPDATE' | 'FAIL';
export type ImportMode = 'VALID_ROWS_ONLY' | 'ALL_OR_NOTHING';

export interface ImportIssue {
  level: 'ERROR' | 'WARNING' | 'INFO';
  code: string;
  message: string;
  column?: string;
}

export interface ImportPreviewRow {
  row: number;
  nameEn?: string;
  nameAr?: string;
  sku?: string;
  barcode?: string;
  category?: string;
  categoryResolved?: string;
  price?: number;
  salePrice?: number;
  stock?: number;
  imageStatus: string;
  images: number;
  action: 'CREATE' | 'UPDATE' | 'SKIP' | 'NONE';
  status: 'VALID' | 'WARNING' | 'ERROR';
  matchedProductId?: string;
  issues: ImportIssue[];
}

export interface ImportSummary {
  totalRows: number;
  valid: number;
  warnings: number;
  errors: number;
  existingMatched: number;
  newProducts: number;
  toCreate: number;
  toUpdate: number;
  toSkip: number;
  images: number;
}

export interface ImportPreview {
  sessionId: string;
  fileName: string;
  imagesFileName?: string;
  existingStrategy: ExistingStrategy;
  mode: ImportMode;
  createCategories: boolean;
  currency: string;
  expiresAt: string;
  summary: ImportSummary;
  columns: string[];
  fileIssues: ImportIssue[];
  rows: ImportPreviewRow[];
  unmatchedImages: string[];
  canImport: boolean;
}

export interface ImportResultRow {
  row: number;
  nameEn?: string;
  sku?: string;
  barcode?: string;
  outcome: 'CREATED' | 'UPDATED' | 'SKIPPED' | 'FAILED';
  productId?: string;
  imagesAttached: number;
  imageFailures: number;
  issues: ImportIssue[];
}

export interface ImportResult {
  sessionId: string;
  replayed: boolean;
  status: 'COMPLETED' | 'FAILED';
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  imagesAttached: number;
  imageFailures: number;
  rows: ImportResultRow[];
}

/** The same limits the server enforces (checked here only to answer sooner). */
export const IMPORT_LIMITS = { fileBytes: 5 * 1024 * 1024, zipBytes: 50 * 1024 * 1024, rows: 2000 };

export async function downloadImportTemplate(): Promise<{ blob: Blob; filename: string }> {
  return apiDownload('/api/dashboard/product-imports/template', 'khangates-products-template.xlsx');
}

export async function previewImport(
  storeId: string,
  file: File,
  images: File | null,
  options: { existing: ExistingStrategy; mode: ImportMode; createCategories: boolean },
): Promise<ImportPreview> {
  const form = new FormData();
  form.append('storeId', storeId);
  form.append('file', file);
  if (images) form.append('images', images);
  form.append('existing', options.existing);
  form.append('mode', options.mode);
  form.append('createCategories', String(options.createCategories));
  return apiRequest<ImportPreview>('/api/dashboard/product-imports/preview', { method: 'POST', body: form });
}

export async function confirmImport(sessionId: string, file: File, images: File | null): Promise<ImportResult> {
  const form = new FormData();
  form.append('file', file);
  if (images) form.append('images', images);
  return apiRequest<ImportResult>(`/api/dashboard/product-imports/${encodeURIComponent(sessionId)}/confirm`, { method: 'POST', body: form });
}

export async function downloadImportReport(sessionId: string, format: 'csv' | 'xlsx'): Promise<{ blob: Blob; filename: string }> {
  return apiDownload(`/api/dashboard/product-imports/${encodeURIComponent(sessionId)}/report?format=${format}`, `import-report.${format}`);
}

/** Saves a downloaded file through the browser. */
export function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

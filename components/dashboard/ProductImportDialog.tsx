'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Download, FileSpreadsheet, ImageIcon, Info, Upload, X, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import {
  IMPORT_LIMITS, confirmImport, downloadImportReport, downloadImportTemplate, previewImport, saveBlob,
  type ExistingStrategy, type ImportMode, type ImportPreview, type ImportResult, type ImportPreviewRow,
} from '@/lib/api/product-import';

type Step = 'choose' | 'preview' | 'result';

interface Props {
  open: boolean;
  storeId: string;
  onClose: () => void;
  /** Called after an import saved anything, so the product list can reload. */
  onImported: () => void;
}

const STRATEGIES: { value: ExistingStrategy; label: string; hint: string }[] = [
  { value: 'SKIP', label: 'Skip existing', hint: 'Rows that match a product already in your store are left alone.' },
  { value: 'UPDATE', label: 'Update existing', hint: 'Filled cells replace the product’s values; empty cells keep them.' },
  { value: 'FAIL', label: 'Treat as error', hint: 'A row that matches an existing product is not imported.' },
];

function money(v: number | undefined, currency: string) {
  if (v === undefined || v === null) return '—';
  const digits = ['JOD', 'KWD', 'BHD', 'OMR', 'TND', 'IQD', 'LYD'].includes(currency) ? 3 : 2;
  return `${currency} ${v.toFixed(digits)}`;
}

function StatusPill({ status }: { status: ImportPreviewRow['status'] }) {
  const map = {
    VALID: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle2 size={13} aria-hidden="true" />, text: 'Valid' },
    WARNING: { cls: 'bg-amber-50 text-amber-800 border-amber-200', icon: <AlertTriangle size={13} aria-hidden="true" />, text: 'Warning' },
    ERROR: { cls: 'bg-red-50 text-red-700 border-red-200', icon: <XCircle size={13} aria-hidden="true" />, text: 'Error' },
  }[status];
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium', map.cls)}>
      {map.icon}{map.text}
    </span>
  );
}

function ActionPill({ action }: { action: ImportPreviewRow['action'] }) {
  const cls = {
    CREATE: 'bg-primary-50 text-primary-700',
    UPDATE: 'bg-sky-50 text-sky-700',
    SKIP: 'bg-slate-100 text-slate-600',
    NONE: 'bg-slate-100 text-slate-500',
  }[action];
  return <span className={cn('rounded px-2 py-0.5 text-xs font-semibold', cls)}>{action === 'NONE' ? 'NOT IMPORTED' : action}</span>;
}

function Tile({ label, value, tone }: { label: string; value: number; tone?: 'ok' | 'warn' | 'bad' }) {
  return (
    <div className={cn('rounded-card border bg-white px-3 py-2',
      tone === 'bad' && value > 0 ? 'border-red-200' : tone === 'warn' && value > 0 ? 'border-amber-200' : 'border-surface-200')}>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className={cn('text-xl font-bold tabular-nums',
        tone === 'bad' && value > 0 ? 'text-red-700' : tone === 'warn' && value > 0 ? 'text-amber-700' : tone === 'ok' ? 'text-emerald-700' : 'text-slate-900')}>{value}</p>
    </div>
  );
}

export function ProductImportDialog({ open, storeId, onClose, onImported }: Props) {
  const [step, setStep] = useState<Step>('choose');
  const [file, setFile] = useState<File | null>(null);
  const [images, setImages] = useState<File | null>(null);
  const [existing, setExisting] = useState<ExistingStrategy>('SKIP');
  const [mode, setMode] = useState<ImportMode>('VALID_ROWS_ONLY');
  const [createCategories, setCreateCategories] = useState(false);
  const [busy, setBusy] = useState<null | 'template' | 'preview' | 'confirm' | 'report'>(null);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [problemsOnly, setProblemsOnly] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const zipInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && !busy) close(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, busy]);

  function reset() {
    setStep('choose');
    setFile(null);
    setImages(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setProblemsOnly(false);
  }

  function close() {
    if (busy) return;
    reset();
    onClose();
  }

  async function run<T>(what: NonNullable<typeof busy>, action: () => Promise<T>): Promise<T | undefined> {
    setBusy(what);
    setError(null);
    try {
      return await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
      return undefined;
    } finally {
      setBusy(null);
    }
  }

  function pickFile(f: File | null) {
    setError(null);
    if (!f) return setFile(null);
    const name = f.name.toLowerCase();
    if (name.endsWith('.xls')) return setError('Old Excel .xls files are not supported. In Excel choose File → Save As → Excel Workbook (.xlsx).');
    if (!name.endsWith('.xlsx') && !name.endsWith('.csv')) return setError('Choose an Excel workbook (.xlsx) or a CSV file.');
    if (f.size > IMPORT_LIMITS.fileBytes) return setError('The spreadsheet can be up to 5 MB.');
    setFile(f);
  }

  function pickZip(f: File | null) {
    setError(null);
    if (!f) return setImages(null);
    if (!f.name.toLowerCase().endsWith('.zip')) return setError('Pictures must be one .zip file.');
    if (f.size > IMPORT_LIMITS.zipBytes) return setError('The pictures ZIP can be up to 50 MB.');
    setImages(f);
  }

  async function onTemplate() {
    const r = await run('template', downloadImportTemplate);
    if (r) saveBlob(r.blob, r.filename);
  }

  async function onPreview() {
    if (!file) return;
    const p = await run('preview', () => previewImport(storeId, file, images, { existing, mode, createCategories }));
    if (p) {
      setPreview(p);
      setProblemsOnly(p.summary.errors + p.summary.warnings > 0 && p.rows.length > 50);
      setStep('preview');
    }
  }

  async function onConfirm() {
    if (!file || !preview) return;
    const r = await run('confirm', () => confirmImport(preview.sessionId, file, images));
    if (r) {
      setResult(r);
      setStep('result');
      if (r.created + r.updated > 0) onImported();
    }
  }

  async function onReport(format: 'csv' | 'xlsx') {
    const id = result?.sessionId ?? preview?.sessionId;
    if (!id) return;
    const r = await run('report', () => downloadImportReport(id, format));
    if (r) saveBlob(r.blob, r.filename);
  }

  const rows = useMemo(
    () => (preview?.rows ?? []).filter(r => !problemsOnly || r.status !== 'VALID'),
    [preview, problemsOnly],
  );

  if (!open) return null;

  const importCount = preview ? preview.summary.toCreate + preview.summary.toUpdate : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4" role="dialog" aria-modal="true" aria-labelledby="import-title">
      <div className="absolute inset-0 bg-black/50" onClick={close} aria-hidden="true" />
      <div className="relative flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl2 bg-white shadow-modal">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-surface-200 px-5 pt-4 pb-3">
          <div>
            <h2 id="import-title" className="text-lg font-semibold text-slate-900">Import products</h2>
            <p className="text-sm text-slate-500">
              {step === 'choose' && 'Upload a spreadsheet. You will see every row before anything is saved.'}
              {step === 'preview' && preview && `${preview.fileName}${preview.imagesFileName ? ` + ${preview.imagesFileName}` : ''} — nothing has been saved yet.`}
              {step === 'result' && 'Import finished.'}
            </p>
          </div>
          <button onClick={close} aria-label="Close import" disabled={!!busy}
            className="rounded-md p-1 text-slate-400 hover:bg-surface-100 hover:text-slate-600 cursor-pointer disabled:cursor-not-allowed">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {error && (
            <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              <XCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {step === 'choose' && (
            <div className="grid gap-4 md:grid-cols-2">
              <section className="space-y-3">
                <div className="rounded-card border border-surface-200 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">1. Get the template</h3>
                  <p className="mt-1 text-sm text-slate-500">Columns: name_en, name_ar, category, sku, barcode, price, sale_price, stock, image_url… Only name_en and price are required for new products.</p>
                  <Button variant="outline" className="mt-3" icon={<Download size={15} />} loading={busy === 'template'} onClick={onTemplate}>
                    Download template (.xlsx)
                  </Button>
                </div>

                <div className="rounded-card border border-surface-200 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">2. Upload your file</h3>
                  <label htmlFor="import-file" className="mt-2 flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-surface-300 px-3 py-3 hover:bg-surface-50">
                    <FileSpreadsheet size={22} className="text-primary-600" aria-hidden="true" />
                    <span className="min-w-0 text-sm">
                      <span className="block font-medium text-slate-800 truncate">{file ? file.name : 'Choose a spreadsheet'}</span>
                      <span className="block text-slate-500">.xlsx or .csv, up to 5 MB and {IMPORT_LIMITS.rows} rows</span>
                    </span>
                  </label>
                  <input id="import-file" ref={fileInput} type="file" accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    className="sr-only" onChange={e => pickFile(e.target.files?.[0] ?? null)} data-testid="import-file" />

                  <label htmlFor="import-images" className="mt-2 flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-surface-300 px-3 py-3 hover:bg-surface-50">
                    <ImageIcon size={22} className="text-slate-500" aria-hidden="true" />
                    <span className="min-w-0 text-sm">
                      <span className="block font-medium text-slate-800 truncate">{images ? images.name : 'Pictures ZIP (optional)'}</span>
                      <span className="block text-slate-500">Files named after the SKU or barcode: COKE-330.jpg, COKE-330_2.jpg</span>
                    </span>
                  </label>
                  <input id="import-images" ref={zipInput} type="file" accept=".zip,application/zip" className="sr-only"
                    onChange={e => pickZip(e.target.files?.[0] ?? null)} data-testid="import-images" />
                  {images && (
                    <button type="button" onClick={() => { setImages(null); if (zipInput.current) zipInput.current.value = ''; }}
                      className="mt-1 text-xs text-slate-500 underline cursor-pointer">Remove pictures ZIP</button>
                  )}
                </div>
              </section>

              <section className="space-y-3">
                <fieldset className="rounded-card border border-surface-200 p-4">
                  <legend className="px-1 text-sm font-semibold text-slate-900">3. Products that already exist</legend>
                  <p className="text-xs text-slate-500">A row matches an existing product by barcode, then SKU — never by name.</p>
                  <div className="mt-2 space-y-1">
                    {STRATEGIES.map(s => (
                      <label key={s.value} className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 hover:bg-surface-50">
                        <input type="radio" name="existing" value={s.value} checked={existing === s.value} onChange={() => setExisting(s.value)}
                          className="mt-1 accent-primary-600" />
                        <span className="text-sm"><span className="font-medium text-slate-800">{s.label}</span><span className="block text-slate-500">{s.hint}</span></span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="rounded-card border border-surface-200 p-4">
                  <legend className="px-1 text-sm font-semibold text-slate-900">4. Options</legend>
                  <label className="flex cursor-pointer items-start gap-2 px-2 py-1.5">
                    <input type="radio" name="mode" checked={mode === 'VALID_ROWS_ONLY'} onChange={() => setMode('VALID_ROWS_ONLY')} className="mt-1 accent-primary-600" />
                    <span className="text-sm"><span className="font-medium text-slate-800">Import the valid rows</span><span className="block text-slate-500">Rows with errors are listed and skipped.</span></span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-2 px-2 py-1.5">
                    <input type="radio" name="mode" checked={mode === 'ALL_OR_NOTHING'} onChange={() => setMode('ALL_OR_NOTHING')} className="mt-1 accent-primary-600" />
                    <span className="text-sm"><span className="font-medium text-slate-800">All or nothing</span><span className="block text-slate-500">Import only if every row is valid.</span></span>
                  </label>
                  <label className="mt-1 flex cursor-pointer items-start gap-2 border-t border-surface-100 px-2 pt-2">
                    <input type="checkbox" checked={createCategories} onChange={e => setCreateCategories(e.target.checked)} className="mt-1 accent-primary-600" />
                    <span className="text-sm"><span className="font-medium text-slate-800">Create missing categories</span><span className="block text-slate-500">Otherwise a product with an unknown category is imported uncategorized.</span></span>
                  </label>
                </fieldset>
              </section>
            </div>
          )}

          {step === 'preview' && preview && (
            <>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                <Tile label="Rows" value={preview.summary.totalRows} />
                <Tile label="Valid" value={preview.summary.valid} tone="ok" />
                <Tile label="Warnings" value={preview.summary.warnings} tone="warn" />
                <Tile label="Errors" value={preview.summary.errors} tone="bad" />
                <Tile label="Existing matched" value={preview.summary.existingMatched} />
                <Tile label="New products" value={preview.summary.newProducts} />
              </div>
              <p className="text-sm text-slate-600">
                Will create <strong>{preview.summary.toCreate}</strong>, update <strong>{preview.summary.toUpdate}</strong>, skip <strong>{preview.summary.toSkip}</strong>
                {preview.summary.images > 0 && <> and attach <strong>{preview.summary.images}</strong> picture{preview.summary.images === 1 ? '' : 's'}</>}.
                Prices are in {preview.currency}. Picture links are saved as given (not downloaded or checked).
              </p>
              {(preview.fileIssues.length > 0 || preview.unmatchedImages.length > 0) && (
                <ul className="space-y-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  {preview.fileIssues.map((i, n) => <li key={n} className="flex gap-2"><AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />{i.message}</li>)}
                  {preview.unmatchedImages.length > 0 && (
                    <li className="pl-6 text-xs text-amber-800">Unused ZIP files: {preview.unmatchedImages.slice(0, 12).join(', ')}{preview.unmatchedImages.length > 12 ? ` and ${preview.unmatchedImages.length - 12} more` : ''}</li>
                  )}
                </ul>
              )}
              {preview.mode === 'ALL_OR_NOTHING' && preview.summary.errors > 0 && (
                <p role="alert" className="text-sm font-medium text-red-700">“All or nothing” is on and {preview.summary.errors} row{preview.summary.errors === 1 ? ' has' : 's have'} errors: fix the file and upload it again.</p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={problemsOnly} onChange={e => setProblemsOnly(e.target.checked)} className="accent-primary-600" />
                  Show only rows with errors or warnings
                </label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" icon={<Download size={14} />} loading={busy === 'report'} onClick={() => onReport('csv')}>Report (CSV)</Button>
                  <Button variant="outline" size="sm" icon={<Download size={14} />} onClick={() => onReport('xlsx')} disabled={!!busy}>Report (Excel)</Button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-card border border-surface-200">
                <table className="w-full text-sm" data-testid="import-preview-table">
                  <thead className="bg-surface-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Row</th>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">SKU / barcode</th>
                      <th className="px-3 py-2">Category</th>
                      <th className="px-3 py-2 text-right">Price</th>
                      <th className="px-3 py-2 text-right">Stock</th>
                      <th className="px-3 py-2">Pictures</th>
                      <th className="px-3 py-2">Action</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100">
                    {rows.map(r => (
                      <tr key={r.row} className={cn('align-top', r.status === 'ERROR' && 'bg-red-50/40')} data-row={r.row}>
                        <td className="px-3 py-2 tabular-nums text-slate-500">{r.row}</td>
                        <td className="px-3 py-2">
                          <span className="block font-medium text-slate-900">{r.nameEn ?? '—'}</span>
                          {r.nameAr && <span className="block text-slate-500" dir="rtl" lang="ar">{r.nameAr}</span>}
                          {r.issues.length > 0 && (
                            <ul className="mt-1 space-y-0.5">
                              {r.issues.map((i, n) => (
                                <li key={n} className={cn('flex gap-1 text-xs', i.level === 'ERROR' ? 'text-red-700' : i.level === 'WARNING' ? 'text-amber-800' : 'text-slate-500')}>
                                  {i.level === 'INFO' ? <Info size={12} className="mt-0.5 shrink-0" aria-hidden="true" /> : null}
                                  <span><span className="sr-only">{i.level}: </span>{i.message}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                        <td className="px-3 py-2 font-mono text-xs text-slate-700">{r.sku ?? '—'}<br />{r.barcode ?? ''}</td>
                        <td className="px-3 py-2 text-slate-700">{r.categoryResolved ?? (r.category ? <span className="text-amber-800">{r.category}?</span> : '—')}</td>
                        <td className="px-3 py-2 text-right tabular-nums">
                          {money(r.price, preview.currency)}
                          {r.salePrice !== undefined && r.salePrice !== null && <span className="block text-xs text-emerald-700">sale {money(r.salePrice, preview.currency)}</span>}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">{r.stock ?? '—'}</td>
                        <td className="px-3 py-2 text-slate-600">{r.imageStatus}</td>
                        <td className="px-3 py-2"><ActionPill action={r.action} /></td>
                        <td className="px-3 py-2"><StatusPill status={r.status} /></td>
                      </tr>
                    ))}
                    {rows.length === 0 && (
                      <tr><td colSpan={9} className="px-3 py-6 text-center text-slate-500">No rows with problems.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {step === 'result' && result && (
            <div className="space-y-4" data-testid="import-result">
              <div className={cn('flex items-start gap-3 rounded-card border px-4 py-3',
                result.status === 'COMPLETED' ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50')}>
                {result.status === 'COMPLETED'
                  ? <CheckCircle2 className="mt-0.5 text-emerald-700" size={20} aria-hidden="true" />
                  : <XCircle className="mt-0.5 text-red-700" size={20} aria-hidden="true" />}
                <div className="text-sm">
                  <p className="font-semibold text-slate-900">{result.status === 'COMPLETED' ? 'Import complete' : 'Nothing was imported'}</p>
                  {result.replayed && <p className="text-slate-600">This import had already run; nothing was imported twice.</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                <Tile label="Created" value={result.created} tone="ok" />
                <Tile label="Updated" value={result.updated} />
                <Tile label="Skipped" value={result.skipped} />
                <Tile label="Failed" value={result.failed} tone="bad" />
                <Tile label="Pictures attached" value={result.imagesAttached} />
                <Tile label="Picture failures" value={result.imageFailures} tone="warn" />
              </div>
              {result.rows.some(r => r.outcome === 'FAILED' || r.imageFailures > 0) && (
                <div className="rounded-card border border-surface-200">
                  <p className="border-b border-surface-100 px-3 py-2 text-sm font-semibold text-slate-900">Rows that need attention</p>
                  <ul className="max-h-64 divide-y divide-surface-100 overflow-y-auto text-sm">
                    {result.rows.filter(r => r.outcome === 'FAILED' || r.imageFailures > 0).map(r => (
                      <li key={r.row} className="px-3 py-2">
                        <span className="font-medium text-slate-800">Row {r.row}{r.nameEn ? ` · ${r.nameEn}` : ''}</span>
                        <span className="ml-2 text-xs text-slate-500">{r.outcome}</span>
                        <ul className="text-xs text-red-700">{r.issues.filter(i => i.level !== 'INFO').map((i, n) => <li key={n}>{i.message}</li>)}</ul>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" icon={<Download size={14} />} loading={busy === 'report'} onClick={() => onReport('csv')}>Download report (CSV)</Button>
                <Button variant="outline" size="sm" icon={<Download size={14} />} onClick={() => onReport('xlsx')} disabled={!!busy}>Download report (Excel)</Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-surface-200 px-5 py-3">
          {step === 'choose' && (
            <>
              <Button variant="ghost" onClick={close} disabled={!!busy}>Cancel</Button>
              <Button variant="primary" icon={<Upload size={15} />} onClick={onPreview} disabled={!file || !!busy} loading={busy === 'preview'}>
                Check file
              </Button>
            </>
          )}
          {step === 'preview' && preview && (
            <>
              <Button variant="ghost" onClick={() => { setStep('choose'); setPreview(null); }} disabled={!!busy}>Change file or options</Button>
              <Button variant="primary" onClick={onConfirm} disabled={!preview.canImport || !!busy} loading={busy === 'confirm'} data-testid="import-confirm">
                {importCount === 0 ? 'Nothing to import' : `Import ${importCount} product${importCount === 1 ? '' : 's'}`}
              </Button>
            </>
          )}
          {step === 'result' && (
            <>
              <Button variant="ghost" onClick={reset}>Import another file</Button>
              <Button variant="primary" onClick={close}>Done</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

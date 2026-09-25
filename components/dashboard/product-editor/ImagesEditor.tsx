'use client';

import { useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import {
  saveProductImages,
  uploadProductImage,
  type ApiImage,
} from '@/lib/api/products';

const MAX_IMAGES = 12;
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';

interface Row { id?: string; url: string; altText: string }

interface ImagesEditorProps {
  productId: string;
  storeId: string;
  initial: ApiImage[];
  canEdit: boolean;
  onSaved: (images: ApiImage[]) => void;
}

// The product's picture gallery. The first picture is the one shown on product cards; it can be
// changed by moving another picture to the top. Pictures come from an upload (stored by us) or a
// pasted link (stored where it already lives).
export function ImagesEditor({ productId, storeId, initial, canEdit, onSaved }: ImagesEditorProps) {
  const { success, error: toastError } = useToast();
  const fileInput = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<Row[]>(() => initial.map(i => ({ id: i.id, url: i.url, altText: i.altText ?? '' })));
  const [link, setLink] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  function update(next: Row[]) {
    setRows(next);
    setDirty(true);
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= rows.length) return;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    update(next);
  }

  function addLink() {
    const url = link.trim();
    if (!/^https?:\/\/.{3,480}$/.test(url)) {
      toastError('Enter a full image link starting with http:// or https://');
      return;
    }
    if (rows.length >= MAX_IMAGES) {
      toastError(`A product can have up to ${MAX_IMAGES} pictures.`);
      return;
    }
    update([...rows, { url, altText: '' }]);
    setLink('');
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const room = MAX_IMAGES - rows.length;
    if (room <= 0) {
      toastError(`A product can have up to ${MAX_IMAGES} pictures.`);
      return;
    }
    setUploading(true);
    const added: Row[] = [];
    for (const file of Array.from(files).slice(0, room)) {
      if (file.size > MAX_BYTES) {
        toastError(`"${file.name}" is over 5 MB.`);
        continue;
      }
      try {
        added.push({ url: await uploadProductImage(storeId, file), altText: '' });
      } catch (e) {
        toastError(e instanceof Error ? e.message : `Could not upload "${file.name}".`);
      }
    }
    if (added.length > 0) update([...rows, ...added]);
    setUploading(false);
    if (fileInput.current) fileInput.current.value = '';
  }

  async function save() {
    setSaving(true);
    try {
      const saved = await saveProductImages(
        productId,
        rows.map(r => ({ id: r.id, url: r.url, altText: r.altText.trim() || undefined })),
      );
      setRows(saved.map(i => ({ id: i.id, url: i.url, altText: i.altText ?? '' })));
      setDirty(false);
      onSaved(saved);
      success('Pictures saved.');
    } catch (e) {
      toastError(e instanceof Error ? e.message : 'Could not save pictures.');
    }
    setSaving(false);
  }

  return (
    <div className="space-y-4">
      {canEdit && (
        <Card className="p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={fileInput}
              type="file"
              accept={ACCEPT}
              multiple
              className="sr-only"
              id="product-image-upload"
              onChange={e => handleFiles(e.target.files)}
            />
            <Button
              variant="secondary"
              icon={<Upload size={15} />}
              loading={uploading}
              disabled={rows.length >= MAX_IMAGES}
              onClick={() => fileInput.current?.click()}
            >
              Upload pictures
            </Button>
            <span className="text-xs text-slate-500">JPEG, PNG, WebP or GIF · up to 5 MB each</span>
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                label="…or paste an image link"
                placeholder="https://"
                value={link}
                onChange={e => setLink(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLink(); } }}
              />
            </div>
            <Button variant="secondary" onClick={addLink} disabled={!link.trim()}>Add</Button>
          </div>
        </Card>
      )}

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-surface-200 py-12 text-slate-400">
          <ImagePlus size={28} />
          <p className="text-sm">No pictures yet</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((row, index) => (
            <li key={row.id ?? `${row.url}-${index}`}>
              <Card className="p-3 flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={row.url} alt={row.altText || ''} className="w-16 h-16 rounded-lg object-cover bg-surface-100 shrink-0" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    {index === 0 && <Badge variant="success">Primary</Badge>}
                    <p className="text-xs text-slate-400 truncate">{row.url}</p>
                  </div>
                  <Input
                    aria-label="Description (for screen readers)"
                    placeholder="Short description (optional)"
                    maxLength={200}
                    disabled={!canEdit}
                    value={row.altText}
                    onChange={e => update(rows.map((r, i) => (i === index ? { ...r, altText: e.target.value } : r)))}
                  />
                </div>
                {canEdit && (
                  <div className="flex flex-col gap-1 shrink-0">
                    <IconButton label="Move up" disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp size={14} /></IconButton>
                    <IconButton label="Move down" disabled={index === rows.length - 1} onClick={() => move(index, 1)}><ArrowDown size={14} /></IconButton>
                    <IconButton label="Remove picture" danger onClick={() => update(rows.filter((_, i) => i !== index))}><Trash2 size={14} /></IconButton>
                  </div>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}

      {canEdit && (
        <div className="flex justify-end">
          <Button variant="primary" loading={saving} disabled={!dirty || uploading} onClick={save}>Save pictures</Button>
        </div>
      )}
    </div>
  );
}

function IconButton({ label, onClick, disabled, danger, children }: {
  label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`h-7 w-7 flex items-center justify-center rounded-md transition-colors duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 ${
        danger ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-slate-600 bg-surface-100 hover:bg-surface-200'
      }`}
    >
      {children}
    </button>
  );
}

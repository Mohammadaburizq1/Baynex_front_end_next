'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Theme color presets (matching Flutter ThemePalette) ────────────────────
const THEME_COLORS = [
  { id: 'indigo',  color: '#6366F1', label: 'Indigo'  },
  { id: 'violet',  color: '#7C3AED', label: 'Violet'  },
  { id: 'emerald', color: '#10B981', label: 'Emerald' },
  { id: 'forest',  color: '#16A34A', label: 'Forest'  },
  { id: 'ocean',   color: '#0EA5E9', label: 'Ocean'   },
  { id: 'sunset',  color: '#F97316', label: 'Sunset'  },
  { id: 'ruby',    color: '#E11D48', label: 'Ruby'    },
  { id: 'amber',   color: '#F59E0B', label: 'Amber'   },
];

// ── Progress bar (step 4 of 4 = complete) ─────────────────────────────────
function ProgressBar() {
  return (
    <div className="flex gap-1.5 mb-5">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: '#2A2F3D' }}>
          <div
            className="h-full rounded-full"
            style={{ width: '100%', background: 'linear-gradient(90deg, #6366F1, #8B5CF6)' }}
          />
        </div>
      ))}
    </div>
  );
}

export default function OnboardingFollowUpPage() {
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState('indigo');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    setSaving(true);
    try {
      await new Promise(r => setTimeout(r, 1200));
      router.push('/dashboard');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Navy animated background */}
      <div
        className="fixed inset-0 z-0"
        style={{ background: 'linear-gradient(135deg, #0A1628 0%, #132F5C 40%, #1A2844 75%, #0A1628 100%)' }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0 login-aurora-1"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, transparent 50%, rgba(129,92,246,0.05) 100%)' }}
          />
          <div
            className="absolute inset-0 login-aurora-2"
            style={{ background: 'linear-gradient(225deg, rgba(167,139,250,0.06) 0%, transparent 60%)' }}
          />
          <div className="absolute inset-0 login-grid opacity-60" />
          <div
            className="absolute w-[500px] h-[500px] -top-32 -left-32 rounded-full login-blob-1"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)' }}
          />
          <div
            className="absolute w-[400px] h-[400px] -bottom-20 -right-20 rounded-full login-blob-2"
            style={{ background: 'radial-gradient(circle, rgba(129,92,246,0.10) 0%, transparent 70%)' }}
          />
        </div>
      </div>

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-20 glass-nav px-4 md:px-6 h-14 flex items-center justify-between">
        <span className="text-white font-extrabold text-[17px] font-jakarta tracking-tight">
          Almost There!
        </span>
        <span className="text-white/50 text-sm font-semibold font-jakarta">ShopLink</span>
      </div>

      {/* Content */}
      <main className="relative z-10 min-h-dvh pt-14 pb-6 px-4 flex flex-col">
        <div className="w-full max-w-[720px] mx-auto flex-1 flex flex-col pt-4">

          {/* Glass panel */}
          <div
            className="rounded-[20px] border p-5 md:p-7 mb-3 flex-1"
            style={{
              background: 'rgba(20, 23, 31, 0.97)',
              borderColor: '#2A2F3D',
              boxShadow: '0 12px 32px rgba(0,0,0,0.25)',
            }}
          >
            <ProgressBar />

            {/* Step completed indicator */}
            <div
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full mb-6"
              style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)' }}
            >
              <Check size={14} style={{ color: '#22C55E' }} />
              <span className="text-xs font-bold" style={{ color: '#4ADE80' }}>
                All 3 steps complete
              </span>
            </div>

            <h2
              className="text-[26px] font-extrabold leading-tight mb-2"
              style={{ color: '#F4F4F5', letterSpacing: '-0.5px' }}
            >
              Brand Your Store
            </h2>
            <p className="text-[15px] mb-7" style={{ color: '#B4C0D0', lineHeight: 1.5 }}>
              Choose a primary colour and add a short description. These can be changed anytime from Store Settings.
            </p>

            {/* Color picker */}
            <p className="text-sm font-bold mb-3" style={{ color: '#B4C0D0' }}>Primary Colour</p>
            <div className="flex flex-wrap gap-3 mb-7">
              {THEME_COLORS.map(tc => {
                const active = selectedColor === tc.id;
                return (
                  <button
                    key={tc.id}
                    onClick={() => setSelectedColor(tc.id)}
                    disabled={saving}
                    aria-label={tc.label}
                    title={tc.label}
                    className="relative w-11 h-11 rounded-full cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:opacity-50"
                    style={{
                      background: tc.color,
                      border: active ? '3px solid #FFFFFF' : '1.5px solid rgba(255,255,255,0.2)',
                      boxShadow: active ? `0 0 12px ${tc.color}80` : 'none',
                      transform: active ? 'scale(1.08)' : 'scale(1)',
                    }}
                  >
                    {active && (
                      <Check
                        size={16}
                        className="absolute inset-0 m-auto text-white"
                        style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Description */}
            <label className="block text-sm font-bold mb-1.5" style={{ color: '#B4C0D0' }}>
              Store Description
              <span className="ml-1.5 font-normal" style={{ color: '#B4C0D0' }}>(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              disabled={saving}
              rows={3}
              placeholder="Briefly describe your business — what you offer, what makes you special..."
              className="w-full rounded-xl text-sm resize-none outline-none transition-all duration-150 disabled:opacity-50"
              style={{
                background: '#1A1D28',
                border: '1px solid #2A2F3D',
                color: '#F4F4F5',
                padding: '12px 14px',
                lineHeight: 1.55,
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = '#818CF8';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(99,102,241,0.2)';
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = '#2A2F3D';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />

            {/* Color preview strip */}
            <div
              className="mt-5 p-4 rounded-xl border flex items-center gap-3"
              style={{ background: '#1A1D28', borderColor: '#2A2F3D' }}
            >
              <div
                className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center"
                style={{ background: THEME_COLORS.find(c => c.id === selectedColor)?.color ?? '#6366F1' }}
              >
                <Check size={18} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: '#F4F4F5' }}>
                  {THEME_COLORS.find(c => c.id === selectedColor)?.label} theme selected
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#B4C0D0' }}>
                  Your storefront buttons and accents will use this colour
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div
            className="rounded-2xl border p-4 shrink-0"
            style={{
              background: 'rgba(20, 23, 31, 0.98)',
              borderColor: '#2A2F3D',
              boxShadow: '0 -4px 20px rgba(0,0,0,0.35)',
            }}
          >
            <div className="flex gap-3">
              <button
                onClick={() => router.back()}
                disabled={saving}
                className="flex-1 h-12 rounded-xl text-[15px] font-semibold cursor-pointer transition-all duration-150 disabled:opacity-40 border"
                style={{ borderColor: '#B4C0D0', color: '#F4F4F5' }}
              >
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={saving}
                className="flex-1 h-12 rounded-xl text-[15px] font-bold text-white cursor-pointer transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ background: '#6366F1' }}
                onMouseEnter={e => { if (!saving) e.currentTarget.style.background = '#4F46E5'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#6366F1'; }}
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                {saving ? 'Creating your store…' : 'Create Store'}
              </button>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}

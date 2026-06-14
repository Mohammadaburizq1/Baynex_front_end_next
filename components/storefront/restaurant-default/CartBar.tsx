'use client';

interface CartBarProps {
  count: number;
  total: number;
  currencySuffix: string;
  primary: string;
  onOpen: () => void;
}

export default function CartBar({ count, total, currencySuffix, primary, onOpen }: CartBarProps) {
  if (count === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        width: 'calc(100% - 32px)',
        maxWidth: 480,
      }}
    >
      <button
        onClick={onOpen}
        style={{
          backgroundColor: primary,
          borderRadius: 16,
          border: 'none',
          padding: '14px 20px',
          width: '100%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: `0 8px 32px ${primary}55`,
        }}
        className="transition-opacity hover:opacity-95"
      >
        <span
          style={{
            backgroundColor: 'rgba(255,255,255,0.25)',
            color: '#fff',
            borderRadius: 8,
            padding: '2px 10px',
            fontWeight: 800,
            fontSize: 14,
          }}
          className="font-sans"
        >
          {count} item{count !== 1 ? 's' : ''}
        </span>
        <span style={{ color: '#fff', fontWeight: 800, fontSize: 15 }} className="font-sans">
          View Cart
        </span>
        <span style={{ color: '#fff', fontWeight: 900, fontSize: 15 }} className="font-sans">
          {total.toFixed(2)} {currencySuffix}
        </span>
      </button>
    </div>
  );
}

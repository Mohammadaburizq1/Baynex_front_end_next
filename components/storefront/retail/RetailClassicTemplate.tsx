'use client';

import { useState, useMemo } from 'react';
import type { StorefrontData, PublicProduct } from '@/lib/types/store';
import { ShoppingBag, X, Minus, Plus } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CartItem {
  product: PublicProduct;
  qty: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const COLORS = {
  bg: '#F8F8F8',
  surface: '#FFFFFF',
  ink: '#1A1A1A',
  muted: '#6B7280',
  border: '#E5E7EB',
} as const;

// ─── Image Component ──────────────────────────────────────────────────────────

function ProductImage({
  imageUrl,
  name,
  primary,
  className = '',
}: {
  imageUrl: string | null;
  name: string;
  primary: string;
  className?: string;
}) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className={`w-full h-full object-cover ${className}`}
      />
    );
  }
  return (
    <div
      className={`w-full h-full flex items-center justify-center ${className}`}
      style={{ background: `linear-gradient(135deg, ${primary}22, ${primary}11)` }}
    >
      <ShoppingBag size={32} color={COLORS.muted} />
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({
  product,
  primary,
  currencySuffix,
  onAdd,
}: {
  product: PublicProduct;
  primary: string;
  currencySuffix: string;
  onAdd: (id: number) => void;
}) {
  const displayPrice = product.discountPrice ?? product.price;
  const hasDiscount = product.discountPrice !== null && product.discountPrice < product.price;

  return (
    <div className="bg-white rounded-2xl overflow-hidden hover:shadow-md transition cursor-pointer">
      <div className="aspect-[3/4] relative overflow-hidden">
        <ProductImage imageUrl={product.imageUrl} name={product.name} primary={primary} />
      </div>
      <div className="p-3">
        <p className="font-jakarta font-semibold text-[11px] uppercase tracking-wider" style={{ color: COLORS.muted }}>
          {product.category}
        </p>
        <p className="font-jakarta font-bold text-sm mt-0.5 line-clamp-2" style={{ color: COLORS.ink }}>
          {product.name}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <span className="font-jakarta font-extrabold text-[15px]" style={{ color: COLORS.ink }}>
            {displayPrice.toLocaleString()} {currencySuffix}
          </span>
          {hasDiscount && (
            <span className="font-jakarta text-sm line-through" style={{ color: COLORS.muted }}>
              {product.price.toLocaleString()} {currencySuffix}
            </span>
          )}
        </div>
        {product.available && product.stock > 0 ? (
          <button
            onClick={() => onAdd(product.id)}
            className="w-full py-2 mt-2 rounded-xl font-jakarta font-bold text-sm text-white cursor-pointer"
            style={{ background: primary }}
            aria-label={`Add ${product.name} to bag`}
          >
            Add to bag
          </button>
        ) : (
          <button
            disabled
            className="w-full py-2 mt-2 rounded-xl font-jakarta font-bold text-sm cursor-not-allowed opacity-40"
            style={{ background: COLORS.muted, color: COLORS.surface }}
          >
            Out of stock
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Cart Drawer ──────────────────────────────────────────────────────────────

function CartDrawer({
  cart,
  open,
  primary,
  currencySuffix,
  onClose,
  onRemove,
  onChangeQty,
}: {
  cart: CartItem[];
  open: boolean;
  primary: string;
  currencySuffix: string;
  onClose: () => void;
  onRemove: (id: number) => void;
  onChangeQty: (id: number, delta: number) => void;
}) {
  const total = cart.reduce((sum, item) => {
    const price = item.product.discountPrice ?? item.product.price;
    return sum + price * item.qty;
  }, 0);

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        role="dialog"
        aria-label="Shopping cart"
        aria-modal="true"
        className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-50 flex flex-col"
        style={{
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 300ms ease',
        }}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b flex justify-between items-center" style={{ borderColor: COLORS.border }}>
          <h2 className="font-jakarta font-bold text-lg" style={{ color: COLORS.ink }}>
            Your Bag
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"
            aria-label="Close cart"
          >
            <X size={20} color={COLORS.ink} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 px-6">
              <ShoppingBag size={40} color={COLORS.muted} />
              <p className="font-jakarta text-sm text-center" style={{ color: COLORS.muted }}>
                Your bag is empty
              </p>
            </div>
          ) : (
            cart.map((item) => {
              const price = item.product.discountPrice ?? item.product.price;
              return (
                <div
                  key={item.product.id}
                  className="flex gap-3 py-3 px-5 border-b items-start"
                  style={{ borderColor: COLORS.border }}
                >
                  {/* Thumbnail */}
                  <div className="w-[60px] h-[60px] rounded-xl overflow-hidden flex-shrink-0">
                    <ProductImage
                      imageUrl={item.product.imageUrl}
                      name={item.product.name}
                      primary={COLORS.muted}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-jakarta font-bold text-sm line-clamp-1" style={{ color: COLORS.ink }}>
                      {item.product.name}
                    </p>
                    <p className="font-jakarta text-sm mt-0.5" style={{ color: COLORS.muted }}>
                      {price.toLocaleString()} {currencySuffix}
                    </p>
                    {/* Qty controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => onChangeQty(item.product.id, -1)}
                        className="w-6 h-6 rounded-full border flex items-center justify-center cursor-pointer hover:bg-gray-50 transition"
                        style={{ borderColor: COLORS.border }}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} color={COLORS.ink} />
                      </button>
                      <span className="font-jakarta font-bold text-sm w-4 text-center" style={{ color: COLORS.ink }}>
                        {item.qty}
                      </span>
                      <button
                        onClick={() => onChangeQty(item.product.id, 1)}
                        className="w-6 h-6 rounded-full border flex items-center justify-center cursor-pointer hover:bg-gray-50 transition"
                        style={{ borderColor: COLORS.border }}
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} color={COLORS.ink} />
                      </button>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => onRemove(item.product.id)}
                    className="p-1 rounded hover:bg-gray-100 transition cursor-pointer flex-shrink-0"
                    aria-label={`Remove ${item.product.name}`}
                  >
                    <X size={14} color={COLORS.muted} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="px-5 py-4 border-t" style={{ borderColor: COLORS.border }}>
            <div className="flex justify-between items-center mb-3">
              <span className="font-jakarta text-sm" style={{ color: COLORS.muted }}>Total</span>
              <span className="font-jakarta font-bold text-lg" style={{ color: COLORS.ink }}>
                {total.toLocaleString()} {currencySuffix}
              </span>
            </div>
            <button
              className="w-full h-12 rounded-xl font-jakarta font-bold text-sm text-white cursor-pointer"
              style={{ background: primary }}
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function RetailClassicTemplate({ data }: { data: StorefrontData }) {
  const primary = data.store.primaryColor ?? '#475569';

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(data.products.map((p) => p.category)));
    return ['All', ...cats];
  }, [data.products]);

  const filtered = useMemo(() => {
    if (activeCategory === 'All') return data.products;
    return data.products.filter((p) => p.category === activeCategory);
  }, [data.products, activeCategory]);

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  function addToCart(id: number) {
    const product = data.products.find((p) => p.id === id);
    if (!product) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  }

  function removeFromCart(id: number) {
    setCart((prev) => prev.filter((item) => item.product.id !== id));
  }

  function changeQty(id: number, delta: number) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === id ? { ...item, qty: item.qty + delta } : item
        )
        .filter((item) => item.qty > 0)
    );
  }

  return (
    <div className="min-h-screen font-jakarta" style={{ background: COLORS.bg }}>
      {/* ── Sticky Navbar ── */}
      <header
        className="bg-white border-b px-4 md:px-8 h-14 flex items-center justify-between sticky top-0 z-20"
        style={{ borderColor: COLORS.border }}
      >
        <span className="font-jakarta font-bold text-lg" style={{ color: COLORS.ink }}>
          {data.store.shopName}
        </span>

        <button
          onClick={() => setCartOpen(true)}
          className="relative p-2 cursor-pointer"
          aria-label={`Open cart, ${cartCount} items`}
        >
          <ShoppingBag size={22} color={COLORS.ink} />
          {cartCount > 0 && (
            <span
              className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full text-white text-[10px] font-bold"
              style={{ background: primary }}
            >
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
        </button>
      </header>

      {/* ── Hero Banner ── */}
      <section
        className="h-[280px] md:h-[340px] relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${primary} 0%, #1a1a2e 100%)` }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <p className="font-jakarta font-extrabold text-xs tracking-widest text-white/70 uppercase mb-3">
            NEW COLLECTION
          </p>
          <h1 className="font-jakarta font-extrabold text-4xl md:text-5xl text-white leading-none">
            {data.store.shopName}
          </h1>
          <p className="font-jakarta text-base text-white/70 mt-4 max-w-md">
            {data.store.description || 'Quality & style for every occasion'}
          </p>
          <button
            className="bg-white rounded-full px-6 py-2.5 font-jakarta font-bold text-sm mt-6 cursor-pointer hover:opacity-90 transition"
            style={{ color: primary }}
            onClick={() => {
              document.getElementById('rc-products')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Shop Now
          </button>
        </div>
      </section>

      {/* ── Category Tabs ── */}
      <nav
        className="bg-white border-b sticky top-14 z-10 overflow-x-auto"
        style={{ borderColor: COLORS.border }}
        aria-label="Product categories"
      >
        <div className="px-4 py-2 flex gap-1" style={{ minWidth: 'max-content' }}>
          {categories.map((cat) => {
            const isActive = cat === activeCategory;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-4 py-2 font-jakarta font-semibold text-sm cursor-pointer rounded-lg transition whitespace-nowrap"
                style={{
                  color: isActive ? primary : COLORS.muted,
                  borderBottom: isActive ? `2px solid ${primary}` : '2px solid transparent',
                  background: 'transparent',
                }}
                aria-pressed={isActive}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Product Grid ── */}
      <main
        id="rc-products"
        className="px-4 md:px-8 py-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
      >
        {filtered.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center gap-3">
            <ShoppingBag size={40} color={COLORS.muted} />
            <p className="font-jakarta text-sm" style={{ color: COLORS.muted }}>
              No products in this category yet
            </p>
          </div>
        ) : (
          filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              primary={primary}
              currencySuffix={data.store.currencySuffix}
              onAdd={addToCart}
            />
          ))
        )}
      </main>

      {/* ── Cart Drawer ── */}
      <CartDrawer
        cart={cart}
        open={cartOpen}
        primary={primary}
        currencySuffix={data.store.currencySuffix}
        onClose={() => setCartOpen(false)}
        onRemove={removeFromCart}
        onChangeQty={changeQty}
      />

      {/* ── Footer ── */}
      <footer className="px-6 md:px-12 py-10 text-white" style={{ background: COLORS.ink }}>
        <p className="font-jakarta font-extrabold text-xl">{data.store.shopName}</p>
        {data.store.openingHours && (
          <p className="text-sm text-white/60 mt-1">{data.store.openingHours}</p>
        )}
        {data.store.deliveryInfo && (
          <p className="text-sm text-white/60 mt-0.5">{data.store.deliveryInfo}</p>
        )}
      </footer>
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';
import type { StorefrontData, PublicProduct } from '@/lib/types/store';
import { Plus, UtensilsCrossed } from 'lucide-react';
import { Roboto } from 'next/font/google';

const roboto = Roboto({ subsets: ['latin'], weight: ['400', '700', '800', '900'], display: 'swap' });

// ─── Types ────────────────────────────────────────────────────────────────────

interface CartItem {
  product: PublicProduct;
  qty: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const C = {
  canvas: '#FFEB3B',
  ink: '#000000',
  rail: '#212121',
  add: '#00E676',
} as const;

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({
  product,
  currencySuffix,
  onAdd,
}: {
  product: PublicProduct;
  currencySuffix: string;
  onAdd: () => void;
}) {
  const displayPrice = `${(product.discountPrice ?? product.price).toFixed(2)} ${currencySuffix}`;

  return (
    <div
      className="bg-white relative cursor-pointer overflow-hidden"
      style={{ border: '4px solid #000', borderRadius: '16px' }}
    >
      {/* Image */}
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-[200px] w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div
          className="h-[200px] w-full flex items-center justify-center"
          style={{ background: C.canvas }}
        >
          <UtensilsCrossed size={48} color={C.ink} />
        </div>
      )}

      {/* Content */}
      <div className="p-4" style={{ paddingRight: '96px' }}>
        <h3
          className={`${roboto.className} font-black uppercase leading-[1.1]`}
          style={{ fontSize: '26px', color: C.ink }}
        >
          {product.name}
        </h3>
        <p
          className={`${roboto.className} font-extrabold mt-1`}
          style={{ fontSize: '16px', color: '#424242' }}
        >
          {product.category}
        </p>
        <p
          className={`${roboto.className} font-black mt-1`}
          style={{ fontSize: '32px', color: C.rail }}
        >
          {displayPrice}
        </p>
      </div>

      {/* ADD button */}
      <button
        onClick={onAdd}
        aria-label={`Add ${product.name}`}
        className="absolute bottom-4 right-4 w-20 h-20 rounded-full flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
        style={{ background: C.add, border: '4px solid #000' }}
      >
        <Plus size={40} color={C.ink} strokeWidth={3} />
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DriveThruTemplate({ data }: { data: StorefrontData }) {
  const { store, products } = data;
  const tc = data.templateContent;

  const [cart, setCart] = useState<CartItem[]>([]);

  const availableProducts = useMemo(
    () => products.filter((p) => p.available),
    [products],
  );

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const cartTotal = cart.reduce((sum, item) => {
    return sum + (item.product.discountPrice ?? item.product.price) * item.qty;
  }, 0);

  const addToCart = (product: PublicProduct) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) return prev.map((i) => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product, qty: 1 }];
    });
  };

  const handleCheckout = () => {
    if (!store.whatsappNumber || cart.length === 0) return;
    const lines = cart
      .map(
        (item) =>
          `• ${item.product.name} ×${item.qty} — ${((item.product.discountPrice ?? item.product.price) * item.qty).toFixed(2)} ${store.currencySuffix}`,
      )
      .join('\n');
    const msg = `Hello ${store.shopName}!\n\nMy order:\n${lines}\n\nTotal: ${cartTotal.toFixed(2)} ${store.currencySuffix}`;
    window.open(
      `https://wa.me/${store.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`,
      '_blank',
    );
  };

  return (
    <div
      className={`${roboto.className} min-h-screen`}
      style={{ background: '#F5F5F5', paddingBottom: cartCount > 0 ? '140px' : '0' }}
    >
      {/* Header */}
      <header
        className="px-5 py-5 sticky top-0 z-20 flex items-start justify-between"
        style={{ background: C.rail }}
      >
        <div>
          <p
            className={`${roboto.className} font-extrabold text-xs mb-1`}
            style={{ color: C.canvas, letterSpacing: '1px' }}
          >
            SWIPE ITEM TO ADD · LARGE BUTTONS
          </p>
          <h1
            className={`${roboto.className} font-black uppercase leading-[1.05]`}
            style={{ fontSize: '32px', color: C.canvas }}
          >
            {store.shopName}
          </h1>
        </div>

        {/* Cart count badge */}
        <div
          className={`${roboto.className} font-black px-3 py-1`}
          style={{
            background: C.add,
            border: '4px solid #000',
            fontSize: '20px',
            color: C.ink,
            borderRadius: '8px',
            minWidth: '44px',
            textAlign: 'center',
          }}
          aria-label={`${cartCount} items in cart`}
        >
          {cartCount}
        </div>
      </header>

      {/* Products */}
      {availableProducts.length === 0 ? (
        <div className="flex items-center justify-center py-20 px-6">
          <p
            className={`${roboto.className} font-extrabold text-xl text-center uppercase`}
            style={{ color: '#424242' }}
          >
            No items available right now.
          </p>
        </div>
      ) : (
        <div className="px-3 py-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-screen-xl mx-auto">
          {availableProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              currencySuffix={store.currencySuffix}
              onAdd={() => addToCart(product)}
            />
          ))}
        </div>
      )}

      {/* Checkout bar */}
      {cartCount > 0 && (
        <div
          className="fixed bottom-0 inset-x-0 px-4 py-4 z-20"
          style={{ background: C.rail }}
        >
          <p
            className={`${roboto.className} font-extrabold mb-3`}
            style={{ fontSize: '20px', color: C.canvas }}
          >
            {cartCount} IN YOUR ORDER
          </p>
          <button
            onClick={handleCheckout}
            className={`${roboto.className} font-black w-full cursor-pointer tracking-[1.5px]`}
            style={{
              height: '72px',
              background: C.canvas,
              border: '4px solid #000',
              fontSize: '32px',
              color: C.ink,
              borderRadius: '8px',
            }}
          >
            CHECKOUT — {cartTotal.toFixed(2)} {store.currencySuffix}
          </button>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';
import type { StorefrontData, PublicProduct } from '@/lib/types/store';
import { Coffee } from 'lucide-react';
import { Oswald } from 'next/font/google';
import { Bebas_Neue } from 'next/font/google';

const oswald = Oswald({ subsets: ['latin'], weight: ['400', '500', '700'], display: 'swap' });
const bebasNeue = Bebas_Neue({ subsets: ['latin'], weight: ['400'], display: 'swap' });

// ─── Types ────────────────────────────────────────────────────────────────────

interface CartItem {
  product: PublicProduct;
  qty: number;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProductCard({
  product,
  idx,
  currencySuffix,
  onAdd,
}: {
  product: PublicProduct;
  idx: number;
  currencySuffix: string;
  onAdd: (id: number) => void;
}) {
  const imgHeight = idx % 2 === 0 ? 120 : 180;
  const displayPrice = (product.discountPrice ?? product.price).toFixed(2);

  return (
    <div
      className="bg-black overflow-hidden"
      style={{ border: '5px solid #000' }}
    >
      {/* Image */}
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full object-cover block"
          style={{ height: imgHeight }}
          loading="lazy"
        />
      ) : (
        <div
          className="w-full flex items-center justify-center bg-[#1C1917]"
          style={{ height: imgHeight }}
          aria-hidden="true"
        >
          <Coffee size={32} color="#6B7280" />
        </div>
      )}

      {/* Text block */}
      <div className="p-3 bg-black">
        <p
          className={`font-bold text-[20px] text-white uppercase leading-[1.05] ${oswald.className}`}
        >
          {product.name}
        </p>

        <p
          className={`text-[28px] text-[#E0E0E0] tracking-[1px] leading-tight ${bebasNeue.className}`}
        >
          {displayPrice} {currencySuffix}
        </p>

        <button
          onClick={() => onAdd(product.id)}
          disabled={!product.available || product.stock === 0}
          className={`w-full h-12 bg-[#E0E0E0] text-black text-[22px] tracking-[2px] cursor-pointer border-0 mt-2 disabled:opacity-40 ${bebasNeue.className}`}
          aria-label={`Add ${product.name} to cart`}
        >
          + ADD TO CART
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function IndustrialBrewTemplate({ data }: { data: StorefrontData }) {
  const { store, products } = data;
  const tc = data.templateContent;

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce(
    (s, i) => s + (i.product.discountPrice ?? i.product.price) * i.qty,
    0
  );

  function addToCart(productId: number) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === productId);
      if (existing)
        return prev.map((i) =>
          i.product.id === productId ? { ...i, qty: i.qty + 1 } : i
        );
      return [...prev, { product, qty: 1 }];
    });
  }

  // Grouped categories
  const categories = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const p of products) {
      if (!seen.has(p.category)) {
        seen.add(p.category);
        result.push(p.category);
      }
    }
    return result;
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') return products.filter((p) => p.available);
    return products.filter((p) => p.available && p.category === selectedCategory);
  }, [products, selectedCategory]);

  return (
    <div className="min-h-screen bg-white">
      {/* ── Header ── */}
      <header
        className="bg-black px-4 py-4 sticky top-0 z-20"
        style={{ borderBottom: '6px solid #000' }}
      >
        <p
          className={`text-[14px] text-[#E0E0E0] tracking-[4px] mb-1 ${bebasNeue.className}`}
        >
          ROAST / RAW
        </p>
        <div className="flex items-center justify-between gap-4">
          <h1
            className={`font-bold text-[36px] text-white leading-[0.95] ${oswald.className}`}
          >
            {store.shopName}
          </h1>

          {/* Cart badge */}
          <div
            className={`flex-shrink-0 text-[20px] text-black px-3 py-1 border-4 border-black ${bebasNeue.className}`}
            style={{ background: '#E0E0E0' }}
            aria-live="polite"
            aria-label={`Cart: ${cartCount} items`}
          >
            {cartCount > 0 ? `${cartCount} IN BAG` : 'BAG EMPTY'}
          </div>
        </div>
      </header>

      {/* ── Category Row ── */}
      <nav
        className="h-13 bg-white border-b-4 border-black flex gap-0 overflow-x-auto"
        style={{ scrollbarWidth: 'none', height: '52px' }}
        aria-label="Product categories"
      >
        {['All', ...categories].map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 h-full flex items-center border-r-4 border-black cursor-pointer whitespace-nowrap font-bold text-[13px] uppercase ${oswald.className}`}
              style={
                isSelected
                  ? { background: '#000000', color: '#E0E0E0' }
                  : { background: '#FFFFFF', color: '#000000' }
              }
              aria-pressed={isSelected}
            >
              {cat}
            </button>
          );
        })}
      </nav>

      {/* ── Product List ── */}
      <main
        className="px-3 py-3 flex flex-col gap-3 md:grid md:grid-cols-2 lg:grid-cols-3 pb-28 max-w-screen-xl mx-auto"
        aria-label="Products"
      >
        {filteredProducts.map((product, idx) => (
          <ProductCard
            key={product.id}
            product={product}
            idx={idx}
            currencySuffix={store.currencySuffix}
            onAdd={addToCart}
          />
        ))}
        {filteredProducts.length === 0 && (
          <p
            className={`text-center py-16 text-[20px] text-[#6B7280] md:col-span-2 lg:col-span-3 ${bebasNeue.className}`}
          >
            NO ITEMS HERE
          </p>
        )}
      </main>

      {/* ── Checkout Block ── */}
      {cartCount > 0 && (
        <div
          className="fixed bottom-0 inset-x-0 z-30 bg-black px-3 py-3"
          aria-live="polite"
          aria-label="Cart summary"
        >
          <p
            className={`font-bold text-[16px] text-[#E0E0E0] mb-2 ${oswald.className}`}
          >
            {cartCount} {cartCount === 1 ? 'ITEM' : 'ITEMS'}&nbsp;&middot;&nbsp;
            {cartTotal.toFixed(2)} {store.currencySuffix}
          </p>
          <button
            className={`w-full h-16 bg-[#333] text-white text-[36px] tracking-[6px] cursor-pointer ${bebasNeue.className}`}
            aria-label="Proceed to checkout"
          >
            CHECKOUT
          </button>
        </div>
      )}
    </div>
  );
}

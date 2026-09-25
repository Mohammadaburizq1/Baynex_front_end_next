'use client';
import { formatMoney } from '@/lib/utils';

import { useEffect, useState, useMemo } from 'react';
import type { StorefrontData, PublicProduct } from '@/lib/types/store';
import { Plus, UtensilsCrossed } from 'lucide-react';
import { Roboto } from 'next/font/google';
import CheckoutDrawer from '@/components/storefront/restaurant-default/CheckoutDrawer';
import { ProductOptionsDialog } from '@/components/storefront/shared/ProductOptionsDialog';
import { readCartDraft, clearCartDraft } from '@/lib/utils/cart-draft';
import {
  addLine, cartCount as countOf, cartSubtotal, changeQty as changeLineQty, needsOptions, removeLine, restoreFromDraft,
  type CartLine,
} from '@/lib/utils/cart-lines';

const roboto = Roboto({ subsets: ['latin'], weight: ['400', '700', '800', '900'], display: 'swap' });

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
  const displayPrice = formatMoney((product.discountPrice ?? product.price), currencySuffix);

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

  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  // The product whose variant / add-on choices are being made (null = dialog closed).
  const [optionsFor, setOptionsFor] = useState<PublicProduct | null>(null);

  // Restore a cart saved before a guest was redirected to /customer/login (see CheckoutDrawer).
  useEffect(() => {
    const draft = readCartDraft(store.slug);
    if (!draft || draft.length === 0) return;
    const restored = restoreFromDraft(draft, products);
    if (restored.length > 0) {
      setCart(restored);
      setCartOpen(true);
    }
    clearCartDraft(store.slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.slug]);

  const availableProducts = useMemo(
    () => products.filter((p) => p.available),
    [products],
  );

  const cartCount = countOf(cart);
  const cartTotal = cartSubtotal(cart);

  const addToCart = (product: PublicProduct) => {
    // A product with variants or add-ons needs the customer to choose first.
    if (needsOptions(product)) {
      setOptionsFor(product);
      return;
    }
    setCart((prev) => addLine(prev, product, 1));
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
            onClick={() => setCartOpen(true)}
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
            CHECKOUT — {formatMoney(cartTotal, store.currencySuffix)}
          </button>
        </div>
      )}

      <ProductOptionsDialog
        product={optionsFor}
        currencySuffix={store.currencySuffix}
        accent={C.add}
        onClose={() => setOptionsFor(null)}
        onConfirm={(selection, qty) => {
          if (optionsFor) setCart((prev) => addLine(prev, optionsFor, qty, selection));
          setOptionsFor(null);
        }}
      />
      <CheckoutDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        storeSlug={store.slug}
        cart={cart}
        currencySuffix={store.currencySuffix}
        onChangeQty={(key, delta) => setCart((prev) => changeLineQty(prev, key, delta))}
        onRemove={(key) => setCart((prev) => removeLine(prev, key))}
        onOrderPlaced={() => setCart([])}
      />
    </div>
  );
}

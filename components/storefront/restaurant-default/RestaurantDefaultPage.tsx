'use client';

import { useEffect, useState } from 'react';
import type { StorefrontData, PublicProduct } from '@/lib/types/store';
import { getCuisinePreset } from '@/lib/data/cuisine-presets';
import RestaurantNavbar from './RestaurantNavbar';
import RestaurantHeroSection from './RestaurantHeroSection';
import DeliveryTrustStrip from './DeliveryTrustStrip';
import PopularDishesSection from './PopularDishesSection';
import FullMenuSection from './FullMenuSection';
import StorefrontFooter from './StorefrontFooter';
import CartBar from './CartBar';
import WhatsAppButton from './WhatsAppButton';
import CheckoutDrawer from './CheckoutDrawer';
import { readCartDraft, clearCartDraft } from '@/lib/utils/cart-draft';

interface CartItem {
  product: PublicProduct;
  qty: number;
}

interface RestaurantDefaultPageProps {
  data: StorefrontData;
}

export default function RestaurantDefaultPage({ data }: RestaurantDefaultPageProps) {
  const { store, products } = data;
  const preset = getCuisinePreset(store.businessSubCategorySlug);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const draft = readCartDraft(store.slug);
    if (!draft || draft.length === 0) return;
    const restored: CartItem[] = [];
    for (const d of draft) {
      const product = products.find((p) => String(p.id) === d.productId);
      if (product) restored.push({ product, qty: d.qty });
    }
    if (restored.length > 0) {
      setCart(restored);
      setCartOpen(true);
    }
    clearCartDraft(store.slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.slug]);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + (i.product.discountPrice ?? i.product.price) * i.qty, 0);

  function addToCart(productId: number) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === productId);
      if (existing) return prev.map((i) => i.product.id === productId ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product, qty: 1 }];
    });
  }

  function changeQty(productId: number, delta: number) {
    setCart((prev) => prev
      .map((i) => i.product.id === productId ? { ...i, qty: i.qty + delta } : i)
      .filter((i) => i.qty > 0));
  }

  function removeFromCart(productId: number) {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  }

  const tc = data.templateContent;

  // — Content derivation —
  const name = (store.shopName ?? '').trim() || 'Foodie Restaurant';
  const openingHours = tc?.openingHours || (store.openingHours ?? '').trim() || 'Open: 11:00am – 11:00pm';
  const subtitle =
    tc?.heroDescription ||
    (store.description ?? '').trim() ||
    `Order online or visit us for ${preset.labelEn.toLowerCase()} made fresh.`;

  let heroImageUrl = tc?.heroImageUrl || preset.heroImageUrl;
  if (!tc?.heroImageUrl) {
    for (const p of products) {
      if (p.imageUrl?.trim()) { heroImageUrl = p.imageUrl.trim(); break; }
    }
    if (heroImageUrl === preset.heroImageUrl && store.logoUrl?.trim()) {
      heroImageUrl = store.logoUrl.trim();
    }
  }

  let floatingCardImageUrl = tc?.floatingCardImageUrl || preset.floatingImageUrl;
  if (!tc?.floatingCardImageUrl) {
    if (products.length > 1 && products[1].imageUrl?.trim()) {
      floatingCardImageUrl = products[1].imageUrl.trim();
    } else if (products.length > 0 && products[0].imageUrl?.trim()) {
      floatingCardImageUrl = products[0].imageUrl.trim();
    }
  }

  const heroContent = {
    storeName: name,
    heroEyebrow: tc?.heroEyebrow || 'Welcome to',
    heroTitleMain: name,
    heroTitleEnjoyLine: tc?.heroTitleEnjoyLine || preset.heroEnjoyLine,
    heroHighlight: tc?.heroHighlight || preset.heroHighlight,
    heroSubtitle: subtitle,
    primaryButtonLabel: tc?.primaryCta || 'Reserve a Table',
    secondaryButtonLabel: tc?.secondaryCta || 'Online Order',
    heroImageUrl,
    floatingCardName: tc?.floatingCardName || preset.floatingCardName,
    floatingCardBlurb: tc?.floatingCardBlurb || preset.floatingCardBlurb,
    floatingCardImageUrl,
    bestFoodBadge: preset.bestFoodBadge,
    openingHours,
  };

  return (
    <div style={{ backgroundColor: preset.background, minHeight: '100vh' }}>
      <RestaurantNavbar
        storeName={name}
        preset={preset}
        cartCount={cartCount}
        onCart={() => setCartOpen(true)}
      />

      <main>
        <RestaurantHeroSection
          content={heroContent}
          preset={preset}
          onReserveTable={() => {}}
          onOnlineOrder={() => {}}
        />

        <DeliveryTrustStrip
          preset={preset}
          deliveryInfo={store.deliveryInfo}
        />

        <PopularDishesSection
          products={products}
          currencySuffix={store.currencySuffix}
          preset={preset}
          onAddProduct={addToCart}
        />

        <FullMenuSection
          products={products}
          currencySuffix={store.currencySuffix}
          preset={preset}
          onAddProduct={addToCart}
        />
      </main>

      <StorefrontFooter
        storeName={name}
        openingHours={openingHours}
        whatsappNumber={store.whatsappNumber}
        preset={preset}
      />

      <CartBar
        count={cartCount}
        total={cartTotal}
        currencySuffix={store.currencySuffix}
        primary={preset.primary}
        onOpen={() => setCartOpen(true)}
      />

      <WhatsAppButton
        whatsappNumber={store.whatsappNumber}
        storeName={name}
        primary={preset.primary}
      />

      <CheckoutDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        storeSlug={store.slug}
        cart={cart}
        currencySuffix={store.currencySuffix}
        onChangeQty={changeQty}
        onRemove={removeFromCart}
        onOrderPlaced={() => setCart([])}
      />
    </div>
  );
}

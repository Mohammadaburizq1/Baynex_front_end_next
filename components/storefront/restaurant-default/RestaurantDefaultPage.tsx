'use client';

import { useEffect, useState } from 'react';
import type { StorefrontData, PublicProduct } from '@/lib/types/store';
import { ProductOptionsDialog } from '../shared/ProductOptionsDialog';
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
import {
  addLine, cartCount as countOf, cartSubtotal, changeQty as changeLineQty, needsOptions, removeLine, restoreFromDraft,
  type CartLine,
} from '@/lib/utils/cart-lines';

interface RestaurantDefaultPageProps {
  data: StorefrontData;
}

export default function RestaurantDefaultPage({ data }: RestaurantDefaultPageProps) {
  const scrollToMenu = () => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
  const { store, products } = data;
  const preset = getCuisinePreset(store.businessSubCategorySlug);

  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  // The product whose variant / add-on choices are being made (null = dialog closed).
  const [optionsFor, setOptionsFor] = useState<PublicProduct | null>(null);

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

  const cartCount = countOf(cart);
  const cartTotal = cartSubtotal(cart);

  function addToCart(productId: number) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    // A product with variants or add-ons needs the customer to choose first.
    if (needsOptions(product)) {
      setOptionsFor(product);
      return;
    }
    setCart((prev) => addLine(prev, product, 1));
  }

  function changeQty(key: string, delta: number) {
    setCart((prev) => changeLineQty(prev, key, delta));
  }

  function removeFromCart(key: string) {
    setCart((prev) => removeLine(prev, key));
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
          onReserveTable={scrollToMenu}
          onOnlineOrder={scrollToMenu}
        />

        <DeliveryTrustStrip
          preset={preset}
          deliveryInfo={store.deliveryInfo}
          demo={data.demo}
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

      <ProductOptionsDialog
        product={optionsFor}
        currencySuffix={store.currencySuffix}
        accent={preset.primary}
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
        onChangeQty={changeQty}
        onRemove={removeFromCart}
        onOrderPlaced={() => setCart([])}
      />
    </div>
  );
}

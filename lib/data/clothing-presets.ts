import type { ClothingTemplateContent, ClothingTemplateId } from '@/lib/types/clothing-template-content';

const PETAL_DEFAULT: ClothingTemplateContent = {
  navLinks: 'New In,Dresses,Tops,Accessories,About',
  heroEyebrow: 'New Collection 2025',
  heroTitleLine1: 'Dressed for the',
  heroTitleLine2: "moments you'll",
  heroTitleEmphasis: 'remember forever',
  heroDescription:
    'Thoughtfully designed clothing for those who move through life with intention. Each piece crafted to be worn again and again.',
  primaryCta: 'Shop Now',
  secondaryCta: 'New Arrivals',
  heroBadgeLabel: 'NEW IN',
  heroBadgeSubtitle: 'Spring 2025',
  heroImageUrl:
    'https://images.unsplash.com/photo-1529139574466-a303027614a4?auto=format&fit=crop&w=700&q=80',
  tickerText:
    'Free shipping on orders above $120 • New arrivals every Thursday • Easy 30-day returns •',
  productsEyebrow: 'New Arrivals',
  productsTitle: 'The Collection',
  productsCta: 'View All Pieces',
  brandStoryQuote:
    'Every woman deserves clothing that feels as good as it looks — made with care, worn with joy.',
  lookbookEyebrow: 'Style Inspiration',
  lookbookTitle: 'Shop the Look',
  lookbookLinkLabel: 'View All →',
  lookbookItems: [
    {
      name: 'The Sunday Edit',
      imageUrl:
        'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Garden Party',
      imageUrl:
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Golden Hour',
      imageUrl:
        'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=80',
    },
  ],
  testimonialsEyebrow: 'Love Notes',
  testimonialsTitle: 'Our Community',
  testimonials: [
    {
      quote:
        'This brand is everything I needed — beautiful, effortless, and timeless.',
      name: 'Sophie L.',
    },
    {
      quote: 'Arrived beautifully packaged and fits perfectly. Stunning quality.',
      name: 'Amara T.',
    },
    {
      quote:
        'Finally found a brand that gets it. Every piece makes me feel like myself.',
      name: 'Clara B.',
    },
  ],
  newsletterEyebrow: 'Stay Connected',
  newsletterTitle: 'Always First',
  newsletterBody:
    'Be the first to know about new arrivals, exclusive offers, and styling tips.',
  newsletterButton: 'Join Us',
  newsletterPlaceholder: 'your@email.com',
  footerSocialLinks: 'Instagram,Pinterest,TikTok',
};

const EDITORIAL_DEFAULT: ClothingTemplateContent = {
  ...PETAL_DEFAULT,
  heroEyebrow: 'SS / 25',
  heroTitleLine1: 'Where silence',
  heroTitleLine2: 'meets',
  heroTitleEmphasis: 'structure',
  heroDescription:
    'Architectural silhouettes and restrained palettes for the modern wardrobe.',
  primaryCta: 'Explore Collection',
  secondaryCta: 'Lookbook',
  heroImageUrl:
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=700&q=80',
  productsTitle: 'The Edit',
  brandStoryQuote: 'Fashion is architecture. It is a matter of proportions.',
};

const STREETWEAR_DEFAULT: ClothingTemplateContent = {
  ...PETAL_DEFAULT,
  navLinks: 'Drops,Latest,Archive,About',
  heroEyebrow: 'DROP 07 — LIVE',
  heroTitleLine1: 'VOID',
  heroTitleLine2: 'DRIP',
  heroTitleEmphasis: 'COLLECTION',
  heroDescription: 'Limited runs. Bold graphics. Street culture redefined.',
  primaryCta: 'Shop Drop',
  secondaryCta: 'View Archive',
  heroImageUrl:
    'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=700&q=80',
  tickerText: 'NEW DROP LIVE • FREE SHIPPING $80+ • MEMBERS GET EARLY ACCESS •',
  productsTitle: 'Latest Drop',
  testimonialsTitle: 'The Culture',
  footerSocialLinks: 'Instagram,TikTok,Discord',
};

export const CLOTHING_PRESETS: Record<ClothingTemplateId, ClothingTemplateContent> = {
  'clothing-boutique': PETAL_DEFAULT,
  'clothing-editorial': EDITORIAL_DEFAULT,
  'clothing-streetwear': STREETWEAR_DEFAULT,
};

export function isClothingTemplateId(id: string): id is ClothingTemplateId {
  return id in CLOTHING_PRESETS;
}

export function defaultClothingContent(templateId: string): ClothingTemplateContent {
  if (isClothingTemplateId(templateId)) {
    return structuredClone(CLOTHING_PRESETS[templateId]);
  }
  return structuredClone(PETAL_DEFAULT);
}

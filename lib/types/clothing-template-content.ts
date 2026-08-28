/** Editable copy & media for clothing storefront templates. */
export interface ClothingTestimonial {
  quote: string;
  name: string;
}

export interface ClothingLookbookItem {
  name: string;
  imageUrl: string;
}

export interface ClothingTemplateContent {
  /** Nav links — comma-separated in editor, e.g. "New In,Dresses,Tops" */
  navLinks: string;
  heroEyebrow: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroTitleEmphasis: string;
  heroDescription: string;
  primaryCta: string;
  secondaryCta: string;
  heroBadgeLabel: string;
  heroBadgeSubtitle: string;
  heroImageUrl: string;
  tickerText: string;
  productsEyebrow: string;
  productsTitle: string;
  productsCta: string;
  brandStoryQuote: string;
  lookbookEyebrow: string;
  lookbookTitle: string;
  lookbookLinkLabel: string;
  lookbookItems: ClothingLookbookItem[];
  testimonialsEyebrow: string;
  testimonialsTitle: string;
  testimonials: ClothingTestimonial[];
  newsletterEyebrow: string;
  newsletterTitle: string;
  newsletterBody: string;
  newsletterButton: string;
  newsletterPlaceholder: string;
  footerSocialLinks: string;
}

export type ClothingTemplateId =
  | 'clothing-boutique'
  | 'clothing-editorial'
  | 'clothing-streetwear';

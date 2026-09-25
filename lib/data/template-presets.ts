import type { TemplateContent } from '@/lib/types/template-content';

const COMMON_TESTIMONIALS: TemplateContent['testimonials'] = [
  { quote: 'Absolutely amazing — exceeded every expectation!', name: 'Sarah M.' },
  { quote: 'The best experience I\'ve had. Highly recommend.', name: 'James K.' },
  { quote: 'Outstanding quality and service.', name: 'Aisha R.' },
];

// ── Restaurant / food ─────────────────────────────────────────────────────

const RESTAURANT: TemplateContent = {
  navLinks: 'Menu,About,Reservations,Contact',
  heroEyebrow: 'Welcome to',
  heroDescription: 'Fresh ingredients, bold flavors, unforgettable dining.',
  primaryCta: 'View Menu',
  secondaryCta: 'Order Online',
  openingHours: 'Open: 11:00am – 11:00pm',
  floatingCardName: "Today's Special",
  floatingCardBlurb: "Chef's fresh pick of the day",
  productsEyebrow: 'Our Menu',
  productsTitle: 'Popular Dishes',
  productsCta: 'View Full Menu',
  testimonialsEyebrow: 'What People Say',
  testimonialsTitle: 'Guest Reviews',
  testimonials: COMMON_TESTIMONIALS,
  newsletterEyebrow: 'Stay Connected',
  newsletterTitle: 'Get Our Latest Offers',
  newsletterBody: 'Subscribe for weekly specials, events and exclusive discounts.',
  newsletterButton: 'Subscribe',
  newsletterPlaceholder: 'your@email.com',
  footerSocialLinks: 'Instagram,Facebook,TikTok',
  footerAbout: 'Serving great food with passion.',
};

// ── Coffee / café ─────────────────────────────────────────────────────────

const COFFEE: TemplateContent = {
  navLinks: 'Menu,About,Loyalty,Contact',
  heroEyebrow: 'Artisan Coffee',
  heroDescription: 'Craft coffee, roasted slow.',
  primaryCta: 'Order Now',
  secondaryCta: 'View Menu',
  openingHours: 'Mon–Sun 7:00 AM – 9:00 PM',
  productsEyebrow: 'Our Menu',
  productsTitle: 'Signature Drinks',
  productsCta: 'See All',
  testimonialsEyebrow: 'Coffee Lovers',
  testimonialsTitle: 'What They Say',
  testimonials: COMMON_TESTIMONIALS,
  newsletterEyebrow: 'Join the Club',
  newsletterTitle: 'Stay Caffeinated',
  newsletterBody: 'Get exclusive deals and first looks at new roasts.',
  newsletterButton: 'Join Us',
  newsletterPlaceholder: 'your@email.com',
  footerSocialLinks: 'Instagram,TikTok,Facebook',
  footerAbout: 'Coffee is our craft.',
};

// ── Street food ───────────────────────────────────────────────────────────

const STREET_FOOD: TemplateContent = {
  navLinks: 'Menu,About,Order,Contact',
  heroEyebrow: 'Fresh & Fast',
  heroDescription: 'Street food made with love.',
  primaryCta: 'Order Now',
  tickerText: '🔥 ORDER NOW 🍔 FRESH DAILY 🔥 ORDER NOW 🍔 FRESH DAILY •',
  productsEyebrow: 'Our Menu',
  productsTitle: 'Today\'s Picks',
  openingHours: 'Mon–Sun 10:00 AM – 10:00 PM',
  testimonials: COMMON_TESTIMONIALS,
  footerSocialLinks: 'Instagram,TikTok,Facebook',
};

// ── Retail ────────────────────────────────────────────────────────────────

const RETAIL: TemplateContent = {
  navLinks: 'Shop,Collections,About,Contact',
  heroEyebrow: 'NEW COLLECTION',
  heroTitle: 'The Collection',
  heroDescription: 'Quality & style for every occasion.',
  primaryCta: 'Shop Now',
  secondaryCta: 'New Arrivals',
  productsEyebrow: 'Featured',
  productsTitle: 'New Arrivals',
  productsCta: 'View All',
  brandStoryQuote: 'Crafted with care. Worn with confidence.',
  testimonialsEyebrow: 'Customer Love',
  testimonialsTitle: 'What They Say',
  testimonials: COMMON_TESTIMONIALS,
  newsletterEyebrow: 'Stay in the Loop',
  newsletterTitle: 'Join Our Community',
  newsletterBody: 'Be the first to know about new arrivals and exclusive offers.',
  newsletterButton: 'Subscribe',
  newsletterPlaceholder: 'your@email.com',
  footerSocialLinks: 'Instagram,Pinterest,Facebook',
  footerAbout: 'Fashion for the everyday.',
};

// ── Real estate ───────────────────────────────────────────────────────────

const REAL_ESTATE: TemplateContent = {
  navLinks: 'Listings,About,Services,Contact',
  heroEyebrow: 'Property Listings',
  heroTitle: 'Find Your Dream Home',
  heroDescription: 'Find your perfect property with our expert team.',
  primaryCta: 'View Listings',
  secondaryCta: 'Contact Us',
  productsEyebrow: 'Properties',
  productsTitle: 'Featured Listings',
  testimonials: COMMON_TESTIMONIALS,
  footerSocialLinks: 'Facebook,Instagram,LinkedIn',
  footerAbout: 'Your trusted property partner.',
};

// ── Services ──────────────────────────────────────────────────────────────

const SERVICES: TemplateContent = {
  navLinks: 'Services,About,Portfolio,Contact',
  heroEyebrow: 'PROFESSIONAL SERVICES',
  heroTitle: 'Expert Services',
  heroDescription: 'Expert services tailored to your needs.',
  primaryCta: 'Book Now',
  secondaryCta: 'Learn More',
  openingHours: 'Mon–Fri 9:00 AM – 6:00 PM',
  productsEyebrow: 'What We Offer',
  productsTitle: 'Our Services',
  productsCta: 'View All Services',
  testimonialsEyebrow: 'Client Stories',
  testimonialsTitle: 'What Clients Say',
  testimonials: COMMON_TESTIMONIALS,
  newsletterEyebrow: 'Stay Updated',
  newsletterTitle: 'Get Our Newsletter',
  newsletterBody: 'Industry insights, tips and exclusive offers.',
  newsletterButton: 'Subscribe',
  newsletterPlaceholder: 'your@email.com',
  footerSocialLinks: 'LinkedIn,Instagram,Facebook',
  footerAbout: 'Delivering excellence every time.',
};

// ── Medical / clinic ──────────────────────────────────────────────────────

const MEDICAL: TemplateContent = {
  navLinks: 'Services,Doctors,About,Contact',
  heroEyebrow: 'Healthcare You Can Trust',
  heroTitle: 'Your Health, Our Priority',
  heroDescription: 'Compassionate care from qualified professionals.',
  primaryCta: 'Book Appointment',
  secondaryCta: 'Learn More',
  openingHours: 'Mon–Sat 8:00 AM – 6:00 PM',
  productsEyebrow: 'Our Services',
  productsTitle: 'Medical Services',
  productsCta: 'View All',
  testimonialsEyebrow: 'Patient Stories',
  testimonialsTitle: 'Trusted by Many',
  testimonials: COMMON_TESTIMONIALS,
  footerSocialLinks: 'Facebook,Instagram',
  footerAbout: 'Committed to your well-being.',
};

// ── Clothing (supplements ClothingTemplateContent) ────────────────────────

const CLOTHING: TemplateContent = {
  navLinks: 'New In,Collections,Sale,About',
  heroEyebrow: 'New Collection 2025',
  heroTitleLine1: 'Dressed for the',
  heroTitleLine2: "moments you'll",
  heroTitleEmphasis: 'remember forever',
  heroDescription: 'Curated pieces for the modern wardrobe.',
  heroImageUrl: '',
  primaryCta: 'Shop Now',
  secondaryCta: 'New Arrivals',
  heroBadgeLabel: 'NEW IN',
  heroBadgeSubtitle: 'Spring 2025',
  tickerText: 'Free shipping • New arrivals • Easy returns •',
  productsEyebrow: 'New Arrivals',
  productsTitle: 'The Collection',
  productsCta: 'View All Pieces',
  brandStoryQuote: 'Fashion is the armor to survive the reality of everyday life.',
  lookbookEyebrow: 'Style Inspiration',
  lookbookTitle: 'Shop the Look',
  lookbookLinkLabel: 'View All →',
  lookbookItems: [
    { name: 'Summer Edit', imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80' },
    { name: 'Evening Wear', imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=600&q=80' },
    { name: 'Casual Days', imageUrl: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?auto=format&fit=crop&w=600&q=80' },
  ],
  testimonialsEyebrow: 'Love Notes',
  testimonialsTitle: 'Our Community',
  testimonials: COMMON_TESTIMONIALS,
  newsletterEyebrow: 'Stay Connected',
  newsletterTitle: 'Always First',
  newsletterBody: 'Join our list for early access to drops, styling tips and exclusive members-only offers.',
  newsletterButton: 'Join Us',
  newsletterPlaceholder: 'your@email.com',
  footerSocialLinks: 'Instagram,Pinterest,TikTok',
};

// ── Mapping ───────────────────────────────────────────────────────────────

export function getTemplateDefaults(templateId: string): TemplateContent {
  if (templateId.startsWith('clothing-')) return CLOTHING;
  if (templateId.startsWith('real-estate-')) return REAL_ESTATE;
  if (templateId.startsWith('services-')) return SERVICES;
  if (templateId.startsWith('medical-')) return MEDICAL;
  if (
    templateId.startsWith('retail-') ||
    templateId === 'catalog-inquiry'
  ) return RETAIL;
  if (templateId === 'street-food-pop') return STREET_FOOD;
  if (templateId.startsWith('coffee-')) return COFFEE;
  // All restaurant/food templates (restaurant-default, burger-*, ramen-*, etc.)
  return RESTAURANT;
}

export type TemplateCategory =
  | 'restaurant'
  | 'coffee'
  | 'street-food'
  | 'retail'
  | 'real-estate'
  | 'services'
  | 'medical'
  | 'clothing';

export function getTemplateCategory(templateId: string): TemplateCategory {
  if (templateId.startsWith('clothing-')) return 'clothing';
  if (templateId.startsWith('real-estate-')) return 'real-estate';
  if (templateId.startsWith('services-')) return 'services';
  if (templateId.startsWith('medical-')) return 'medical';
  if (templateId.startsWith('retail-') || templateId === 'catalog-inquiry') return 'retail';
  if (templateId === 'street-food-pop') return 'street-food';
  if (templateId.startsWith('coffee-')) return 'coffee';
  return 'restaurant';
}

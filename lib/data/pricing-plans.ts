// Single source of truth for plan copy — shared by the landing page pricing section
// (components/landing/LandingPage.tsx) and the dashboard Billing page, so the two can
// never drift out of sync on tier names, features, or prices.

export interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: 'STARTER',
    price: '0',
    yearlyPrice: '0',
    period: 'per month',
    features: [
      '1 Store',
      '20 Products',
      'WhatsApp orders',
      'Basic delivery zones',
      'Basic reports',
      'Community support',
    ],
    description: 'Perfect for individuals launching their first store',
    buttonText: 'Start for Free',
    href: '/onboarding',
    isPopular: false,
  },
  {
    name: 'BASIC',
    price: '19',
    yearlyPrice: '15',
    period: 'per month',
    features: [
      '1 Store',
      '100 Products',
      'Orders dashboard',
      'Inventory tracking',
      'Customer CRM',
      'Offers & discounts',
      'Advanced reports',
    ],
    description: 'Ideal for growing merchants ready to scale',
    buttonText: 'Get Started',
    href: '/onboarding',
    isPopular: true,
  },
  {
    name: 'PRO',
    price: '49',
    yearlyPrice: '39',
    period: 'per month',
    features: [
      'Unlimited stores',
      'Unlimited products',
      'Priority WhatsApp support',
      'Custom domain',
      'Advanced analytics',
      'API access',
      'Dedicated account manager',
    ],
    description: 'For established businesses with full control',
    buttonText: 'Contact Sales',
    href: '/onboarding',
    isPopular: false,
  },
];

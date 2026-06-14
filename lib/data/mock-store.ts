import type { StorefrontData } from '../types/store';

/** Demo store used when no backend is configured or slug is "demo-restaurant". */
export const DEMO_RESTAURANT: StorefrontData = {
  store: {
    id: 1,
    slug: 'demo-restaurant',
    shopName: 'Foodie Restaurant',
    description: 'Order online or visit us for fresh food made with love.',
    businessType: 'restaurant',
    businessSubCategorySlug: null,
    mainBusinessCategoryLabel: 'Restaurants & Cafes',
    primaryColor: '#F5A142',
    logoUrl: null,
    whatsappNumber: null,
    openingHours: 'Open: 11:00am – 11:00pm',
    deliveryInfo: null,
    currencyCode: 'USD',
    currencySuffix: 'USD',
  },
  products: [
    {
      id: 1,
      name: 'Spaghetti Pasta',
      description: 'Classic tomato sauce, parmesan, and fresh basil.',
      category: 'Mains',
      price: 14.0,
      discountPrice: null,
      stock: 50,
      available: true,
      imageUrl:
        'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 2,
      name: 'Vegetable Salad',
      description: 'Crisp greens, seasonal vegetables, light vinaigrette.',
      category: 'Starters',
      price: 11.5,
      discountPrice: null,
      stock: 30,
      available: true,
      imageUrl:
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 3,
      name: 'Chicken Noodles',
      description: 'Wok-tossed noodles with tender chicken and vegetables.',
      category: 'Mains',
      price: 13.25,
      discountPrice: null,
      stock: 40,
      available: true,
      imageUrl:
        'https://images.unsplash.com/photo-1617093727343-37473b2a0b2a?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 4,
      name: 'Butter Chicken',
      description: 'Creamy tomato curry with basmati rice.',
      category: 'Mains',
      price: 16.0,
      discountPrice: null,
      stock: 25,
      available: true,
      imageUrl:
        'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 5,
      name: 'Salmon Salad',
      description: 'Grilled salmon over mixed greens with citrus dressing.',
      category: 'Mains',
      price: 12.0,
      discountPrice: null,
      stock: 20,
      available: true,
      imageUrl:
        'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 6,
      name: 'Burger Meal',
      description: 'Beef patty, cheddar, fries, and house sauce.',
      category: 'Mains',
      price: 15.5,
      discountPrice: null,
      stock: 35,
      available: true,
      imageUrl:
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80',
    },
  ],
};

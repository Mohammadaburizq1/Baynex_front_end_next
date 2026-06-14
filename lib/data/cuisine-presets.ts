export interface CuisinePreset {
  slug: string;
  labelEn: string;
  primary: string;
  background: string;
  backgroundAlt: string;
  heroImageUrl: string;
  floatingImageUrl: string;
  heroHighlight: string;
  heroEnjoyLine: string;
  bestFoodBadge: string;
  floatingCardName: string;
  floatingCardBlurb: string;
}

export const GENERAL_PRESET: CuisinePreset = {
  slug: '',
  labelEn: 'Restaurant',
  primary: '#F5A142',
  background: '#FFFAF0',
  backgroundAlt: '#FFF8EA',
  heroImageUrl:
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=82',
  floatingImageUrl:
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=400&q=82',
  heroHighlight: 'The Food',
  heroEnjoyLine: 'and Enjoy',
  bestFoodBadge: 'Best Food 🍽️',
  floatingCardName: "Chef's Special",
  floatingCardBlurb: 'Fresh plates made to order',
};

export const CUISINE_PRESETS: CuisinePreset[] = [
  GENERAL_PRESET,
  {
    slug: 'pizza-restaurant',
    labelEn: 'Fired Oven',
    primary: '#E85D4C',
    background: '#FFF8F5',
    backgroundAlt: '#FFEFE8',
    heroImageUrl:
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=82',
    floatingImageUrl:
      'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=400&q=82',
    heroHighlight: 'Wood-fired',
    heroEnjoyLine: 'pies & slices',
    bestFoodBadge: "Chef's pie",
    floatingCardName: 'Margherita',
    floatingCardBlurb: 'San Marzano, fresh mozzarella',
  },
  {
    slug: 'burger-restaurant',
    labelEn: 'Smash House',
    primary: '#D97706',
    background: '#FFFBEB',
    backgroundAlt: '#FFF4D6',
    heroImageUrl:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=82',
    floatingImageUrl:
      'https://images.unsplash.com/photo-1550547660-d9450f179526?auto=format&fit=crop&w=400&q=82',
    heroHighlight: 'Smash',
    heroEnjoyLine: 'burgers & fries',
    bestFoodBadge: 'House combo',
    floatingCardName: 'Classic Smash',
    floatingCardBlurb: 'Juicy patty, melted cheese',
  },
  {
    slug: 'cafe',
    labelEn: 'Coffee',
    primary: '#FF9800',
    background: '#000000',
    backgroundAlt: '#1A1A1A',
    heroImageUrl:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=82',
    floatingImageUrl:
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=82',
    heroHighlight: 'Find the best',
    heroEnjoyLine: 'coffee for you',
    bestFoodBadge: 'Special for you',
    floatingCardName: 'House Roast',
    floatingCardBlurb: 'Rich aroma, smooth finish',
  },
  {
    slug: 'coffee-beans',
    labelEn: 'Coffee Beans',
    primary: '#2C1810',
    background: '#FAF8F5',
    backgroundAlt: '#F3EDE6',
    heroImageUrl:
      'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1200&q=82',
    floatingImageUrl:
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55c?auto=format&fit=crop&w=400&q=82',
    heroHighlight: 'Organic Coffee',
    heroEnjoyLine: '& matcha',
    bestFoodBadge: 'Shop all',
    floatingCardName: 'Single Origin',
    floatingCardBlurb: 'Freshly roasted · thoughtfully sourced',
  },
  {
    slug: 'coffee-smooth',
    labelEn: 'Coffee Smooth',
    primary: '#4A2C2A',
    background: '#F7F5F2',
    backgroundAlt: '#EDE8E3',
    heroImageUrl:
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=82',
    floatingImageUrl:
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55c?auto=format&fit=crop&w=400&q=82',
    heroHighlight: 'The standard for',
    heroEnjoyLine: 'dark roast',
    bestFoodBadge: 'Crowd pleasers',
    floatingCardName: 'Smooth Roast',
    floatingCardBlurb: 'Bold · balanced · silky finish',
  },
  {
    slug: 'coffee-artisan',
    labelEn: 'Artisan Roaster',
    primary: '#A65F3B',
    background: '#FFFCF8',
    backgroundAlt: '#F5EDE4',
    heroImageUrl:
      'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=1200&q=82',
    floatingImageUrl:
      'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=400&q=82',
    heroHighlight: 'Craft coffee',
    heroEnjoyLine: 'roasted slow',
    bestFoodBadge: 'Single origin',
    floatingCardName: 'House Espresso',
    floatingCardBlurb: 'Notes of cocoa · caramel · citrus',
  },
  {
    slug: 'coffee-urban-rush',
    labelEn: 'Urban Rush',
    primary: '#E85D04',
    background: '#F5F5F5',
    backgroundAlt: '#FFFFFF',
    heroImageUrl:
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=82',
    floatingImageUrl:
      'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=400&q=82',
    heroHighlight: 'Grab & go',
    heroEnjoyLine: 'in minutes',
    bestFoodBadge: 'Rush hour',
    floatingCardName: 'Double Shot',
    floatingCardBlurb: 'Extra hot · extra fast',
  },
  {
    slug: 'coffee-cyber-brew',
    labelEn: 'CyberBrew',
    primary: '#00F5FF',
    background: '#0A0014',
    backgroundAlt: '#120820',
    heroImageUrl:
      'https://images.unsplash.com/photo-1515823064-d6e0a0469a8d?auto=format&fit=crop&w=1200&q=82',
    floatingImageUrl:
      'https://images.unsplash.com/photo-1525385133512-2f3bdd039bcd?auto=format&fit=crop&w=400&q=82',
    heroHighlight: 'Neon lobby',
    heroEnjoyLine: 'open late',
    bestFoodBadge: 'Night drop',
    floatingCardName: 'Galaxy Boba',
    floatingCardBlurb: 'Tapioca · ube cloud · cyan drizzle',
  },
  {
    slug: 'coffee-green-leaf',
    labelEn: 'Green Leaf',
    primary: '#2D6A4F',
    background: '#F7F4EE',
    backgroundAlt: '#FFFCF7',
    heroImageUrl:
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1200&q=82',
    floatingImageUrl:
      'https://images.unsplash.com/photo-1515823064-d6e0a0469a8d?auto=format&fit=crop&w=400&q=82',
    heroHighlight: 'Grown slow',
    heroEnjoyLine: 'served fresh',
    bestFoodBadge: 'Organic pick',
    floatingCardName: 'Ceremonial Matcha',
    floatingCardBlurb: 'Stone-ground · oat-friendly · zero rush',
  },
  {
    slug: 'coffee-drive-thru',
    labelEn: 'Drive-Thru',
    primary: '#FFEB3B',
    background: '#FFEB3B',
    backgroundAlt: '#FFF59D',
    heroImageUrl:
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=82',
    floatingImageUrl:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=400&q=82',
    heroHighlight: 'Lane open',
    heroEnjoyLine: 'order fast',
    bestFoodBadge: 'Commuter combo',
    floatingCardName: 'Large Americano',
    floatingCardBlurb: 'Extra hot · swipe to add',
  },
  {
    slug: 'coffee-cupping-room',
    labelEn: 'Cupping Room',
    primary: '#C9A962',
    background: '#0A0A0A',
    backgroundAlt: '#141414',
    heroImageUrl:
      'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1200&q=82',
    floatingImageUrl:
      'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=400&q=82',
    heroHighlight: 'Single origin',
    heroEnjoyLine: 'gallery',
    bestFoodBadge: 'Lot 12',
    floatingCardName: 'Ethiopia Yirgacheffe',
    floatingCardBlurb: 'Jasmine · bergamot · honey finish',
  },
  {
    slug: 'coffee-industrial-brew',
    labelEn: 'Industrial Brew',
    primary: '#000000',
    background: '#E0E0E0',
    backgroundAlt: '#FFFFFF',
    heroImageUrl:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=82',
    floatingImageUrl:
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=82',
    heroHighlight: 'Raw space',
    heroEnjoyLine: 'dark roast',
    bestFoodBadge: 'Floor batch',
    floatingCardName: 'Warehouse Espresso',
    floatingCardBlurb: 'Bitter · dense · unapologetic',
  },
  {
    slug: 'coffee-matcha-zen',
    labelEn: 'Matcha Zen',
    primary: '#C5E1A5',
    background: '#F5F5DC',
    backgroundAlt: '#FFFBF0',
    heroImageUrl:
      'https://images.unsplash.com/photo-1515823064-d6e0a0469a8d?auto=format&fit=crop&w=1200&q=82',
    floatingImageUrl:
      'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=400&q=82',
    heroHighlight: 'Stillness',
    heroEnjoyLine: 'in every cup',
    bestFoodBadge: 'Ceremonial',
    floatingCardName: 'Uji Matcha',
    floatingCardBlurb: 'Stone-ground · whisked slow · umami calm',
  },
  {
    slug: 'dessert-shop',
    labelEn: 'Sugar Atelier',
    primary: '#DB5A9A',
    background: '#FFF5FA',
    backgroundAlt: '#FFECF4',
    heroImageUrl:
      'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=1200&q=82',
    floatingImageUrl:
      'https://images.unsplash.com/photo-1587241321921-58a3ddb2a32a?auto=format&fit=crop&w=400&q=82',
    heroHighlight: 'Handmade',
    heroEnjoyLine: 'pastry & cakes',
    bestFoodBadge: "Today's slice",
    floatingCardName: 'Berry Cake',
    floatingCardBlurb: 'Layers of cream & fruit',
  },
  {
    slug: 'fast-food',
    labelEn: 'Quick Counter',
    primary: '#EF4444',
    background: '#FFF7F7',
    backgroundAlt: '#FFEEEE',
    heroImageUrl:
      'https://images.unsplash.com/photo-1561758033-dffb6b0b6020?auto=format&fit=crop&w=1200&q=82',
    floatingImageUrl:
      'https://images.unsplash.com/photo-1572802419224-296b0a6a0c0a?auto=format&fit=crop&w=400&q=82',
    heroHighlight: 'Hot',
    heroEnjoyLine: 'counter picks',
    bestFoodBadge: 'Value combo',
    floatingCardName: 'Crispy Box',
    floatingCardBlurb: 'Ready in minutes',
  },
  {
    slug: 'healthy-food',
    labelEn: 'Garden Kitchen',
    primary: '#16A34A',
    background: '#F4FBF6',
    backgroundAlt: '#E8F7EC',
    heroImageUrl:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=82',
    floatingImageUrl:
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=82',
    heroHighlight: 'Fresh',
    heroEnjoyLine: 'bowls & plates',
    bestFoodBadge: 'Green bowl',
    floatingCardName: 'Power Salad',
    floatingCardBlurb: 'Greens, grains, lean protein',
  },
  {
    slug: 'seafood-restaurant',
    labelEn: 'Harbor & Tide',
    primary: '#0EA5E9',
    background: '#F0F9FF',
    backgroundAlt: '#E0F2FE',
    heroImageUrl:
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=82',
    floatingImageUrl:
      'https://images.unsplash.com/photo-1519708227418-c8fd9a32b8a2?auto=format&fit=crop&w=400&q=82',
    heroHighlight: 'Daily',
    heroEnjoyLine: 'dock catch',
    bestFoodBadge: "Chef's catch",
    floatingCardName: 'Grilled Fillet',
    floatingCardBlurb: 'Line-caught, lemon butter',
  },
  {
    slug: 'street-food-pop',
    labelEn: 'Street Food Pop',
    primary: '#FF3B30',
    background: '#FFC107',
    backgroundAlt: '#FFFFFF',
    heroImageUrl:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1200&q=82',
    floatingImageUrl:
      'https://images.unsplash.com/photo-1572802419224-296b0a6a0c0a?auto=format&fit=crop&w=400&q=82',
    heroHighlight: 'Pop-up',
    heroEnjoyLine: 'energy',
    bestFoodBadge: 'Hot drop',
    floatingCardName: 'Smash Box',
    floatingCardBlurb: 'Loud · messy · delicious',
  },
  {
    slug: 'breakfast-restaurant',
    labelEn: 'Sunrise Table',
    primary: '#F59E0B',
    background: '#FFFBEB',
    backgroundAlt: '#FFF7D6',
    heroImageUrl:
      'https://images.unsplash.com/photo-1533089860892-a7c6f0a806b7?auto=format&fit=crop&w=1200&q=82',
    floatingImageUrl:
      'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=400&q=82',
    heroHighlight: 'Morning',
    heroEnjoyLine: 'plates & brunch',
    bestFoodBadge: 'Brunch pick',
    floatingCardName: 'Fluffy Stack',
    floatingCardBlurb: 'Maple syrup, seasonal fruit',
  },
];

export function getCuisinePreset(subCategorySlug: string | null | undefined): CuisinePreset {
  const s = (subCategorySlug ?? '').trim().toLowerCase();
  return CUISINE_PRESETS.find((p) => p.slug === s) ?? GENERAL_PRESET;
}

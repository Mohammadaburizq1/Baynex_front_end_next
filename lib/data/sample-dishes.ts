export interface SampleDish {
  name: string;
  description: string;
  priceUsd: number;
  imageUrl: string;
}

export const SAMPLE_DISHES: SampleDish[] = [
  {
    name: 'Spaghetti Pasta',
    description: 'Classic tomato sauce, parmesan, and fresh basil.',
    priceUsd: 14.0,
    imageUrl:
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Vegetable Salad',
    description: 'Crisp greens, seasonal vegetables, light vinaigrette.',
    priceUsd: 11.5,
    imageUrl:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Chicken Noodles',
    description: 'Wok-tossed noodles with tender chicken and vegetables.',
    priceUsd: 13.25,
    imageUrl:
      'https://images.unsplash.com/photo-1617093727343-37473b2a0b2a?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Butter Chicken',
    description: 'Creamy tomato curry with basmati rice.',
    priceUsd: 16.0,
    imageUrl:
      'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Salmon Salad',
    description: 'Grilled salmon over mixed greens with citrus dressing.',
    priceUsd: 12.0,
    imageUrl:
      'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Burger Meal',
    description: 'Beef patty, cheddar, fries, and house sauce.',
    priceUsd: 15.5,
    imageUrl:
      'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80',
  },
];

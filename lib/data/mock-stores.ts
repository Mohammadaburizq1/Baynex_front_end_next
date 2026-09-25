import type { StorefrontData, StoreBusinessType } from '../types/store';

// ── Shared product sets ────────────────────────────────────────────────────────

const COFFEE_PRODUCTS = [
  { id: 1, name: 'House Espresso', description: 'Double shot, rich crema, dark chocolate finish.', category: 'Espresso', price: 3.50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1596116793498-bb7ddff35dbe?auto=format&fit=crop&w=400&q=80' },
  { id: 2, name: 'Signature Latte', description: 'Silky oat milk, single-origin espresso, light caramel.', category: 'Lattes', price: 5.00, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=400&q=80' },
  { id: 3, name: 'Cappuccino', description: 'Equal parts espresso, steamed milk, and velvety foam.', category: 'Espresso', price: 4.50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=400&q=80' },
  { id: 4, name: 'Cold Brew', description: '18-hour steep, served over ice. Smooth & bold.', category: 'Cold', price: 5.50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1517959105821-eaf2591984ca?auto=format&fit=crop&w=400&q=80' },
  { id: 5, name: 'Matcha Latte', description: 'Ceremonial grade matcha, steamed oat milk.', category: 'Matcha', price: 5.50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1515823064-d6e0a0469a8d?auto=format&fit=crop&w=400&q=80' },
  { id: 6, name: 'Chai Tea Latte', description: 'House-spiced chai, steamed milk, honey.', category: 'Tea', price: 4.50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1571658986106-af05b9c5d27a?auto=format&fit=crop&w=400&q=80' },
  { id: 7, name: 'Butter Croissant', description: 'Flaky layers, rich butter, baked fresh daily.', category: 'Food', price: 4.00, discountPrice: null, stock: 30, available: true, imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=400&q=80' },
  { id: 8, name: 'Avocado Toast', description: 'Sourdough, smashed avocado, poached egg, chilli flakes.', category: 'Food', price: 9.00, discountPrice: null, stock: 20, available: true, imageUrl: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c820?auto=format&fit=crop&w=400&q=80' },
];

const RETAIL_PRODUCTS = [
  { id: 1, name: 'Silk Wrap Dress', description: 'Fluid silk crepe, adjustable tie waist. Sizes XS–XL.', category: 'Dresses', price: 189.00, discountPrice: 149.00, stock: 12, available: true, imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=400&q=80' },
  { id: 2, name: 'Oversized Linen Shirt', description: 'Relaxed Belgian linen, pearl buttons, drop shoulder.', category: 'Tops', price: 95.00, discountPrice: null, stock: 20, available: true, imageUrl: 'https://images.unsplash.com/photo-1532453288672-3a17ac36f3ef?auto=format&fit=crop&w=400&q=80' },
  { id: 3, name: 'High-Waist Wide Trousers', description: 'Tailored wool blend. Ivory & camel.', category: 'Bottoms', price: 145.00, discountPrice: null, stock: 8, available: true, imageUrl: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=400&q=80' },
  { id: 4, name: 'Leather Blazer', description: 'Supple lambskin, single-button, fully lined.', category: 'Outerwear', price: 395.00, discountPrice: null, stock: 5, available: true, imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=400&q=80' },
  { id: 5, name: 'Minimalist Mule', description: 'Italian leather, block heel 5cm. Black & tan.', category: 'Shoes', price: 225.00, discountPrice: null, stock: 15, available: true, imageUrl: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=400&q=80' },
  { id: 6, name: 'Structured Tote', description: 'Vachetta leather, gold hardware, 3 interior pockets.', category: 'Bags', price: 320.00, discountPrice: null, stock: 7, available: true, imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=400&q=80' },
  { id: 7, name: 'Gold Chain Necklace', description: 'Fine 14k gold-fill, 46cm adjustable.', category: 'Jewellery', price: 95.00, discountPrice: null, stock: 25, available: true, imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=400&q=80' },
  { id: 8, name: 'Cashmere Knit', description: '100% Grade A cashmere, relaxed fit, seven colourways.', category: 'Tops', price: 265.00, discountPrice: null, stock: 10, available: true, imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=400&q=80' },
];

const REAL_ESTATE_PRODUCTS = [
  { id: 1, name: 'Sky Penthouse — Floor 48', description: '4 bed · 4 bath · 450 m² · Private rooftop terrace & plunge pool.', category: 'Penthouses', price: 4500000, discountPrice: null, stock: 1, available: true, imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80' },
  { id: 2, name: 'Skyline Apartment', description: '2 bed · 2 bath · 145 m² · Floor-to-ceiling glass, city views.', category: 'Apartments', price: 980000, discountPrice: null, stock: 3, available: true, imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80' },
  { id: 3, name: 'Garden Villa', description: '5 bed · 5.5 bath · 820 m² · Private pool, landscaped gardens.', category: 'Villas', price: 2750000, discountPrice: null, stock: 1, available: true, imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=400&q=80' },
  { id: 4, name: 'Designer Studio', description: '1 bed · 1 bath · 68 m² · Fully furnished, concierge service.', category: 'Studios', price: 450000, discountPrice: null, stock: 4, available: true, imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=80' },
  { id: 5, name: 'Waterfront Loft', description: '3 bed · 2 bath · 210 m² · Industrial finishes, marina views.', category: 'Lofts', price: 1650000, discountPrice: null, stock: 2, available: true, imageUrl: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=400&q=80' },
];

const SPA_SERVICES = [
  { id: 1, name: 'Swedish Massage', description: 'Full-body relaxation · 60 or 90 minutes · Warm aromatherapy oils.', category: 'Massage', price: 85, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=400&q=80' },
  { id: 2, name: 'Deep Tissue Therapy', description: 'Targets chronic tension · 60 minutes · Sports-grade pressure.', category: 'Massage', price: 100, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=400&q=80' },
  { id: 3, name: 'Signature Facial', description: 'Cleanse, tone, hydrate · 45 minutes · Suitable for all skin types.', category: 'Facials', price: 75, discountPrice: 65, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=400&q=80' },
  { id: 4, name: 'Hot Stone Ritual', description: 'Basalt stones + warm oil · 75 minutes · Deep muscle release.', category: 'Treatments', price: 120, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80' },
  { id: 5, name: 'Aromatherapy Journey', description: 'Essential oil blend · 60 minutes · Stress & anxiety relief.', category: 'Treatments', price: 90, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1596178060810-72660de82a4d?auto=format&fit=crop&w=400&q=80' },
  { id: 6, name: 'Exfoliating Body Scrub', description: 'Salt scrub + hydrating wrap · 45 minutes · Glowing skin.', category: 'Body', price: 80, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1620733723572-11c53fc809a9?auto=format&fit=crop&w=400&q=80' },
];

const SERVICES_PRODUCTS = [
  { id: 1, name: 'Haircut & Style', description: 'Wash, cut, blow-dry · 45 min · All hair types.', category: 'Hair', price: 45, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80' },
  { id: 2, name: 'Full Colour', description: 'Base colour + toning · 2 hrs · Consultation included.', category: 'Hair', price: 120, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=400&q=80' },
  { id: 3, name: 'Manicure', description: 'Shape, buff, polish · 30 min · Gel available +10.', category: 'Nails', price: 35, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=400&q=80' },
  { id: 4, name: 'Facial Treatment', description: 'Deep cleanse + mask · 50 min · Customised to skin type.', category: 'Skin', price: 70, discountPrice: 60, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=400&q=80' },
  { id: 5, name: 'Eyebrow Shaping', description: 'Wax or thread · 15 min · Includes tinting option.', category: 'Brows', price: 25, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=400&q=80' },
  { id: 6, name: 'Spray Tan', description: 'Full body bronze · 15 min treatment · Lasts 7–10 days.', category: 'Body', price: 50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1519415510236-718bdfcd89c8?auto=format&fit=crop&w=400&q=80' },
];

const BURGER_PRODUCTS = [
  { id: 1, name: 'Classic Smash Burger', description: 'Single smash patty, american cheese, pickles, house sauce.', category: 'Burgers', price: 9.50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80' },
  { id: 2, name: 'Double Stack Attack', description: 'Two smashed patties, double cheese, caramelised onion.', category: 'Burgers', price: 13.50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1553979459-d2229ba7433a?auto=format&fit=crop&w=400&q=80' },
  { id: 3, name: 'BBQ Bacon Crunch', description: 'Thick-cut bacon, BBQ glaze, crispy onion ring on top.', category: 'Burgers', price: 14.00, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1550317138-10000687a72b?auto=format&fit=crop&w=400&q=80' },
  { id: 4, name: 'Crispy Chicken Smash', description: 'Fried chicken thigh, slaw, sriracha mayo.', category: 'Burgers', price: 12.50, discountPrice: 10.00, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=400&q=80' },
  { id: 5, name: 'Smash Sauce Fries', description: 'Crispy shoestring fries loaded with house smash sauce.', category: 'Sides', price: 5.00, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=400&q=80' },
  { id: 6, name: 'Onion Ring Tower', description: 'Beer-battered onion rings, buttermilk ranch dip.', category: 'Sides', price: 5.50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=400&q=80' },
  { id: 7, name: 'House Lemonade', description: 'Fresh-squeezed lemonade, mint, ice. Classic or pink.', category: 'Drinks', price: 4.00, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=400&q=80' },
  { id: 8, name: 'Chocolate Milkshake', description: 'Hand-blended with premium ice cream, topped with cream.', category: 'Drinks', price: 6.50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=400&q=80' },
];

const DESSERT_PRODUCTS = [
  { id: 1, name: 'Strawberry Mille-Feuille', description: 'Flaky pastry layers, vanilla custard, fresh strawberries.', category: 'Pastries', price: 9.50, discountPrice: null, stock: 20, available: true, imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80' },
  { id: 2, name: 'Dark Chocolate Tart', description: 'Bittersweet ganache in a crisp almond shell, sea salt.', category: 'Cakes', price: 8.50, discountPrice: null, stock: 20, available: true, imageUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=400&q=80' },
  { id: 3, name: 'Raspberry Macaron Box', description: '6-piece macaron set, rotating seasonal flavours.', category: 'Seasonal', price: 18.00, discountPrice: 15.00, stock: 15, available: true, imageUrl: 'https://images.unsplash.com/photo-1558326567-98ae2405596b?auto=format&fit=crop&w=400&q=80' },
  { id: 4, name: 'Classic Crème Brûlée', description: 'Silky vanilla custard, caramelised sugar crust.', category: 'Pastries', price: 10.00, discountPrice: null, stock: 20, available: true, imageUrl: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?auto=format&fit=crop&w=400&q=80' },
  { id: 5, name: 'Pistachio Éclair', description: 'Light choux pastry, pistachio cream, green glaze.', category: 'Pastries', price: 7.50, discountPrice: null, stock: 25, available: true, imageUrl: 'https://images.unsplash.com/photo-1514517220017-8ce97a34a7b6?auto=format&fit=crop&w=400&q=80' },
  { id: 6, name: 'Lemon Chiffon Slice', description: 'Airy sponge, lemon curd, whipped cream. Serves 1.', category: 'Cakes', price: 9.00, discountPrice: null, stock: 15, available: true, imageUrl: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=400&q=80' },
  { id: 7, name: 'Berry Pavlova', description: 'Crisp meringue, chantilly cream, seasonal berry medley.', category: 'Seasonal', price: 11.00, discountPrice: null, stock: 12, available: true, imageUrl: 'https://images.unsplash.com/photo-1488477304112-4944851de03d?auto=format&fit=crop&w=400&q=80' },
  { id: 8, name: 'Hot White Chocolate', description: 'Thick Belgian white chocolate, steamed oat milk, cream.', category: 'Drinks', price: 6.50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1542990253-a781e5291f36?auto=format&fit=crop&w=400&q=80' },
];

const KOREAN_PRODUCTS = [
  { id: 1, name: 'Wagyu Short Rib (Galbi)', description: 'LA-cut wagyu galbi, marinated in soy, pear, sesame. Grilled tableside.', category: 'BBQ', price: 32.00, discountPrice: null, stock: 20, available: true, imageUrl: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=400&q=80' },
  { id: 2, name: 'Pork Belly (Samgyeopsal)', description: 'Premium 3-layer pork belly, sesame oil & salt dipping.', category: 'BBQ', price: 24.00, discountPrice: null, stock: 30, available: true, imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80' },
  { id: 3, name: 'Spicy Pork Bulgogi', description: 'Marinated sliced pork, gochujang, garlic, sesame.', category: 'BBQ', price: 22.00, discountPrice: 19.00, stock: 30, available: true, imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=400&q=80' },
  { id: 4, name: 'Premium Ribeye', description: 'Australian Prime ribeye, thinly sliced, for the grill. 200g.', category: 'BBQ', price: 45.00, discountPrice: null, stock: 15, available: true, imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=400&q=80' },
  { id: 5, name: 'Kimchi Pancake', description: 'Crispy kimchijeon, scallions, sesame dipping sauce.', category: 'Sides', price: 12.00, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?auto=format&fit=crop&w=400&q=80' },
  { id: 6, name: 'Japchae Glass Noodles', description: 'Sweet potato noodles, beef, mushroom, spinach, sesame.', category: 'Sides', price: 11.00, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?auto=format&fit=crop&w=400&q=80' },
  { id: 7, name: 'Soju Cocktail', description: 'House soju mixed with yuzu, honey or peach. Your pick.', category: 'Drinks', price: 9.00, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=400&q=80' },
  { id: 8, name: 'Bingsu (Shaved Ice)', description: 'Fine-shaved milk ice, red bean, mochi, condensed milk.', category: 'Desserts', price: 12.00, discountPrice: null, stock: 30, available: true, imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=400&q=80' },
];

const FRENCH_PRODUCTS = [
  { id: 1, name: 'French Onion Soup', description: 'Slow-caramelised onions, rich beef bouillon, gruyère croûte.', category: 'Entrées', price: 14.00, discountPrice: null, stock: 40, available: true, imageUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=400&q=80' },
  { id: 2, name: 'Foie Gras Terrine', description: 'Duck foie gras, brioche toast, Sauternes jelly.', category: 'Entrées', price: 24.00, discountPrice: 20.00, stock: 12, available: true, imageUrl: 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?auto=format&fit=crop&w=400&q=80' },
  { id: 3, name: 'Steak Frites', description: 'Bavette steak au poivre, hand-cut fries, béarnaise.', category: 'Plats', price: 36.00, discountPrice: null, stock: 20, available: true, imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=400&q=80' },
  { id: 4, name: 'Canard Confit', description: 'Slow-cooked duck leg, lentils du Puy, cherry jus.', category: 'Plats', price: 32.00, discountPrice: null, stock: 20, available: true, imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80' },
  { id: 5, name: 'Sole Meunière', description: 'Dover sole, brown butter, capers, lemon, parsley.', category: 'Plats', price: 38.00, discountPrice: null, stock: 15, available: true, imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=400&q=80' },
  { id: 6, name: 'Plateau de Fromages', description: 'Three French cheeses, quince paste, walnut bread.', category: 'Fromages', price: 22.00, discountPrice: null, stock: 30, available: true, imageUrl: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?auto=format&fit=crop&w=400&q=80' },
  { id: 7, name: 'Crème Brûlée', description: 'Classic Tahitian vanilla custard, caramelised sugar.', category: 'Desserts', price: 12.00, discountPrice: null, stock: 40, available: true, imageUrl: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?auto=format&fit=crop&w=400&q=80' },
  { id: 8, name: 'Profiteroles', description: 'Choux puffs, Valrhona chocolate sauce, vanilla ice cream.', category: 'Desserts', price: 14.00, discountPrice: null, stock: 40, available: true, imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80' },
];

const RAMEN_PRODUCTS = [
  { id: 1, name: 'Tonkotsu Ramen', description: 'Rich pork bone broth, chashu pork, soft egg, bamboo shoots.', category: 'Ramen', price: 14.50, discountPrice: null, stock: 40, available: true, imageUrl: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?auto=format&fit=crop&w=400&q=80' },
  { id: 2, name: 'Spicy Miso Ramen', description: 'House miso paste, chilli oil, corn, minced pork, nori.', category: 'Ramen', price: 15.00, discountPrice: null, stock: 40, available: true, imageUrl: 'https://images.unsplash.com/photo-1614563637806-1d0e645e0940?auto=format&fit=crop&w=400&q=80' },
  { id: 3, name: 'Shoyu Ramen', description: 'Soy-seasoned clear broth, wagyu chashu, menma, narutomaki.', category: 'Ramen', price: 13.50, discountPrice: null, stock: 40, available: true, imageUrl: 'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?auto=format&fit=crop&w=400&q=80' },
  { id: 4, name: 'Tsukemen (Dipping)', description: 'Thick noodles, intense dipping broth, pork belly. Limited qty.', category: 'Ramen', price: 16.00, discountPrice: 14.00, stock: 20, available: true, imageUrl: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?auto=format&fit=crop&w=400&q=80' },
  { id: 5, name: 'Karaage Chicken', description: 'Marinated fried chicken, kewpie mayo, lemon wedge. 6-piece.', category: 'Small Plates', price: 9.50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c3?auto=format&fit=crop&w=400&q=80' },
  { id: 6, name: 'Gyoza (6pc)', description: 'Pan-fried pork and cabbage dumplings, ponzu dipping sauce.', category: 'Small Plates', price: 8.00, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=400&q=80' },
  { id: 7, name: 'Japanese Highball', description: 'Suntory whisky, soda water, ice. Crisp and clean.', category: 'Drinks', price: 7.00, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=400&q=80' },
  { id: 8, name: 'Matcha Soft Serve', description: 'Ceremonial grade matcha, cold-churned, served in cup or cone.', category: 'Add-Ons', price: 5.00, discountPrice: null, stock: 50, available: true, imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=400&q=80' },
];

const MEDITERRANEAN_PRODUCTS = [
  { id: 1, name: 'Slow-Braised Lamb Kleftiko', description: 'Shoulder lamb, lemon, garlic, oregano. Oven-sealed for 6hrs.', category: 'Mains', price: 24.00, discountPrice: null, stock: 20, available: true, imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80' },
  { id: 2, name: 'Seafood Paella', description: 'Saffron rice, prawns, mussels, calamari. Serves 1.', category: 'Mains', price: 26.00, discountPrice: null, stock: 20, available: true, imageUrl: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=400&q=80' },
  { id: 3, name: 'Hummus & Warm Pita', description: 'Hand-crafted hummus, extra virgin olive oil, paprika, herbs.', category: 'Mezze', price: 9.50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=400&q=80' },
  { id: 4, name: 'Stuffed Vine Leaves', description: 'Dolmades with rice, pine nuts, fresh herbs. 6-piece.', category: 'Mezze', price: 11.00, discountPrice: 9.00, stock: 30, available: true, imageUrl: 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?auto=format&fit=crop&w=400&q=80' },
  { id: 5, name: 'Grilled Seabass', description: 'Line-caught, lemon-herb butter, roasted vegetables.', category: 'Grills', price: 32.00, discountPrice: null, stock: 15, available: true, imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=400&q=80' },
  { id: 6, name: 'Souvlaki Platter', description: 'Pork skewers, tzatziki, pita bread, side salad.', category: 'Grills', price: 22.00, discountPrice: null, stock: 25, available: true, imageUrl: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=400&q=80' },
  { id: 7, name: 'Baklava', description: 'Layered filo, walnuts, pistachios, rose water honey syrup.', category: 'Desserts', price: 8.00, discountPrice: null, stock: 30, available: true, imageUrl: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=400&q=80' },
  { id: 8, name: 'Greek Coffee & Loukoumades', description: 'Traditional Greek coffee + 3 fried honey doughnuts.', category: 'Desserts', price: 9.50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80' },
];

const SMOOTHIE_PRODUCTS = [
  { id: 1, name: 'Dragon Fruit Power Bowl', description: 'Pitaya base, mango, coconut flakes, chia, granola, honey drizzle.', category: 'Bowls', price: 14.50, discountPrice: null, stock: 30, available: true, imageUrl: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=400&q=80' },
  { id: 2, name: 'Green Goddess Bowl', description: 'Spirulina base, kiwi, spinach, banana, flaxseed, almond.', category: 'Bowls', price: 13.50, discountPrice: 12.00, stock: 30, available: true, imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80' },
  { id: 3, name: 'Tropical Mango Blast', description: 'Mango, pineapple, passionfruit, coconut water, ice.', category: 'Smoothies', price: 9.50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=400&q=80' },
  { id: 4, name: 'Berry Detox', description: 'Mixed berries, beet, ginger, lemon, coconut water.', category: 'Smoothies', price: 10.00, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1553530979-6babb2e7f231?auto=format&fit=crop&w=400&q=80' },
  { id: 5, name: 'Ginger Immunity Shot', description: 'Ginger, lemon, turmeric, black pepper. 60ml hit.', category: 'Shots', price: 4.00, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=400&q=80' },
  { id: 6, name: 'Matcha Boost Shot', description: 'Ceremonial matcha, coconut oil, oat milk. Focus fuel.', category: 'Shots', price: 4.50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1515823064-d6e0a0469a8d?auto=format&fit=crop&w=400&q=80' },
  { id: 7, name: 'Açai Granola Bites', description: 'Freeze-dried açai, rolled oats, dark choc chips. Per serve.', category: 'Bites', price: 7.50, discountPrice: null, stock: 50, available: true, imageUrl: 'https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&w=400&q=80' },
  { id: 8, name: 'Protein Bliss Ball', description: 'Dates, cashews, cacao, vanilla. 3 per serve, no sugar added.', category: 'Bites', price: 6.50, discountPrice: null, stock: 60, available: true, imageUrl: 'https://images.unsplash.com/photo-1505253304499-671c55fb57fe?auto=format&fit=crop&w=400&q=80' },
];

const CLINIC_SERVICES = [
  { id: 1, name: 'General Consultation', description: 'Comprehensive health assessment with our experienced GP. Includes full examination and personalised care plan.', category: 'General', price: 95, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=400&q=80' },
  { id: 2, name: 'Blood Panel & Lab Work', description: 'Full blood count, metabolic panel, and specialised markers. Most results returned within 24 hours.', category: 'Diagnostics', price: 145, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1576671081837-49000212a370?auto=format&fit=crop&w=400&q=80' },
  { id: 3, name: 'Cardiac Screening', description: 'ECG, blood pressure monitoring, and cardiovascular risk assessment by a specialist cardiologist.', category: 'Cardiology', price: 220, discountPrice: 185, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=400&q=80' },
  { id: 4, name: 'Sports Medicine', description: 'Injury assessment, rehabilitation planning, and return-to-play protocols for athletes and active patients.', category: 'Sports', price: 130, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80' },
  { id: 5, name: 'Mental Health Consultation', description: 'Confidential assessment and care planning with our qualified mental health specialists.', category: 'Mental Health', price: 160, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80' },
  { id: 6, name: 'Preventive Health Check', description: 'Annual full-body wellness screen tailored to your age, gender, and lifestyle risk factors.', category: 'Wellness', price: 350, discountPrice: 290, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1631217872822-7d26f07e03b2?auto=format&fit=crop&w=400&q=80' },
];

const PHARMACY_PRODUCTS = [
  { id: 1, name: 'Vitamin D3 + K2', description: 'High-strength 5000 IU with K2 for optimal absorption. Supports bone and immune health. 90 capsules.', category: 'Vitamins', price: 24, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80' },
  { id: 2, name: 'Omega-3 Fish Oil', description: 'Pharmaceutical-grade EPA & DHA. Supports heart, brain, and joint health. 60 softgels.', category: 'Supplements', price: 32, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1550572017-edd951b55104?auto=format&fit=crop&w=400&q=80' },
  { id: 3, name: 'Zinc + Magnesium', description: 'ZMA formula for immune support and muscle recovery. Ideal for active individuals. 120 capsules.', category: 'Minerals', price: 19, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=400&q=80' },
  { id: 4, name: 'Probiotic Complex', description: '10-strain, 50 billion CFU live cultures. Supports gut health and immune function.', category: 'Gut Health', price: 38, discountPrice: 28, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=400&q=80' },
  { id: 5, name: 'Pain Relief Gel', description: 'Fast-acting topical formula targeting muscle aches and joint pain. Non-greasy, quick absorption.', category: 'Pain Relief', price: 15, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1563213126-a4273aed2016?auto=format&fit=crop&w=400&q=80' },
  { id: 6, name: 'Immunity Boost Pack', description: 'Vitamin C 1000mg + Zinc + Echinacea. Triple-action immune defence. 30-day programme.', category: 'Immunity', price: 44, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=400&q=80' },
];

const PREMIUM_MEDICAL_SERVICES = [
  { id: 1, name: 'Botulinum Toxin Treatment', description: 'Precision anti-wrinkle treatment targeting forehead lines, crow\'s feet, and frown lines. Natural-looking results from £250.', category: 'Injectables', price: 250, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=400&q=80' },
  { id: 2, name: 'Dermal Fillers', description: 'Hyaluronic acid volumising and contouring — lips, cheeks, jawline, and under-eyes. Fully reversible.', category: 'Injectables', price: 380, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=400&q=80' },
  { id: 3, name: 'Laser Skin Resurfacing', description: 'Fractional CO2 laser for skin texture, pigmentation, and fine lines. Visible results from a single session.', category: 'Laser', price: 595, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=400&q=80' },
  { id: 4, name: 'IV Drip Therapy', description: 'Customised intravenous vitamin infusion. Energy, immunity, or glow protocols — chosen in consultation.', category: 'Wellness', price: 220, discountPrice: 189, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=400&q=80' },
  { id: 5, name: 'PRP Skin Rejuvenation', description: 'Platelet-rich plasma microneedling for collagen stimulation, skin renewal, and a lasting luminosity.', category: 'Regenerative', price: 490, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=400&q=80' },
  { id: 6, name: 'Medical Skin Analysis', description: 'Comprehensive AI-assisted skin assessment with a personalised treatment roadmap from our senior clinician.', category: 'Consultation', price: 120, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80' },
];

const EDITORIAL_PRODUCTS = [
  { id: 1, name: 'Silk Charmeuse Gown', description: 'Bias-cut silk charmeuse, adjustable straps, puddle hem. Available in ivory and midnight.', category: 'Eveningwear', price: 895, discountPrice: null, stock: 12, available: true, imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80' },
  { id: 2, name: 'Cashmere Trench Coat', description: 'Double-faced cashmere, horn buttons, self-belt. A wardrobe cornerstone, seasonless.', category: 'Outerwear', price: 1245, discountPrice: null, stock: 8, available: true, imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=400&q=80' },
  { id: 3, name: 'Bias-Cut Slip Dress', description: 'Fluid silk satin, adjustable spaghetti straps, midi length. Effortless from day to evening.', category: 'Dresses', price: 445, discountPrice: null, stock: 18, available: true, imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80' },
  { id: 4, name: 'Merino Knit Blazer', description: 'Single-button, ribbed trim, relaxed silhouette. Elevated casual with structured ease.', category: 'Tailoring', price: 695, discountPrice: 595, stock: 14, available: true, imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=400&q=80' },
  { id: 5, name: 'Velvet Palazzo Trousers', description: 'Wide-leg silk velvet, elasticated waist, side-seam pockets. Luxurious drape and movement.', category: 'Bottoms', price: 385, discountPrice: null, stock: 20, available: true, imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=400&q=80' },
  { id: 6, name: 'Raw Silk Blouse', description: 'Relaxed fit, hidden button placket, slightly dropped shoulder. Raw texture, refined silhouette.', category: 'Tops', price: 295, discountPrice: null, stock: 25, available: true, imageUrl: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=400&q=80' },
];

const STREETWEAR_PRODUCTS = [
  { id: 1, name: 'Phantom Hoodie', description: 'Heavyweight 400gsm fleece, dropped shoulders, embroidered VOID chest mark. The season\'s hero piece.', category: 'Hoodies', price: 145, discountPrice: null, stock: 50, available: true, imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?auto=format&fit=crop&w=400&q=80' },
  { id: 2, name: 'Void Cargo Pants', description: '8-pocket ripstop cargo, adjustable hem cuffs, utility clip. Relaxed fit, goes with everything.', category: 'Bottoms', price: 165, discountPrice: null, stock: 40, available: true, imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=400&q=80' },
  { id: 3, name: 'Dead Season Cap', description: '6-panel structured, tonal embroidery, adjustable strap. Low-profile and clean.', category: 'Accessories', price: 55, discountPrice: null, stock: 80, available: true, imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=400&q=80' },
  { id: 4, name: 'UV-React Tee', description: 'Heavyweight 260gsm cotton, UV-reactive print that shifts in sunlight. Oversized fit.', category: 'Tops', price: 75, discountPrice: null, stock: 60, available: true, imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=400&q=80' },
  { id: 5, name: 'Tech Fleece Jacket', description: 'Bonded tech fleece, YKK zips, thumb holes. Lightweight warmth with a stealth aesthetic.', category: 'Outerwear', price: 195, discountPrice: 175, stock: 30, available: true, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80' },
  { id: 6, name: 'Reflective Runner Shorts', description: '3M reflective piping, mesh liner, side-seam zip pocket. Made for night runs and street sessions.', category: 'Shorts', price: 85, discountPrice: null, stock: 45, available: true, imageUrl: 'https://images.unsplash.com/photo-1591195853828-11db59a44f43?auto=format&fit=crop&w=400&q=80' },
];

const BOUTIQUE_PRODUCTS = [
  { id: 1, name: 'Linen Midi Dress', description: 'Stone-washed linen, adjustable tie waist, below-the-knee length. Breathable and effortlessly elegant.', category: 'Dresses', price: 195, discountPrice: null, stock: 30, available: true, imageUrl: 'https://images.unsplash.com/photo-1529139574466-a303027614a4?auto=format&fit=crop&w=400&q=80' },
  { id: 2, name: 'Floral Wrap Blouse', description: 'Soft viscose crepe, v-wrap neckline, flutter sleeve. Perfect for any occasion.', category: 'Tops', price: 125, discountPrice: null, stock: 35, available: true, imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=400&q=80' },
  { id: 3, name: 'Wide-Leg Trousers', description: 'Tailored viscose, high-rise waist, wide-leg silhouette. Elevates any casual or smart look.', category: 'Bottoms', price: 165, discountPrice: null, stock: 25, available: true, imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=400&q=80' },
  { id: 4, name: 'Rattan Shoulder Bag', description: 'Handwoven rattan with leather strap and interior pocket. Artisan-made, limited quantity.', category: 'Accessories', price: 145, discountPrice: null, stock: 15, available: true, imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80' },
  { id: 5, name: 'Smocked Sundress', description: 'Shirred bodice, tiered skirt, adjustable straps. Sweet, feminine, and effortless for warm days.', category: 'Dresses', price: 175, discountPrice: 149, stock: 28, available: true, imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80' },
  { id: 6, name: 'Embroidered Linen Set', description: 'Matching button-down shirt and wide-leg trouser in embroidered linen. A complete look in one.', category: 'Sets', price: 245, discountPrice: null, stock: 20, available: true, imageUrl: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=400&q=80' },
];

const STUDIO_PRODUCTS = [
  { id: 1, name: 'Brand Photography', description: 'Full-day shoot, up to 80 final edited images, commercial license included.', category: 'Photography', price: 1200, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1561069934-eee225952461?auto=format&fit=crop&w=400&q=80' },
  { id: 2, name: 'Product Shoot', description: 'Studio-lit product photography, 20 images per SKU, white & lifestyle backgrounds.', category: 'Photography', price: 350, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80' },
  { id: 3, name: 'Corporate Portraits', description: 'Headshots & team shots, 2hr session, 30 final retouched selects.', category: 'Photography', price: 480, discountPrice: 420, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80' },
  { id: 4, name: 'Brand Film', description: '60–90 second hero film, full production, sound design, colour grade.', category: 'Video', price: 3500, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80' },
  { id: 5, name: 'Social Content Pack', description: 'Monthly retainer: 12 photos + 4 short-form reels, platform-optimised.', category: 'Video', price: 900, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=400&q=80' },
  { id: 6, name: 'Creative Direction', description: 'Mood boards, art direction, shot lists, on-shoot styling. Full-day rate.', category: 'Direction', price: 750, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1531951523507-36e43d2e4d3b?auto=format&fit=crop&w=400&q=80' },
];

// ── Template-specific mock stores ──────────────────────────────────────────────

function makeStore(overrides: Omit<Partial<ReturnType<typeof baseStore>['store']>, 'businessType'> & { businessType?: StoreBusinessType }) {
  return { ...baseStore().store, ...overrides };
}

function baseStore() {
  return {
    store: {
      id: 1,
      slug: 'demo',
      shopName: 'Demo Store',
      description: '',
      businessType: 'restaurant' as const,
      businessSubCategorySlug: null as string | null,
      mainBusinessCategoryLabel: 'Restaurant',
      primaryColor: '#6366F1',
      logoUrl: null,
      whatsappNumber: '+1 555 000 0000',
      openingHours: 'Open daily · 9am – 10pm',
      deliveryInfo: 'Delivery & dine-in available',
      currencyCode: 'USD',
      currencySuffix: 'USD',
    },
  };
}

const MOCK_STORES: Record<string, StorefrontData> = {
  'restaurant-default': {
    store: makeStore({ slug: 'demo-restaurant', shopName: 'khanGates Restaurant', description: 'Fresh food made with love, served all day.', primaryColor: '#F5A142', businessSubCategorySlug: null }),
    products: [
      { id: 1, name: 'Spaghetti Pasta', description: 'Classic tomato sauce, parmesan, and fresh basil.', category: 'Mains', price: 14.0, discountPrice: null, stock: 50, available: true, imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=400&q=80' },
      { id: 2, name: 'Vegetable Salad', description: 'Crisp greens, seasonal vegetables, light vinaigrette.', category: 'Starters', price: 11.5, discountPrice: null, stock: 30, available: true, imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80' },
      { id: 3, name: 'Chicken Noodles', description: 'Wok-tossed noodles with tender chicken and vegetables.', category: 'Mains', price: 13.25, discountPrice: null, stock: 40, available: true, imageUrl: 'https://images.unsplash.com/photo-1617093727343-37473b2a0b2a?auto=format&fit=crop&w=400&q=80' },
      { id: 4, name: 'Butter Chicken', description: 'Creamy tomato curry with basmati rice.', category: 'Mains', price: 16.0, discountPrice: null, stock: 25, available: true, imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=400&q=80' },
      { id: 5, name: 'Salmon Salad', description: 'Grilled salmon over mixed greens with citrus dressing.', category: 'Mains', price: 12.0, discountPrice: null, stock: 20, available: true, imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=400&q=80' },
      { id: 6, name: 'Burger Meal', description: 'Beef patty, cheddar, fries, and house sauce.', category: 'Mains', price: 15.5, discountPrice: null, stock: 35, available: true, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80' },
    ],
  },

  'cafe': {
    store: makeStore({ slug: 'demo-cafe', shopName: 'The Corner Café', description: 'Warm coffee and pastries in a cosy setting.', primaryColor: '#FF9800', businessSubCategorySlug: 'cafe' }),
    products: COFFEE_PRODUCTS,
  },

  'coffee-artisan': {
    store: makeStore({ slug: 'demo-coffee-artisan', shopName: 'The Roasted Bean', description: 'Single-origin specialty coffee, hand-crafted with care.', primaryColor: '#A65F3B', businessSubCategorySlug: 'coffee-artisan' }),
    products: COFFEE_PRODUCTS,
  },

  'coffee-urban-rush': {
    store: makeStore({ slug: 'demo-coffee-urban-rush', shopName: 'Urban Rush Coffee', description: 'Fast, fresh, and bold. Get your coffee and go.', primaryColor: '#E85D04', businessSubCategorySlug: 'coffee-urban-rush' }),
    products: COFFEE_PRODUCTS,
  },

  'coffee-cyber-brew': {
    store: makeStore({ slug: 'demo-coffee-cyber-brew', shopName: 'CyberBrew', description: 'Neon-lit boba and fusion brews for the night crowd.', primaryColor: '#00F5FF', businessSubCategorySlug: 'coffee-cyber-brew' }),
    products: [
      { id: 1, name: 'Galaxy Boba', description: 'Ube cloud, cyan drizzle, tapioca pearls.', category: 'Boba', price: 7.50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1525385133512-2f3bdd039bcd?auto=format&fit=crop&w=400&q=80' },
      { id: 2, name: 'Neon Matcha', description: 'Ceremonial matcha, oat milk, neon syrup swirl.', category: 'Matcha', price: 6.50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1515823064-d6e0a0469a8d?auto=format&fit=crop&w=400&q=80' },
      { id: 3, name: 'Cyber Espresso Shot', description: 'Double shot, charcoal ice, citrus zest.', category: 'Espresso', price: 5.00, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1596116793498-bb7ddff35dbe?auto=format&fit=crop&w=400&q=80' },
      { id: 4, name: 'Passionfruit Cooler', description: 'Passionfruit, sparkling water, blue pea flower.', category: 'Cold', price: 6.00, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=400&q=80' },
      { id: 5, name: 'Magenta Latte', description: 'Rose, dragonfruit, steamed oat milk.', category: 'Lattes', price: 6.50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=400&q=80' },
      { id: 6, name: 'Power-Up Affogato', description: 'Vanilla bean gelato, espresso, neon sugar.', category: 'Espresso', price: 8.00, discountPrice: null, stock: 50, available: true, imageUrl: 'https://images.unsplash.com/photo-1517959105821-eaf2591984ca?auto=format&fit=crop&w=400&q=80' },
    ],
  },

  'coffee-green-leaf': {
    store: makeStore({ slug: 'demo-coffee-green-leaf', shopName: 'Green Leaf', description: 'Organic, eco-sourced coffee and plant-based bites.', primaryColor: '#2D6A4F', businessSubCategorySlug: 'coffee-green-leaf' }),
    products: [
      { id: 1, name: 'Ceremonial Matcha', description: 'Stone-ground · oat-friendly · zero rush. Vegan', category: 'Matcha', price: 5.50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1515823064-d6e0a0469a8d?auto=format&fit=crop&w=400&q=80' },
      { id: 2, name: 'Cold Brew Tonic', description: 'Slow-steeped cold brew over tonic water. Organic', category: 'Cold', price: 5.00, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1517959105821-eaf2591984ca?auto=format&fit=crop&w=400&q=80' },
      { id: 3, name: 'Forest Latte', description: 'Ashwagandha, turmeric, oat milk blend. Vegan · Dairy-Free', category: 'Lattes', price: 6.00, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=400&q=80' },
      { id: 4, name: 'Single Origin Filter', description: 'Ethiopia Yirgacheffe · light roast · fruity. Organic', category: 'Filter', price: 4.00, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=400&q=80' },
      { id: 5, name: 'Avocado Toast', description: 'Sourdough, smashed avo, sprouts, seeds. Vegan', category: 'Food', price: 9.50, discountPrice: null, stock: 20, available: true, imageUrl: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c820?auto=format&fit=crop&w=400&q=80' },
      { id: 6, name: 'Granola Bowl', description: 'House granola, coconut yogurt, fresh fruit. Vegan · Dairy-Free', category: 'Food', price: 8.00, discountPrice: null, stock: 15, available: true, imageUrl: 'https://images.unsplash.com/photo-1557837932-64c8e15f7b79?auto=format&fit=crop&w=400&q=80' },
    ],
  },

  'coffee-drive-thru': {
    store: makeStore({ slug: 'demo-coffee-drive-thru', shopName: 'Drive Thru Coffee', description: 'Lane open. Order fast, grab and go.', primaryColor: '#FFEB3B', businessSubCategorySlug: 'coffee-drive-thru' }),
    products: COFFEE_PRODUCTS,
  },

  'coffee-cupping-room': {
    store: makeStore({ slug: 'demo-coffee-cupping-room', shopName: 'The Cupping Room', description: 'A gallery of single-origin lots, curated for connoisseurs.', primaryColor: '#C9A962', businessSubCategorySlug: 'coffee-cupping-room' }),
    products: [
      { id: 1, name: 'Ethiopia Yirgacheffe', description: 'Jasmine · bergamot · honey finish. Lot 42, Natural process.', category: 'Single Origin', price: 7.00, discountPrice: null, stock: 30, available: true, imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=400&q=80' },
      { id: 2, name: 'Guatemala Antigua', description: 'Dark chocolate · brown sugar · light acidity. Washed.', category: 'Single Origin', price: 6.50, discountPrice: null, stock: 25, available: true, imageUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=400&q=80' },
      { id: 3, name: 'Colombia Pink Bourbon', description: 'Rose · raspberry · long clean finish. Honey process.', category: 'Single Origin', price: 8.00, discountPrice: null, stock: 20, available: true, imageUrl: 'https://images.unsplash.com/photo-1596116793498-bb7ddff35dbe?auto=format&fit=crop&w=400&q=80' },
      { id: 4, name: 'House Espresso Blend', description: 'Rich crema, caramel, dark chocolate. Year-round.', category: 'Espresso', price: 4.50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=400&q=80' },
      { id: 5, name: 'Kenya AA', description: 'Blackcurrant · lemon zest · wine-like body. Double washed.', category: 'Single Origin', price: 7.50, discountPrice: null, stock: 15, available: true, imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80' },
    ],
  },

  'coffee-industrial-brew': {
    store: makeStore({ slug: 'demo-coffee-industrial-brew', shopName: 'Industrial Brew', description: 'Raw space. Dark roast. No fuss.', primaryColor: '#000000', businessSubCategorySlug: 'coffee-industrial-brew' }),
    products: COFFEE_PRODUCTS,
  },

  'coffee-blossom': {
    store: makeStore({ slug: 'demo-coffee-blossom', shopName: 'Blossom Café', description: 'A quiet corner for great coffee and soft mornings.', primaryColor: '#C5607A', businessSubCategorySlug: 'coffee-blossom' }),
    products: [
      { id: 1, name: 'Rose Latte', description: 'House espresso, steamed oat milk, real rose syrup.', category: 'Lattes', price: 6.00, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=400&q=80' },
      { id: 2, name: 'Petal Cold Brew', description: '18-hour cold brew, hibiscus tonic, petal ice.', category: 'Cold', price: 6.50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1517959105821-eaf2591984ca?auto=format&fit=crop&w=400&q=80' },
      { id: 3, name: 'Signature Flat White', description: 'Ristretto, velvety microfoam, clean finish.', category: 'Espresso', price: 4.50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=400&q=80' },
      { id: 4, name: 'Honey Matcha', description: 'Ceremonial matcha, oat milk, touch of raw honey.', category: 'Matcha', price: 5.50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1515823064-d6e0a0469a8d?auto=format&fit=crop&w=400&q=80' },
      { id: 5, name: 'Vanilla Drip', description: 'Single-origin filter, light roast, vanilla finish.', category: 'Filter', price: 4.00, discountPrice: 3.50, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=400&q=80' },
      { id: 6, name: 'Lavender Latte', description: 'Espresso, lavender syrup, warm oat milk.', category: 'Lattes', price: 6.00, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=400&q=80' },
      { id: 7, name: 'Strawberry Tart', description: 'Buttery shell, custard cream, fresh strawberries.', category: 'Pastries', price: 5.50, discountPrice: null, stock: 15, available: true, imageUrl: 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?auto=format&fit=crop&w=400&q=80' },
      { id: 8, name: 'Croissant au Beurre', description: 'Laminated dough, pure butter, 72-hour proof.', category: 'Pastries', price: 4.00, discountPrice: null, stock: 20, available: true, imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=400&q=80' },
    ],
  },

  'coffee-tropical-bloom': {
    store: makeStore({ slug: 'demo-coffee-tropical-bloom', shopName: 'Bloom & Brew', description: 'Sun-soaked sips and jungle energy. Your daily escape starts here.', primaryColor: '#FF6B35', businessSubCategorySlug: 'coffee-tropical-bloom' }),
    products: [
      { id: 1, name: 'Mango Cold Brew', description: 'Cold brew, fresh mango syrup, coconut milk, chilli salt rim.', category: 'Cold', price: 7.50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1517959105821-eaf2591984ca?auto=format&fit=crop&w=400&q=80' },
      { id: 2, name: 'Coconut Latte', description: 'Double espresso, toasted coconut milk, pandan syrup.', category: 'Lattes', price: 7.00, discountPrice: 6.00, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=400&q=80' },
      { id: 3, name: 'Sunrise Espresso', description: 'Triple shot, passion fruit foam, citrus zest. Bright & bold.', category: 'Espresso', price: 6.00, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1596116793498-bb7ddff35dbe?auto=format&fit=crop&w=400&q=80' },
      { id: 4, name: 'Pineapple Matcha', description: 'Ceremonial matcha, pineapple juice, oat milk, lime leaf.', category: 'Matcha', price: 7.50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1515823064-d6e0a0469a8d?auto=format&fit=crop&w=400&q=80' },
      { id: 5, name: 'Hibiscus Fizz', description: 'Hibiscus cold brew, sparkling water, ginger, mint. Zero caffeine.', category: 'Cold', price: 6.50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=400&q=80' },
      { id: 6, name: 'Jungle Cappuccino', description: 'Dark roast, wild honey, steamed coconut milk, cacao dust.', category: 'Espresso', price: 6.50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=400&q=80' },
      { id: 7, name: 'Tropical Açaí Bowl', description: 'Frozen açaí, mango, banana, granola, coconut flakes.', category: 'Food', price: 11.00, discountPrice: null, stock: 20, available: true, imageUrl: 'https://images.unsplash.com/photo-1557837932-64c8e15f7b79?auto=format&fit=crop&w=400&q=80' },
      { id: 8, name: 'Banana Passionfruit Cake', description: 'Moist banana cake, passion curd, toasted coconut top.', category: 'Food', price: 7.50, discountPrice: null, stock: 15, available: true, imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=400&q=80' },
    ],
  },

  'coffee-dark-academia': {
    store: makeStore({ slug: 'demo-coffee-dark-academia', shopName: 'The Raven & Roast', description: 'Where every cup is a chapter. Sit. Sip. Lose yourself.', primaryColor: '#C4962A', businessSubCategorySlug: 'coffee-dark-academia' }),
    products: [
      { id: 1, name: 'The Scholar\'s Drip', description: 'Single-origin Ethiopia, light roast, poured slowly. For long hours.', category: 'Filter', price: 5.50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=400&q=80' },
      { id: 2, name: 'Midnight Ristretto', description: 'Ultra-short double shot, syrupy, dark as the last page.', category: 'Espresso', price: 5.00, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1596116793498-bb7ddff35dbe?auto=format&fit=crop&w=400&q=80' },
      { id: 3, name: 'Crimson Latte', description: 'Rose hip syrup, espresso, oat milk. Warm and mysterious.', category: 'Lattes', price: 7.00, discountPrice: 6.00, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=400&q=80' },
      { id: 4, name: 'Amber Cold Brew', description: '20-hour steep, served in aged oak-smoked ice.', category: 'Cold', price: 7.50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1517959105821-eaf2591984ca?auto=format&fit=crop&w=400&q=80' },
      { id: 5, name: 'Librarian\'s Chai', description: 'Cinnamon, clove, cardamom, black tea, warm oat milk.', category: 'Tea', price: 6.00, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1571658986106-af05b9c5d27a?auto=format&fit=crop&w=400&q=80' },
      { id: 6, name: 'Dark Mocha', description: 'Single-origin dark chocolate, double espresso, cream foam.', category: 'Lattes', price: 8.00, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80' },
      { id: 7, name: 'Raven Affogato', description: 'Vanilla bean ice cream drowned in a double ristretto.', category: 'Specialty', price: 8.50, discountPrice: null, stock: 30, available: true, imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=400&q=80' },
      { id: 8, name: 'Spiced Butter Cake', description: 'Brown butter cake, praline, dusted with cinnamon.', category: 'Pastry', price: 6.00, discountPrice: null, stock: 20, available: true, imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=400&q=80' },
    ],
  },

  'coffee-luxury-espresso': {
    store: makeStore({ slug: 'demo-coffee-luxury-espresso', shopName: 'Noir & Gold', description: 'Precision-brewed. Single-origin. An experience, not just a coffee.', primaryColor: '#C9A84C', businessSubCategorySlug: 'coffee-luxury-espresso' }),
    products: [
      { id: 1, name: "L'Espresso Noir", description: 'Double ristretto, dark chocolate finish, obsidian crema.', category: 'Espresso', price: 6.00, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1596116793498-bb7ddff35dbe?auto=format&fit=crop&w=400&q=80' },
      { id: 2, name: 'Grand Cappuccino', description: 'Single-origin, velvety microfoam, served at 68°C.', category: 'Espresso', price: 7.50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=400&q=80' },
      { id: 3, name: 'Affogato Royale', description: 'Tahitian vanilla gelato, double ristretto poured tableside.', category: 'Specialty', price: 9.50, discountPrice: null, stock: 30, available: true, imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80' },
      { id: 4, name: 'Cortado de Luxe', description: 'Espresso and steamed milk 1:1. Clean. Precise.', category: 'Espresso', price: 7.00, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=400&q=80' },
      { id: 5, name: 'Cold Brew Reserve', description: '24-hour steep, single-origin Ethiopia, crystal ice.', category: 'Cold', price: 8.00, discountPrice: null, stock: 50, available: true, imageUrl: 'https://images.unsplash.com/photo-1517959105821-eaf2591984ca?auto=format&fit=crop&w=400&q=80' },
      { id: 6, name: 'Blanc Latte', description: 'White chocolate, oat milk, black truffle salt finish.', category: 'Specialty', price: 8.50, discountPrice: 7.00, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1515823064-d6e0a0469a8d?auto=format&fit=crop&w=400&q=80' },
      { id: 7, name: 'Saffron Flat White', description: 'Ristretto, saffron-infused oat milk, rose water mist.', category: 'Specialty', price: 9.00, discountPrice: null, stock: 40, available: true, imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=400&q=80' },
      { id: 8, name: 'Petite Madeleine', description: 'Warm almond-glazed madeleine, baked to order.', category: 'Pastry', price: 5.50, discountPrice: null, stock: 20, available: true, imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=400&q=80' },
    ],
  },

  'coffee-aurora-brew': {
    store: makeStore({ slug: 'demo-coffee-aurora-brew', shopName: 'Aurora Brew', description: 'Inspired by the northern sky — vivid, rare, unforgettable.', primaryColor: '#00E5C8', businessSubCategorySlug: 'coffee-aurora-brew' }),
    products: [
      { id: 1, name: 'Northern Lights Latte', description: 'Blue pea flower, oat milk, aurora swirl — served cold or warm.', category: 'Signature', price: 7.50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=400&q=80' },
      { id: 2, name: 'Midnight Sun Cold Brew', description: '20-hour steep, citrus zest, served over glacier ice.', category: 'Cold', price: 6.50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1517959105821-eaf2591984ca?auto=format&fit=crop&w=400&q=80' },
      { id: 3, name: 'Boreal Espresso', description: 'Double shot, cedar-smoked ice, clean dark finish.', category: 'Espresso', price: 5.50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1596116793498-bb7ddff35dbe?auto=format&fit=crop&w=400&q=80' },
      { id: 4, name: 'Aurora Matcha', description: 'Ceremonial matcha, oat milk, teal butterfly pea swirl.', category: 'Matcha', price: 7.00, discountPrice: 6.00, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1515823064-d6e0a0469a8d?auto=format&fit=crop&w=400&q=80' },
      { id: 5, name: 'Tundra Cold Brew', description: 'Cold brew, iced pine needle tonic, citrus peel.', category: 'Cold', price: 7.50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80' },
      { id: 6, name: 'Polar Flat White', description: 'Ristretto, steamed oat milk, vanilla frost dust.', category: 'Espresso', price: 6.00, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=400&q=80' },
      { id: 7, name: 'Solstice Chai', description: 'Star anise, cardamom, oat milk — warming like a long summer night.', category: 'Signature', price: 6.50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1571658986106-af05b9c5d27a?auto=format&fit=crop&w=400&q=80' },
      { id: 8, name: 'Fjord Mocha', description: 'Dark chocolate, double espresso, oat milk, black sea salt.', category: 'Signature', price: 8.00, discountPrice: null, stock: 50, available: true, imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=400&q=80' },
    ],
  },

  'coffee-neon-drip': {
    store: makeStore({ slug: 'demo-coffee-neon-drip', shopName: 'Neon Drip', description: 'Stay up late. Drink something electric. Fuel your night.', primaryColor: '#00D9FF', businessSubCategorySlug: 'coffee-neon-drip' }),
    products: [
      { id: 1, name: 'Midnight Espresso', description: 'Triple shot, charcoal ice, obsidian crema. Pure dark energy.', category: 'Espresso', price: 5.00, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1596116793498-bb7ddff35dbe?auto=format&fit=crop&w=400&q=80' },
      { id: 2, name: 'Cyan Surge', description: 'Cold brew, blue pea flower, tonic, electric ice cube.', category: 'Cold', price: 7.50, discountPrice: 6.50, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1517959105821-eaf2591984ca?auto=format&fit=crop&w=400&q=80' },
      { id: 3, name: 'Magenta Flash', description: 'Rose cold brew, hibiscus fizz, neon pink swirl.', category: 'Cold', price: 7.00, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=400&q=80' },
      { id: 4, name: 'Digital Drip', description: 'Single origin pour-over, Ethiopia Yirgacheffe. Served black.', category: 'Filter', price: 6.50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=400&q=80' },
      { id: 5, name: 'Ghost Latte', description: 'White chocolate, black sesame paste, steamed oat milk.', category: 'Lattes', price: 7.50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=400&q=80' },
      { id: 6, name: 'UV Cappuccino', description: 'Butterfly pea espresso, star anise foam, violet dust.', category: 'Espresso', price: 6.50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=400&q=80' },
      { id: 7, name: 'Neon Matcha', description: 'Ceremonial matcha, oat milk, electric green syrup swirl.', category: 'Matcha', price: 7.00, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1515823064-d6e0a0469a8d?auto=format&fit=crop&w=400&q=80' },
      { id: 8, name: 'Hyperspace Mocha', description: 'Dark choc espresso, hazelnut, shimmering cocoa dust.', category: 'Lattes', price: 8.00, discountPrice: null, stock: 50, available: true, imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80' },
    ],
  },

  'coffee-retro-groove': {
    store: makeStore({ slug: 'demo-coffee-retro-groove', shopName: 'Groove & Brew', description: 'Bold roasts and good vibes since day one. Pull up a stool.', primaryColor: '#FF5533', businessSubCategorySlug: 'coffee-retro-groove' }),
    products: [
      { id: 1, name: 'Signature Drip', description: 'House blend, medium roast, smooth everyday cup.', category: 'Filter', price: 4.00, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=400&q=80' },
      { id: 2, name: 'Double Espresso', description: 'Punchy double shot, thick crema, ready in 30 sec.', category: 'Espresso', price: 3.50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1596116793498-bb7ddff35dbe?auto=format&fit=crop&w=400&q=80' },
      { id: 3, name: 'Groove Latte', description: 'House espresso, oat milk, touch of brown sugar syrup.', category: 'Lattes', price: 5.50, discountPrice: 4.80, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=400&q=80' },
      { id: 4, name: 'Iced Brown Sugar Latte', description: 'Espresso, brown sugar, oat milk, over ice.', category: 'Cold', price: 6.00, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1517959105821-eaf2591984ca?auto=format&fit=crop&w=400&q=80' },
      { id: 5, name: 'Flat White', description: 'Ristretto shots, microfoam, bold and velvety.', category: 'Espresso', price: 4.50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=400&q=80' },
      { id: 6, name: 'Vanilla Cold Brew', description: '18-hr steep, house vanilla syrup, shake over ice.', category: 'Cold', price: 6.50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80' },
      { id: 7, name: 'Banana Walnut Loaf', description: 'Moist, buttery, warm from the oven. Slice or whole.', category: 'Food', price: 4.50, discountPrice: null, stock: 20, available: true, imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=400&q=80' },
      { id: 8, name: 'Smashed Avo Toast', description: 'Sourdough, smashed avo, chilli, lemon, seeds.', category: 'Food', price: 9.50, discountPrice: null, stock: 15, available: true, imageUrl: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c820?auto=format&fit=crop&w=400&q=80' },
    ],
  },

  'coffee-matcha-zen': {
    store: makeStore({ slug: 'demo-coffee-matcha-zen', shopName: 'Matcha Zen', description: 'Stillness in every cup. Ceremonial-grade matcha and mindful tea.', primaryColor: '#C5E1A5', businessSubCategorySlug: 'coffee-matcha-zen' }),
    products: [
      { id: 1, name: 'Uji Matcha', description: 'Stone-ground · whisked slow · umami calm. Served cold or hot.', category: 'Matcha', price: 5.50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1515823064-d6e0a0469a8d?auto=format&fit=crop&w=400&q=80' },
      { id: 2, name: 'Houjicha Latte', description: 'Roasted green tea, creamy and low-caffeine.', category: 'Tea', price: 5.00, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1571658986106-af05b9c5d27a?auto=format&fit=crop&w=400&q=80' },
      { id: 3, name: 'Genmaicha', description: 'Green tea with toasted rice. Rustic and grounding.', category: 'Tea', price: 4.50, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=400&q=80' },
      { id: 4, name: 'Cold Matcha', description: 'Ceremonial matcha shaken over ice. Pure.', category: 'Matcha', price: 6.00, discountPrice: null, stock: 99, available: true, imageUrl: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=400&q=80' },
      { id: 5, name: 'Rice Cake', description: 'Mochi-style rice cake with red bean and sesame.', category: 'Food', price: 4.00, discountPrice: null, stock: 30, available: true, imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55c?auto=format&fit=crop&w=400&q=80' },
    ],
  },

  'street-food-pop': {
    store: makeStore({ slug: 'demo-street-food-pop', shopName: 'Street Food Pop', description: 'Loud · messy · delicious. Pop-up energy all day.', primaryColor: '#FF3B30', businessSubCategorySlug: 'street-food-pop' }),
    products: [
      { id: 1, name: 'Smash Burger Box', description: 'Double smash, american cheese, pickles, house sauce.', category: 'Burgers', price: 12.00, discountPrice: null, stock: 50, available: true, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80' },
      { id: 2, name: 'Loaded Fries', description: 'Crispy fries, jalapeño cheese sauce, crispy onions.', category: 'Sides', price: 7.50, discountPrice: null, stock: 40, available: true, imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=400&q=80' },
      { id: 3, name: 'Crispy Chicken Wrap', description: 'Fried chicken, slaw, sriracha mayo, flour tortilla.', category: 'Wraps', price: 10.00, discountPrice: null, stock: 35, available: true, imageUrl: 'https://images.unsplash.com/photo-1561758033-dffb6b0b6020?auto=format&fit=crop&w=400&q=80' },
      { id: 4, name: 'Takoyaki Balls', description: 'Octopus, bonito flakes, mayo, 6-piece.', category: 'Snacks', price: 8.00, discountPrice: null, stock: 30, available: true, imageUrl: 'https://images.unsplash.com/photo-1543826173-1beeb97525d8?auto=format&fit=crop&w=400&q=80' },
      { id: 5, name: 'Mango Sticky Rice', description: 'Fresh mango, coconut cream, toasted sesame.', category: 'Desserts', price: 6.50, discountPrice: null, stock: 25, available: true, imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=400&q=80' },
    ],
  },

  'retail-classic': {
    store: makeStore({ slug: 'demo-retail-classic', shopName: 'Classic Store', description: 'Quality everyday essentials and fashion staples.', primaryColor: '#475569', businessType: 'retail', businessSubCategorySlug: 'retail-classic', mainBusinessCategoryLabel: 'Retail' }),
    products: RETAIL_PRODUCTS,
  },

  'retail-luxe-boutique': {
    store: makeStore({ slug: 'demo-retail-luxe', shopName: 'Maison Éclat', description: 'Curated luxury fashion. Each piece tells a story.', primaryColor: '#8B7355', businessType: 'retail', businessSubCategorySlug: 'retail-luxe-boutique', mainBusinessCategoryLabel: 'Luxury Retail' }),
    products: RETAIL_PRODUCTS,
  },

  'catalog-inquiry': {
    store: makeStore({ slug: 'demo-catalog', shopName: 'Catalog Studio', description: 'Browse our full collection and connect via WhatsApp.', primaryColor: '#6366F1', businessType: 'catalog', businessSubCategorySlug: 'catalog-inquiry', mainBusinessCategoryLabel: 'Catalog' }),
    products: RETAIL_PRODUCTS,
  },

  'real-estate-default': {
    store: makeStore({ slug: 'demo-real-estate', shopName: 'Premier Properties', description: 'Exclusive residential and commercial listings.', primaryColor: '#0EA5E9', businessType: 'real_estate', businessSubCategorySlug: null, mainBusinessCategoryLabel: 'Real Estate' }),
    products: REAL_ESTATE_PRODUCTS,
  },

  'real-estate-open-house': {
    store: makeStore({ slug: 'demo-open-house', shopName: 'Open House Realty', description: 'Discover your perfect home with us.', primaryColor: '#1E3A5F', businessType: 'real_estate', businessSubCategorySlug: 'real-estate-open-house', mainBusinessCategoryLabel: 'Real Estate' }),
    products: REAL_ESTATE_PRODUCTS,
  },

  'real-estate-skyline': {
    store: makeStore({ slug: 'demo-skyline-estate', shopName: 'Skyline Estate', description: 'Ultra-luxury penthouses and exclusive city residences.', primaryColor: '#C5A880', businessType: 'real_estate', businessSubCategorySlug: 'real-estate-skyline', mainBusinessCategoryLabel: 'Luxury Real Estate' }),
    products: REAL_ESTATE_PRODUCTS,
  },

  'real-estate-prestige': {
    store: makeStore({ slug: 'demo-prestige-estate', shopName: 'Meridian Estates', description: 'A curated collection of extraordinary residences. We represent properties of distinction for the most discerning clientele.', primaryColor: '#C9A84C', businessType: 'real_estate', businessSubCategorySlug: 'real-estate-prestige', mainBusinessCategoryLabel: 'Prestige Real Estate' }),
    products: REAL_ESTATE_PRODUCTS,
  },

  'services-hub': {
    store: makeStore({ slug: 'demo-services-hub', shopName: 'ServicePro Hub', description: 'Professional services tailored for your needs.', primaryColor: '#0D9488', businessType: 'services', businessSubCategorySlug: null, mainBusinessCategoryLabel: 'Services' }),
    products: SERVICES_PRODUCTS,
  },

  'services-serenity-spa': {
    store: makeStore({ slug: 'demo-serenity-spa', shopName: 'Serenity Spa & Wellness', description: 'A sanctuary of calm. Book your wellness journey today.', primaryColor: '#B8A9C9', businessType: 'services', businessSubCategorySlug: 'services-serenity-spa', mainBusinessCategoryLabel: 'Wellness & Spa' }),
    products: SPA_SERVICES,
  },

  'burger-restaurant': {
    store: makeStore({ slug: 'demo-burger-restaurant', shopName: 'Smash House', description: 'Juicy smash burgers and crispy fries done right. No fillers, just flavour.', primaryColor: '#F59E0B', businessSubCategorySlug: 'burger-restaurant' }),
    products: BURGER_PRODUCTS,
  },

  'dessert-shop': {
    store: makeStore({ slug: 'demo-dessert-shop', shopName: 'Sugar Atelier', description: 'Handmade pastries, cakes, and confectionery crafted fresh every morning.', primaryColor: '#EC4899', businessSubCategorySlug: 'dessert-shop' }),
    products: DESSERT_PRODUCTS,
  },

  'ramen-shop': {
    store: makeStore({ slug: 'demo-ramen-shop', shopName: 'Tenshu Ramen', description: 'Late-night Tokyo-style ramen. Rich broths, hand-pulled noodles, served until the city sleeps.', primaryColor: '#DC2626', businessSubCategorySlug: 'ramen-shop' }),
    products: RAMEN_PRODUCTS,
  },

  'mediterranean-restaurant': {
    store: makeStore({ slug: 'demo-mediterranean', shopName: 'Agora Bistro', description: 'Family recipes from the Mediterranean coast. Slow food, warm welcome, olive oil on everything.', primaryColor: '#C0562A', businessSubCategorySlug: 'mediterranean-restaurant' }),
    products: MEDITERRANEAN_PRODUCTS,
  },

  'smoothie-bar': {
    store: makeStore({ slug: 'demo-smoothie-bar', shopName: 'Pulse Bar', description: 'Plant-powered fuel for people who move. Bowls, blends, shots, bites — made fresh to order.', primaryColor: '#22C55E', businessSubCategorySlug: 'smoothie-bar' }),
    products: SMOOTHIE_PRODUCTS,
  },

  'korean-grille': {
    store: makeStore({ slug: 'demo-korean-grille', shopName: 'Bulgogi House', description: 'Premium Korean BBQ. Live fire, premium cuts, traditional banchan — grill your own tableside.', primaryColor: '#E91E8C', businessSubCategorySlug: 'korean-grille' }),
    products: KOREAN_PRODUCTS,
  },

  'french-brasserie': {
    store: makeStore({ slug: 'demo-french-brasserie', shopName: 'Maison Laurent', description: 'Classic Parisian brasserie. Timeless French cuisine, fine wines, and warm hospitality since 1948.', primaryColor: '#D4AF37', businessSubCategorySlug: 'french-brasserie' }),
    products: FRENCH_PRODUCTS,
  },

  'real-estate-agency': {
    store: makeStore({ slug: 'demo-real-estate-agency', shopName: 'Vantage Properties', description: 'Award-winning real estate agency specializing in luxury residential and commercial properties. Trusted by thousands of clients across the region since 1999.', primaryColor: '#2C4A3E', businessType: 'real_estate', businessSubCategorySlug: 'real-estate-agency', mainBusinessCategoryLabel: 'Real Estate Agency' }),
    products: REAL_ESTATE_PRODUCTS,
  },

  'real-estate-corporate': {
    store: makeStore({ slug: 'demo-real-estate-corporate', shopName: 'Luminary Realty', description: 'Redefining the standard of luxury real estate. From city-centre apartments to sprawling estates, we match discerning buyers with exceptional properties.', primaryColor: '#C07830', businessType: 'real_estate', businessSubCategorySlug: 'real-estate-corporate', mainBusinessCategoryLabel: 'Real Estate Agency' }),
    products: REAL_ESTATE_PRODUCTS,
  },

  'real-estate-noir': {
    store: makeStore({ slug: 'demo-real-estate-noir', shopName: 'Eclipse Estate', description: 'Where prestige meets the shadows. Eclipse Estate curates the rarest properties for those who expect nothing less than extraordinary.', primaryColor: '#C9A87A', businessType: 'real_estate', businessSubCategorySlug: 'real-estate-noir', mainBusinessCategoryLabel: 'Luxury Real Estate' }),
    products: REAL_ESTATE_PRODUCTS,
  },

  'real-estate-bold': {
    store: makeStore({ slug: 'demo-real-estate-bold', shopName: 'Apex Realty', description: 'Bold results for buyers, sellers, and investors. No fluff — just expertise, hustle, and deals that close.', primaryColor: '#1040C0', businessType: 'real_estate', businessSubCategorySlug: 'real-estate-bold', mainBusinessCategoryLabel: 'Real Estate Agency' }),
    products: REAL_ESTATE_PRODUCTS,
  },

  'real-estate-soleil': {
    store: makeStore({ slug: 'demo-real-estate-soleil', shopName: 'Soleil Estates', description: 'Two decades of expertise placing discerning clients in exceptional properties. Warm, personal, and relentlessly professional.', primaryColor: '#D4A853', businessType: 'real_estate', businessSubCategorySlug: 'real-estate-soleil', mainBusinessCategoryLabel: 'Luxury Real Estate' }),
    products: REAL_ESTATE_PRODUCTS,
  },

  'real-estate-axiom': {
    store: makeStore({ slug: 'demo-real-estate-axiom', shopName: 'Axiom Properties', description: 'Premier real estate agency. Proven results. Two decades of deals that matter — no fluff, no delays, just closed.', primaryColor: '#E62020', businessType: 'real_estate', businessSubCategorySlug: 'real-estate-axiom', mainBusinessCategoryLabel: 'Real Estate Agency' }),
    products: REAL_ESTATE_PRODUCTS,
  },

  'services-meridian': {
    store: makeStore({ slug: 'demo-services-meridian', shopName: 'Meridian Advisory', description: 'Expert advisory services that cut through complexity and deliver measurable outcomes for ambitious organisations across every sector.', primaryColor: '#C08B45', businessType: 'services', businessSubCategorySlug: 'services-meridian', mainBusinessCategoryLabel: 'Professional Services' }),
    products: SERVICES_PRODUCTS,
  },

  'services-volt': {
    store: makeStore({ slug: 'demo-services-volt', shopName: 'Volt Studio', description: 'Branding, web design, digital strategy, and creative production — all under one roof, with zero compromise on quality.', primaryColor: '#A8FF00', businessType: 'services', businessSubCategorySlug: 'services-volt', mainBusinessCategoryLabel: 'Creative Agency' }),
    products: SERVICES_PRODUCTS,
  },

  'services-wellness': {
    store: makeStore({ slug: 'demo-services-wellness', shopName: 'Aurora Wellness', description: 'Personalised wellness programmes, expert practitioners, and a warm community — everything you need to feel and live better.', primaryColor: '#C26845', businessType: 'services', businessSubCategorySlug: 'services-wellness', mainBusinessCategoryLabel: 'Wellness Studio' }),
    products: SPA_SERVICES,
  },

  'services-studio': {
    store: makeStore({ slug: 'demo-services-studio', shopName: 'Obsidian Studio', description: 'Award-winning photography and visual media production for brands that refuse to be ordinary. We make images that move.', primaryColor: '#E8001C', businessType: 'services', businessSubCategorySlug: 'services-studio', mainBusinessCategoryLabel: 'Photography Studio' }),
    products: STUDIO_PRODUCTS,
  },

  'medical-clinic': {
    store: makeStore({ slug: 'demo-medical-clinic', shopName: 'Vitalis Medical Centre', description: 'Comprehensive medical care from diagnosis to treatment. Expert doctors, advanced diagnostics, and genuine care for every patient.', primaryColor: '#2E86DE', businessType: 'medical', businessSubCategorySlug: 'medical-clinic', mainBusinessCategoryLabel: 'Medical Centre' }),
    products: CLINIC_SERVICES,
  },

  'medical-pharmacy': {
    store: makeStore({ slug: 'demo-medical-pharmacy', shopName: 'PharmaPlus', description: 'Premium medicines, supplements, and health products — dispensed by expert pharmacists and delivered to your door, same day.', primaryColor: '#00875A', businessType: 'medical', businessSubCategorySlug: 'medical-pharmacy', mainBusinessCategoryLabel: 'Pharmacy & Health' }),
    products: PHARMACY_PRODUCTS,
  },

  'medical-premium': {
    store: makeStore({ slug: 'demo-medical-premium', shopName: 'Lumiere Aesthetics', description: 'Clinician-led aesthetic treatments combining medical precision with an artist\'s eye. Subtle, natural, transformative results.', primaryColor: '#C4A35A', businessType: 'medical', businessSubCategorySlug: 'medical-premium', mainBusinessCategoryLabel: 'Aesthetic Clinic' }),
    products: PREMIUM_MEDICAL_SERVICES,
  },

  'clothing-editorial': {
    store: makeStore({ slug: 'demo-clothing-editorial', shopName: 'Maison Noir', description: 'Each piece is a collaboration between tradition and modernity — crafted in our Paris atelier for those who understand the language of cloth.', primaryColor: '#C4A55A', businessType: 'clothing', businessSubCategorySlug: 'clothing-editorial', mainBusinessCategoryLabel: 'Fashion House' }),
    products: EDITORIAL_PRODUCTS,
  },

  'clothing-streetwear': {
    store: makeStore({ slug: 'demo-clothing-streetwear', shopName: 'VOID DRIP', description: 'Designed for those who live outside the system. Limited pieces. No restocks. Get yours before it\'s gone.', primaryColor: '#D4F500', businessType: 'clothing', businessSubCategorySlug: 'clothing-streetwear', mainBusinessCategoryLabel: 'Streetwear' }),
    products: STREETWEAR_PRODUCTS,
  },

  'clothing-boutique': {
    store: makeStore({ slug: 'demo-clothing-boutique', shopName: 'Petal Studio', description: 'Thoughtfully designed women\'s clothing for those who move through life with intention. Each piece crafted to be worn again and again.', primaryColor: '#9B7060', businessType: 'clothing', businessSubCategorySlug: 'clothing-boutique', mainBusinessCategoryLabel: 'Women\'s Boutique' }),
    products: BOUTIQUE_PRODUCTS,
  },
};

// Food variants use the restaurant-default template with cuisine presets
const FOOD_ALIASES: Record<string, string> = {
  'pizza-restaurant': 'restaurant-default',
  'chinese-restaurant': 'restaurant-default',
  'fast-food': 'restaurant-default',
  'healthy-food': 'restaurant-default',
  'seafood-restaurant': 'restaurant-default',
  'breakfast-restaurant': 'restaurant-default',
};

export function getMockStore(templateId: string): StorefrontData {
  const resolvedId = FOOD_ALIASES[templateId] ?? templateId;
  if (MOCK_STORES[resolvedId]) return MOCK_STORES[resolvedId];

  // For food aliases, return a customized restaurant-default store
  const subCategoryOverrides: Record<string, { shopName: string; description: string; primaryColor: string; businessSubCategorySlug: string }> = {
    'pizza-restaurant': { shopName: 'Fired Oven', description: 'Wood-fired pizza, handmade dough, daily.', primaryColor: '#E85D4C', businessSubCategorySlug: 'pizza-restaurant' },
    'chinese-restaurant': { shopName: 'Golden Dragon', description: 'Authentic Chinese cuisine, family recipes.', primaryColor: '#C41E3A', businessSubCategorySlug: 'chinese-restaurant' },
    'fast-food': { shopName: 'Quick Counter', description: 'Hot food ready in minutes.', primaryColor: '#EF4444', businessSubCategorySlug: 'fast-food' },
    'healthy-food': { shopName: 'Garden Kitchen', description: 'Fresh bowls and plates for a better day.', primaryColor: '#16A34A', businessSubCategorySlug: 'healthy-food' },
    'seafood-restaurant': { shopName: 'Harbor & Tide', description: 'Daily dock catch, grilled to order.', primaryColor: '#0EA5E9', businessSubCategorySlug: 'seafood-restaurant' },
    'breakfast-restaurant': { shopName: 'Sunrise Table', description: 'Morning plates and all-day brunch.', primaryColor: '#F59E0B', businessSubCategorySlug: 'breakfast-restaurant' },
  };

  const base = MOCK_STORES['restaurant-default'];
  const override = subCategoryOverrides[templateId];
  if (override) {
    return {
      ...base,
      store: { ...base.store, ...override },
    };
  }

  return base;
}

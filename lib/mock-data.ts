import type {
  Store, User, Product, ProductCategory, Order, OrderItem,
  Customer, DeliveryZone, InventoryItem, SalesDataPoint,
  CategoryRevenue, ReportSummary, Appointment,
} from './types';

// ── Store ─────────────────────────────────────────────────────────────────────

export const mockStore: Store = {
  id: 'store-001',
  name: 'khanGates Demo Store',
  slug: 'demo-store',
  businessType: 'restaurant',
  category: 'Fast Food',
  description: 'The best burgers and fries in town.',
  phone: '+60 12-345 6789',
  email: 'hello@khanGates.my',
  address: '123 Jalan Bukit Bintang, Kuala Lumpur, 55100',
  currency: 'MYR',
  timezone: 'Asia/Kuala_Lumpur',
  status: 'active',
  theme: 'restaurant-default',
  createdAt: '2024-01-15T08:00:00Z',
};

export const mockUser: User = {
  id: 'user-001',
  name: 'Ahmad Farid',
  email: 'farid@khanGates.my',
  role: 'owner',
};

// ── Categories ────────────────────────────────────────────────────────────────

export const mockCategories: ProductCategory[] = [
  { id: 'cat-1', name: 'Burgers', slug: 'burgers' },
  { id: 'cat-2', name: 'Pizzas', slug: 'pizzas' },
  { id: 'cat-3', name: 'Sides', slug: 'sides' },
  { id: 'cat-4', name: 'Drinks', slug: 'drinks' },
  { id: 'cat-5', name: 'Desserts', slug: 'desserts' },
];

// ── Products ──────────────────────────────────────────────────────────────────

export const mockProducts: Product[] = [
  { id: 'p-1', name: 'Classic Beef Burger', description: 'Juicy beef patty with fresh veggies and our signature sauce.', price: 12.90, comparePrice: 15.90, category: 'Burgers', categoryId: 'cat-1', images: [], stock: 45, sku: 'BUR-001', status: 'active', featured: true, tags: ['bestseller', 'halal'], createdAt: '2024-01-15T08:00:00Z', updatedAt: '2024-06-01T10:00:00Z' },
  { id: 'p-2', name: 'Double Smash Burger', description: 'Two smashed patties, double cheese, caramelised onions.', price: 18.90, category: 'Burgers', categoryId: 'cat-1', images: [], stock: 30, sku: 'BUR-002', status: 'active', featured: true, tags: ['new', 'halal'], createdAt: '2024-02-01T08:00:00Z', updatedAt: '2024-06-01T10:00:00Z' },
  { id: 'p-3', name: 'Spicy Chicken Burger', description: 'Crispy fried chicken with sriracha mayo.', price: 13.90, category: 'Burgers', categoryId: 'cat-1', images: [], stock: 0, sku: 'BUR-003', status: 'out_of_stock', featured: false, tags: ['spicy', 'halal'], createdAt: '2024-02-10T08:00:00Z', updatedAt: '2024-06-01T10:00:00Z' },
  { id: 'p-4', name: 'Margherita Pizza', description: 'Classic tomato, mozzarella and basil.', price: 22.90, category: 'Pizzas', categoryId: 'cat-2', images: [], stock: 20, sku: 'PIZ-001', status: 'active', featured: false, tags: ['vegetarian'], createdAt: '2024-03-01T08:00:00Z', updatedAt: '2024-06-01T10:00:00Z' },
  { id: 'p-5', name: 'BBQ Chicken Pizza', description: 'Smoky BBQ sauce, grilled chicken, red onion.', price: 26.90, category: 'Pizzas', categoryId: 'cat-2', images: [], stock: 15, sku: 'PIZ-002', status: 'active', featured: true, tags: ['halal'], createdAt: '2024-03-05T08:00:00Z', updatedAt: '2024-06-01T10:00:00Z' },
  { id: 'p-6', name: 'Crispy Fries (M)', description: 'Golden crispy fries, lightly salted.', price: 5.90, category: 'Sides', categoryId: 'cat-3', images: [], stock: 100, sku: 'SID-001', status: 'active', featured: false, tags: ['vegetarian', 'halal'], createdAt: '2024-01-15T08:00:00Z', updatedAt: '2024-06-01T10:00:00Z' },
  { id: 'p-7', name: 'Onion Rings', description: 'Beer-battered crispy onion rings.', price: 7.90, category: 'Sides', categoryId: 'cat-3', images: [], stock: 60, sku: 'SID-002', status: 'active', featured: false, tags: ['vegetarian'], createdAt: '2024-01-20T08:00:00Z', updatedAt: '2024-06-01T10:00:00Z' },
  { id: 'p-8', name: 'Mango Lassi', description: 'Fresh mango blended with yoghurt.', price: 6.90, category: 'Drinks', categoryId: 'cat-4', images: [], stock: 8, sku: 'DRK-001', status: 'active', featured: false, tags: ['vegetarian', 'halal'], createdAt: '2024-04-01T08:00:00Z', updatedAt: '2024-06-01T10:00:00Z' },
  { id: 'p-9', name: 'Chocolate Lava Cake', description: 'Warm gooey chocolate cake with vanilla ice cream.', price: 9.90, category: 'Desserts', categoryId: 'cat-5', images: [], stock: 25, sku: 'DES-001', status: 'active', featured: true, tags: ['vegetarian'], createdAt: '2024-04-10T08:00:00Z', updatedAt: '2024-06-01T10:00:00Z' },
  { id: 'p-10', name: 'Coke (Can)', description: '330ml Coca-Cola can.', price: 3.50, category: 'Drinks', categoryId: 'cat-4', images: [], stock: 200, sku: 'DRK-002', status: 'inactive', featured: false, tags: [], createdAt: '2024-01-15T08:00:00Z', updatedAt: '2024-06-01T10:00:00Z' },
];

// ── Orders ────────────────────────────────────────────────────────────────────

const makeItems = (items: Array<[string, string, number, number]>): OrderItem[] =>
  items.map(([id, name, qty, price]) => ({
    id: `oi-${id}`,
    productId: id,
    productName: name,
    quantity: qty,
    unitPrice: price,
    totalPrice: qty * price,
  }));

export const mockOrders: Order[] = [
  { id: 'ord-001', orderNumber: '#1001', customerId: 'cus-1', customerName: 'Nurul Ain', customerPhone: '+60 11-1234 5678', customerEmail: 'ain@email.com', items: makeItems([['p-1', 'Classic Beef Burger', 2, 12.90], ['p-6', 'Crispy Fries (M)', 2, 5.90]]), subtotal: 37.60, deliveryFee: 5.00, discount: 0, tax: 0, total: 42.60, status: 'delivered', paymentStatus: 'paid', paymentMethod: 'online', fulfillmentType: 'delivery', deliveryAddress: 'No. 5, Jalan Ampang, KL', createdAt: '2024-06-05T09:15:00Z', updatedAt: '2024-06-05T10:30:00Z' },
  { id: 'ord-002', orderNumber: '#1002', customerId: 'cus-2', customerName: 'Hafiz Rahman', customerPhone: '+60 12-8765 4321', customerEmail: 'hafiz@email.com', items: makeItems([['p-2', 'Double Smash Burger', 1, 18.90], ['p-7', 'Onion Rings', 1, 7.90], ['p-10', 'Coke (Can)', 2, 3.50]]), subtotal: 33.80, deliveryFee: 0, discount: 0, tax: 0, total: 33.80, status: 'preparing', paymentStatus: 'paid', paymentMethod: 'card', fulfillmentType: 'pickup', createdAt: '2024-06-05T11:00:00Z', updatedAt: '2024-06-05T11:10:00Z' },
  { id: 'ord-003', orderNumber: '#1003', customerId: 'cus-3', customerName: 'Siti Rahayu', customerPhone: '+60 17-5555 9999', customerEmail: 'siti@email.com', items: makeItems([['p-4', 'Margherita Pizza', 1, 22.90], ['p-9', 'Chocolate Lava Cake', 2, 9.90]]), subtotal: 42.70, deliveryFee: 5.00, discount: 5.00, tax: 0, total: 42.70, status: 'pending', paymentStatus: 'unpaid', paymentMethod: 'cash', fulfillmentType: 'delivery', deliveryAddress: '88, Jalan Cheras, KL', createdAt: '2024-06-05T12:30:00Z', updatedAt: '2024-06-05T12:30:00Z' },
  { id: 'ord-004', orderNumber: '#1004', customerId: 'cus-4', customerName: 'Zulkifli Omar', customerPhone: '+60 13-2222 7777', customerEmail: 'zul@email.com', items: makeItems([['p-5', 'BBQ Chicken Pizza', 2, 26.90]]), subtotal: 53.80, deliveryFee: 5.00, discount: 0, tax: 0, total: 58.80, status: 'confirmed', paymentStatus: 'paid', paymentMethod: 'online', fulfillmentType: 'delivery', deliveryAddress: 'Unit 12A, KLCC, KL', createdAt: '2024-06-05T13:05:00Z', updatedAt: '2024-06-05T13:07:00Z' },
  { id: 'ord-005', orderNumber: '#1005', customerId: 'cus-5', customerName: 'Wan Faizal', customerPhone: '+60 19-3333 8888', customerEmail: 'wan@email.com', items: makeItems([['p-1', 'Classic Beef Burger', 3, 12.90], ['p-6', 'Crispy Fries (M)', 3, 5.90], ['p-8', 'Mango Lassi', 3, 6.90]]), subtotal: 77.10, deliveryFee: 0, discount: 0, tax: 0, total: 77.10, status: 'out_for_delivery', paymentStatus: 'paid', paymentMethod: 'wallet', fulfillmentType: 'delivery', deliveryAddress: '22, Jalan Duta, KL', createdAt: '2024-06-05T13:45:00Z', updatedAt: '2024-06-05T14:00:00Z' },
  { id: 'ord-006', orderNumber: '#1006', customerId: 'cus-1', customerName: 'Nurul Ain', customerPhone: '+60 11-1234 5678', customerEmail: 'ain@email.com', items: makeItems([['p-9', 'Chocolate Lava Cake', 1, 9.90]]), subtotal: 9.90, deliveryFee: 5.00, discount: 0, tax: 0, total: 14.90, status: 'cancelled', paymentStatus: 'refunded', paymentMethod: 'online', fulfillmentType: 'delivery', deliveryAddress: 'No. 5, Jalan Ampang, KL', createdAt: '2024-06-04T18:00:00Z', updatedAt: '2024-06-04T18:30:00Z' },
  { id: 'ord-007', orderNumber: '#1007', customerId: 'cus-6', customerName: 'Priya Sharma', customerPhone: '+60 16-4444 2222', customerEmail: 'priya@email.com', items: makeItems([['p-2', 'Double Smash Burger', 2, 18.90], ['p-7', 'Onion Rings', 2, 7.90]]), subtotal: 53.60, deliveryFee: 5.00, discount: 0, tax: 0, total: 58.60, status: 'delivered', paymentStatus: 'paid', paymentMethod: 'card', fulfillmentType: 'delivery', deliveryAddress: 'Bangsar South, KL', createdAt: '2024-06-04T20:00:00Z', updatedAt: '2024-06-04T21:15:00Z' },
  { id: 'ord-008', orderNumber: '#1008', customerId: 'cus-7', customerName: 'Lee Wei Ming', customerPhone: '+60 10-6666 3333', customerEmail: 'wei@email.com', items: makeItems([['p-5', 'BBQ Chicken Pizza', 1, 26.90], ['p-4', 'Margherita Pizza', 1, 22.90]]), subtotal: 49.80, deliveryFee: 0, discount: 0, tax: 0, total: 49.80, status: 'ready', paymentStatus: 'paid', paymentMethod: 'online', fulfillmentType: 'pickup', createdAt: '2024-06-05T14:20:00Z', updatedAt: '2024-06-05T14:35:00Z' },
];

// ── Customers ─────────────────────────────────────────────────────────────────

export const mockCustomers: Customer[] = [
  { id: 'cus-1', name: 'Nurul Ain', email: 'ain@email.com', phone: '+60 11-1234 5678', address: 'No. 5, Jalan Ampang, KL', totalOrders: 8, totalSpent: 312.40, lastOrderAt: '2024-06-05T09:15:00Z', tags: ['vip', 'regular'], notes: 'Prefers extra sauce', createdAt: '2024-02-01T08:00:00Z' },
  { id: 'cus-2', name: 'Hafiz Rahman', email: 'hafiz@email.com', phone: '+60 12-8765 4321', totalOrders: 5, totalSpent: 198.70, lastOrderAt: '2024-06-05T11:00:00Z', tags: ['regular'], createdAt: '2024-03-10T08:00:00Z' },
  { id: 'cus-3', name: 'Siti Rahayu', email: 'siti@email.com', phone: '+60 17-5555 9999', address: '88, Jalan Cheras, KL', totalOrders: 3, totalSpent: 89.60, lastOrderAt: '2024-06-05T12:30:00Z', tags: [], createdAt: '2024-04-15T08:00:00Z' },
  { id: 'cus-4', name: 'Zulkifli Omar', email: 'zul@email.com', phone: '+60 13-2222 7777', address: 'KLCC, KL', totalOrders: 12, totalSpent: 587.20, lastOrderAt: '2024-06-05T13:05:00Z', tags: ['vip', 'corporate'], notes: 'Usually orders for team lunches', createdAt: '2024-01-20T08:00:00Z' },
  { id: 'cus-5', name: 'Wan Faizal', email: 'wan@email.com', phone: '+60 19-3333 8888', address: 'Jalan Duta, KL', totalOrders: 6, totalSpent: 245.80, lastOrderAt: '2024-06-05T13:45:00Z', tags: ['regular'], createdAt: '2024-03-01T08:00:00Z' },
  { id: 'cus-6', name: 'Priya Sharma', email: 'priya@email.com', phone: '+60 16-4444 2222', address: 'Bangsar South, KL', totalOrders: 4, totalSpent: 178.40, lastOrderAt: '2024-06-04T20:00:00Z', tags: [], createdAt: '2024-04-01T08:00:00Z' },
  { id: 'cus-7', name: 'Lee Wei Ming', email: 'wei@email.com', phone: '+60 10-6666 3333', totalOrders: 2, totalSpent: 99.60, lastOrderAt: '2024-06-05T14:20:00Z', tags: ['new'], createdAt: '2024-06-01T08:00:00Z' },
];

// ── Delivery Zones ────────────────────────────────────────────────────────────

export const mockDeliveryZones: DeliveryZone[] = [
  { id: 'zone-1', name: 'Zone A — City Centre', areas: ['KLCC', 'Bukit Bintang', 'Chow Kit', 'Masjid India'], minOrder: 20, deliveryFee: 5.00, estimatedTime: '20–30 min', isActive: true },
  { id: 'zone-2', name: 'Zone B — Mid-Ring', areas: ['Bangsar', 'Damansara', 'Mont Kiara', 'Desa Park City'], minOrder: 30, deliveryFee: 7.00, estimatedTime: '30–45 min', isActive: true },
  { id: 'zone-3', name: 'Zone C — Outer Ring', areas: ['Subang Jaya', 'Shah Alam', 'Petaling Jaya'], minOrder: 50, deliveryFee: 10.00, estimatedTime: '45–60 min', isActive: false },
];

// ── Inventory ─────────────────────────────────────────────────────────────────

export const mockInventory: InventoryItem[] = [
  { id: 'inv-1', productId: 'p-1', productName: 'Classic Beef Burger', sku: 'BUR-001', category: 'Burgers', currentStock: 45, lowStockThreshold: 10, reorderQty: 50, unitCost: 5.50, stockStatus: 'in_stock', lastUpdated: '2024-06-05T08:00:00Z' },
  { id: 'inv-2', productId: 'p-2', productName: 'Double Smash Burger', sku: 'BUR-002', category: 'Burgers', currentStock: 30, lowStockThreshold: 10, reorderQty: 40, unitCost: 7.80, stockStatus: 'in_stock', lastUpdated: '2024-06-05T08:00:00Z' },
  { id: 'inv-3', productId: 'p-3', productName: 'Spicy Chicken Burger', sku: 'BUR-003', category: 'Burgers', currentStock: 0, lowStockThreshold: 10, reorderQty: 40, unitCost: 5.20, stockStatus: 'out_of_stock', lastUpdated: '2024-06-04T18:00:00Z' },
  { id: 'inv-4', productId: 'p-4', productName: 'Margherita Pizza', sku: 'PIZ-001', category: 'Pizzas', currentStock: 20, lowStockThreshold: 5, reorderQty: 30, unitCost: 9.00, stockStatus: 'in_stock', lastUpdated: '2024-06-05T08:00:00Z' },
  { id: 'inv-5', productId: 'p-5', productName: 'BBQ Chicken Pizza', sku: 'PIZ-002', category: 'Pizzas', currentStock: 15, lowStockThreshold: 5, reorderQty: 30, unitCost: 11.00, stockStatus: 'in_stock', lastUpdated: '2024-06-05T08:00:00Z' },
  { id: 'inv-6', productId: 'p-6', productName: 'Crispy Fries (M)', sku: 'SID-001', category: 'Sides', currentStock: 100, lowStockThreshold: 20, reorderQty: 100, unitCost: 1.50, stockStatus: 'in_stock', lastUpdated: '2024-06-05T08:00:00Z' },
  { id: 'inv-7', productId: 'p-7', productName: 'Onion Rings', sku: 'SID-002', category: 'Sides', currentStock: 8, lowStockThreshold: 10, reorderQty: 50, unitCost: 2.50, stockStatus: 'low_stock', lastUpdated: '2024-06-05T08:00:00Z' },
  { id: 'inv-8', productId: 'p-8', productName: 'Mango Lassi', sku: 'DRK-001', category: 'Drinks', currentStock: 8, lowStockThreshold: 10, reorderQty: 30, unitCost: 2.20, stockStatus: 'low_stock', lastUpdated: '2024-06-05T08:00:00Z' },
  { id: 'inv-9', productId: 'p-9', productName: 'Chocolate Lava Cake', sku: 'DES-001', category: 'Desserts', currentStock: 25, lowStockThreshold: 5, reorderQty: 30, unitCost: 4.00, stockStatus: 'in_stock', lastUpdated: '2024-06-05T08:00:00Z' },
  { id: 'inv-10', productId: 'p-10', productName: 'Coke (Can)', sku: 'DRK-002', category: 'Drinks', currentStock: 200, lowStockThreshold: 30, reorderQty: 100, unitCost: 1.20, stockStatus: 'in_stock', lastUpdated: '2024-06-05T08:00:00Z' },
];

// ── Reports ───────────────────────────────────────────────────────────────────

export const mockSalesData: SalesDataPoint[] = [
  { date: '2024-05-27', revenue: 412.50, orders: 11, avgOrderValue: 37.50 },
  { date: '2024-05-28', revenue: 588.20, orders: 15, avgOrderValue: 39.21 },
  { date: '2024-05-29', revenue: 345.80, orders: 9, avgOrderValue: 38.42 },
  { date: '2024-05-30', revenue: 721.40, orders: 18, avgOrderValue: 40.08 },
  { date: '2024-05-31', revenue: 893.60, orders: 22, avgOrderValue: 40.62 },
  { date: '2024-06-01', revenue: 650.30, orders: 16, avgOrderValue: 40.64 },
  { date: '2024-06-02', revenue: 478.90, orders: 12, avgOrderValue: 39.91 },
  { date: '2024-06-03', revenue: 534.10, orders: 14, avgOrderValue: 38.15 },
  { date: '2024-06-04', revenue: 812.70, orders: 20, avgOrderValue: 40.64 },
  { date: '2024-06-05', revenue: 967.40, orders: 24, avgOrderValue: 40.31 },
];

export const mockCategoryRevenue: CategoryRevenue[] = [
  { category: 'Burgers', revenue: 2340.80, orders: 58, percentage: 38 },
  { category: 'Pizzas', revenue: 1820.40, orders: 32, percentage: 30 },
  { category: 'Sides', revenue: 890.20, orders: 74, percentage: 15 },
  { category: 'Drinks', revenue: 612.50, orders: 89, percentage: 10 },
  { category: 'Desserts', revenue: 441.60, orders: 45, percentage: 7 },
];

export const mockReportSummary: ReportSummary = {
  totalRevenue: 6105.50,
  totalOrders: 161,
  avgOrderValue: 37.92,
  totalCustomers: 87,
  revenueChange: 12.4,
  ordersChange: 8.7,
  customersChange: 5.2,
  avgOrderChange: 3.4,
};

// ── Appointments ──────────────────────────────────────────────────────────────

export const mockAppointments: Appointment[] = [
  { id: 'apt-1', customerId: 'cus-1', customerName: 'Nurul Ain', customerPhone: '+60 11-1234 5678', service: 'Haircut & Styling', staffMember: 'Sara', date: '2024-06-06', time: '10:00', duration: 60, status: 'confirmed', price: 85.00, createdAt: '2024-06-01T08:00:00Z' },
  { id: 'apt-2', customerId: 'cus-2', customerName: 'Hafiz Rahman', customerPhone: '+60 12-8765 4321', service: 'Beard Trim', staffMember: 'Ali', date: '2024-06-06', time: '11:30', duration: 30, status: 'scheduled', price: 35.00, createdAt: '2024-06-02T08:00:00Z' },
  { id: 'apt-3', customerId: 'cus-3', customerName: 'Siti Rahayu', customerPhone: '+60 17-5555 9999', service: 'Full Package', staffMember: 'Sara', date: '2024-06-05', time: '14:00', duration: 120, status: 'completed', price: 150.00, createdAt: '2024-06-01T08:00:00Z' },
];

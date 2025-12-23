// lib/data/terminalMaps.ts
// Terminal 3 Abu Dhabi Airport - Complete POI Database (Part 1 of 3)

export type POICategory = 
  | 'gate' | 'dining' | 'retail' | 'service' | 'facility' 
  | 'transportation' | 'lounge' | 'security';

export type Level = 'departure' | 'arrival' | 'both';

export interface Coordinates {
  x: number;
  y: number;
  level: Level;
}

export interface POI {
  id: string;
  name: string;
  category: POICategory;
  subcategory?: string;
  terminal: string;
  coordinates: Coordinates;
  description?: string;
  operatingHours?: string;
  accessibility?: boolean;
  keywords: string[];
  connectedTo?: string[];
}

// Complete POI list - 95 total locations
export const terminal3POIs: POI[] = [
  // GATES (30) - Concourses A, B, C
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `gate_a${i + 1}`,
    name: `Gate A${i + 1}`,
    category: 'gate' as POICategory,
    terminal: 'T3',
    coordinates: { 
      x: 900 + (i % 5) * 50, 
      y: 150 + Math.floor(i / 5) * 50, 
      level: 'departure' as Level 
    },
    accessibility: true,
    keywords: ['gate', `a${i + 1}`, 'departure', 'boarding'],
    connectedTo: i > 0 ? [`gate_a${i}`] : []
  })),
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `gate_b${i + 1}`,
    name: `Gate B${i + 1}`,
    category: 'gate' as POICategory,
    terminal: 'T3',
    coordinates: { 
      x: 500 + (i % 5) * 50, 
      y: 300 + Math.floor(i / 5) * 50, 
      level: 'departure' as Level 
    },
    accessibility: true,
    keywords: ['gate', `b${i + 1}`, 'departure', 'boarding'],
    connectedTo: i > 0 ? [`gate_b${i}`] : []
  })),
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `gate_c${i + 1}`,
    name: `Gate C${i + 1}`,
    category: 'gate' as POICategory,
    terminal: 'T3',
    coordinates: { 
      x: 100 + (i % 5) * 50, 
      y: 450 + Math.floor(i / 5) * 50, 
      level: 'departure' as Level 
    },
    accessibility: true,
    keywords: ['gate', `c${i + 1}`, 'departure', 'boarding'],
    connectedTo: i > 0 ? [`gate_c${i}`] : []
  })),

  // DINING (20)
  { id: 'dining_costa_a', name: 'Costa Coffee', category: 'dining', subcategory: 'cafe',
    terminal: 'T3', coordinates: { x: 850, y: 175, level: 'departure' },
    description: 'Coffee and pastries', operatingHours: '24/7', accessibility: true,
    keywords: ['coffee', 'cafe', 'costa', 'breakfast', 'snacks'] },
  { id: 'dining_starbucks_main', name: 'Starbucks', category: 'dining', subcategory: 'cafe',
    terminal: 'T3', coordinates: { x: 600, y: 250, level: 'departure' },
    operatingHours: '24/7', accessibility: true,
    keywords: ['coffee', 'starbucks', 'wifi', 'tea', 'breakfast'] },
  { id: 'dining_shake_shack', name: 'Shake Shack', category: 'dining', subcategory: 'fast_food',
    terminal: 'T3', coordinates: { x: 450, y: 325, level: 'departure' },
    description: 'Burgers and shakes', operatingHours: '06:00-23:00', accessibility: true,
    keywords: ['burger', 'fast food', 'american', 'lunch'] },
  { id: 'dining_mcdonalds', name: "McDonald's", category: 'dining', subcategory: 'fast_food',
    terminal: 'T3', coordinates: { x: 750, y: 325, level: 'departure' },
    operatingHours: '24/7', accessibility: true,
    keywords: ['mcdonalds', 'fast food', 'burger', 'breakfast', 'kids'] },
  { id: 'dining_wagamama', name: 'Wagamama', category: 'dining', subcategory: 'restaurant',
    terminal: 'T3', coordinates: { x: 400, y: 400, level: 'departure' },
    description: 'Asian cuisine and ramen', operatingHours: '10:00-22:00', accessibility: true,
    keywords: ['asian', 'ramen', 'noodles', 'japanese', 'restaurant'] },
  { id: 'dining_paul', name: 'PAUL Bakery', category: 'dining', subcategory: 'bakery',
    terminal: 'T3', coordinates: { x: 950, y: 225, level: 'departure' },
    operatingHours: '05:00-23:00', accessibility: true,
    keywords: ['bakery', 'french', 'bread', 'pastry', 'sandwich'] },
  { id: 'dining_pret', name: 'Pret A Manger', category: 'dining', subcategory: 'cafe',
    terminal: 'T3', coordinates: { x: 200, y: 475, level: 'departure' },
    operatingHours: '06:00-22:00', accessibility: true,
    keywords: ['sandwich', 'salad', 'healthy', 'organic', 'coffee'] },
  { id: 'dining_pizza_express', name: 'Pizza Express', category: 'dining', subcategory: 'restaurant',
    terminal: 'T3', coordinates: { x: 550, y: 400, level: 'departure' },
    operatingHours: '11:00-23:00', accessibility: true,
    keywords: ['pizza', 'italian', 'pasta', 'restaurant'] },
  { id: 'dining_yo_sushi', name: 'YO! Sushi', category: 'dining', subcategory: 'restaurant',
    terminal: 'T3', coordinates: { x: 650, y: 275, level: 'departure' },
    operatingHours: '10:00-22:00', accessibility: true,
    keywords: ['sushi', 'japanese', 'asian', 'seafood'] },
  { id: 'dining_nandos', name: "Nando's", category: 'dining', subcategory: 'restaurant',
    terminal: 'T3', coordinates: { x: 450, y: 450, level: 'departure' },
    description: 'Peri-peri chicken', operatingHours: '11:00-23:00', accessibility: true,
    keywords: ['chicken', 'peri peri', 'halal', 'grilled'] },
  { id: 'dining_zaatar', name: 'Zaatar w Zeit', category: 'dining', subcategory: 'restaurant',
    terminal: 'T3', coordinates: { x: 150, y: 525, level: 'departure' },
    description: 'Lebanese street food', operatingHours: '08:00-23:00', accessibility: true,
    keywords: ['lebanese', 'middle eastern', 'manakish', 'halal'] },
  { id: 'dining_tim_hortons', name: 'Tim Hortons', category: 'dining', subcategory: 'cafe',
    terminal: 'T3', coordinates: { x: 500, y: 275, level: 'departure' },
    operatingHours: '24/7', accessibility: true,
    keywords: ['coffee', 'donuts', 'breakfast', 'cafe'] },
  { id: 'dining_burger_king', name: 'Burger King', category: 'dining', subcategory: 'fast_food',
    terminal: 'T3', coordinates: { x: 800, y: 375, level: 'departure' },
    operatingHours: '24/7', accessibility: true,
    keywords: ['burger', 'fast food', 'whopper', 'fries'] },
  { id: 'dining_pinkberry', name: 'Pinkberry', category: 'dining', subcategory: 'dessert',
    terminal: 'T3', coordinates: { x: 350, y: 525, level: 'departure' },
    operatingHours: '08:00-22:00', accessibility: true,
    keywords: ['yogurt', 'dessert', 'frozen yogurt', 'sweet'] },
  { id: 'dining_juice_bar', name: 'Fresh Juice Bar', category: 'dining', subcategory: 'cafe',
    terminal: 'T3', coordinates: { x: 300, y: 425, level: 'departure' },
    operatingHours: '07:00-21:00', accessibility: true,
    keywords: ['juice', 'smoothie', 'healthy', 'fresh', 'fruit'] },
  { id: 'dining_food_court', name: 'International Food Court', category: 'dining', subcategory: 'food_court',
    terminal: 'T3', coordinates: { x: 600, y: 200, level: 'departure' },
    operatingHours: '24/7', accessibility: true,
    keywords: ['food court', 'variety', 'international', 'multiple'] },
  { id: 'dining_carluccio', name: "Carluccio's", category: 'dining', subcategory: 'restaurant',
    terminal: 'T3', coordinates: { x: 1050, y: 175, level: 'departure' },
    operatingHours: '08:00-22:00', accessibility: true,
    keywords: ['italian', 'pasta', 'wine', 'restaurant'] },
  { id: 'dining_kfc', name: 'KFC', category: 'dining', subcategory: 'fast_food',
    terminal: 'T3', coordinates: { x: 700, y: 400, level: 'departure' },
    operatingHours: '24/7', accessibility: true,
    keywords: ['chicken', 'fast food', 'kfc', 'halal'] },
  { id: 'dining_subway', name: 'Subway', category: 'dining', subcategory: 'fast_food',
    terminal: 'T3', coordinates: { x: 250, y: 500, level: 'departure' },
    operatingHours: '06:00-23:00', accessibility: true,
    keywords: ['sandwich', 'subway', 'healthy', 'salad', 'fast food'] },
  { id: 'dining_baskin_robbins', name: 'Baskin Robbins', category: 'dining', subcategory: 'dessert',
    terminal: 'T3', coordinates: { x: 900, y: 300, level: 'departure' },
    operatingHours: '08:00-00:00', accessibility: true,
    keywords: ['ice cream', 'dessert', 'sweet', 'baskin robbins'] },

  // RETAIL (15)
  { id: 'retail_dutyfree_main', name: 'Duty Free Main Store', category: 'retail', subcategory: 'duty_free',
    terminal: 'T3', coordinates: { x: 700, y: 275, level: 'departure' },
    description: 'Largest duty-free shopping', operatingHours: '24/7', accessibility: true,
    keywords: ['duty free', 'shopping', 'perfume', 'luxury', 'alcohol'] },
  { id: 'retail_dutyfree_liquor', name: 'Duty Free Liquor & Tobacco', category: 'retail', subcategory: 'duty_free',
    terminal: 'T3', coordinates: { x: 850, y: 275, level: 'departure' },
    operatingHours: '24/7', accessibility: true,
    keywords: ['duty free', 'alcohol', 'liquor', 'wine', 'tobacco'] },
  { id: 'retail_electronics', name: 'Tech Zone', category: 'retail', subcategory: 'electronics',
    terminal: 'T3', coordinates: { x: 750, y: 225, level: 'departure' },
    operatingHours: '06:00-00:00', accessibility: true,
    keywords: ['electronics', 'tech', 'phone', 'laptop', 'apple', 'samsung'] },
  { id: 'retail_fashion', name: 'Fashion Avenue', category: 'retail', subcategory: 'fashion',
    terminal: 'T3', coordinates: { x: 550, y: 225, level: 'departure' },
    operatingHours: '08:00-23:00', accessibility: true,
    keywords: ['fashion', 'clothes', 'designer', 'luxury', 'clothing'] },
  { id: 'retail_watches', name: 'Watch Gallery', category: 'retail', subcategory: 'jewelry',
    terminal: 'T3', coordinates: { x: 800, y: 225, level: 'departure' },
    operatingHours: '08:00-23:00', accessibility: true,
    keywords: ['watches', 'luxury', 'jewelry', 'timepiece'] },
  { id: 'retail_perfume', name: 'Perfume & Cosmetics', category: 'retail', subcategory: 'beauty',
    terminal: 'T3', coordinates: { x: 650, y: 225, level: 'departure' },
    operatingHours: '24/7', accessibility: true,
    keywords: ['perfume', 'cosmetics', 'beauty', 'makeup', 'fragrance'] },
  { id: 'retail_souvenir', name: 'UAE Souvenirs', category: 'retail', subcategory: 'gifts',
    terminal: 'T3', coordinates: { x: 350, y: 475, level: 'departure' },
    operatingHours: '06:00-23:00', accessibility: true,
    keywords: ['souvenir', 'gifts', 'uae', 'local', 'handicrafts'] },
  { id: 'retail_bookstore', name: 'Airport Bookstore', category: 'retail', subcategory: 'books',
    terminal: 'T3', coordinates: { x: 500, y: 225, level: 'departure' },
    operatingHours: '06:00-00:00', accessibility: true,
    keywords: ['books', 'magazines', 'reading', 'bookstore', 'newspapers'] },
  { id: 'retail_sunglasses', name: 'Sunglasses Boutique', category: 'retail', subcategory: 'accessories',
    terminal: 'T3', coordinates: { x: 900, y: 250, level: 'departure' },
    operatingHours: '08:00-23:00', accessibility: true,
    keywords: ['sunglasses', 'rayban', 'oakley', 'accessories'] },
  { id: 'retail_chocolate', name: 'Godiva Chocolates', category: 'retail', subcategory: 'food',
    terminal: 'T3', coordinates: { x: 750, y: 300, level: 'departure' },
    operatingHours: '24/7', accessibility: true,
    keywords: ['chocolate', 'godiva', 'sweets', 'gifts'] },
  { id: 'retail_jewelry', name: 'Gold & Diamond Jewellery', category: 'retail', subcategory: 'jewelry',
    terminal: 'T3', coordinates: { x: 1000, y: 200, level: 'departure' },
    operatingHours: '08:00-23:00', accessibility: true,
    keywords: ['jewelry', 'gold', 'diamond', 'luxury', 'rings'] },
  { id: 'retail_toys', name: 'Kids Toy Store', category: 'retail', subcategory: 'toys',
    terminal: 'T3', coordinates: { x: 400, y: 300, level: 'departure' },
    operatingHours: '08:00-22:00', accessibility: true,
    keywords: ['toys', 'kids', 'children', 'games', 'gifts'] },
  { id: 'retail_luggage', name: 'Samsonite Luggage', category: 'retail', subcategory: 'travel',
    terminal: 'T3', coordinates: { x: 550, y: 325, level: 'departure' },
    operatingHours: '06:00-23:00', accessibility: true,
    keywords: ['luggage', 'bags', 'suitcase', 'travel', 'samsonite'] },
  { id: 'retail_pharmacy_shop', name: 'Beauty & Wellness Shop', category: 'retail', subcategory: 'health',
    terminal: 'T3', coordinates: { x: 200, y: 450, level: 'departure' },
    operatingHours: '24/7', accessibility: true,
    keywords: ['health', 'beauty', 'wellness', 'skincare'] },
  { id: 'retail_convenience', name: '24/7 Convenience Store', category: 'retail', subcategory: 'convenience',
    terminal: 'T3', coordinates: { x: 300, y: 350, level: 'departure' },
    operatingHours: '24/7', accessibility: true,
    keywords: ['convenience', 'snacks', 'drinks', 'essentials', '24/7'] },

  // SERVICES (12)
  { id: 'service_atm_1', name: 'ATM - Emirates NBD', category: 'service', subcategory: 'atm',
    terminal: 'T3', coordinates: { x: 600, y: 175, level: 'both' },
    operatingHours: '24/7', accessibility: true,
    keywords: ['atm', 'cash', 'money', 'bank', 'withdrawal'] },
  { id: 'service_atm_2', name: 'ATM - ADCB', category: 'service', subcategory: 'atm',
    terminal: 'T3', coordinates: { x: 400, y: 350, level: 'both' },
    operatingHours: '24/7', accessibility: true,
    keywords: ['atm', 'cash', 'money', 'bank'] },
  { id: 'service_exchange', name: 'Currency Exchange', category: 'service', subcategory: 'exchange',
    terminal: 'T3', coordinates: { x: 650, y: 200, level: 'both' },
    description: 'Al Ansari Exchange', operatingHours: '24/7', accessibility: true,
    keywords: ['currency', 'exchange', 'money', 'forex', 'al ansari'] },
  { id: 'service_pharmacy', name: 'Airport Pharmacy', category: 'service', subcategory: 'pharmacy',
    terminal: 'T3', coordinates: { x: 500, y: 350, level: 'departure' },
    operatingHours: '24/7', accessibility: true,
    keywords: ['pharmacy', 'medicine', 'drugs', 'health', 'prescription'] },
  { id: 'service_sim_card', name: 'Etisalat SIM Cards', category: 'service', subcategory: 'telecom',
    terminal: 'T3', coordinates: { x: 550, y: 175, level: 'both' },
    operatingHours: '24/7', accessibility: true,
    keywords: ['sim card', 'mobile', 'phone', 'etisalat', 'data', 'internet'] },
  { id: 'service_vip', name: 'VIP Services', category: 'service', subcategory: 'vip',
    terminal: 'T3', coordinates: { x: 700, y: 150, level: 'departure' },
    operatingHours: '24/7', accessibility: true,
    keywords: ['vip', 'premium', 'concierge', 'fast track'] },
  { id: 'service_left_luggage', name: 'Left Luggage Storage', category: 'service', subcategory: 'luggage',
    terminal: 'T3', coordinates: { x: 400, y: 200, level: 'both' },
    operatingHours: '24/7', accessibility: true,
    keywords: ['luggage', 'storage', 'baggage', 'left luggage', 'lockers'] },
  { id: 'service_porter', name: 'Porter Service', category: 'service', subcategory: 'assistance',
    terminal: 'T3', coordinates: { x: 500, y: 150, level: 'both' },
    operatingHours: '24/7', accessibility: true,
    keywords: ['porter', 'baggage', 'assistance', 'help', 'trolley'] },
  { id: 'service_wifi', name: 'Free WiFi Zone', category: 'service', subcategory: 'internet',
    terminal: 'T3', coordinates: { x: 600, y: 300, level: 'departure' },
    description: 'High-speed internet access', operatingHours: '24/7', accessibility: true,
    keywords: ['wifi', 'internet', 'free', 'wireless', 'connection'] },
  { id: 'service_charging', name: 'Phone Charging Station', category: 'service', subcategory: 'charging',
    terminal: 'T3', coordinates: { x: 450, y: 275, level: 'departure' },
    operatingHours: '24/7', accessibility: true,
    keywords: ['charging', 'phone', 'battery', 'usb', 'power'] },
  { id: 'service_post', name: 'Emirates Post', category: 'service', subcategory: 'postal',
    terminal: 'T3', coordinates: { x: 350, y: 400, level: 'departure' },
    operatingHours: '08:00-20:00', accessibility: true,
    keywords: ['post', 'mail', 'shipping', 'parcels', 'stamps'] },
  { id: 'service_spa', name: 'Timeless Spa', category: 'service', subcategory: 'wellness',
    terminal: 'T3', coordinates: { x: 1050, y: 225, level: 'departure' },
    description: 'Massage and wellness services', operatingHours: '06:00-23:00', accessibility: true,
    keywords: ['spa', 'massage', 'wellness', 'relaxation', 'treatment'] },

  // Continue in next artifact...
];

export default terminal3POIs;
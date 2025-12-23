// lib/data/terminalMaps_facilities.ts
// Terminal 3 Facilities, Lounges, Transportation (Part 2 of 3)

import { POI, POICategory, Level } from './terminalMaps';

export const terminal3Facilities: POI[] = [
  // FACILITIES (18)
  { id: 'facility_restroom_a1', name: 'Restrooms - Concourse A East', category: 'facility', subcategory: 'restroom',
    terminal: 'T3', coordinates: { x: 1050, y: 125, level: 'departure' },
    operatingHours: '24/7', accessibility: true,
    keywords: ['restroom', 'toilet', 'bathroom', 'wc', 'washroom'] },
  { id: 'facility_restroom_a2', name: 'Restrooms - Concourse A West', category: 'facility', subcategory: 'restroom',
    terminal: 'T3', coordinates: { x: 850, y: 225, level: 'departure' },
    operatingHours: '24/7', accessibility: true,
    keywords: ['restroom', 'toilet', 'bathroom', 'wc'] },
  { id: 'facility_restroom_b1', name: 'Restrooms - Concourse B North', category: 'facility', subcategory: 'restroom',
    terminal: 'T3', coordinates: { x: 450, y: 300, level: 'departure' },
    operatingHours: '24/7', accessibility: true,
    keywords: ['restroom', 'toilet', 'bathroom', 'wc'] },
  { id: 'facility_restroom_b2', name: 'Restrooms - Concourse B South', category: 'facility', subcategory: 'restroom',
    terminal: 'T3', coordinates: { x: 750, y: 350, level: 'departure' },
    operatingHours: '24/7', accessibility: true,
    keywords: ['restroom', 'toilet', 'bathroom', 'wc'] },
  { id: 'facility_restroom_c1', name: 'Restrooms - Concourse C East', category: 'facility', subcategory: 'restroom',
    terminal: 'T3', coordinates: { x: 300, y: 475, level: 'departure' },
    operatingHours: '24/7', accessibility: true,
    keywords: ['restroom', 'toilet', 'bathroom', 'wc'] },
  { id: 'facility_restroom_c2', name: 'Restrooms - Concourse C West', category: 'facility', subcategory: 'restroom',
    terminal: 'T3', coordinates: { x: 100, y: 525, level: 'departure' },
    operatingHours: '24/7', accessibility: true,
    keywords: ['restroom', 'toilet', 'bathroom', 'wc'] },
  
  { id: 'facility_prayer_room_1', name: 'Prayer Room - Main', category: 'facility', subcategory: 'prayer',
    terminal: 'T3', coordinates: { x: 700, y: 200, level: 'departure' },
    description: 'Multi-faith prayer and meditation room', operatingHours: '24/7', accessibility: true,
    keywords: ['prayer', 'mosque', 'muslim', 'meditation', 'worship', 'wudu'] },
  { id: 'facility_prayer_room_2', name: 'Prayer Room - Concourse A', category: 'facility', subcategory: 'prayer',
    terminal: 'T3', coordinates: { x: 1000, y: 175, level: 'departure' },
    operatingHours: '24/7', accessibility: true,
    keywords: ['prayer', 'mosque', 'muslim', 'meditation'] },
  { id: 'facility_prayer_room_3', name: 'Prayer Room - Concourse C', category: 'facility', subcategory: 'prayer',
    terminal: 'T3', coordinates: { x: 200, y: 500, level: 'departure' },
    operatingHours: '24/7', accessibility: true,
    keywords: ['prayer', 'mosque', 'muslim', 'meditation'] },
  
  { id: 'facility_info_desk_1', name: 'Information Desk - Main', category: 'facility', subcategory: 'information',
    terminal: 'T3', coordinates: { x: 600, y: 150, level: 'both' },
    description: 'Main information and assistance', operatingHours: '24/7', accessibility: true,
    keywords: ['information', 'help', 'desk', 'assistance', 'questions', 'ask'] },
  { id: 'facility_info_desk_2', name: 'Information Desk - Arrivals', category: 'facility', subcategory: 'information',
    terminal: 'T3', coordinates: { x: 600, y: 150, level: 'arrival' },
    operatingHours: '24/7', accessibility: true,
    keywords: ['information', 'help', 'arrivals', 'assistance'] },
  
  { id: 'facility_nursing_room', name: 'Nursing & Baby Care Room', category: 'facility', subcategory: 'family',
    terminal: 'T3', coordinates: { x: 550, y: 250, level: 'departure' },
    description: 'Private room for nursing mothers', operatingHours: '24/7', accessibility: true,
    keywords: ['nursing', 'baby', 'mother', 'children', 'family', 'breastfeeding'] },
  
  { id: 'facility_kids_play', name: "Kids' Play Area", category: 'facility', subcategory: 'family',
    terminal: 'T3', coordinates: { x: 350, y: 325, level: 'departure' },
    description: 'Supervised play area for children', operatingHours: '06:00-23:00', accessibility: true,
    keywords: ['kids', 'children', 'play', 'playground', 'family', 'toys'] },
  
  { id: 'facility_first_aid', name: 'Medical Center', category: 'facility', subcategory: 'medical',
    terminal: 'T3', coordinates: { x: 500, y: 200, level: 'both' },
    description: '24/7 medical assistance', operatingHours: '24/7', accessibility: true,
    keywords: ['medical', 'first aid', 'doctor', 'nurse', 'emergency', 'health'] },
  
  { id: 'facility_smoking_1', name: 'Smoking Lounge - Concourse B', category: 'facility', subcategory: 'smoking',
    terminal: 'T3', coordinates: { x: 600, y: 375, level: 'departure' },
    operatingHours: '24/7', accessibility: true,
    keywords: ['smoking', 'cigarette', 'tobacco', 'smoke'] },
  { id: 'facility_smoking_2', name: 'Smoking Lounge - Concourse A', category: 'facility', subcategory: 'smoking',
    terminal: 'T3', coordinates: { x: 950, y: 175, level: 'departure' },
    operatingHours: '24/7', accessibility: true,
    keywords: ['smoking', 'cigarette', 'smoke'] },
  
  { id: 'facility_quiet_zone', name: 'Quiet Zone', category: 'facility', subcategory: 'relaxation',
    terminal: 'T3', coordinates: { x: 800, y: 250, level: 'departure' },
    description: 'Silent relaxation area', operatingHours: '24/7', accessibility: true,
    keywords: ['quiet', 'silent', 'relaxation', 'sleep', 'rest'] },
  
  { id: 'facility_business_center', name: 'Business Center', category: 'facility', subcategory: 'business',
    terminal: 'T3', coordinates: { x: 750, y: 175, level: 'departure' },
    description: 'Workstations, printing, meeting rooms', operatingHours: '24/7', accessibility: true,
    keywords: ['business', 'work', 'office', 'printing', 'meeting', 'computer'] },
];

export const terminal3Lounges: POI[] = [
  // LOUNGES (5)
  { id: 'lounge_etihad_first', name: 'Etihad First Class Lounge', category: 'lounge', subcategory: 'first_class',
    terminal: 'T3', coordinates: { x: 1100, y: 125, level: 'departure' },
    description: 'Premium lounge with spa, dining, and private suites',
    operatingHours: '24/7', accessibility: true,
    keywords: ['lounge', 'etihad', 'first class', 'premium', 'luxury', 'spa', 'dining'] },
  
  { id: 'lounge_etihad_business', name: 'Etihad Business Class Lounge', category: 'lounge', subcategory: 'business_class',
    terminal: 'T3', coordinates: { x: 1000, y: 225, level: 'departure' },
    description: 'Business lounge with buffet and showers',
    operatingHours: '24/7', accessibility: true,
    keywords: ['lounge', 'etihad', 'business class', 'buffet', 'shower', 'work'] },
  
  { id: 'lounge_plaza_premium', name: 'Plaza Premium Lounge', category: 'lounge', subcategory: 'independent',
    terminal: 'T3', coordinates: { x: 150, y: 450, level: 'departure' },
    description: 'Pay-per-use lounge with food and drinks',
    operatingHours: '24/7', accessibility: true,
    keywords: ['lounge', 'plaza premium', 'pay', 'independent', 'food', 'drinks'] },
  
  { id: 'lounge_marhaba', name: 'Marhaba Lounge', category: 'lounge', subcategory: 'independent',
    terminal: 'T3', coordinates: { x: 650, y: 325, level: 'departure' },
    description: 'Airport lounge with international buffet',
    operatingHours: '24/7', accessibility: true,
    keywords: ['lounge', 'marhaba', 'pay', 'buffet', 'relax'] },
  
  { id: 'lounge_sleep_pods', name: 'Sleep Pods & Nap Zone', category: 'lounge', subcategory: 'rest',
    terminal: 'T3', coordinates: { x: 450, y: 375, level: 'departure' },
    description: 'Private sleeping pods for rent',
    operatingHours: '24/7', accessibility: true,
    keywords: ['sleep', 'pod', 'nap', 'rest', 'bed', 'privacy'] },
];

export const terminal3Transportation: POI[] = [
  // TRANSPORTATION (8)
  { id: 'transport_taxi', name: 'Taxi Stand', category: 'transportation', subcategory: 'taxi',
    terminal: 'T3', coordinates: { x: 600, y: 100, level: 'arrival' },
    description: 'Official airport taxi service', operatingHours: '24/7', accessibility: true,
    keywords: ['taxi', 'cab', 'transport', 'ride', 'car'] },
  
  { id: 'transport_uber_careem', name: 'Ride-Hailing Pick-up', category: 'transportation', subcategory: 'rideshare',
    terminal: 'T3', coordinates: { x: 650, y: 100, level: 'arrival' },
    description: 'Uber, Careem pick-up zone', operatingHours: '24/7', accessibility: true,
    keywords: ['uber', 'careem', 'ride hailing', 'app', 'pickup'] },
  
  { id: 'transport_bus', name: 'Airport Bus Stop', category: 'transportation', subcategory: 'bus',
    terminal: 'T3', coordinates: { x: 500, y: 100, level: 'arrival' },
    description: 'Public bus routes to Dubai and Abu Dhabi', operatingHours: '05:00-00:00', accessibility: true,
    keywords: ['bus', 'public transport', 'dubai', 'abu dhabi', 'cheap'] },
  
  { id: 'transport_metro', name: 'Metro Station Link', category: 'transportation', subcategory: 'metro',
    terminal: 'T3', coordinates: { x: 700, y: 100, level: 'arrival' },
    description: 'Free shuttle to metro station', operatingHours: '06:00-23:00', accessibility: true,
    keywords: ['metro', 'train', 'shuttle', 'public transport'] },
  
  { id: 'transport_rental_car', name: 'Car Rental Desks', category: 'transportation', subcategory: 'rental',
    terminal: 'T3', coordinates: { x: 550, y: 125, level: 'arrival' },
    description: 'Hertz, Avis, Europcar, Budget', operatingHours: '24/7', accessibility: true,
    keywords: ['car rental', 'rent', 'car', 'drive', 'hertz', 'avis', 'budget'] },
  
  { id: 'transport_hotel_shuttle', name: 'Hotel Shuttle Pick-up', category: 'transportation', subcategory: 'shuttle',
    terminal: 'T3', coordinates: { x: 750, y: 100, level: 'arrival' },
    description: 'Free hotel shuttle services', operatingHours: '24/7', accessibility: true,
    keywords: ['hotel', 'shuttle', 'free', 'transport', 'accommodation'] },
  
  { id: 'transport_parking', name: 'Parking Information', category: 'transportation', subcategory: 'parking',
    terminal: 'T3', coordinates: { x: 450, y: 125, level: 'both' },
    description: 'Short-term and long-term parking info', operatingHours: '24/7', accessibility: true,
    keywords: ['parking', 'car park', 'valet', 'long term', 'short term'] },
  
  { id: 'transport_limousine', name: 'Limousine Service', category: 'transportation', subcategory: 'luxury',
    terminal: 'T3', coordinates: { x: 800, y: 100, level: 'arrival' },
    description: 'Premium chauffeur services', operatingHours: '24/7', accessibility: true,
    keywords: ['limousine', 'limo', 'chauffeur', 'luxury', 'premium', 'driver'] },
];

export const terminal3Security: POI[] = [
  // SECURITY & BAGGAGE (7)
  { id: 'security_main', name: 'Security Checkpoint - Main', category: 'security', subcategory: 'checkpoint',
    terminal: 'T3', coordinates: { x: 600, y: 175, level: 'departure' },
    description: 'Main security screening', operatingHours: '24/7', accessibility: true,
    keywords: ['security', 'checkpoint', 'screening', 'passport', 'check'] },
  
  { id: 'security_fast_track', name: 'Fast Track Security', category: 'security', subcategory: 'fast_track',
    terminal: 'T3', coordinates: { x: 650, y: 175, level: 'departure' },
    description: 'Priority security lane', operatingHours: '24/7', accessibility: true,
    keywords: ['fast track', 'priority', 'quick', 'security', 'express'] },
  
  { id: 'baggage_claim_1', name: 'Baggage Claim Belt 1-5', category: 'facility', subcategory: 'baggage',
    terminal: 'T3', coordinates: { x: 500, y: 125, level: 'arrival' },
    operatingHours: '24/7', accessibility: true,
    keywords: ['baggage', 'luggage', 'claim', 'carousel', 'arrival', 'bags'] },
  
  { id: 'baggage_claim_2', name: 'Baggage Claim Belt 6-10', category: 'facility', subcategory: 'baggage',
    terminal: 'T3', coordinates: { x: 700, y: 125, level: 'arrival' },
    operatingHours: '24/7', accessibility: true,
    keywords: ['baggage', 'luggage', 'claim', 'carousel', 'bags'] },
  
  { id: 'customs', name: 'Customs & Immigration', category: 'security', subcategory: 'customs',
    terminal: 'T3', coordinates: { x: 600, y: 125, level: 'arrival' },
    description: 'Passport control and customs declaration', operatingHours: '24/7', accessibility: true,
    keywords: ['customs', 'immigration', 'passport', 'border', 'declaration'] },
  
  { id: 'checkin_counters', name: 'Check-in Counters', category: 'facility', subcategory: 'checkin',
    terminal: 'T3', coordinates: { x: 600, y: 100, level: 'departure' },
    description: 'Airline check-in desks', operatingHours: '24/7', accessibility: true,
    keywords: ['check in', 'counter', 'desk', 'ticket', 'baggage drop'] },
  
  { id: 'self_checkin', name: 'Self Check-in Kiosks', category: 'facility', subcategory: 'self_service',
    terminal: 'T3', coordinates: { x: 550, y: 100, level: 'departure' },
    description: 'Automated check-in machines', operatingHours: '24/7', accessibility: true,
    keywords: ['self check in', 'kiosk', 'automated', 'machine', 'fast'] },
];

// Combine all POIs
export const allTerminal3POIs = [
  ...terminal3Facilities,
  ...terminal3Lounges,
  ...terminal3Transportation,
  ...terminal3Security,
];

export default allTerminal3POIs;
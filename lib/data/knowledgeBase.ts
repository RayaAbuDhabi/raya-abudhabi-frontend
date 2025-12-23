// lib/data/knowledgeBase.ts
// Abu Dhabi Airport Knowledge Base - COMPLETE VERSION

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  category: string;
  tags: string[];
}

export interface Terminal {
  id: string;
  name: string;
  airlines: string[];
  facilities: string[];
  gates: string;
  checkInCounters: string;
  notes?: string;
}

export interface KnowledgeBase {
  airport: {
    code: string;
    name: string;
    city: string;
    country: string;
    timezone: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  terminals: Terminal[];
  faqs: FAQ[];
  emergencyContacts: {
    police: string;
    ambulance: string;
    airportInfo: string;
    immigration: string;
    lostBaggage: string;
  };
  operatingHours: {
    airport: string;
    checkIn: string;
    security: string;
    dutyFree: string;
  };
}

export const knowledgeBase: KnowledgeBase = {
  airport: {
    code: "AUH",
    name: "Abu Dhabi International Airport",
    city: "Abu Dhabi",
    country: "United Arab Emirates",
    timezone: "Asia/Dubai",
    coordinates: {
      lat: 24.4330,
      lng: 54.6511
    }
  },
  terminals: [
    {
      id: "T1",
      name: "Terminal 1",
      airlines: ["Etihad Airways", "Partner Airlines"],
      facilities: ["Duty Free", "Lounges", "prayer rooms", "Nursery", "Showers"],
      gates: "1-59",
      checkInCounters: "101-199"
    },
    {
      id: "T2",
      name: "Terminal 2",
      airlines: ["Low-cost carriers", "Charter flights"],
      facilities: ["Basic amenities", "prayer rooms"],
      gates: "201-230",
      checkInCounters: "201-250"
    },
    {
      id: "T3",
      name: "Terminal 3 (Midfield)",
      airlines: ["Etihad Airways", "International carriers"],
      facilities: ["Premium Lounges", "Luxury Shopping", "Fine Dining", "Spa", "Hotel"],
      gates: "A1-A24, B1-B30, C1-C30",
      checkInCounters: "301-450",
      notes: "Largest terminal, opened 2023"
    }
  ],
  faqs: [
    {
      id: "wifi",
      question: "How do I connect to WiFi?",
      answer: "Free WiFi is available throughout the airport. Connect to 'AUH Free WiFi' network. No password required for 2 hours of complimentary access.",
      keywords: ["wifi", "why Fi", "wi-fi", "wiFi", "wi fi", "Wifi", "internet", "wireless", "online", "connect", "network", "net"],
      category: "connectivity",
      tags: ["internet", "wifi", "free"]
    },
    {
      id: "prayer_rooms",
      question: "Where are the prayer rooms?",
      answer: "Prayer rooms (مصلى) are located in all terminals. Terminal 1: Near Gate 25 and Gate 45. Terminal 2: Near Gate 210. Terminal 3: Level 2 near Gates A15, B20, and C15. All rooms have ablution facilities.",
      keywords: ["prayer", "pray", "muslim", "salah", "mosque", "masjid", "wudu", "ablution", "مصلى", "صلاة", "worship"],
      category: "religious",
      tags: ["prayer", "religious", "facilities"]
    },
    {
      id: "restroom",
      question: "Where are the restrooms?",
      answer: "Restrooms are conveniently located throughout all terminals. In Terminal 3, you'll find restrooms near all gate clusters, on the check-in level, and in the arrivals hall. All facilities include accessible restrooms and baby changing rooms.",
      keywords: ["restroom", "toilet", "bathroom", "washroom", "wc", "lavatory", "loo", "facilities"],
      category: "facilities",
      tags: ["restroom", "toilet", "facilities"]
    },
    {
      id: "currency_exchange",
      question: "Where can I exchange currency?",
      answer: "Currency exchange counters are available in all terminals. Terminal 3 has UAE Exchange and Al Ansari Exchange on Level 2. Operating hours: 24/7. ATMs accept major international cards.",
      keywords: ["money", "currency", "exchange", "atm", "cash", "dirham", "aed", "bank", "change money"],
      category: "services",
      tags: ["money", "banking", "currency"]
    },
    {
      id: "lounges",
      question: "What lounges are available?",
      answer: "Terminal 1: Etihad First & Business Class Lounges. Terminal 3: Premium Lounges (The Luxury Collection), Etihad Lounges, and Plaza Premium Lounge. Access via airline status, credit cards, or paid entry.",
      keywords: ["lounge", "rest", "relax", "comfortable", "waiting", "premium", "business class", "relaxation"],
      category: "amenities",
      tags: ["lounge", "comfort", "premium"]
    },
    {
      id: "transit_visa",
      question: "Do I need a transit visa?",
      answer: "UAE offers 48-96 hour transit visas for eligible nationalities. Check with your airline or UAE immigration. US, UK, EU citizens can get visa on arrival. GCC citizens don't need visa.",
      keywords: ["visa", "transit", "immigration", "passport", "layover", "stopover", "entry"],
      category: "immigration",
      tags: ["visa", "immigration", "travel"]
    },
    {
      id: "baggage_claim",
      question: "Where do I collect my baggage?",
      answer: "Baggage claim areas are located on the arrivals level of each terminal. Check your flight info screen for carousel number. Lost baggage counter is near carousel 1 in T3, open 24/7.",
      keywords: ["baggage", "luggage", "bag", "suitcase", "claim", "collect", "carousel", "lost", "missing"],
      category: "baggage",
      tags: ["baggage", "luggage", "arrivals"]
    },
    {
      id: "food_restaurants",
      question: "What food options are available?",
      answer: "Terminal 3 has 40+ dining options: McDonald's, Shake Shack, Paul Bakery, Wagamama, Lebanese restaurants, Arabic cafes. Terminal 1 has 20+ outlets. Halal food widely available. 24-hour options available.",
      keywords: ["food", "restaurant", "eat", "dining", "meal", "hungry", "halal", "cafe", "coffee", "lunch", "dinner", "breakfast"],
      category: "dining",
      tags: ["food", "dining", "restaurants"]
    },
    {
      id: "duty_free",
      question: "Where is duty free shopping?",
      answer: "Abu Dhabi Duty Free is located post-security in all terminals. Terminal 3 has the largest selection with luxury brands, perfumes, electronics, and souvenirs. Open 24/7. Accepts AED, USD, EUR, GBP.",
      keywords: ["shopping", "duty free", "dutyfree", "duty-free", "shop", "buy", "store", "mall", "purchase", "retail"],
      category: "shopping",
      tags: ["shopping", "duty-free", "retail"]
    },
    {
      id: "etihad_checkin",
      question: "Where is Etihad check-in?",
      answer: "Etihad Airways check-in: Terminal 3 counters 301-380. Economy class opens 4 hours before departure. Business/First class use premium check-in zone. Online check-in available 30 hours before flight.",
      keywords: ["etihad", "check in", "checkin", "check-in", "counter", "boarding pass", "etihad airways"],
      category: "airlines",
      tags: ["etihad", "checkin", "airlines"]
    },
    {
      id: "transfer_time",
      question: "How long do I need for connecting flights?",
      answer: "Minimum connection time: 60 minutes same terminal, 90 minutes between terminals. Terminal 3 is large - allow 20-30 minutes walking time between distant gates. Free shuttle buses run between terminals every 10 minutes.",
      keywords: ["transfer", "connection", "connecting", "layover", "transit", "change flight", "stopover"],
      category: "transfers",
      tags: ["connections", "transfer", "transit"]
    },
    {
      id: "parking",
      question: "What are the parking options?",
      answer: "Multi-level parking at all terminals. Rates: AED 15/hour, AED 150/day. Long-term parking: AED 50/day. Valet parking available at Terminal 3. Free for first 15 minutes. Payment by card or cash.",
      keywords: ["parking", "park", "car", "vehicle", "lot", "garage", "valet"],
      category: "transport",
      tags: ["parking", "transport", "car"]
    },
    {
      id: "city_transport",
      question: "How do I get to Abu Dhabi city?",
      answer: "Bus A1 runs to city center (30 mins, AED 4). Taxis available 24/7 at all terminals (30-45 mins to city, ~AED 70-100). Uber/Careem available. Car rental desks in arrivals hall.",
      keywords: ["bus", "taxi", "uber", "careem", "transport", "city", "downtown", "ride", "transfer"],
      category: "transport",
      tags: ["transport", "city", "taxi"]
    },
    {
      id: "dubai_transport",
      question: "How do I get to Dubai?",
      answer: "Direct bus to Dubai (90 mins, AED 25) departs hourly. Taxi to Dubai: ~AED 250-300, 90 minutes. Pre-book airport transfer for better rates. No direct metro connection.",
      keywords: ["dubai", "bus", "taxi", "transport", "transfer"],
      category: "transport",
      tags: ["dubai", "transport", "intercity"]
    },
    {
      id: "medical",
      question: "Where is medical assistance?",
      answer: "Medical centers in all terminals, open 24/7. Terminal 3: Level 2 near Gate B15. Free basic first aid. Pharmacy available. For emergencies, call 999 or alert airport staff.",
      keywords: ["medical", "doctor", "pharmacy", "sick", "ill", "emergency", "health", "clinic", "medicine", "treatment"],
      category: "services",
      tags: ["medical", "health", "emergency"]
    },
    {
      id: "kids_facilities",
      question: "Are there facilities for children?",
      answer: "Children's play areas in Terminal 1 (near Gate 30) and Terminal 3 (Gates A10, B25, C20). Nursery rooms with baby changing facilities in all terminals. Family lanes at security and immigration.",
      keywords: ["children", "kids", "child", "baby", "infant", "family", "play", "playground", "nursery", "changing", "toddler"],
      category: "facilities",
      tags: ["family", "children", "facilities"]
    },
    {
      id: "smoking",
      question: "Where can I smoke?",
      answer: "Designated smoking rooms available post-security in all terminals. Terminal 3 has smoking lounges near Gates A20, B10, and C25. Airport is otherwise non-smoking.",
      keywords: ["smoking", "smoke", "cigarette", "tobacco", "smoker"],
      category: "facilities",
      tags: ["smoking", "facilities"]
    },
    {
      id: "hotel",
      question: "Is there a hotel in the airport?",
      answer: "Terminal 3 has an airside hotel (transit passengers, no visa needed). Day rooms available for 6-12 hours. Park Inn by Radisson connected to Terminal 1. Several hotels within 10 minutes drive.",
      keywords: ["hotel", "sleep", "sleeping", "rest", "accommodation", "room", "stay", "nap", "overnight"],
      category: "accommodation",
      tags: ["hotel", "accommodation", "sleep"]
    },
    {
      id: "sim_card",
      question: "Where can I buy a SIM card?",
      answer: "Etisalat and du stores in arrivals area of all terminals. Tourist SIM cards available: AED 50-100 with data. Valid passport required. Open 24/7 in Terminal 3.",
      keywords: ["sim", "sim card", "phone", "mobile", "cellular", "data", "etisalat", "du", "card"],
      category: "connectivity",
      tags: ["mobile", "sim", "phone"]
    },
    {
      id: "customs",
      question: "What are the customs rules?",
      answer: "Duty-free allowance: 400 cigarettes, 4L alcohol (non-Muslims over 18). Prohibited: drugs, weapons, pork products, Israeli goods. Declare amounts over AED 60,000. E-gates available for UAE residents.",
      keywords: ["customs", "declaration", "duty", "allowed", "prohibited", "import", "rules", "regulations"],
      category: "customs",
      tags: ["customs", "immigration", "rules"]
    },
    {
      id: "lost_found",
      question: "Where is lost and found?",
      answer: "Lost & Found office in Terminal 3 arrivals area, near baggage claim 1. Open 24/7. For items lost on aircraft, contact your airline. Call +971 2 575 7500 or visit service desk.",
      keywords: ["lost", "found", "missing", "left", "forgot", "lost and found"],
      category: "services",
      tags: ["lost-found", "services"]
    }
  ],
  emergencyContacts: {
    police: "999",
    ambulance: "998",
    airportInfo: "+971 2 505 5555",
    immigration: "+971 2 401 9999",
    lostBaggage: "+971 2 575 7500"
  },
  operatingHours: {
    airport: "24/7",
    checkIn: "Typically 4 hours before departure",
    security: "24/7",
    dutyFree: "24/7"
  }
};
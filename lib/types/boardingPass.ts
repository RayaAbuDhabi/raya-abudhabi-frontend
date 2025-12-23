// lib/types/boardingPass.ts
// TypeScript interfaces for boarding pass data

export interface BoardingPass {
  // Passenger info
  passengerName: string;
  firstName?: string;
  lastName?: string;
  
  // Flight info
  flightNumber: string;
  airline?: string;
  bookingReference?: string;
  
  // Route
  origin: string;
  destination: string;
  originCity?: string;
  destinationCity?: string;
  
  // Seat & Gate
  seatNumber: string;
  gateNumber: string;
  
  // Time
  departureTime: string;
  boardingTime?: string;
  departureDate?: string;
  
  // Additional
  classOfService?: 'economy' | 'business' | 'first';
  sequenceNumber?: string;
  barcode?: string;
  
  // Parsed metadata
  rawData?: string;
  parseMethod?: 'iata' | 'manual' | 'ocr';
}

export interface ParseResult {
  success: boolean;
  boardingPass?: BoardingPass;
  error?: string;
  confidence?: number;
}
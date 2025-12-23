// lib/services/boardingPassParser.ts
// Parse IATA boarding pass barcodes and extract flight information

import { BoardingPass, ParseResult } from '../types/boardingPass';

export class BoardingPassParser {
  
  /**
   * Parse IATA standard boarding pass barcode (BCBP format)
   * Format: M1SURNAME/FIRSTNAME EABCDEFORIGIN DEST AIRLINEFLTDATE...
   */
  parseIATABarcode(barcode: string): ParseResult {
    try {
      // Check if it starts with M (mandatory fields indicator)
      if (!barcode.startsWith('M')) {
        return { success: false, error: 'Not a valid IATA boarding pass barcode' };
      }

      // Extract number of legs (M1 = 1 leg, M2 = 2 legs, etc.)
      const legs = parseInt(barcode.charAt(1));
      
      if (legs < 1 || legs > 4) {
        return { success: false, error: 'Invalid number of flight legs' };
      }

      let pos = 2;

      // Passenger name (variable length, ends at first space before PNR)
      // Format: SURNAME/FIRSTNAME
      const nameEndPos = barcode.indexOf(' ', pos);
      const fullName = barcode.substring(pos, nameEndPos).trim();
      const [lastName, firstName] = fullName.split('/');
      
      pos = nameEndPos + 1;

      // Electronic ticket indicator (E)
      const eTicket = barcode.charAt(pos);
      pos += 1;

      // PNR / Booking reference (6 chars)
      const bookingReference = barcode.substring(pos, pos + 6).trim();
      pos += 6;

      // Origin airport (3 chars)
      const origin = barcode.substring(pos, pos + 3);
      pos += 3;

      // Destination airport (3 chars)
      const destination = barcode.substring(pos, pos + 3);
      pos += 3;

      // Airline code (2-3 chars)
      const airline = barcode.substring(pos, pos + 3).replace(/\s/g, '');
      pos += 3;

      // Flight number (4-5 chars)
      const flightNumber = barcode.substring(pos, pos + 5).replace(/^0+/, '').trim();
      pos += 5;

      // Julian date (3 chars - day of year)
      const julianDate = barcode.substring(pos, pos + 3);
      pos += 3;

      // Class of service (1 char)
      const serviceClass = barcode.charAt(pos);
      pos += 1;

      // Seat number (4 chars)
      const seatNumber = barcode.substring(pos, pos + 4).trim();
      pos += 4;

      // Sequence number (4 chars)
      const sequenceNumber = barcode.substring(pos, pos + 4).trim();
      pos += 4;

      // Check-in sequence (1 char)
      const checkinSeq = barcode.charAt(pos);
      pos += 1;

      // Try to extract gate from conditional section if available
      let gateNumber = 'TBA';
      
      // Look for gate pattern in the remaining data
      const remainingData = barcode.substring(pos);
      const gateMatch = remainingData.match(/\s([A-Z]\d{1,2})\s/);
      if (gateMatch) {
        gateNumber = gateMatch[1];
      }

      // Map service class
      let classOfService: 'economy' | 'business' | 'first' = 'economy';
      if (serviceClass === 'F') classOfService = 'first';
      else if (serviceClass === 'J' || serviceClass === 'C') classOfService = 'business';
      else if (serviceClass === 'Y' || serviceClass === 'M') classOfService = 'economy';

      const boardingPass: BoardingPass = {
        passengerName: fullName,
        firstName: firstName?.trim(),
        lastName: lastName?.trim(),
        flightNumber: `${airline}${flightNumber}`,
        airline: airline,
        bookingReference: bookingReference,
        origin: origin,
        destination: destination,
        seatNumber: seatNumber,
        gateNumber: gateNumber,
        departureTime: 'Check airport displays', // Not in barcode
        classOfService: classOfService,
        sequenceNumber: sequenceNumber,
        barcode: barcode,
        rawData: barcode,
        parseMethod: 'iata'
      };

      return {
        success: true,
        boardingPass: boardingPass,
        confidence: 0.9
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to parse barcode: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Parse manual/OCR extracted text from boarding pass
   * This handles the human-readable format like your image
   */
  parseManualFormat(text: string): ParseResult {
    try {
      const lines = text.split('\n').map(l => l.trim());
      
      let passengerName = '';
      let flightNumber = '';
      let seatNumber = '';
      let gateNumber = '';
      let departureTime = '';
      let origin = '';
      let destination = '';

      // Look for patterns in the text
      for (const line of lines) {
        // Passenger name (usually all caps with comma)
        if (line.match(/^[A-Z]+,\s*[A-Z]+$/)) {
          passengerName = line;
        }

        // Flight number (letters + numbers like CB092, EY123)
        const flightMatch = line.match(/\b([A-Z]{2}\d{3,4})\b/);
        if (flightMatch) {
          flightNumber = flightMatch[1];
        }

        // Seat (like 14B, 23A)
        const seatMatch = line.match(/\b(\d{1,2}[A-F])\b/);
        if (seatMatch && !seatNumber) {
          seatNumber = seatMatch[1];
        }

        // Gate (like A12, B5, C23)
        const gateMatch = line.match(/\b([A-C]\d{1,2})\b/);
        if (gateMatch && !gateNumber) {
          gateNumber = gateMatch[1];
        }

        // Time (like 07:10, 14:30)
        const timeMatch = line.match(/\b(\d{2}:\d{2})\b/);
        if (timeMatch && !departureTime) {
          departureTime = timeMatch[1];
        }

        // Airport codes (3 letters)
        const airportMatch = line.match(/\b([A-Z]{3})\b/);
        if (airportMatch) {
          if (!origin) origin = airportMatch[1];
          else if (!destination && airportMatch[1] !== origin) {
            destination = airportMatch[1];
          }
        }
      }

      if (!passengerName || !flightNumber || !gateNumber) {
        return {
          success: false,
          error: 'Could not extract required information (name, flight, or gate)'
        };
      }

      const boardingPass: BoardingPass = {
        passengerName: passengerName,
        flightNumber: flightNumber,
        seatNumber: seatNumber || 'N/A',
        gateNumber: gateNumber,
        departureTime: departureTime || 'TBA',
        origin: origin || 'N/A',
        destination: destination || 'N/A',
        rawData: text,
        parseMethod: 'manual'
      };

      return {
        success: true,
        boardingPass: boardingPass,
        confidence: 0.7
      };

    } catch (error) {
      return {
        success: false,
        error: `Failed to parse text: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Smart parser - tries IATA first, falls back to manual parsing
   */
  parse(data: string): ParseResult {
    // Try IATA barcode format first
    if (data.startsWith('M')) {
      const result = this.parseIATABarcode(data);
      if (result.success) return result;
    }

    // Fall back to manual text parsing
    return this.parseManualFormat(data);
  }
}

export const boardingPassParser = new BoardingPassParser();
export default boardingPassParser;
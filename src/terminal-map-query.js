// Terminal Map Query Library
// This library allows the chatbot to query map data and answer user questions

class TerminalMapQuery {
  constructor(mapData) {
    this.data = mapData;
  }

  // ==================== GATE QUERIES ====================
  
  /**
   * Find a gate by name or ID
   * Example: findGate("A1") or findGate("gate_a1")
   */
  findGate(gateIdentifier) {
    const query = gateIdentifier.toLowerCase().replace(/\s+/g, '');
    return this.data.gates.find(gate => 
      gate.name.toLowerCase() === query || 
      gate.id.toLowerCase() === query ||
      gate.display_name.toLowerCase().includes(query)
    );
  }

  /**
   * Get all gates in a concourse
   * Example: getGatesByConcourse("A")
   */
  getGatesByConcourse(concourse) {
    return this.data.gates.filter(gate => 
      gate.concourse.toUpperCase() === concourse.toUpperCase()
    );
  }

  /**
   * Get gate location description
   * Example: getGateLocation("A1") -> "Gate A1 is located in Concourse A, upper level"
   */
  getGateLocation(gateName) {
    const gate = this.findGate(gateName);
    if (!gate) return `Gate ${gateName} not found in our system.`;
    
    return `Gate ${gate.name} is located in ${gate.location_description}. ` +
           `Current wait time: ${gate.wait_time_minutes} minutes (${gate.congestion} congestion).`;
  }

  // ==================== DISTANCE CALCULATIONS ====================
  
  /**
   * Calculate straight-line distance between two points
   */
  calculateDistance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Get distance between two gates
   * Example: getDistanceBetweenGates("A1", "A5") -> {distance: 400, time: "4 minutes 46 seconds"}
   */
  getDistanceBetweenGates(gate1Name, gate2Name) {
    const gate1 = this.findGate(gate1Name);
    const gate2 = this.findGate(gate2Name);
    
    if (!gate1) return { error: `Gate ${gate1Name} not found` };
    if (!gate2) return { error: `Gate ${gate2Name} not found` };
    
    const distance = this.calculateDistance(gate1.x, gate1.y, gate2.x, gate2.y);
    const walkingTime = distance / this.data.routing.walking_speed_mps;
    const minutes = Math.floor(walkingTime / 60);
    const seconds = Math.round(walkingTime % 60);
    
    return {
      from: gate1.name,
      to: gate2.name,
      distance_meters: Math.round(distance),
      walking_time_seconds: Math.round(walkingTime),
      walking_time_formatted: `${minutes} minutes ${seconds} seconds`,
      description: `From Gate ${gate1.name} to Gate ${gate2.name}: approximately ${Math.round(distance)} meters, about ${minutes} minute${minutes !== 1 ? 's' : ''} walk.`
    };
  }

  /**
   * Natural language distance query
   * Example: "How far from Gate A1 to Gate A5?"
   */
  answerDistanceQuery(query) {
    const gatePattern = /gate\s*([a-c]\d+)/gi;
    const matches = [...query.matchAll(gatePattern)];
    
    if (matches.length >= 2) {
      const gate1 = matches[0][1];
      const gate2 = matches[1][1];
      const result = this.getDistanceBetweenGates(gate1, gate2);
      return result.description || result.error;
    }
    
    return "Please specify two gates. Example: 'How far from Gate A1 to Gate A5?'";
  }

  // ==================== FACILITY QUERIES ====================
  
  /**
   * Find facilities by type
   * Example: findFacilitiesByType("dining") or findFacilitiesByType("prayer_room")
   */
  findFacilitiesByType(type) {
    return this.data.facilities.filter(facility => 
      facility.type.toLowerCase() === type.toLowerCase() ||
      facility.category.toLowerCase() === type.toLowerCase()
    );
  }

  /**
   * Find nearest facility to a gate
   * Example: findNearestFacility("A1", "dining")
   */
  findNearestFacility(gateName, facilityType) {
    const gate = this.findGate(gateName);
    if (!gate) return { error: `Gate ${gateName} not found` };
    
    const facilities = facilityType ? 
      this.findFacilitiesByType(facilityType) : 
      this.data.facilities;
    
    let nearest = null;
    let minDistance = Infinity;
    
    facilities.forEach(facility => {
      const distance = this.calculateDistance(gate.x, gate.y, facility.x, facility.y);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = facility;
      }
    });
    
    if (!nearest) return { error: `No ${facilityType} facilities found` };
    
    const walkingTime = minDistance / this.data.routing.walking_speed_mps;
    const minutes = Math.floor(walkingTime / 60);
    
    return {
      facility: nearest.display_name,
      type: nearest.type,
      distance_meters: Math.round(minDistance),
      walking_time_minutes: minutes,
      description: `The nearest ${nearest.type} to Gate ${gate.name} is ${nearest.display_name}, located about ${Math.round(minDistance)} meters away (${minutes} minute walk). ${nearest.location_description}`
    };
  }

  /**
   * Find all facilities near a gate
   * Example: getFacilitiesNearGate("A1", 200) - within 200 meters
   */
  getFacilitiesNearGate(gateName, maxDistance = 300) {
    const gate = this.findGate(gateName);
    if (!gate) return { error: `Gate ${gateName} not found` };
    
    const nearbyFacilities = this.data.facilities
      .map(facility => ({
        ...facility,
        distance: this.calculateDistance(gate.x, gate.y, facility.x, facility.y)
      }))
      .filter(f => f.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);
    
    return {
      gate: gate.name,
      count: nearbyFacilities.length,
      facilities: nearbyFacilities.map(f => ({
        name: f.display_name,
        type: f.type,
        distance_meters: Math.round(f.distance),
        icon: f.icon
      })),
      description: `Near Gate ${gate.name}, there are ${nearbyFacilities.length} facilities: ${nearbyFacilities.map(f => f.display_name).join(', ')}`
    };
  }

  // ==================== NATURAL LANGUAGE QUERIES ====================
  
  /**
   * Answer "Where is" questions
   * Example: "Where is Gate A1?" or "Where is the prayer room?"
   */
  answerWhereIsQuery(query) {
    const queryLower = query.toLowerCase();
    
    // Check for gate query
    if (queryLower.includes('gate')) {
      const gateMatch = queryLower.match(/gate\s*([a-c]\d+)/i);
      if (gateMatch) {
        return this.getGateLocation(gateMatch[1]);
      }
    }
    
    // Check for facility queries
    const facilityKeywords = {
      'prayer': 'prayer_room',
      'bathroom': 'restroom',
      'restroom': 'restroom',
      'toilet': 'restroom',
      'restaurant': 'dining',
      'food': 'dining',
      'coffee': 'cafe',
      'shop': 'retail',
      'duty free': 'duty_free',
      'lounge': 'lounge',
      'pharmacy': 'pharmacy',
      'information': 'information',
      'currency': 'currency_exchange'
    };
    
    for (const [keyword, type] of Object.entries(facilityKeywords)) {
      if (queryLower.includes(keyword)) {
        const facilities = this.findFacilitiesByType(type);
        if (facilities.length > 0) {
          return `I found ${facilities.length} ${type.replace('_', ' ')} location(s): ` +
                 facilities.map(f => `${f.display_name} (${f.location_description})`).join(', ');
        }
      }
    }
    
    return "I can help you find gates, restaurants, prayer rooms, restrooms, shops, and other facilities. What are you looking for?";
  }

  /**
   * Answer "What's near" questions
   * Example: "What's near Gate A1?" or "What restaurants are near Gate B3?"
   */
  answerWhatsNearQuery(query) {
    const gateMatch = query.match(/gate\s*([a-c]\d+)/i);
    if (!gateMatch) {
      return "Please specify a gate. Example: 'What's near Gate A1?'";
    }
    
    const gateName = gateMatch[1];
    const queryLower = query.toLowerCase();
    
    // Check for specific facility type
    let facilityType = null;
    if (queryLower.includes('restaurant') || queryLower.includes('food')) facilityType = 'dining';
    if (queryLower.includes('shop') || queryLower.includes('retail')) facilityType = 'retail';
    if (queryLower.includes('prayer')) facilityType = 'prayer_room';
    if (queryLower.includes('bathroom') || queryLower.includes('restroom')) facilityType = 'restroom';
    
    if (facilityType) {
      const result = this.findNearestFacility(gateName, facilityType);
      return result.description || result.error;
    } else {
      const result = this.getFacilitiesNearGate(gateName);
      return result.description || result.error;
    }
  }

  /**
   * Get gate congestion info
   * Example: "How busy is Gate A4?"
   */
  getGateCongestion(gateName) {
    const gate = this.findGate(gateName);
    if (!gate) return `Gate ${gateName} not found.`;
    
    const congestionText = {
      'low': 'not busy',
      'medium': 'moderately busy',
      'high': 'very busy'
    };
    
    return `Gate ${gate.name} is currently ${congestionText[gate.congestion]} with an estimated wait time of ${gate.wait_time_minutes} minutes.`;
  }

  // ==================== ACCESSIBILITY QUERIES ====================
  
  /**
   * Find accessible routes
   * Example: findAccessibleRoute("A1", "C2")
   */
  findAccessibleRoute(fromGate, toGate) {
    const gate1 = this.findGate(fromGate);
    const gate2 = this.findGate(toGate);
    
    if (!gate1 || !gate2) return { error: "Gate not found" };
    
    // Find nearest elevator or ramp
    const accessibilityFeatures = this.data.accessibility
      .filter(a => a.type === 'elevator' || a.type === 'ramp')
      .map(feature => ({
        ...feature,
        distanceFrom1: this.calculateDistance(gate1.x, gate1.y, feature.x, feature.y),
        distanceFrom2: this.calculateDistance(gate2.x, gate2.y, feature.x, feature.y)
      }));
    
    return {
      from: gate1.name,
      to: gate2.name,
      accessible_features: accessibilityFeatures.slice(0, 3).map(f => ({
        type: f.type,
        location: f.location_description
      })),
      description: `Accessible route from Gate ${gate1.name} to Gate ${gate2.name}: Use ${accessibilityFeatures[0].type} at ${accessibilityFeatures[0].location_description}`
    };
  }

  // ==================== MAIN QUERY HANDLER ====================
  
  /**
   * Main entry point for natural language queries
   * Routes to appropriate handler based on query type
   */
  handleQuery(query) {
    const queryLower = query.toLowerCase();
    
    // Distance queries
    if (queryLower.includes('how far') || 
        queryLower.includes('distance') ||
        (queryLower.includes('from') && queryLower.includes('to'))) {
      return this.answerDistanceQuery(query);
    }
    
    // "Where is" queries
    if (queryLower.includes('where is') || queryLower.includes('where are')) {
      return this.answerWhereIsQuery(query);
    }
    
    // "What's near" queries
    if (queryLower.includes('near') || 
        queryLower.includes('close to') ||
        queryLower.includes('around')) {
      return this.answerWhatsNearQuery(query);
    }
    
    // Congestion queries
    if (queryLower.includes('busy') || 
        queryLower.includes('crowded') ||
        queryLower.includes('wait time')) {
      const gateMatch = query.match(/gate\s*([a-c]\d+)/i);
      if (gateMatch) {
        return this.getGateCongestion(gateMatch[1]);
      }
    }
    
    // Accessibility queries
    if (queryLower.includes('accessible') || 
        queryLower.includes('wheelchair') ||
        queryLower.includes('elevator')) {
      return "I can help you find accessible routes, elevators, and ramps. Please specify your starting and destination gates.";
    }
    
    return "I can help you with:\n" +
           "- Gate locations: 'Where is Gate A1?'\n" +
           "- Distances: 'How far from Gate A1 to Gate A5?'\n" +
           "- Nearby facilities: 'What's near Gate B3?'\n" +
           "- Wait times: 'How busy is Gate A4?'\n" +
           "What would you like to know?";
  }
}

// ==================== USAGE EXAMPLES ====================

// Example usage for chatbot integration:
/*
const mapQuery = new TerminalMapQuery(terminalMapData);

// User asks: "Where is Gate A1?"
console.log(mapQuery.handleQuery("Where is Gate A1?"));
// Output: "Gate A1 is located in Concourse A, upper level. Current wait time: 5 minutes (low congestion)."

// User asks: "How far from Gate A1 to Gate A5?"
console.log(mapQuery.handleQuery("How far from Gate A1 to Gate A5?"));
// Output: "From Gate A1 to Gate A5: approximately 400 meters, about 4 minutes walk."

// User asks: "What restaurants are near Gate B3?"
console.log(mapQuery.handleQuery("What restaurants are near Gate B3?"));
// Output: "The nearest dining to Gate B3 is Terminal Restaurant, located about 186 meters away (2 minute walk)..."

// User asks: "How busy is Gate A4?"
console.log(mapQuery.handleQuery("How busy is Gate A4?"));
// Output: "Gate A4 is currently very busy with an estimated wait time of 18 minutes."
*/

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TerminalMapQuery;
}
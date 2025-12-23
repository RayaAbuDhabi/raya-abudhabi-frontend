// lib/test-navigation.ts
// Comprehensive test suite for Raya's navigation engine

import navigationEngine from './services/navigationEngine';

console.log('🚀 RAYA NAVIGATION ENGINE - VALIDATION SUITE\n');
console.log('='.repeat(60));

// TEST 1: System Statistics
console.log('\n📊 TEST 1: SYSTEM STATISTICS');
console.log('-'.repeat(60));
try {
  const stats = navigationEngine.getStats();
  console.log('✅ Navigation engine initialized');
  console.log(`   Total POIs: ${stats.totalPOIs}`);
  console.log(`   Gates: ${stats.gates}`);
  console.log(`   Dining: ${stats.dining}`);
  console.log(`   Retail: ${stats.retail}`);
  console.log(`   Services: ${stats.services}`);
  console.log(`   Facilities: ${stats.facilities}`);
  console.log(`   Navigation nodes: ${stats.navigationNodes}`);
  
  if (stats.totalPOIs === 0) {
    console.error('❌ CRITICAL: No POIs loaded!');
  }
} catch (error) {
  console.error('❌ FAILED:', error);
}

// TEST 2: Gate Lookup
console.log('\n🚪 TEST 2: GATE LOOKUP');
console.log('-'.repeat(60));
const testGates = ['gate a1', 'gate a5', 'gate b3', 'gate c10'];
testGates.forEach(gateName => {
  const gate = navigationEngine.findPOI(gateName);
  if (gate) {
    console.log(`✅ Found: ${gate.name} (${gate.terminal}, Floor ${gate.floor})`);
  } else {
    console.log(`❌ Not found: ${gateName}`);
  }
});

// TEST 3: Fuzzy Search
console.log('\n🔍 TEST 3: FUZZY SEARCH');
console.log('-'.repeat(60));
const searches = [
  { query: 'coffee', category: 'dining' },
  { query: 'pharmacy', category: 'service' },  // Changed from 'services' to 'service'
  { query: 'lounge', category: 'lounge' },     // Changed from 'facilities' to 'lounge'
  { query: 'prayer', category: 'facility' }    // Changed from 'facilities' to 'facility'
];

searches.forEach(({ query, category }) => {
  const results = navigationEngine.searchPOIs(query, { 
    category: category,
    limit: 3 
  });
  console.log(`\n"${query}" (${category}): ${results.length} results`);
  results.forEach((poi, i) => {
    console.log(`   ${i + 1}. ${poi.name} - ${poi.terminal}, Level ${poi.coordinates.level}`);
  });
});

// TEST 4: Nearby POIs
console.log('\n📍 TEST 4: NEARBY POI DETECTION');
console.log('-'.repeat(60));
const gateA1 = navigationEngine.findPOI('gate a1');
if (gateA1) {
  console.log(`Starting point: ${gateA1.name}`);
  const nearby = navigationEngine.getNearbyPOIs(gateA1, 100);
  console.log(`Found ${nearby.length} POIs within 100m:`);
  nearby.slice(0, 5).forEach(poi => {
    console.log(`   - ${poi.name} (${poi.distance.toFixed(0)}m)`);
  });
}

// TEST 5: Pathfinding - Short Distance
console.log('\n🗺️  TEST 5: PATHFINDING - SHORT ROUTE');
console.log('-'.repeat(60));
const shortRouteTest = () => {
  const start = navigationEngine.findPOI('gate a1');
  const end = navigationEngine.findPOI('gate a5');
  
  if (start && end) {
    console.log(`Route: ${start.name} → ${end.name}`);
    const route = navigationEngine.findPath(start, end);
    
    if (route) {
      console.log(`✅ Path found!`);
      console.log(`   Distance: ${route.distance}m`);
      console.log(`   Walking time: ${route.walkingTime}s (~${Math.ceil(route.walkingTime / 60)} min)`);
      console.log(`   Steps: ${route.instructions.length}`);
      console.log('\n   Turn-by-turn:');
      route.instructions.forEach((step, i) => {
        console.log(`   ${i + 1}. ${step}`);
      });
    } else {
      console.log('❌ No path found');
    }
  }
};
shortRouteTest();

// TEST 6: Pathfinding - Long Distance (Cross-terminal)
console.log('\n🗺️  TEST 6: PATHFINDING - CROSS-TERMINAL ROUTE');
console.log('-'.repeat(60));
const longRouteTest = () => {
  const start = navigationEngine.findPOI('gate a1');
  const end = navigationEngine.findPOI('gate c10');
  
  if (start && end) {
    console.log(`Route: ${start.name} → ${end.name}`);
    const route = navigationEngine.findPath(start, end);
    
    if (route) {
      console.log(`✅ Path found!`);
      console.log(`   Distance: ${route.distance}m`);
      console.log(`   Walking time: ${route.walkingTime}s (~${Math.ceil(route.walkingTime / 60)} min)`);
      console.log(`   Steps: ${route.instructions.length}`);
      console.log('\n   Key waypoints:');
      route.instructions.slice(0, 5).forEach((step, i) => {
        console.log(`   ${i + 1}. ${step}`);
      });
      if (route.instructions.length > 5) {
        console.log(`   ... (${route.instructions.length - 5} more steps)`);
      }
    } else {
      console.log('❌ No path found');
    }
  }
};
longRouteTest();

// TEST 7: Filter by Terminal
console.log('\n🏢 TEST 7: TERMINAL FILTERING');
console.log('-'.repeat(60));
const terminal = 'T3';
const pois = navigationEngine.searchPOIs('', { 
  terminal: terminal,
  limit: 5 
});
console.log(`${terminal}: ${pois.length} POIs (showing first 5):`);
pois.forEach(poi => {
  console.log(`   - ${poi.name} (${poi.category})`);
});

// TEST 8: Accessibility Check
console.log('\n♿ TEST 8: ACCESSIBILITY FEATURES');
console.log('-'.repeat(60));
const accessible = navigationEngine.searchPOIs('', { 
  accessibility: true,
  limit: 10 
});
console.log(`Found ${accessible.length} accessible POIs:`);
accessible.slice(0, 5).forEach(poi => {
  console.log(`   ✅ ${poi.name} (${poi.terminal})`);
});

// SUMMARY
console.log('\n' + '='.repeat(60));
console.log('🎯 TEST SUITE COMPLETE');
console.log('='.repeat(60));
console.log('\nNext steps:');
console.log('1. Review any ❌ failures above');
console.log('2. Check lib/data/navigationPaths.ts if nodes = 0');
console.log('3. Verify lib/data/terminalMaps.ts has all POIs');
console.log('4. Test integration with hybrid engine');
console.log('\n✨ Ready to integrate with Raya\'s voice assistant!\n');
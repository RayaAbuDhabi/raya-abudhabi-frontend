// lib/debug-pois.ts
// Check what properties your POIs actually have

import navigationEngine from './services/navigationEngine';

console.log('🔍 DEBUGGING POI STRUCTURE\n');

// Get the first POI
const firstGate = navigationEngine.findPOI('gate a1');

if (firstGate) {
  console.log('📦 Sample POI (Gate A1):');
  console.log(JSON.stringify(firstGate, null, 2));
  console.log('\n🔑 Available properties:', Object.keys(firstGate));
}

// Check a dining POI
const coffee = navigationEngine.findPOI('costa coffee');
if (coffee) {
  console.log('\n📦 Sample POI (Costa Coffee):');
  console.log(JSON.stringify(coffee, null, 2));
}

// Try searching without type filter
const allResults = navigationEngine.searchPOIs('', { limit: 5 });
console.log('\n📋 First 5 POIs (no filter):');
allResults.forEach((poi, i) => {
  console.log(`${i + 1}. ${poi.name}`);
  console.log(`   Properties:`, Object.keys(poi));
  console.log(`   Full object:`, JSON.stringify(poi, null, 2));
});
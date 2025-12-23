import navigationEngine from './services/navigationEngine';

console.log('🧪 SIMPLE PATHFINDING TEST\n');

const gateA1 = navigationEngine.findPOI('gate a1');
const gateA5 = navigationEngine.findPOI('gate a5');

if (!gateA1 || !gateA5) {
  console.error('❌ Could not find gates');
  process.exit(1);
}

console.log('✅ Found both gates');
console.log(`   Gate A1: (${gateA1.coordinates.x}, ${gateA1.coordinates.y})`);
console.log(`   Gate A5: (${gateA5.coordinates.x}, ${gateA5.coordinates.y})`);

console.log('\n🔍 Attempting pathfinding...');

const startTime = Date.now();
const route = navigationEngine.findPath(gateA1, gateA5);
const elapsed = Date.now() - startTime;

if (route) {
  console.log(`✅ PATH FOUND! (${elapsed}ms)`);
  console.log(`   Distance: ${route.distance}m`);
  console.log(`   Walking time: ${route.walkingTime}s`);
  console.log(`   Steps: ${route.instructions.length}`);
  route.instructions.forEach((instruction, i) => {
    console.log(`   ${i + 1}. ${instruction}`);
  });
} else {
  console.log(`❌ No path found (${elapsed}ms)`);
}
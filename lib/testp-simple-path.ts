import { findPOI, findSimplePath } from './services/simplePathfinding';

console.log('🧪 SIMPLE PATHFINDING TEST\n');

const gateA1 = findPOI('gate a1');
const gateA5 = findPOI('gate a5');

if (!gateA1 || !gateA5) {
  console.error('❌ Gates not found');
  process.exit(1);
}

console.log('✅ Found gates');
console.log(`   ${gateA1.name}: (${gateA1.coordinates.x}, ${gateA1.coordinates.y})`);
console.log(`   ${gateA5.name}: (${gateA5.coordinates.x}, ${gateA5.coordinates.y})`);

const route = findSimplePath(gateA1, gateA5);

console.log('\n✅ PATH FOUND!');
console.log(`   Distance: ${route.distance}m`);
console.log(`   Walking time: ${route.walkingTime}s (~${Math.ceil(route.walkingTime / 60)} min)`);
console.log('\n📍 Instructions:');
route.instructions.forEach((inst, i) => {
  console.log(`   ${i + 1}. ${inst}`);
});
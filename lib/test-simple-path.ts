console.log('🔍 Starting test...');

import { findPOI, findSimplePath } from './services/simplePathfinding';

console.log('✅ Imports loaded');

const gateA1 = findPOI('gate a1');
const gateA5 = findPOI('gate a5');

console.log('Gate A1:', gateA1);
console.log('Gate A5:', gateA5);

if (gateA1 && gateA5) {
  console.log('✅ Both gates found, calculating path...');
  const route = findSimplePath(gateA1, gateA5);
  console.log('✅ PATH FOUND!');
  console.log(`Distance: ${route.distance}m`);
  console.log(`Time: ${route.walkingTime}s`);
  route.instructions.forEach(i => console.log(`- ${i}`));
} else {
  console.log('❌ Gates not found');
}
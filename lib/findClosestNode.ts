// lib/test-closest-node.ts
import navigationGraph from './data/navigationPaths';
import navigationEngine from './services/navigationEngine';

console.log('🔍 DEBUG: Finding Closest Nodes\n');

const gateA1 = navigationEngine.findPOI('gate a1');

if (!gateA1) {
  console.error('❌ Gate A1 not found');
  process.exit(1);
}

console.log('Gate A1 coordinates:', gateA1.coordinates);
console.log('Gate A1 level:', gateA1.coordinates.level);

console.log('\n📊 Navigation Graph Info:');
console.log(`Total nodes: ${navigationGraph.length}`);

console.log('\nNodes on same level as Gate A1:');
const sameLevelNodes = navigationGraph.filter(
  n => n.coordinates.level === gateA1.coordinates.level || n.coordinates.level === 'both'
);

console.log(`Found ${sameLevelNodes.length} nodes on level "${gateA1.coordinates.level}" or "both"`);

if (sameLevelNodes.length === 0) {
  console.log('\n❌ NO NODES ON SAME LEVEL!');
  console.log('Available levels in graph:');
  const levels = [...new Set(navigationGraph.map(n => n.coordinates.level))];
  console.log(levels);
} else {
  console.log('\nCalculating distances:');
  sameLevelNodes.forEach(node => {
    const dist = Math.sqrt(
      Math.pow(node.coordinates.x - gateA1.coordinates.x, 2) +
      Math.pow(node.coordinates.y - gateA1.coordinates.y, 2)
    );
    console.log(`  ${node.id}: ${dist.toFixed(0)}px away`);
  });
}
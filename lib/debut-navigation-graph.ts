// lib/debug-navigation-graph.ts
// Debug why pathfinding fails

import navigationGraph from './data/navigationPaths';
import navigationEngine from './services/navigationEngine';

console.log('🔍 DEBUGGING NAVIGATION GRAPH\n');

console.log('📊 Graph Statistics:');
console.log(`   Total nodes: ${navigationGraph.length}`);
console.log(`   Node IDs:`, navigationGraph.map(n => n.id));

console.log('\n🔗 Connection Analysis:');
navigationGraph.forEach(node => {
  console.log(`\n${node.id}:`);
  console.log(`   Position: (${node.coordinates.x}, ${node.coordinates.y})`);
  console.log(`   Level: ${node.coordinates.level}`);
  console.log(`   Type: ${node.type || 'junction'}`);
  console.log(`   Connections: ${node.connections.length}`);
  node.connections.forEach(conn => {
    console.log(`      → ${conn.to} (${conn.distance}m)`);
  });
});

console.log('\n🎯 Testing POI to Node Mapping:');
const gateA1 = navigationEngine.findPOI('gate a1');
const gateA5 = navigationEngine.findPOI('gate a5');

if (gateA1) {
  console.log(`\nGate A1:`);
  console.log(`   Position: (${gateA1.coordinates.x}, ${gateA1.coordinates.y})`);
  console.log(`   Level: ${gateA1.coordinates.level}`);
  
  // Find closest node manually
  const sameLevelNodes = navigationGraph.filter(
    n => n.coordinates.level === gateA1.coordinates.level || n.coordinates.level === 'both'
  );
  console.log(`   Same-level nodes available: ${sameLevelNodes.length}`);
  
  if (sameLevelNodes.length > 0) {
    const distances = sameLevelNodes.map(n => ({
      id: n.id,
      distance: Math.sqrt(
        Math.pow(n.coordinates.x - gateA1.coordinates.x, 2) +
        Math.pow(n.coordinates.y - gateA1.coordinates.y, 2)
      )
    }));
    distances.sort((a, b) => a.distance - b.distance);
    console.log(`   Closest nodes:`, distances.slice(0, 3));
  }
}

if (gateA5) {
  console.log(`\nGate A5:`);
  console.log(`   Position: (${gateA5.coordinates.x}, ${gateA5.coordinates.y})`);
  console.log(`   Level: ${gateA5.coordinates.level}`);
}

console.log('\n🚨 DIAGNOSIS:');
if (navigationGraph.length < 5) {
  console.log('❌ Not enough navigation nodes (need 20+ for proper routing)');
}

const disconnectedNodes = navigationGraph.filter(n => n.connections.length === 0);
if (disconnectedNodes.length > 0) {
  console.log(`❌ ${disconnectedNodes.length} disconnected nodes found:`, disconnectedNodes.map(n => n.id));
}

const totalConnections = navigationGraph.reduce((sum, n) => sum + n.connections.length, 0);
console.log(`\n✅ Total connections in graph: ${totalConnections}`);
if (totalConnections === 0) {
  console.log('❌ CRITICAL: No connections between nodes! Graph is completely disconnected.');
}
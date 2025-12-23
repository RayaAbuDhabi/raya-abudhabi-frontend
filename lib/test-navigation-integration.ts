import offlineEngine from './services/offlineEngine';

console.log('🧪 NAVIGATION INTEGRATION TEST\n');

async function testQuery(query: string) {
  console.log(`\n📝 Query: "${query}"`);
  const result = await offlineEngine.processQuery(query);
  console.log(`✅ Answer: ${result.answer}`);
  console.log(`📊 Confidence: ${result.confidence}`);
  console.log(`📂 Category: ${result.category}`);
  
  if (result.navigation) {
    console.log(`🗺️ Navigation:`);
    console.log(`   Distance: ${result.navigation.distance}m`);
    console.log(`   Time: ${Math.ceil(result.navigation.walkingTime / 60)} min`);
    console.log(`   Steps: ${result.navigation.instructions.length}`);
  }
}

// Test navigation queries
(async () => {
  await testQuery("take me to gate a5");
  await testQuery("where is gate a1");
  await testQuery("how do I get to gate c5");
  
  // Test regular FAQ
  await testQuery("is there wifi");
})();
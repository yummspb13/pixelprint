// Test API order functionality
async function testAPIOrder() {
  console.log('🧪 Testing API order functionality...');
  
  try {
    // First, get current services
    console.log('1. Getting current services...');
    const response = await fetch('https://pixelprint1.vercel.app/api/services?includeInactive=true');
    const data = await response.json();
    
    const advertising = data.services.Advertising;
    if (!advertising || advertising.length < 2) {
      console.log('❌ Not enough services in Advertising category');
      return;
    }
    
    console.log('Current Advertising services:');
    advertising.forEach((service, index) => {
      console.log(`  ${index + 1}. ${service.name} (ID: ${service.id}, order: ${service.order})`);
    });
    
    // Test moving first service down
    const firstService = advertising[0];
    const secondService = advertising[1];
    
    console.log(`\n2. Moving ${firstService.name} down...`);
    
    const updates = [
      { id: firstService.id, order: 2 },
      { id: secondService.id, order: 1 }
    ];
    
    console.log('Updates:', updates);
    
    const updateResponse = await fetch('https://pixelprint1.vercel.app/api/services/bulk-update-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates, useTempSwap: false })
    });
    
    const updateResult = await updateResponse.json();
    console.log('Update result:', updateResult);
    
    if (updateResult.success) {
      console.log('✅ Update successful!');
      
      // Wait a bit and check the result
      console.log('\n3. Waiting 2 seconds and checking result...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const checkResponse = await fetch('https://pixelprint1.vercel.app/api/services?includeInactive=true');
      const checkData = await checkResponse.json();
      
      const newAdvertising = checkData.services.Advertising;
      console.log('New Advertising services order:');
      newAdvertising.forEach((service, index) => {
        console.log(`  ${index + 1}. ${service.name} (ID: ${service.id}, order: ${service.order})`);
      });
      
      // Check if order changed
      const firstServiceNew = newAdvertising.find(s => s.id === firstService.id);
      const secondServiceNew = newAdvertising.find(s => s.id === secondService.id);
      
      if (firstServiceNew.order === 2 && secondServiceNew.order === 1) {
        console.log('✅ Order changed correctly!');
      } else {
        console.log('❌ Order did not change as expected');
      }
    } else {
      console.log('❌ Update failed');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAPIOrder();

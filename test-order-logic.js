// Test the order logic
function testOrderLogic() {
  console.log('🧪 Testing order logic...');
  
  // Simulate services array
  const services = [
    { id: 189, name: 'Flyers', order: 1 },
    { id: 190, name: 'Leaflets', order: 2 },
    { id: 191, name: 'Posters', order: 3 }
  ];
  
  console.log('Initial order:', services.map(s => `${s.name} (${s.order})`));
  
  // Test moving service 190 up (should become first)
  const serviceId = 190;
  const direction = 'up';
  
  const categoryServices = services.sort((a, b) => a.order - b.order);
  const currentIndex = categoryServices.findIndex(s => s.id === serviceId);
  const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
  
  console.log('Current index:', currentIndex);
  console.log('New index:', newIndex);
  
  // Create new order array
  const newOrder = [...categoryServices];
  const [movedService] = newOrder.splice(currentIndex, 1);
  newOrder.splice(newIndex, 0, movedService);
  
  console.log('New order array:', newOrder.map(s => s.name));
  
  // Prepare updates with correct order values
  const updates = newOrder.map((service, index) => ({
    id: service.id,
    order: index + 1
  }));
  
  console.log('Updates:', updates);
  
  // Expected result: Leaflets should be first (order: 1), Flyers second (order: 2), Posters third (order: 3)
  const expected = [
    { id: 190, order: 1 }, // Leaflets
    { id: 189, order: 2 }, // Flyers
    { id: 191, order: 3 }  // Posters
  ];
  
  console.log('Expected:', expected);
  console.log('Match:', JSON.stringify(updates) === JSON.stringify(expected) ? '✅' : '❌');
}

testOrderLogic();

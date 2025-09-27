const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function fixServiceOrder() {
  try {
    console.log('🔧 Fixing service order...');
    
    // Get all services grouped by category
    const services = await prisma.service.findMany({
      orderBy: [
        { category: 'asc' },
        { createdAt: 'asc' }
      ]
    });
    
    const servicesByCategory = {};
    services.forEach(service => {
      if (!servicesByCategory[service.category]) {
        servicesByCategory[service.category] = [];
      }
      servicesByCategory[service.category].push(service);
    });
    
    console.log(`Found ${Object.keys(servicesByCategory).length} categories`);
    
    let categoryOrder = 1;
    const updates = [];
    
    // Process each category
    for (const [category, categoryServices] of Object.entries(servicesByCategory)) {
      console.log(`Processing category: ${category} (${categoryServices.length} services)`);
      
      // Set categoryOrder for all services in this category
      categoryServices.forEach((service, index) => {
        updates.push({
          id: service.id,
          order: index + 1,
          categoryOrder: categoryOrder
        });
      });
      
      categoryOrder++;
    }
    
    console.log(`Updating ${updates.length} services...`);
    
    // Update all services in batches
    const batchSize = 10;
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      
      await prisma.$transaction(
        batch.map(update =>
          prisma.service.update({
            where: { id: update.id },
            data: {
              order: update.order,
              categoryOrder: update.categoryOrder
            }
          })
        )
      );
      
      console.log(`Updated batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(updates.length / batchSize)}`);
    }
    
    console.log('✅ Service order fixed successfully!');
    
    // Verify the fix
    const updatedServices = await prisma.service.findMany({
      orderBy: [
        { categoryOrder: 'asc' },
        { order: 'asc' }
      ],
      select: {
        id: true,
        name: true,
        category: true,
        order: true,
        categoryOrder: true
      }
    });
    
    console.log('\n📋 Updated services order:');
    let currentCategory = '';
    updatedServices.forEach(service => {
      if (service.category !== currentCategory) {
        currentCategory = service.category;
        console.log(`\n${currentCategory}:`);
      }
      console.log(`  ${service.order}. ${service.name} (categoryOrder: ${service.categoryOrder})`);
    });
    
  } catch (error) {
    console.error('❌ Error fixing service order:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixServiceOrder();

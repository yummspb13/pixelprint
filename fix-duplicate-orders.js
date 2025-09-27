const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.nrtznccqxnfbvgarbqua:Rat606727931@aws-1-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
    }
  }
});

async function fixDuplicateOrders() {
  try {
    console.log('🔧 Fixing duplicate orders...');
    
    // Get all services grouped by category
    const services = await prisma.service.findMany({
      orderBy: [
        { category: 'asc' },
        { categoryOrder: 'asc' },
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
    
    const updates = [];
    
    // Process each category
    for (const [category, categoryServices] of Object.entries(servicesByCategory)) {
      console.log(`Processing category: ${category} (${categoryServices.length} services)`);
      
      // Sort by current order, then by creation date
      const sortedServices = categoryServices.sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
      
      // Assign new sequential order
      sortedServices.forEach((service, index) => {
        updates.push({
          id: service.id,
          order: index + 1,
          categoryOrder: service.categoryOrder
        });
      });
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
    
    console.log('✅ Duplicate orders fixed successfully!');
    
    // Verify the fix
    const updatedServices = await prisma.service.findMany({
      where: { category: 'Advertising' },
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
    
    console.log('\n📋 Updated Advertising services order:');
    updatedServices.forEach(service => {
      console.log(`  ${service.order}. ${service.name} (categoryOrder: ${service.categoryOrder})`);
    });
    
  } catch (error) {
    console.error('❌ Error fixing duplicate orders:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDuplicateOrders();

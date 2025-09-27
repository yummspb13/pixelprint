const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.nrtznccqxnfbvgarbqua:Rat606727931@aws-1-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
    }
  }
});

async function checkOrder() {
  try {
    console.log('🔍 Checking service order in Supabase...');
    
    const services = await prisma.service.findMany({
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
    
    console.log('Advertising services:');
    services.forEach(service => {
      console.log(`  ${service.order}. ${service.name} (categoryOrder: ${service.categoryOrder})`);
    });
    
  } catch (error) {
    console.error('❌ Error checking order:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrder();

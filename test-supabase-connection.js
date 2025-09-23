const { PrismaClient } = require('@prisma/client');

// Используем ваши реальные данные подключения
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.nrtznccqxnfbvgarbqua:Rat606727931@aws-1-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
    }
  }
});

async function testConnection() {
  try {
    console.log('🔍 Тестируем подключение к Supabase PostgreSQL...');
    
    // Проверяем подключение
    await prisma.$connect();
    console.log('✅ Подключение к базе данных успешно!');
    
    // Проверяем количество записей в каждой таблице
    const servicesCount = await prisma.service.count();
    console.log(`📦 Services: ${servicesCount} записей`);
    
    const priceRowsCount = await prisma.priceRow.count();
    console.log(`💰 PriceRows: ${priceRowsCount} записей`);
    
    const tiersCount = await prisma.tier.count();
    console.log(`📊 Tiers: ${tiersCount} записей`);
    
    const menuTilesCount = await prisma.menuTile.count();
    console.log(`🍽️ MenuTiles: ${menuTilesCount} записей`);
    
    const whyArticlesCount = await prisma.whyArticle.count();
    console.log(`📝 WhyArticles: ${whyArticlesCount} записей`);
    
    const settingsCount = await prisma.settings.count();
    console.log(`⚙️ Settings: ${settingsCount} записей`);
    
    console.log('🎉 Все проверки пройдены успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка при подключении к базе данных:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

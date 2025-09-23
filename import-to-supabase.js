const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

// Создаем клиент для Supabase PostgreSQL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.nrtznccqxnfbvgarbqua:Rat606727931@aws-1-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
    }
  }
});

async function importData() {
  try {
    console.log('🚀 Начинаем импорт данных в Supabase...');

    // 1. Импортируем Services
    console.log('📦 Импортируем Services...');
    const servicesData = fs.readFileSync('services.json', 'utf8');
    const services = JSON.parse(servicesData);
    
    for (const service of services) {
      try {
        await prisma.service.upsert({
          where: { id: service.id },
          update: service,
          create: service
        });
      } catch (error) {
        console.log(`⚠️ Ошибка при импорте сервиса ${service.id}:`, error.message);
      }
    }
    console.log(`✅ Импортировано ${services.length} сервисов`);

    // 2. Импортируем PriceRows
    console.log('💰 Импортируем PriceRows...');
    const priceRowsData = fs.readFileSync('price_rows.json', 'utf8');
    const priceRows = JSON.parse(priceRowsData);
    
    for (const priceRow of priceRows) {
      try {
        await prisma.priceRow.upsert({
          where: { id: priceRow.id },
          update: priceRow,
          create: priceRow
        });
      } catch (error) {
        console.log(`⚠️ Ошибка при импорте price row ${priceRow.id}:`, error.message);
      }
    }
    console.log(`✅ Импортировано ${priceRows.length} price rows`);

    // 3. Импортируем Tiers
    console.log('📊 Импортируем Tiers...');
    const tiersData = fs.readFileSync('tiers.json', 'utf8');
    const tiers = JSON.parse(tiersData);
    
    for (const tier of tiers) {
      try {
        await prisma.tier.upsert({
          where: { id: tier.id },
          update: tier,
          create: tier
        });
      } catch (error) {
        console.log(`⚠️ Ошибка при импорте tier ${tier.id}:`, error.message);
      }
    }
    console.log(`✅ Импортировано ${tiers.length} tiers`);

    // 4. Импортируем MenuTiles
    console.log('🍽️ Импортируем MenuTiles...');
    const menuTilesData = fs.readFileSync('menu_tiles.json', 'utf8');
    const menuTiles = JSON.parse(menuTilesData);
    
    for (const menuTile of menuTiles) {
      try {
        await prisma.menuTile.upsert({
          where: { id: menuTile.id },
          update: menuTile,
          create: menuTile
        });
      } catch (error) {
        console.log(`⚠️ Ошибка при импорте menu tile ${menuTile.id}:`, error.message);
      }
    }
    console.log(`✅ Импортировано ${menuTiles.length} menu tiles`);

    // 5. Импортируем WhyArticles
    console.log('📝 Импортируем WhyArticles...');
    const whyArticlesData = fs.readFileSync('why_articles.json', 'utf8');
    const whyArticles = JSON.parse(whyArticlesData);
    
    for (const whyArticle of whyArticles) {
      try {
        await prisma.whyArticle.upsert({
          where: { id: whyArticle.id },
          update: whyArticle,
          create: whyArticle
        });
      } catch (error) {
        console.log(`⚠️ Ошибка при импорте why article ${whyArticle.id}:`, error.message);
      }
    }
    console.log(`✅ Импортировано ${whyArticles.length} why articles`);

    console.log('🎉 Импорт завершен успешно!');

  } catch (error) {
    console.error('❌ Ошибка при импорте:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importData();

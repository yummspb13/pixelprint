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

async function fixAndImport() {
  try {
    console.log('🧹 Очищаем старые данные в Supabase...');

    // 1. Удаляем все старые данные в правильном порядке
    await prisma.tier.deleteMany();
    console.log('✅ Удалены все tiers');

    await prisma.priceRow.deleteMany();
    console.log('✅ Удалены все price rows');

    await prisma.service.deleteMany();
    console.log('✅ Удалены все services');

    await prisma.menuTile.deleteMany();
    console.log('✅ Удалены все menu tiles');

    await prisma.whyArticle.deleteMany();
    console.log('✅ Удалены все why articles');

    await prisma.settings.deleteMany();
    console.log('✅ Удалены все settings');

    console.log('\n🚀 Начинаем импорт новых данных...');

    // 2. Импортируем Services с исправлением типов
    console.log('📦 Импортируем Services...');
    const servicesData = fs.readFileSync('services.json', 'utf8');
    const services = JSON.parse(servicesData);
    
    for (const service of services) {
      try {
        await prisma.service.create({
          data: {
            ...service,
            isActive: Boolean(service.isActive),
            configuratorEnabled: Boolean(service.configuratorEnabled),
            calculatorAvailable: Boolean(service.calculatorAvailable)
          }
        });
      } catch (error) {
        console.log(`⚠️ Ошибка при импорте сервиса ${service.id}:`, error.message);
      }
    }
    console.log(`✅ Импортировано ${services.length} сервисов`);

    // 3. Импортируем PriceRows с исправлением типов
    console.log('💰 Импортируем PriceRows...');
    const priceRowsData = fs.readFileSync('price_rows.json', 'utf8');
    const priceRows = JSON.parse(priceRowsData);
    
    for (const priceRow of priceRows) {
      try {
        await prisma.priceRow.create({
          data: {
            ...priceRow,
            isActive: Boolean(priceRow.isActive)
          }
        });
      } catch (error) {
        console.log(`⚠️ Ошибка при импорте price row ${priceRow.id}:`, error.message);
      }
    }
    console.log(`✅ Импортировано ${priceRows.length} price rows`);

    // 4. Импортируем Tiers
    console.log('📊 Импортируем Tiers...');
    const tiersData = fs.readFileSync('tiers.json', 'utf8');
    const tiers = JSON.parse(tiersData);
    
    for (const tier of tiers) {
      try {
        await prisma.tier.create({
          data: tier
        });
      } catch (error) {
        console.log(`⚠️ Ошибка при импорте tier ${tier.id}:`, error.message);
      }
    }
    console.log(`✅ Импортировано ${tiers.length} tiers`);

    // 5. Импортируем MenuTiles с исправлением типов
    console.log('🍽️ Импортируем MenuTiles...');
    const menuTilesData = fs.readFileSync('menu_tiles.json', 'utf8');
    const menuTiles = JSON.parse(menuTilesData);
    
    for (const menuTile of menuTiles) {
      try {
        await prisma.menuTile.create({
          data: {
            ...menuTile,
            isActive: Boolean(menuTile.isActive)
          }
        });
      } catch (error) {
        console.log(`⚠️ Ошибка при импорте menu tile ${menuTile.id}:`, error.message);
      }
    }
    console.log(`✅ Импортировано ${menuTiles.length} menu tiles`);

    // 6. Импортируем WhyArticles с исправлением типов
    console.log('📝 Импортируем WhyArticles...');
    const whyArticlesData = fs.readFileSync('why_articles.json', 'utf8');
    const whyArticles = JSON.parse(whyArticlesData);
    
    for (const whyArticle of whyArticles) {
      try {
        await prisma.whyArticle.create({
          data: {
            ...whyArticle,
            isActive: Boolean(whyArticle.isActive)
          }
        });
      } catch (error) {
        console.log(`⚠️ Ошибка при импорте why article ${whyArticle.id}:`, error.message);
      }
    }
    console.log(`✅ Импортировано ${whyArticles.length} why articles`);

    console.log('\n🎉 Импорт завершен успешно!');

  } catch (error) {
    console.error('❌ Ошибка при импорте:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAndImport();

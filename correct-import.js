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

// Функция для конвертации timestamp в Date
function convertTimestamp(timestamp) {
  return new Date(timestamp);
}

async function correctImport() {
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
    
    let importedServices = 0;
    for (const service of services) {
      try {
        await prisma.service.create({
          data: {
            ...service,
            isActive: Boolean(service.isActive),
            configuratorEnabled: Boolean(service.configuratorEnabled),
            calculatorAvailable: Boolean(service.calculatorAvailable),
            createdAt: convertTimestamp(service.createdAt),
            updatedAt: convertTimestamp(service.updatedAt)
          }
        });
        importedServices++;
      } catch (error) {
        console.log(`⚠️ Ошибка при импорте сервиса ${service.id}:`, error.message);
      }
    }
    console.log(`✅ Импортировано ${importedServices} сервисов`);

    // 3. Импортируем PriceRows с исправлением типов
    console.log('💰 Импортируем PriceRows...');
    const priceRowsData = fs.readFileSync('price_rows.json', 'utf8');
    const priceRows = JSON.parse(priceRowsData);
    
    let importedPriceRows = 0;
    for (const priceRow of priceRows) {
      try {
        await prisma.priceRow.create({
          data: {
            ...priceRow,
            isActive: Boolean(priceRow.isActive),
            createdAt: convertTimestamp(priceRow.createdAt),
            updatedAt: convertTimestamp(priceRow.updatedAt)
          }
        });
        importedPriceRows++;
      } catch (error) {
        console.log(`⚠️ Ошибка при импорте price row ${priceRow.id}:`, error.message);
      }
    }
    console.log(`✅ Импортировано ${importedPriceRows} price rows`);

    // 4. Получаем список существующих price row IDs
    const existingPriceRowIds = await prisma.priceRow.findMany({
      select: { id: true }
    });
    const existingIds = new Set(existingPriceRowIds.map(row => row.id));
    console.log(`📋 Найдено ${existingIds.size} существующих price rows`);

    // 5. Импортируем только те Tiers, которые ссылаются на существующие PriceRows
    console.log('📊 Импортируем Tiers...');
    const tiersData = fs.readFileSync('tiers.json', 'utf8');
    const tiers = JSON.parse(tiersData);
    
    let importedTiers = 0;
    let skippedTiers = 0;
    for (const tier of tiers) {
      try {
        if (existingIds.has(tier.rowId)) {
          await prisma.tier.create({
            data: tier
          });
          importedTiers++;
        } else {
          skippedTiers++;
        }
      } catch (error) {
        console.log(`⚠️ Ошибка при импорте tier ${tier.id}:`, error.message);
      }
    }
    console.log(`✅ Импортировано ${importedTiers} tiers, пропущено ${skippedTiers} tiers`);

    // 6. Импортируем MenuTiles с исправлением типов
    console.log('🍽️ Импортируем MenuTiles...');
    const menuTilesData = fs.readFileSync('menu_tiles.json', 'utf8');
    const menuTiles = JSON.parse(menuTilesData);
    
    let importedMenuTiles = 0;
    for (const menuTile of menuTiles) {
      try {
        await prisma.menuTile.create({
          data: {
            ...menuTile,
            isActive: Boolean(menuTile.isActive),
            createdAt: convertTimestamp(menuTile.createdAt),
            updatedAt: convertTimestamp(menuTile.updatedAt)
          }
        });
        importedMenuTiles++;
      } catch (error) {
        console.log(`⚠️ Ошибка при импорте menu tile ${menuTile.id}:`, error.message);
      }
    }
    console.log(`✅ Импортировано ${importedMenuTiles} menu tiles`);

    // 7. Импортируем WhyArticles с исправлением типов
    console.log('📝 Импортируем WhyArticles...');
    const whyArticlesData = fs.readFileSync('why_articles.json', 'utf8');
    const whyArticles = JSON.parse(whyArticlesData);
    
    let importedWhyArticles = 0;
    for (const whyArticle of whyArticles) {
      try {
        await prisma.whyArticle.create({
          data: {
            ...whyArticle,
            isActive: Boolean(whyArticle.isActive),
            createdAt: convertTimestamp(whyArticle.createdAt),
            updatedAt: convertTimestamp(whyArticle.updatedAt)
          }
        });
        importedWhyArticles++;
      } catch (error) {
        console.log(`⚠️ Ошибка при импорте why article ${whyArticle.id}:`, error.message);
      }
    }
    console.log(`✅ Импортировано ${importedWhyArticles} why articles`);

    console.log('\n🎉 Импорт завершен успешно!');
    console.log(`📊 Итого импортировано:`);
    console.log(`  - Services: ${importedServices}`);
    console.log(`  - PriceRows: ${importedPriceRows}`);
    console.log(`  - Tiers: ${importedTiers}`);
    console.log(`  - MenuTiles: ${importedMenuTiles}`);
    console.log(`  - WhyArticles: ${importedWhyArticles}`);

  } catch (error) {
    console.error('❌ Ошибка при импорте:', error);
  } finally {
    await prisma.$disconnect();
  }
}

correctImport();

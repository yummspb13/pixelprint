const { PrismaClient } = require('@prisma/client');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// SQLite база данных
const sqliteDb = new sqlite3.Database(path.join(__dirname, 'prisma/dev.db'));

// PostgreSQL база данных (будет использовать DATABASE_URL из переменных окружения)
const prisma = new PrismaClient();

async function migrateData() {
  try {
    console.log('🚀 Начинаем миграцию данных...');

    // 1. Мигрируем Services
    console.log('📦 Мигрируем Services...');
    const services = await getSqliteData('SELECT * FROM Service');
    for (const service of services) {
      await prisma.service.upsert({
        where: { id: service.id },
        update: service,
        create: service
      });
    }
    console.log(`✅ Мигрировано ${services.length} сервисов`);

    // 2. Мигрируем PriceRows
    console.log('💰 Мигрируем PriceRows...');
    const priceRows = await getSqliteData('SELECT * FROM PriceRow');
    for (const priceRow of priceRows) {
      await prisma.priceRow.upsert({
        where: { id: priceRow.id },
        update: priceRow,
        create: priceRow
      });
    }
    console.log(`✅ Мигрировано ${priceRows.length} price rows`);

    // 3. Мигрируем Tiers
    console.log('📊 Мигрируем Tiers...');
    const tiers = await getSqliteData('SELECT * FROM Tier');
    for (const tier of tiers) {
      await prisma.tier.upsert({
        where: { id: tier.id },
        update: tier,
        create: tier
      });
    }
    console.log(`✅ Мигрировано ${tiers.length} tiers`);

    // 4. Мигрируем MenuTiles
    console.log('🍽️ Мигрируем MenuTiles...');
    const menuTiles = await getSqliteData('SELECT * FROM MenuTile');
    for (const menuTile of menuTiles) {
      await prisma.menuTile.upsert({
        where: { id: menuTile.id },
        update: menuTile,
        create: menuTile
      });
    }
    console.log(`✅ Мигрировано ${menuTiles.length} menu tiles`);

    // 5. Мигрируем WhyArticles
    console.log('📝 Мигрируем WhyArticles...');
    const whyArticles = await getSqliteData('SELECT * FROM WhyArticle');
    for (const whyArticle of whyArticles) {
      await prisma.whyArticle.upsert({
        where: { id: whyArticle.id },
        update: whyArticle,
        create: whyArticle
      });
    }
    console.log(`✅ Мигрировано ${whyArticles.length} why articles`);

    // 6. Мигрируем Settings
    console.log('⚙️ Мигрируем Settings...');
    const settings = await getSqliteData('SELECT * FROM Settings');
    for (const setting of settings) {
      await prisma.settings.upsert({
        where: { id: setting.id },
        update: setting,
        create: setting
      });
    }
    console.log(`✅ Мигрировано ${settings.length} settings`);

    console.log('🎉 Миграция завершена успешно!');

  } catch (error) {
    console.error('❌ Ошибка при миграции:', error);
  } finally {
    await prisma.$disconnect();
    sqliteDb.close();
  }
}

function getSqliteData(query) {
  return new Promise((resolve, reject) => {
    sqliteDb.all(query, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

migrateData();

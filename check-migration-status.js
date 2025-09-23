const { PrismaClient } = require('@prisma/client');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const prisma = new PrismaClient();
const sqliteDb = new sqlite3.Database(path.join(__dirname, 'prisma/dev.db'));

async function checkMigrationStatus() {
  try {
    console.log('🔍 Проверяем статус миграции...\n');

    // SQLite данные
    console.log('📊 SQLite (исходные данные):');
    const sqliteServices = await getSqliteData('SELECT COUNT(*) as count FROM Service');
    const sqlitePriceRows = await getSqliteData('SELECT COUNT(*) as count FROM PriceRow');
    const sqliteTiers = await getSqliteData('SELECT COUNT(*) as count FROM Tier');
    const sqliteMenuTiles = await getSqliteData('SELECT COUNT(*) as count FROM MenuTile');
    const sqliteWhyArticles = await getSqliteData('SELECT COUNT(*) as count FROM WhyArticle');
    const sqliteSettings = await getSqliteData('SELECT COUNT(*) as count FROM Settings');

    console.log(`  Services: ${sqliteServices[0].count}`);
    console.log(`  PriceRows: ${sqlitePriceRows[0].count}`);
    console.log(`  Tiers: ${sqliteTiers[0].count}`);
    console.log(`  MenuTiles: ${sqliteMenuTiles[0].count}`);
    console.log(`  WhyArticles: ${sqliteWhyArticles[0].count}`);
    console.log(`  Settings: ${sqliteSettings[0].count}`);

    // PostgreSQL данные
    console.log('\n🐘 PostgreSQL (мигрированные данные):');
    try {
      await prisma.$connect();
      
      const pgServices = await prisma.service.count();
      const pgPriceRows = await prisma.priceRow.count();
      const pgTiers = await prisma.tier.count();
      const pgMenuTiles = await prisma.menuTile.count();
      const pgWhyArticles = await prisma.whyArticle.count();
      const pgSettings = await prisma.settings.count();

      console.log(`  Services: ${pgServices}`);
      console.log(`  PriceRows: ${pgPriceRows}`);
      console.log(`  Tiers: ${pgTiers}`);
      console.log(`  MenuTiles: ${pgMenuTiles}`);
      console.log(`  WhyArticles: ${pgWhyArticles}`);
      console.log(`  Settings: ${pgSettings}`);

      // Проверяем соответствие
      console.log('\n✅ Статус миграции:');
      console.log(`  Services: ${sqliteServices[0].count === pgServices ? '✅' : '❌'} (${sqliteServices[0].count}/${pgServices})`);
      console.log(`  PriceRows: ${sqlitePriceRows[0].count === pgPriceRows ? '✅' : '❌'} (${sqlitePriceRows[0].count}/${pgPriceRows})`);
      console.log(`  Tiers: ${sqliteTiers[0].count === pgTiers ? '✅' : '❌'} (${sqliteTiers[0].count}/${pgTiers})`);
      console.log(`  MenuTiles: ${sqliteMenuTiles[0].count === pgMenuTiles ? '✅' : '❌'} (${sqliteMenuTiles[0].count}/${pgMenuTiles})`);
      console.log(`  WhyArticles: ${sqliteWhyArticles[0].count === pgWhyArticles ? '✅' : '❌'} (${sqliteWhyArticles[0].count}/${pgWhyArticles})`);
      console.log(`  Settings: ${sqliteSettings[0].count === pgSettings ? '✅' : '❌'} (${sqliteSettings[0].count}/${pgSettings})`);

    } catch (error) {
      console.log('❌ Ошибка подключения к PostgreSQL:', error.message);
      console.log('💡 Убедитесь, что:');
      console.log('  1. Создана база данных в Vercel');
      console.log('  2. Добавлена переменная DATABASE_URL');
      console.log('  3. Выполнена команда: npx prisma db push');
    }

  } catch (error) {
    console.error('❌ Ошибка при проверке:', error);
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

checkMigrationStatus();

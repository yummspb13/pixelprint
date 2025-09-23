const { PrismaClient } = require('@prisma/client');

// Создаем два клиента Prisma - один для SQLite, один для Supabase
const sqlitePrisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:./prisma/dev.db"
    }
  }
});

const supabasePrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.nrtznccqxnfbvgarbqua:Rat606727931@aws-1-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
    }
  }
});

async function migrateData() {
  try {
    console.log('🚀 Начинаем миграцию данных из SQLite в Supabase...');

    // 1. Мигрируем Services
    console.log('📦 Мигрируем Services...');
    const services = await sqlitePrisma.service.findMany();
    for (const service of services) {
      try {
        await supabasePrisma.service.upsert({
          where: { id: service.id },
          update: service,
          create: service
        });
      } catch (error) {
        console.log(`⚠️ Ошибка при миграции сервиса ${service.id}:`, error.message);
      }
    }
    console.log(`✅ Мигрировано ${services.length} сервисов`);

    // 2. Мигрируем PriceRows
    console.log('💰 Мигрируем PriceRows...');
    const priceRows = await sqlitePrisma.priceRow.findMany();
    for (const priceRow of priceRows) {
      try {
        await supabasePrisma.priceRow.upsert({
          where: { id: priceRow.id },
          update: priceRow,
          create: priceRow
        });
      } catch (error) {
        console.log(`⚠️ Ошибка при миграции price row ${priceRow.id}:`, error.message);
      }
    }
    console.log(`✅ Мигрировано ${priceRows.length} price rows`);

    // 3. Мигрируем Tiers
    console.log('📊 Мигрируем Tiers...');
    const tiers = await sqlitePrisma.tier.findMany();
    for (const tier of tiers) {
      try {
        await supabasePrisma.tier.upsert({
          where: { id: tier.id },
          update: tier,
          create: tier
        });
      } catch (error) {
        console.log(`⚠️ Ошибка при миграции tier ${tier.id}:`, error.message);
      }
    }
    console.log(`✅ Мигрировано ${tiers.length} tiers`);

    // 4. Мигрируем MenuTiles
    console.log('🍽️ Мигрируем MenuTiles...');
    const menuTiles = await sqlitePrisma.menuTile.findMany();
    for (const menuTile of menuTiles) {
      try {
        await supabasePrisma.menuTile.upsert({
          where: { id: menuTile.id },
          update: menuTile,
          create: menuTile
        });
      } catch (error) {
        console.log(`⚠️ Ошибка при миграции menu tile ${menuTile.id}:`, error.message);
      }
    }
    console.log(`✅ Мигрировано ${menuTiles.length} menu tiles`);

    // 5. Мигрируем WhyArticles
    console.log('📝 Мигрируем WhyArticles...');
    const whyArticles = await sqlitePrisma.whyArticle.findMany();
    for (const whyArticle of whyArticles) {
      try {
        await supabasePrisma.whyArticle.upsert({
          where: { id: whyArticle.id },
          update: whyArticle,
          create: whyArticle
        });
      } catch (error) {
        console.log(`⚠️ Ошибка при миграции why article ${whyArticle.id}:`, error.message);
      }
    }
    console.log(`✅ Мигрировано ${whyArticles.length} why articles`);

    // 6. Мигрируем Settings
    console.log('⚙️ Мигрируем Settings...');
    const settings = await sqlitePrisma.settings.findMany();
    for (const setting of settings) {
      try {
        await supabasePrisma.settings.upsert({
          where: { id: setting.id },
          update: setting,
          create: setting
        });
      } catch (error) {
        console.log(`⚠️ Ошибка при миграции setting ${setting.id}:`, error.message);
      }
    }
    console.log(`✅ Мигрировано ${settings.length} settings`);

    console.log('🎉 Миграция завершена успешно!');

  } catch (error) {
    console.error('❌ Ошибка при миграции:', error);
  } finally {
    await sqlitePrisma.$disconnect();
    await supabasePrisma.$disconnect();
  }
}

migrateData();

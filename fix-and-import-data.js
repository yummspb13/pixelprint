const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function fixAndImportData() {
  try {
    console.log('🔧 Исправляем тип поля originalRowId...');
    
    // Исправляем тип поля originalRowId
    await prisma.$executeRaw`
      ALTER TABLE "PriceRow" DROP COLUMN IF EXISTS "originalRowId";
    `;
    
    await prisma.$executeRaw`
      ALTER TABLE "PriceRow" ADD COLUMN "originalRowId" TEXT UNIQUE;
    `;
    
    console.log('✅ Поле originalRowId исправлено на TEXT');
    
    // Очищаем существующие данные
    console.log('🧹 Очищаем существующие данные...');
    await prisma.tier.deleteMany();
    await prisma.priceRow.deleteMany();
    await prisma.service.deleteMany();
    await prisma.menuTile.deleteMany();
    await prisma.whyArticle.deleteMany();
    await prisma.settings.deleteMany();
    
    console.log('✅ Данные очищены');
    
    // Загружаем Services
    console.log('📥 Загружаем Services...');
    const servicesData = JSON.parse(fs.readFileSync('services.json', 'utf8'));
    
    for (const service of servicesData) {
      await prisma.service.create({
        data: {
          id: service.id,
          name: service.name,
          slug: service.slug,
          description: service.description,
          image: service.image,
          category: service.category,
          order: service.order,
          isActive: service.isActive === 1,
          configuratorEnabled: service.configuratorEnabled === 1,
          calculatorAvailable: service.calculatorAvailable === 1,
          clickCount: service.clickCount || 0,
          createdAt: new Date(service.createdAt),
          updatedAt: new Date(service.updatedAt)
        }
      });
    }
    
    console.log(`✅ Загружено ${servicesData.length} сервисов`);
    
    // Загружаем PriceRows
    console.log('📥 Загружаем PriceRows...');
    const priceRowsData = JSON.parse(fs.readFileSync('price_rows.json', 'utf8'));
    
    for (const priceRow of priceRowsData) {
      await prisma.priceRow.create({
        data: {
          id: priceRow.id,
          serviceId: priceRow.serviceId,
          attrs: priceRow.attrs,
          ruleKind: priceRow.ruleKind,
          unit: priceRow.unit || 0,
          setup: priceRow.setup || 0,
          fixed: priceRow.fixed || 0,
          originalRowId: `row_${priceRow.id}`,
          isActive: priceRow.isActive === 1,
          createdAt: new Date(priceRow.createdAt),
          updatedAt: new Date(priceRow.updatedAt)
        }
      });
    }
    
    console.log(`✅ Загружено ${priceRowsData.length} строк цен`);
    
    // Загружаем Tiers
    console.log('📥 Загружаем Tiers...');
    const tiersData = JSON.parse(fs.readFileSync('tiers.json', 'utf8'));
    
    for (const tier of tiersData) {
      await prisma.tier.create({
        data: {
          id: tier.id,
          rowId: tier.rowId,
          qty: tier.qty,
          unit: tier.unit
        }
      });
    }
    
    console.log(`✅ Загружено ${tiersData.length} уровней цен`);
    
    // Загружаем MenuTiles
    console.log('📥 Загружаем MenuTiles...');
    const menuTilesData = JSON.parse(fs.readFileSync('menu_tiles.json', 'utf8'));
    
    for (const menuTile of menuTilesData) {
      await prisma.menuTile.create({
        data: {
          id: menuTile.id,
          title: menuTile.title,
          description: menuTile.description,
          image: menuTile.image,
          link: menuTile.link,
          order: menuTile.order,
          isActive: menuTile.isActive === 1,
          createdAt: new Date(menuTile.createdAt),
          updatedAt: new Date(menuTile.updatedAt)
        }
      });
    }
    
    console.log(`✅ Загружено ${menuTilesData.length} плиток меню`);
    
    // Загружаем WhyArticles
    console.log('📥 Загружаем WhyArticles...');
    const whyArticlesData = JSON.parse(fs.readFileSync('why_articles.json', 'utf8'));
    
    for (const article of whyArticlesData) {
      await prisma.whyArticle.create({
        data: {
          id: article.id,
          title: article.title,
          content: article.content,
          image: article.image,
          order: article.order,
          isActive: article.isActive === 1,
          createdAt: new Date(article.createdAt),
          updatedAt: new Date(article.updatedAt)
        }
      });
    }
    
    console.log(`✅ Загружено ${whyArticlesData.length} статей`);
    
    // Загружаем Settings
    console.log('📥 Загружаем Settings...');
    const settingsData = JSON.parse(fs.readFileSync('settings.json', 'utf8'));
    
    for (const setting of settingsData) {
      await prisma.settings.create({
        data: {
          id: setting.id,
          key: setting.key,
          value: setting.value,
          description: setting.description,
          createdAt: new Date(setting.createdAt),
          updatedAt: new Date(setting.updatedAt)
        }
      });
    }
    
    console.log(`✅ Загружено ${settingsData.length} настроек`);
    
    // Проверяем результат
    console.log('\n📊 Итоговая статистика:');
    const serviceCount = await prisma.service.count();
    const priceRowCount = await prisma.priceRow.count();
    const tierCount = await prisma.tier.count();
    const menuTileCount = await prisma.menuTile.count();
    const whyArticleCount = await prisma.whyArticle.count();
    const settingsCount = await prisma.settings.count();
    
    console.log(`  - Services: ${serviceCount}`);
    console.log(`  - PriceRows: ${priceRowCount}`);
    console.log(`  - Tiers: ${tierCount}`);
    console.log(`  - MenuTiles: ${menuTileCount}`);
    console.log(`  - WhyArticles: ${whyArticleCount}`);
    console.log(`  - Settings: ${settingsCount}`);
    
    console.log('\n🎉 Все данные успешно загружены!');
    
  } catch (error) {
    console.error('❌ Ошибка при загрузке данных:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAndImportData();

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function completeImport() {
  try {
    console.log('📥 Загружаем оставшиеся данные...');
    
    // Загружаем MenuTiles
    console.log('📥 Загружаем MenuTiles...');
    const menuTilesData = JSON.parse(require('fs').readFileSync('menu_tiles.json', 'utf8'));
    
    for (const menuTile of menuTilesData) {
      await prisma.menuTile.create({
        data: {
          id: menuTile.id,
          label: menuTile.label,
          href: menuTile.href,
          image: menuTile.image,
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
    const whyArticlesData = JSON.parse(require('fs').readFileSync('why_articles.json', 'utf8'));
    
    for (const article of whyArticlesData) {
      await prisma.whyArticle.create({
        data: {
          id: article.id,
          title: article.title,
          text: article.text,
          content: article.content,
          image: article.image,
          href: article.href,
          span: article.span,
          images: article.images,
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
    const settingsData = JSON.parse(require('fs').readFileSync('settings.json', 'utf8'));
    
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
    
    // Тестируем API
    console.log('\n🧪 Тестируем API...');
    const services = await prisma.service.findMany({ take: 3 });
    console.log('✅ API работает, найдено сервисов:', services.length);
    
  } catch (error) {
    console.error('❌ Ошибка при загрузке данных:', error);
  } finally {
    await prisma.$disconnect();
  }
}

completeImport();

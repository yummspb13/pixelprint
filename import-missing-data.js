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

async function importMissingData() {
  try {
    console.log('🚀 Импортируем недостающие данные...');

    // 1. Импортируем MenuTiles с исправлением типов
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
        console.log(`✅ Импортирован menu tile: ${menuTile.label}`);
      } catch (error) {
        console.log(`⚠️ Ошибка при импорте menu tile ${menuTile.id}:`, error.message);
      }
    }
    console.log(`✅ Импортировано ${importedMenuTiles} menu tiles`);

    // 2. Импортируем WhyArticles с исправлением типов
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
        console.log(`✅ Импортирована статья: ${whyArticle.title}`);
      } catch (error) {
        console.log(`⚠️ Ошибка при импорте why article ${whyArticle.id}:`, error.message);
      }
    }
    console.log(`✅ Импортировано ${importedWhyArticles} why articles`);

    console.log('\n🎉 Импорт недостающих данных завершен!');
    console.log(`📊 Итого импортировано:`);
    console.log(`  - MenuTiles: ${importedMenuTiles}`);
    console.log(`  - WhyArticles: ${importedWhyArticles}`);

  } catch (error) {
    console.error('❌ Ошибка при импорте:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importMissingData();

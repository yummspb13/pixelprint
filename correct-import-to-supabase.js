const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

// Создаем клиент для Supabase PostgreSQL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.nrtznccqxnfbvgarbqua:Rat606727931@aws-1-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
    }
  }
});

async function correctImportData() {
  try {
    console.log('🚀 Начинаем правильный импорт данных в Supabase...');
    
    // Очищаем базу данных
    console.log('🧹 Очищаем базу данных...');
    await prisma.tier.deleteMany();
    await prisma.priceRow.deleteMany();
    await prisma.service.deleteMany();
    await prisma.menuTile.deleteMany();
    await prisma.whyArticle.deleteMany();
    await prisma.settings.deleteMany();
    console.log('✅ База данных очищена');

    // 1. Импортируем Services
    console.log('📦 Импортируем Services...');
    const servicesData = fs.readFileSync('services.json', 'utf8');
    const services = JSON.parse(servicesData);
    
    let importedServices = 0;
    for (const service of services) {
      try {
        await prisma.service.create({
          data: {
            id: service.id,
            slug: service.slug,
            name: service.name,
            description: service.description,
            image: service.image,
            category: service.category,
            order: service.order || 0,
            categoryOrder: service.categoryOrder || 0,
            isActive: Boolean(service.isActive),
            configuratorEnabled: Boolean(service.configuratorEnabled),
            calculatorAvailable: Boolean(service.calculatorAvailable),
            clickCount: service.clickCount || 0,
            createdAt: service.createdAt ? new Date(service.createdAt) : new Date(),
            updatedAt: service.updatedAt ? new Date(service.updatedAt) : new Date()
          }
        });
        importedServices++;
      } catch (error) {
        console.log(`⚠️ Ошибка при импорте сервиса ${service.id}:`, error.message);
      }
    }
    console.log(`✅ Импортировано ${importedServices} сервисов`);

    // 2. Импортируем PriceRows (БЕЗ originalRowId)
    console.log('💰 Импортируем PriceRows...');
    const priceRowsData = fs.readFileSync('price_rows.json', 'utf8');
    const priceRows = JSON.parse(priceRowsData);
    
    let importedPriceRows = 0;
    for (const priceRow of priceRows) {
      try {
        await prisma.priceRow.create({
          data: {
            id: priceRow.id,
            serviceId: priceRow.serviceId,
            attrs: priceRow.attrs,
            ruleKind: priceRow.ruleKind,
            unit: priceRow.unit,
            setup: priceRow.setup,
            fixed: priceRow.fixed,
            // originalRowId: priceRow.originalRowId, // Игнорируем это поле
            isActive: Boolean(priceRow.isActive),
            createdAt: priceRow.createdAt ? new Date(priceRow.createdAt) : new Date(),
            updatedAt: priceRow.updatedAt ? new Date(priceRow.updatedAt) : new Date()
          }
        });
        importedPriceRows++;
      } catch (error) {
        console.log(`⚠️ Ошибка при импорте price row ${priceRow.id}:`, error.message);
      }
    }
    console.log(`✅ Импортировано ${importedPriceRows} price rows`);

    // 3. Импортируем Tiers (только для существующих price rows)
    console.log('📊 Импортируем Tiers...');
    const tiersData = fs.readFileSync('tiers.json', 'utf8');
    const tiers = JSON.parse(tiersData);
    
    // Получаем все существующие price row IDs
    const existingPriceRowIds = await prisma.priceRow.findMany({
      select: { id: true }
    });
    const existingPriceRowIdSet = new Set(existingPriceRowIds.map(row => row.id));
    
    let importedTiers = 0;
    let skippedTiers = 0;
    for (const tier of tiers) {
      try {
        // Проверяем, что price row существует
        if (!existingPriceRowIdSet.has(tier.rowId)) {
          skippedTiers++;
          continue;
        }
        
        await prisma.tier.create({
          data: {
            id: tier.id,
            rowId: tier.rowId,
            qty: tier.qty,
            unit: tier.unit
          }
        });
        importedTiers++;
      } catch (error) {
        console.log(`⚠️ Ошибка при импорте tier ${tier.id}:`, error.message);
      }
    }
    console.log(`✅ Импортировано ${importedTiers} tiers (пропущено ${skippedTiers})`);

    // 4. Импортируем MenuTiles
    console.log('🍽️ Импортируем MenuTiles...');
    const menuTilesData = fs.readFileSync('menu_tiles.json', 'utf8');
    const menuTiles = JSON.parse(menuTilesData);
    
    let importedMenuTiles = 0;
    for (const menuTile of menuTiles) {
      try {
        await prisma.menuTile.create({
          data: {
            id: menuTile.id,
            label: menuTile.label,
            href: menuTile.href,
            image: menuTile.image,
            order: menuTile.order || 0,
            isActive: Boolean(menuTile.isActive),
            createdAt: menuTile.createdAt ? new Date(menuTile.createdAt) : new Date(),
            updatedAt: menuTile.updatedAt ? new Date(menuTile.updatedAt) : new Date()
          }
        });
        importedMenuTiles++;
      } catch (error) {
        console.log(`⚠️ Ошибка при импорте menu tile ${menuTile.id}:`, error.message);
      }
    }
    console.log(`✅ Импортировано ${importedMenuTiles} menu tiles`);

    // 5. Импортируем WhyArticles
    console.log('📝 Импортируем WhyArticles...');
    const whyArticlesData = fs.readFileSync('why_articles.json', 'utf8');
    const whyArticles = JSON.parse(whyArticlesData);
    
    let importedWhyArticles = 0;
    for (const whyArticle of whyArticles) {
      try {
        await prisma.whyArticle.create({
          data: {
            id: whyArticle.id,
            title: whyArticle.title,
            text: whyArticle.text,
            image: whyArticle.image,
            href: whyArticle.href,
            span: whyArticle.span,
            order: whyArticle.order || 0,
            isActive: Boolean(whyArticle.isActive),
            content: whyArticle.content,
            images: whyArticle.images,
            createdAt: whyArticle.createdAt ? new Date(whyArticle.createdAt) : new Date(),
            updatedAt: whyArticle.updatedAt ? new Date(whyArticle.updatedAt) : new Date()
          }
        });
        importedWhyArticles++;
      } catch (error) {
        console.log(`⚠️ Ошибка при импорте why article ${whyArticle.id}:`, error.message);
      }
    }
    console.log(`✅ Импортировано ${importedWhyArticles} why articles`);

    // 6. Добавляем базовые настройки
    console.log('⚙️ Добавляем базовые настройки...');
    const defaultSettings = [
      { key: 'site_name', value: 'PixelPrint', description: 'Название сайта', category: 'general' },
      { key: 'site_description', value: 'Профессиональная печать в Лондоне', description: 'Описание сайта', category: 'general' },
      { key: 'contact_email', value: 'info@pixelprint.com', description: 'Контактный email', category: 'contact' },
      { key: 'contact_phone', value: '+44 20 1234 5678', description: 'Контактный телефон', category: 'contact' }
    ];

    for (const setting of defaultSettings) {
      try {
        await prisma.settings.upsert({
          where: { key: setting.key },
          update: setting,
          create: setting
        });
      } catch (error) {
        console.log(`⚠️ Ошибка при добавлении настройки ${setting.key}:`, error.message);
      }
    }
    console.log(`✅ Добавлены базовые настройки`);

    // Финальная проверка
    console.log('\n🎉 Импорт завершен! Проверяем результат...');
    const finalServices = await prisma.service.count();
    const finalPriceRows = await prisma.priceRow.count();
    const finalTiers = await prisma.tier.count();
    const finalMenuTiles = await prisma.menuTile.count();
    const finalWhyArticles = await prisma.whyArticle.count();
    
    console.log(`📊 Финальное состояние базы данных:`);
    console.log(`- Services: ${finalServices} записей`);
    console.log(`- PriceRows: ${finalPriceRows} записей`);
    console.log(`- Tiers: ${finalTiers} записей`);
    console.log(`- MenuTiles: ${finalMenuTiles} записей`);
    console.log(`- WhyArticles: ${finalWhyArticles} записей`);
    
    if (finalServices > 0 && finalPriceRows > 0) {
      console.log('✅ Данные успешно загружены в Supabase!');
      console.log('🎯 Теперь можно деплоить на Vercel!');
    } else {
      console.log('❌ Что-то пошло не так, данные не загружены');
    }

  } catch (error) {
    console.error('❌ Ошибка при импорте:', error);
  } finally {
    await prisma.$disconnect();
  }
}

correctImportData();

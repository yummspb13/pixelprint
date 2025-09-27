const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function updateLeafletsData() {
  try {
    console.log('🔄 Обновляем данные Leaflets...\n');
    
    // Читаем данные из JSON файлов
    const priceRows = JSON.parse(fs.readFileSync('price_rows.json', 'utf8'));
    const leafletsRows = priceRows.filter(row => row.serviceId === 190);
    
    console.log(`📊 Найдено ${leafletsRows.length} строк для Leaflets в JSON`);
    
    // Находим сервис Leaflets
    const service = await prisma.service.findUnique({
      where: { slug: 'leaflets' }
    });
    
    if (!service) {
      console.log('❌ Сервис Leaflets не найден');
      return;
    }
    
    console.log(`✅ Сервис найден: ${service.name} (ID: ${service.id})\n`);
    
    // Удаляем старые строки цен
    console.log('🗑️ Удаляем старые строки цен...');
    await prisma.priceRow.deleteMany({
      where: { serviceId: service.id }
    });
    
    // Импортируем новые данные
    console.log('📥 Импортируем новые данные...');
    
    for (const row of leafletsRows) {
      try {
        await prisma.priceRow.create({
          data: {
            serviceId: service.id,
            attrs: row.attrs, // JSON строка
            ruleKind: row.ruleKind,
            unit: row.unit,
            setup: row.setup,
            fixed: row.fixed,
            isActive: Boolean(row.isActive),
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt)
          }
        });
        console.log(`  ✅ Строка ${row.id} импортирована`);
      } catch (error) {
        console.log(`  ❌ Ошибка импорта строки ${row.id}: ${error.message}`);
      }
    }
    
    // Импортируем tiers
    console.log('\n📊 Импортируем tiers...');
    const tiers = JSON.parse(fs.readFileSync('tiers.json', 'utf8'));
    const leafletsTiers = tiers.filter(tier => {
      // Находим rowId для Leaflets
      const priceRow = leafletsRows.find(row => row.id === tier.rowId);
      return priceRow;
    });
    
    console.log(`📊 Найдено ${leafletsTiers.length} tiers для Leaflets`);
    
    for (const tier of leafletsTiers) {
      try {
        await prisma.tier.create({
          data: {
            rowId: tier.rowId,
            qty: tier.qty,
            unit: tier.unit
          }
        });
        console.log(`  ✅ Tier ${tier.id} импортирован`);
      } catch (error) {
        console.log(`  ❌ Ошибка импорта tier ${tier.id}: ${error.message}`);
      }
    }
    
    console.log('\n✅ Обновление завершено!');
    
    // Проверяем результат
    const updatedService = await prisma.service.findUnique({
      where: { slug: 'leaflets' },
      include: {
        rows: {
          where: { isActive: true },
          select: { id: true, attrs: true }
        }
      }
    });
    
    console.log('\n📋 Результат:');
    const attrsMap = new Map();
    updatedService.rows.forEach(row => {
      const attrs = JSON.parse(row.attrs);
      Object.entries(attrs).forEach(([key, value]) => {
        if (!attrsMap.has(key)) {
          attrsMap.set(key, new Set());
        }
        attrsMap.get(key).add(value);
      });
    });
    
    attrsMap.forEach((values, key) => {
      const valuesArray = Array.from(values);
      console.log(`  ${key}: [${valuesArray.join(', ')}]`);
    });
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateLeafletsData();

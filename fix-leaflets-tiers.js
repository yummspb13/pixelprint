const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function fixLeafletsTiers() {
  try {
    console.log('🔧 Исправляем tiers для Leaflets...\n');
    
    // Читаем данные из JSON файлов
    const priceRows = JSON.parse(fs.readFileSync('price_rows.json', 'utf8'));
    const tiers = JSON.parse(fs.readFileSync('tiers.json', 'utf8'));
    
    // Находим Leaflets в JSON
    const leafletsRows = priceRows.filter(row => row.serviceId === 190);
    console.log(`📊 Найдено ${leafletsRows.length} строк Leaflets в JSON`);
    
    // Находим сервис в базе данных
    const service = await prisma.service.findUnique({
      where: { slug: 'leaflets' }
    });
    
    if (!service) {
      console.log('❌ Сервис Leaflets не найден');
      return;
    }
    
    console.log(`✅ Сервис найден: ${service.name} (ID: ${service.id})\n`);
    
    // Создаем маппинг старых ID на новые ID
    const idMapping = new Map();
    
    // Получаем текущие строки цен из базы
    const currentRows = await prisma.priceRow.findMany({
      where: { serviceId: service.id },
      orderBy: { id: 'asc' }
    });
    
    console.log(`📊 Найдено ${currentRows.length} строк в базе данных`);
    
    // Создаем маппинг по атрибутам
    for (let i = 0; i < leafletsRows.length && i < currentRows.length; i++) {
      const jsonRow = leafletsRows[i];
      const dbRow = currentRows[i];
      
      const jsonAttrs = JSON.parse(jsonRow.attrs);
      const dbAttrs = JSON.parse(dbRow.attrs);
      
      // Проверяем, что атрибуты совпадают
      const attrsMatch = Object.keys(jsonAttrs).every(key => 
        jsonAttrs[key] === dbAttrs[key]
      );
      
      if (attrsMatch) {
        idMapping.set(jsonRow.id, dbRow.id);
        console.log(`✅ Маппинг: JSON ${jsonRow.id} -> DB ${dbRow.id}`);
      } else {
        console.log(`❌ Атрибуты не совпадают для строки ${jsonRow.id}`);
      }
    }
    
    console.log(`\n📊 Создано ${idMapping.size} маппингов\n`);
    
    // Импортируем tiers
    const leafletsTiers = tiers.filter(tier => idMapping.has(tier.rowId));
    console.log(`📊 Найдено ${leafletsTiers.length} tiers для импорта\n`);
    
    let importedCount = 0;
    let errorCount = 0;
    
    for (const tier of leafletsTiers) {
      try {
        const newRowId = idMapping.get(tier.rowId);
        if (!newRowId) {
          console.log(`⚠️ Нет маппинга для rowId ${tier.rowId}`);
          continue;
        }
        
        await prisma.tier.create({
          data: {
            rowId: newRowId,
            qty: tier.qty,
            unit: tier.unit
          }
        });
        
        importedCount++;
        if (importedCount % 20 === 0) {
          console.log(`  ✅ Импортировано ${importedCount} tiers...`);
        }
        
      } catch (error) {
        errorCount++;
        if (errorCount <= 5) { // Показываем только первые 5 ошибок
          console.log(`  ❌ Ошибка импорта tier ${tier.id}: ${error.message}`);
        }
      }
    }
    
    console.log(`\n📊 Результат импорта:`);
    console.log(`  ✅ Импортировано: ${importedCount} tiers`);
    console.log(`  ❌ Ошибок: ${errorCount}`);
    
    // Проверяем результат
    console.log(`\n🔍 Проверяем результат...`);
    const updatedService = await prisma.service.findUnique({
      where: { slug: 'leaflets' },
      include: {
        rows: {
          where: { isActive: true },
          include: { tiers: true }
        }
      }
    });
    
    let totalTiers = 0;
    updatedService.rows.forEach((row, index) => {
      totalTiers += row.tiers.length;
      if (index < 3) { // Показываем первые 3 строки
        console.log(`Строка ${index + 1}: ${row.tiers.length} tiers`);
        if (row.tiers.length > 0) {
          row.tiers.slice(0, 3).forEach(tier => {
            console.log(`  ${tier.qty} шт: £${tier.unit}`);
          });
        }
      }
    });
    
    console.log(`\n✅ Итого tiers в базе: ${totalTiers}`);
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixLeafletsTiers();

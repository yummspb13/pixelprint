const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkLeafletsData() {
  try {
    console.log('🔍 Проверяем данные Leaflets в базе данных...\n');
    
    // Находим сервис Leaflets
    const service = await prisma.service.findUnique({
      where: { slug: 'leaflets' },
      include: {
        rows: {
          where: { isActive: true },
          select: { id: true, attrs: true }
        }
      }
    });
    
    if (!service) {
      console.log('❌ Сервис Leaflets не найден');
      return;
    }
    
    console.log(`✅ Сервис найден: ${service.name} (ID: ${service.id})`);
    console.log(`📊 Количество строк цен: ${service.rows.length}\n`);
    
    // Анализируем атрибуты
    const attrsMap = new Map();
    
    service.rows.forEach((row, index) => {
      console.log(`Строка ${index + 1} (ID: ${row.id}):`);
      console.log(`  attrs (строка): ${row.attrs}`);
      
      try {
        const attrs = typeof row.attrs === 'string' ? JSON.parse(row.attrs) : row.attrs;
        console.log(`  attrs (объект):`, attrs);
        
        Object.entries(attrs).forEach(([key, value]) => {
          if (!attrsMap.has(key)) {
            attrsMap.set(key, new Set());
          }
          attrsMap.get(key).add(value);
        });
      } catch (error) {
        console.log(`  ❌ Ошибка парсинга JSON: ${error.message}`);
      }
      console.log('');
    });
    
    console.log('📋 Уникальные атрибуты:');
    attrsMap.forEach((values, key) => {
      const valuesArray = Array.from(values);
      console.log(`  ${key}: ${valuesArray.length} значений - [${valuesArray.join(', ')}]`);
    });
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLeafletsData();

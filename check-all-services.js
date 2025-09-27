const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAllServices() {
  try {
    console.log('🔍 Проверяем все сервисы на проблему с парсингом JSON...\n');
    
    // Получаем все сервисы
    const services = await prisma.service.findMany({
      include: {
        rows: {
          where: { isActive: true },
          select: { id: true, attrs: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    console.log(`📊 Найдено ${services.length} сервисов\n`);
    
    let problemServices = [];
    
    for (const service of services) {
      if (service.rows.length === 0) continue;
      
      console.log(`🔍 Проверяем ${service.name} (${service.slug}):`);
      
      // Проверяем первую строку на проблему с парсингом
      const firstRow = service.rows[0];
      const attrsString = firstRow.attrs;
      
      try {
        const attrs = typeof attrsString === 'string' ? JSON.parse(attrsString) : attrsString;
        
        // Проверяем, есть ли проблемы с парсингом (символы вместо атрибутов)
        const hasProblem = Object.keys(attrs).some(key => key.length === 1 && /[{}":,\s]/.test(key));
        
        if (hasProblem) {
          console.log(`  ❌ ПРОБЛЕМА: Символы вместо атрибутов`);
          problemServices.push(service);
        } else {
          console.log(`  ✅ OK: ${Object.keys(attrs).length} атрибутов`);
        }
        
        // Показываем атрибуты
        const attrsMap = new Map();
        service.rows.forEach(row => {
          const rowAttrs = typeof row.attrs === 'string' ? JSON.parse(row.attrs) : row.attrs;
          Object.entries(rowAttrs).forEach(([key, value]) => {
            if (!attrsMap.has(key)) {
              attrsMap.set(key, new Set());
            }
            attrsMap.get(key).add(value);
          });
        });
        
        attrsMap.forEach((values, key) => {
          const valuesArray = Array.from(values);
          console.log(`    ${key}: ${valuesArray.length} значений [${valuesArray.slice(0, 3).join(', ')}${valuesArray.length > 3 ? '...' : ''}]`);
        });
        
      } catch (error) {
        console.log(`  ❌ ОШИБКА ПАРСИНГА: ${error.message}`);
        problemServices.push(service);
      }
      
      console.log('');
    }
    
    console.log('📋 РЕЗУЛЬТАТ:');
    if (problemServices.length === 0) {
      console.log('✅ Все сервисы работают правильно!');
    } else {
      console.log(`❌ Найдено ${problemServices.length} сервисов с проблемами:`);
      problemServices.forEach(service => {
        console.log(`  - ${service.name} (${service.slug})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllServices();

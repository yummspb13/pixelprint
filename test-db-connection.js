const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function testConnection() {
  try {
    console.log('🔌 Тестируем подключение к Supabase...');
    
    // Проверяем подключение
    await prisma.$connect();
    console.log('✅ Подключение к базе данных успешно!');
    
    // Проверяем существующие таблицы
    const services = await prisma.service.findMany({ take: 1 });
    console.log('✅ Таблица Service доступна, записей:', services.length);
    
    const priceRows = await prisma.priceRow.findMany({ take: 1 });
    console.log('✅ Таблица PriceRow доступна, записей:', priceRows.length);
    
    // Проверяем структуру таблицы PriceRow
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'PriceRow' 
      ORDER BY ordinal_position;
    `;
    
    console.log('\n📋 Структура таблицы PriceRow:');
    tableInfo.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
  } catch (error) {
    console.error('❌ Ошибка подключения:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

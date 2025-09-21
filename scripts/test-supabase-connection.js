const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    connectionString: 'postgresql://postgres.nrtznccqxnfbvgarbqua:Rat60672793@aws-1-eu-west-2.pooler.supabase.com:6543/postgres'
  });

  try {
    console.log('🔄 Подключаемся к Supabase...');
    await client.connect();
    console.log('✅ Подключение успешно!');
    
    const result = await client.query('SELECT NOW() as current_time');
    console.log('📅 Время сервера:', result.rows[0].current_time);
    
    // Проверим существующие таблицы
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('📊 Существующие таблицы:', tables.rows.map(r => r.table_name));
    
  } catch (error) {
    console.error('❌ Ошибка подключения:', error.message);
  } finally {
    await client.end();
  }
}

testConnection();

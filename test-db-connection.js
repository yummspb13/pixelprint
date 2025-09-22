const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    connectionString: 'postgresql://postgres.nrtznccqxnfbvgarbqua:Rat606727931@aws-1-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔍 Testing connection to Supabase...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const result = await client.query('SELECT 1 as test');
    console.log('✅ Query result:', result.rows);
    
    // Проверим, есть ли таблицы
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('📊 Tables in database:', tables.rows);
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error code:', error.code);
  } finally {
    await client.end();
  }
}

testConnection();

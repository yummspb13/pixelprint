const { Client } = require('pg');

async function testSupabase() {
  console.log('🔍 Testing Supabase connection directly...');
  
  // Test 1: Connection pooling URL
  console.log('\n1️⃣ Testing Connection Pooling URL...');
  const poolClient = new Client({
    connectionString: 'postgresql://postgres.nrtznccqxnfbvgarbqua:Rat606727931@aws-1-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await poolClient.connect();
    console.log('✅ Connection pooling: SUCCESS');
    const result = await poolClient.query('SELECT 1 as test');
    console.log('✅ Query result:', result.rows);
    await poolClient.end();
  } catch (error) {
    console.log('❌ Connection pooling: FAILED');
    console.log('Error:', error.message);
  }

  // Test 2: Direct connection URL
  console.log('\n2️⃣ Testing Direct Connection URL...');
  const directClient = new Client({
    connectionString: 'postgresql://postgres:Rat606727931@db.nrtznccqxnfbvgarbqua.supabase.co:5432/postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await directClient.connect();
    console.log('✅ Direct connection: SUCCESS');
    const result = await directClient.query('SELECT 1 as test');
    console.log('✅ Query result:', result.rows);
    await directClient.end();
  } catch (error) {
    console.log('❌ Direct connection: FAILED');
    console.log('Error:', error.message);
  }

  // Test 3: Check if database is accessible
  console.log('\n3️⃣ Testing Database Tables...');
  const testClient = new Client({
    connectionString: 'postgresql://postgres.nrtznccqxnfbvgarbqua:Rat606727931@aws-1-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await testClient.connect();
    const tables = await testClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('✅ Database tables:', tables.rows.map(r => r.table_name));
    await testClient.end();
  } catch (error) {
    console.log('❌ Database tables check: FAILED');
    console.log('Error:', error.message);
  }
}

testSupabase();

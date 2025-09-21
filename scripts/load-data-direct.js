const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// URL для подключения к Supabase
const SUPABASE_URL = "postgresql://postgres.nrtznccqxnfbvgarbqua:Rat60672793@aws-1-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=disable";
const DIRECT_URL = "postgresql://postgres.nrtznccqxnfbvgarbqua:Rat60672793@aws-1-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=disable";

async function loadData() {
  const client = new Client({
    connectionString: DIRECT_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔄 Подключаемся к Supabase...');
    await client.connect();
    console.log('✅ Подключение успешно!');

    // Тестируем подключение
    const test = await client.query('SELECT NOW() as current_time');
    console.log('📅 Время сервера:', test.rows[0].current_time);

    // Читаем данные из локальной SQLite базы
    console.log('📖 Читаем данные из локальной базы...');
    
    // Подключаемся к локальной SQLite базе
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database('./prisma/dev.db');

    // Функция для выполнения SQL запросов
    const query = (sql, params = []) => {
      return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    };

    // Экспортируем данные
    const services = await query('SELECT * FROM Service');
    const whyArticles = await query('SELECT * FROM WhyArticle');
    const users = await query('SELECT * FROM User');
    const accounts = await query('SELECT * FROM Account');
    const sessions = await query('SELECT * FROM Session');
    const verificationTokens = await query('SELECT * FROM VerificationToken');
    const orders = await query('SELECT * FROM Order');
    const orderItems = await query('SELECT * FROM OrderItem');

    console.log(`📊 Найдено данных:`);
    console.log(`   - Services: ${services.length}`);
    console.log(`   - Why Articles: ${whyArticles.length}`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Orders: ${orders.length}`);
    console.log(`   - Order Items: ${orderItems.length}`);

    // Очищаем существующие данные в Supabase
    console.log('🧹 Очищаем существующие данные в Supabase...');
    await client.query('DELETE FROM "OrderItem"');
    await client.query('DELETE FROM "Order"');
    await client.query('DELETE FROM "VerificationToken"');
    await client.query('DELETE FROM "Session"');
    await client.query('DELETE FROM "Account"');
    await client.query('DELETE FROM "User"');
    await client.query('DELETE FROM "WhyArticle"');
    await client.query('DELETE FROM "Service"');

    // Импортируем данные
    console.log('📥 Импортируем Services...');
    for (const service of services) {
      const { id, ...serviceData } = service;
      const columns = Object.keys(serviceData).join(', ');
      const values = Object.values(serviceData).map(v => v === null ? 'NULL' : `'${v}'`).join(', ');
      const placeholders = Object.keys(serviceData).map((_, i) => `$${i + 1}`).join(', ');
      
      await client.query(`
        INSERT INTO "Service" (${columns}) 
        VALUES (${placeholders})
      `, Object.values(serviceData));
    }

    console.log('📥 Импортируем Why Articles...');
    for (const article of whyArticles) {
      const { id, ...articleData } = article;
      const columns = Object.keys(articleData).join(', ');
      const placeholders = Object.keys(articleData).map((_, i) => `$${i + 1}`).join(', ');
      
      await client.query(`
        INSERT INTO "WhyArticle" (${columns}) 
        VALUES (${placeholders})
      `, Object.values(articleData));
    }

    console.log('📥 Импортируем Users...');
    for (const user of users) {
      const { id, ...userData } = user;
      const columns = Object.keys(userData).join(', ');
      const placeholders = Object.keys(userData).map((_, i) => `$${i + 1}`).join(', ');
      
      await client.query(`
        INSERT INTO "User" (${columns}) 
        VALUES (${placeholders})
      `, Object.values(userData));
    }

    console.log('📥 Импортируем Accounts...');
    for (const account of accounts) {
      const { id, ...accountData } = account;
      const columns = Object.keys(accountData).join(', ');
      const placeholders = Object.keys(accountData).map((_, i) => `$${i + 1}`).join(', ');
      
      await client.query(`
        INSERT INTO "Account" (${columns}) 
        VALUES (${placeholders})
      `, Object.values(accountData));
    }

    console.log('📥 Импортируем Sessions...');
    for (const session of sessions) {
      const { id, ...sessionData } = session;
      const columns = Object.keys(sessionData).join(', ');
      const placeholders = Object.keys(sessionData).map((_, i) => `$${i + 1}`).join(', ');
      
      await client.query(`
        INSERT INTO "Session" (${columns}) 
        VALUES (${placeholders})
      `, Object.values(sessionData));
    }

    console.log('📥 Импортируем Verification Tokens...');
    for (const token of verificationTokens) {
      const { id, ...tokenData } = token;
      const columns = Object.keys(tokenData).join(', ');
      const placeholders = Object.keys(tokenData).map((_, i) => `$${i + 1}`).join(', ');
      
      await client.query(`
        INSERT INTO "VerificationToken" (${columns}) 
        VALUES (${placeholders})
      `, Object.values(tokenData));
    }

    console.log('📥 Импортируем Orders...');
    for (const order of orders) {
      const { id, ...orderData } = order;
      const columns = Object.keys(orderData).join(', ');
      const placeholders = Object.keys(orderData).map((_, i) => `$${i + 1}`).join(', ');
      
      await client.query(`
        INSERT INTO "Order" (${columns}) 
        VALUES (${placeholders})
      `, Object.values(orderData));
    }

    console.log('📥 Импортируем Order Items...');
    for (const item of orderItems) {
      const { id, ...itemData } = item;
      const columns = Object.keys(itemData).join(', ');
      const placeholders = Object.keys(itemData).map((_, i) => `$${i + 1}`).join(', ');
      
      await client.query(`
        INSERT INTO "OrderItem" (${columns}) 
        VALUES (${placeholders})
      `, Object.values(itemData));
    }

    console.log('✅ Импорт завершен успешно!');

  } catch (error) {
    console.error('❌ Ошибка импорта:', error);
  } finally {
    await client.end();
    db.close();
  }
}

loadData();

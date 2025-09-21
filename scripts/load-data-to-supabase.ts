import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// URL для подключения к Supabase
const DATABASE_URL = "postgresql://postgres.nrtznccqxnfbvgarbqua:Rat60672793@aws-1-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require";
const DIRECT_URL = "postgresql://postgres:Rat60672793@db.nrtznccqxnfbvgarbqua.supabase.co:5432/postgres?sslmode=require";

// Подключаемся к Supabase
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
});

async function loadData() {
  try {
    console.log('🔄 Подключаемся к Supabase...');
    
    // Тестируем подключение
    const test = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Подключение успешно!', test);

    // Читаем данные из локальной SQLite базы
    console.log('📖 Читаем данные из локальной базы...');
    
    // Подключаемся к локальной SQLite базе
    const localPrisma = new PrismaClient({
      datasources: {
        db: {
          url: "file:./dev.db"
        }
      }
    });

    // Экспортируем данные
    const services = await localPrisma.service.findMany();
    const whyArticles = await localPrisma.whyArticle.findMany();
    const users = await localPrisma.user.findMany();
    const accounts = await localPrisma.account.findMany();
    const sessions = await localPrisma.session.findMany();
    const verificationTokens = await localPrisma.verificationToken.findMany();
    const orders = await localPrisma.order.findMany();
    const orderItems = await localPrisma.orderItem.findMany();

    console.log(`📊 Найдено данных:`);
    console.log(`   - Services: ${services.length}`);
    console.log(`   - Why Articles: ${whyArticles.length}`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Orders: ${orders.length}`);
    console.log(`   - Order Items: ${orderItems.length}`);

    // Очищаем существующие данные в Supabase
    console.log('🧹 Очищаем существующие данные в Supabase...');
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.verificationToken.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
    await prisma.whyArticle.deleteMany();
    await prisma.service.deleteMany();

    // Импортируем данные
    console.log('📥 Импортируем Services...');
    for (const service of services) {
      await prisma.service.create({
        data: {
          ...service,
          id: undefined, // Позволяем PostgreSQL сгенерировать новый ID
        }
      });
    }

    console.log('📥 Импортируем Why Articles...');
    for (const article of whyArticles) {
      await prisma.whyArticle.create({
        data: {
          ...article,
          id: undefined,
        }
      });
    }

    console.log('📥 Импортируем Users...');
    for (const user of users) {
      await prisma.user.create({
        data: {
          ...user,
          id: undefined,
        }
      });
    }

    console.log('📥 Импортируем Accounts...');
    for (const account of accounts) {
      await prisma.account.create({
        data: {
          ...account,
          id: undefined,
        }
      });
    }

    console.log('📥 Импортируем Sessions...');
    for (const session of sessions) {
      await prisma.session.create({
        data: {
          ...session,
          id: undefined,
        }
      });
    }

    console.log('📥 Импортируем Verification Tokens...');
    for (const token of verificationTokens) {
      await prisma.verificationToken.create({
        data: {
          ...token,
          id: undefined,
        }
      });
    }

    console.log('📥 Импортируем Orders...');
    for (const order of orders) {
      await prisma.order.create({
        data: {
          ...order,
          id: undefined,
        }
      });
    }

    console.log('📥 Импортируем Order Items...');
    for (const item of orderItems) {
      await prisma.orderItem.create({
        data: {
          ...item,
          id: undefined,
        }
      });
    }

    console.log('✅ Импорт завершен успешно!');
    
    // Закрываем локальное подключение
    await localPrisma.$disconnect();

  } catch (error) {
    console.error('❌ Ошибка импорта:', error);
  } finally {
    await prisma.$disconnect();
  }
}

loadData();

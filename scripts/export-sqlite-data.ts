import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Подключаемся к локальной SQLite базе
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:./dev.db"
    }
  }
});

async function exportData() {
  try {
    console.log('🔄 Экспортируем данные из SQLite...');

    // Экспортируем все таблицы
    const services = await prisma.service.findMany();
    const whyArticles = await prisma.whyArticle.findMany();
    const users = await prisma.user.findMany();
    const accounts = await prisma.account.findMany();
    const sessions = await prisma.session.findMany();
    const verificationTokens = await prisma.verificationToken.findMany();
    const orders = await prisma.order.findMany();
    const orderItems = await prisma.orderItem.findMany();

    const exportData = {
      services,
      whyArticles,
      users,
      accounts,
      sessions,
      verificationTokens,
      orders,
      orderItems,
      exportedAt: new Date().toISOString()
    };

    // Сохраняем в JSON файл
    const exportPath = path.join(process.cwd(), 'data-export.json');
    fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2));

    console.log('✅ Данные экспортированы в data-export.json');
    console.log(`📊 Статистика:`);
    console.log(`   - Services: ${services.length}`);
    console.log(`   - Why Articles: ${whyArticles.length}`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Orders: ${orders.length}`);
    console.log(`   - Order Items: ${orderItems.length}`);

  } catch (error) {
    console.error('❌ Ошибка экспорта:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();

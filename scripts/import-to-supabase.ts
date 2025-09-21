import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Подключаемся к Supabase PostgreSQL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function importData() {
  try {
    console.log('🔄 Импортируем данные в Supabase...');

    // Читаем экспортированные данные
    const exportPath = path.join(process.cwd(), 'data-export.json');
    if (!fs.existsSync(exportPath)) {
      throw new Error('Файл data-export.json не найден. Сначала запустите export-sqlite-data.ts');
    }

    const exportData = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
    console.log(`📅 Данные экспортированы: ${exportData.exportedAt}`);

    // Очищаем существующие данные (осторожно!)
    console.log('🧹 Очищаем существующие данные...');
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
    for (const service of exportData.services) {
      await prisma.service.create({
        data: {
          ...service,
          id: undefined, // Позволяем PostgreSQL сгенерировать новый ID
        }
      });
    }

    console.log('📥 Импортируем Why Articles...');
    for (const article of exportData.whyArticles) {
      await prisma.whyArticle.create({
        data: {
          ...article,
          id: undefined,
        }
      });
    }

    console.log('📥 Импортируем Users...');
    for (const user of exportData.users) {
      await prisma.user.create({
        data: {
          ...user,
          id: undefined,
        }
      });
    }

    console.log('📥 Импортируем Accounts...');
    for (const account of exportData.accounts) {
      await prisma.account.create({
        data: {
          ...account,
          id: undefined,
        }
      });
    }

    console.log('📥 Импортируем Sessions...');
    for (const session of exportData.sessions) {
      await prisma.session.create({
        data: {
          ...session,
          id: undefined,
        }
      });
    }

    console.log('📥 Импортируем Verification Tokens...');
    for (const token of exportData.verificationTokens) {
      await prisma.verificationToken.create({
        data: {
          ...token,
          id: undefined,
        }
      });
    }

    console.log('📥 Импортируем Orders...');
    for (const order of exportData.orders) {
      await prisma.order.create({
        data: {
          ...order,
          id: undefined,
        }
      });
    }

    console.log('📥 Импортируем Order Items...');
    for (const item of exportData.orderItems) {
      await prisma.orderItem.create({
        data: {
          ...item,
          id: undefined,
        }
      });
    }

    console.log('✅ Импорт завершен успешно!');
    console.log(`📊 Импортировано:`);
    console.log(`   - Services: ${exportData.services.length}`);
    console.log(`   - Why Articles: ${exportData.whyArticles.length}`);
    console.log(`   - Users: ${exportData.users.length}`);
    console.log(`   - Orders: ${exportData.orders.length}`);
    console.log(`   - Order Items: ${exportData.orderItems.length}`);

  } catch (error) {
    console.error('❌ Ошибка импорта:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importData();

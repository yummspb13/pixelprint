const { PrismaClient } = require('@prisma/client');

// Локальная SQLite база
const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:./dev.db"
    }
  }
});

// Supabase PostgreSQL база
const supabasePrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.nrtznccqxnfbvgarbqua:Rat60672793@aws-1-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=disable"
    }
  }
});

async function exportAndImport() {
  try {
    console.log('🔄 Экспортируем данные из SQLite...');
    
    // Экспортируем все данные
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

    console.log('🔄 Подключаемся к Supabase...');
    
    // Тестируем подключение к Supabase
    const test = await supabasePrisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Подключение к Supabase успешно!', test);

    // Очищаем существующие данные в Supabase
    console.log('🧹 Очищаем существующие данные в Supabase...');
    await supabasePrisma.orderItem.deleteMany();
    await supabasePrisma.order.deleteMany();
    await supabasePrisma.verificationToken.deleteMany();
    await supabasePrisma.session.deleteMany();
    await supabasePrisma.account.deleteMany();
    await supabasePrisma.user.deleteMany();
    await supabasePrisma.whyArticle.deleteMany();
    await supabasePrisma.service.deleteMany();

    // Импортируем данные
    console.log('📥 Импортируем Services...');
    for (const service of services) {
      await supabasePrisma.service.create({
        data: {
          ...service,
          id: undefined, // Позволяем PostgreSQL сгенерировать новый ID
        }
      });
    }

    console.log('📥 Импортируем Why Articles...');
    for (const article of whyArticles) {
      await supabasePrisma.whyArticle.create({
        data: {
          ...article,
          id: undefined,
        }
      });
    }

    console.log('📥 Импортируем Users...');
    for (const user of users) {
      await supabasePrisma.user.create({
        data: {
          ...user,
          id: undefined,
        }
      });
    }

    console.log('📥 Импортируем Accounts...');
    for (const account of accounts) {
      await supabasePrisma.account.create({
        data: {
          ...account,
          id: undefined,
        }
      });
    }

    console.log('📥 Импортируем Sessions...');
    for (const session of sessions) {
      await supabasePrisma.session.create({
        data: {
          ...session,
          id: undefined,
        }
      });
    }

    console.log('📥 Импортируем Verification Tokens...');
    for (const token of verificationTokens) {
      await supabasePrisma.verificationToken.create({
        data: {
          ...token,
          id: undefined,
        }
      });
    }

    console.log('📥 Импортируем Orders...');
    for (const order of orders) {
      await supabasePrisma.order.create({
        data: {
          ...order,
          id: undefined,
        }
      });
    }

    console.log('📥 Импортируем Order Items...');
    for (const item of orderItems) {
      await supabasePrisma.orderItem.create({
        data: {
          ...item,
          id: undefined,
        }
      });
    }

    console.log('✅ Импорт завершен успешно!');

  } catch (error) {
    console.error('❌ Ошибка импорта:', error);
  } finally {
    await localPrisma.$disconnect();
    await supabasePrisma.$disconnect();
  }
}

exportAndImport();

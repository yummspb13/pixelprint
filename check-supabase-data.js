const { PrismaClient } = require('@prisma/client');

// Создаем клиент для Supabase PostgreSQL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres.nrtznccqxnfbvgarbqua:Rat606727931@aws-1-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
    }
  }
});

async function checkData() {
  try {
    console.log('🔍 Проверяем данные в Supabase...\n');

    // Проверяем Services
    console.log('📦 Services в Supabase:');
    const services = await prisma.service.findMany({
      select: { id: true, name: true, slug: true, category: true }
    });
    services.forEach(service => {
      console.log(`  ${service.id}: ${service.name} (${service.slug}) - ${service.category}`);
    });
    console.log(`Всего: ${services.length} сервисов\n`);

    // Проверяем PriceRows
    console.log('💰 PriceRows в Supabase:');
    const priceRows = await prisma.priceRow.findMany({
      select: { id: true, serviceId: true, attrs: true, ruleKind: true }
    });
    priceRows.forEach(row => {
      console.log(`  ${row.id}: Service ${row.serviceId} - ${row.ruleKind} - ${JSON.stringify(row.attrs)}`);
    });
    console.log(`Всего: ${priceRows.length} price rows\n`);

    // Проверяем Tiers
    console.log('📊 Tiers в Supabase:');
    const tiers = await prisma.tier.findMany({
      select: { id: true, rowId: true, qty: true, unit: true }
    });
    tiers.forEach(tier => {
      console.log(`  ${tier.id}: Row ${tier.rowId} - ${tier.qty} шт. - £${tier.unit}`);
    });
    console.log(`Всего: ${tiers.length} tiers\n`);

    // Проверяем MenuTiles
    console.log('🍽️ MenuTiles в Supabase:');
    const menuTiles = await prisma.menuTile.findMany({
      select: { id: true, label: true, href: true, order: true }
    });
    menuTiles.forEach(tile => {
      console.log(`  ${tile.id}: ${tile.label} (${tile.href}) - order: ${tile.order}`);
    });
    console.log(`Всего: ${menuTiles.length} menu tiles\n`);

    // Проверяем WhyArticles
    console.log('📝 WhyArticles в Supabase:');
    const whyArticles = await prisma.whyArticle.findMany({
      select: { id: true, title: true, text: true, span: true, order: true }
    });
    whyArticles.forEach(article => {
      console.log(`  ${article.id}: ${article.title} - span: ${article.span} - order: ${article.order}`);
    });
    console.log(`Всего: ${whyArticles.length} why articles\n`);

  } catch (error) {
    console.error('❌ Ошибка при проверке данных:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();

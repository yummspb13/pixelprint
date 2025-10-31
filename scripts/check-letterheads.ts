import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkLetterheads() {
  const service = await prisma.service.findUnique({
    where: { slug: 'letterheads' },
    include: {
      rows: {
        where: { isActive: true },
        include: { tiers: true }
      }
    }
  });

  if (!service) {
    console.log('Service letterheads not found');
    return;
  }

  console.log(`\n📊 Letterheads service: ${service.name}`);
  console.log(`📋 Active rows: ${service.rows.length}\n`);

  service.rows.forEach((row, idx) => {
    const attrs = typeof row.attrs === 'string' ? JSON.parse(row.attrs) : row.attrs;
    const paramCount = Object.keys(attrs).filter(k => k !== '_isMain').length;
    console.log(`Row ${idx + 1} (ID: ${row.id}):`);
    console.log(`  Parameters: ${paramCount}`);
    console.log(`  Attrs:`, attrs);
    console.log(`  Tiers: ${row.tiers.length}`);
    if (row.tiers.length > 0) {
      console.log(`  First tier:`, { qty: row.tiers[0].qty, unit: row.tiers[0].unit });
    }
    console.log('');
  });
}

checkLetterheads()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

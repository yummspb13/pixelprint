import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testCalculation() {
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
    console.log('Service not found');
    return;
  }

  // Тестируем разные комбинации
  const testSelections = [
    { Sides: 'Single Sided (S/S)', Size: 'A4', Color: 'Color' },
    { Sides: 'Single Sided (S/S)', Size: 'A4', Color: 'BW' },
    { Sides: 'Single Sided (S/S)', Size: 'A5', Color: 'BW' },
  ];

  console.log(`\n🧪 Testing quote calculation logic for letterheads\n`);

  for (const selection of testSelections) {
    const selectionKeys = Object.keys(selection);
    console.log(`\n📋 Testing selection:`, selection);
    
    let found = false;
    for (const row of service.rows) {
      const attrs = typeof row.attrs === 'string' ? JSON.parse(row.attrs) : row.attrs;
      const rowAttrsForMatch = { ...attrs };
      delete rowAttrsForMatch._isMain;
      
      // Проверяем точное совпадение
      let isExactMatch = true;
      for (const key of selectionKeys) {
        if (!(key in rowAttrsForMatch) || rowAttrsForMatch[key] !== (selection as Record<string, string>)[key]) {
          isExactMatch = false;
          break;
        }
      }
      
      if (isExactMatch) {
        found = true;
        const tier100 = row.tiers.find(t => t.qty === 100);
        console.log(`  ✅ Found match: Row ${row.id}`);
        console.log(`     Attrs:`, rowAttrsForMatch);
        console.log(`     Tier for 100:`, tier100 ? `£${tier100.unit} (total: £${tier100.unit * 100 * 1.2})` : 'not found');
        break;
      }
    }
    
    if (!found) {
      console.log(`  ❌ No exact match found!`);
      console.log(`     Available rows:`, service.rows.map(r => {
        const attrs = typeof r.attrs === 'string' ? JSON.parse(r.attrs) : r.attrs;
        return Object.fromEntries(Object.entries(attrs).filter(([k]) => k !== '_isMain'));
      }));
    }
  }
}

testCalculation()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

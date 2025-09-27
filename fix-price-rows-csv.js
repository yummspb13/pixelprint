const fs = require('fs');

console.log('🔧 Исправляем CSV файл price_rows.csv...');

const priceRows = JSON.parse(fs.readFileSync('price_rows.json', 'utf8'));

let priceRowsCSV = 'id,serviceId,attrs,ruleKind,unit,setup,fixed,originalRowId,isActive,createdAt,updatedAt\n';

priceRows.forEach(priceRow => {
  const createdAt = priceRow.createdAt ? new Date(priceRow.createdAt).toISOString() : new Date().toISOString();
  const updatedAt = priceRow.updatedAt ? new Date(priceRow.updatedAt).toISOString() : new Date().toISOString();
  
  const row = [
    priceRow.id,
    priceRow.serviceId,
    `"${priceRow.attrs.replace(/"/g, '""')}"`,
    `"${priceRow.ruleKind}"`,
    priceRow.unit || '0',  // Заменяем null на 0
    priceRow.setup || '0', // Заменяем null на 0
    priceRow.fixed || '0', // Заменяем null на 0
    `"row_${priceRow.id}"`,
    priceRow.isActive ? 'true' : 'false',
    `"${createdAt}"`,
    `"${updatedAt}"`
  ].join(',');
  
  priceRowsCSV += row + '\n';
});

fs.writeFileSync('price_rows_fixed.csv', priceRowsCSV);
console.log('✅ Создан исправленный файл price_rows_fixed.csv');

// Показываем первые несколько строк для проверки
console.log('\n📋 Первые 3 строки исправленного файла:');
const lines = priceRowsCSV.split('\n');
for (let i = 0; i < 4; i++) {
  console.log(lines[i]);
}

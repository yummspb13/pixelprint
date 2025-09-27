const fs = require('fs');

// 1. Генерируем CSV для Services
console.log('📦 Генерируем CSV для Services...');
const services = JSON.parse(fs.readFileSync('services.json', 'utf8'));

let servicesCSV = 'id,slug,name,description,image,category,order,categoryOrder,isActive,configuratorEnabled,calculatorAvailable,clickCount,createdAt,updatedAt\n';

services.forEach(service => {
  const createdAt = service.createdAt ? new Date(service.createdAt).toISOString() : new Date().toISOString();
  const updatedAt = service.updatedAt ? new Date(service.updatedAt).toISOString() : new Date().toISOString();
  
  const row = [
    service.id,
    service.slug,
    `"${service.name.replace(/"/g, '""')}"`,
    service.description ? `"${service.description.replace(/"/g, '""')}"` : '',
    service.image ? `"${service.image}"` : '',
    `"${service.category}"`,
    service.order || 0,
    service.categoryOrder || 0,
    service.isActive ? 'true' : 'false',
    service.configuratorEnabled ? 'true' : 'false',
    service.calculatorAvailable ? 'true' : 'false',
    service.clickCount || 0,
    `"${createdAt}"`,
    `"${updatedAt}"`
  ].join(',');
  
  servicesCSV += row + '\n';
});

fs.writeFileSync('services.csv', servicesCSV);
console.log('✅ Создан файл services.csv');

// 2. Генерируем CSV для PriceRows
console.log('💰 Генерируем CSV для PriceRows...');
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
    priceRow.unit || '',
    priceRow.setup || '',
    priceRow.fixed || '',
    `"row_${priceRow.id}"`,
    priceRow.isActive ? 'true' : 'false',
    `"${createdAt}"`,
    `"${updatedAt}"`
  ].join(',');
  
  priceRowsCSV += row + '\n';
});

fs.writeFileSync('price_rows.csv', priceRowsCSV);
console.log('✅ Создан файл price_rows.csv');

// 3. Генерируем CSV для Tiers
console.log('📊 Генерируем CSV для Tiers...');
const tiers = JSON.parse(fs.readFileSync('tiers.json', 'utf8'));

let tiersCSV = 'id,rowId,qty,unit\n';

tiers.forEach(tier => {
  const row = [
    tier.id,
    tier.rowId,
    tier.qty,
    tier.unit
  ].join(',');
  
  tiersCSV += row + '\n';
});

fs.writeFileSync('tiers.csv', tiersCSV);
console.log('✅ Создан файл tiers.csv');

// 4. Генерируем CSV для MenuTiles
console.log('🍽️ Генерируем CSV для MenuTiles...');
const menuTiles = JSON.parse(fs.readFileSync('menu_tiles.json', 'utf8'));

let menuTilesCSV = 'id,label,href,image,order,isActive,createdAt,updatedAt\n';

menuTiles.forEach(menuTile => {
  const createdAt = menuTile.createdAt ? new Date(menuTile.createdAt).toISOString() : new Date().toISOString();
  const updatedAt = menuTile.updatedAt ? new Date(menuTile.updatedAt).toISOString() : new Date().toISOString();
  
  const row = [
    menuTile.id,
    `"${menuTile.label.replace(/"/g, '""')}"`,
    `"${menuTile.href}"`,
    menuTile.image ? `"${menuTile.image}"` : '',
    menuTile.order || 0,
    menuTile.isActive ? 'true' : 'false',
    `"${createdAt}"`,
    `"${updatedAt}"`
  ].join(',');
  
  menuTilesCSV += row + '\n';
});

fs.writeFileSync('menu_tiles.csv', menuTilesCSV);
console.log('✅ Создан файл menu_tiles.csv');

// 5. Генерируем CSV для WhyArticles
console.log('📝 Генерируем CSV для WhyArticles...');
const whyArticles = JSON.parse(fs.readFileSync('why_articles.json', 'utf8'));

let whyArticlesCSV = 'id,title,text,image,href,span,order,isActive,content,images,createdAt,updatedAt\n';

whyArticles.forEach(whyArticle => {
  const createdAt = whyArticle.createdAt ? new Date(whyArticle.createdAt).toISOString() : new Date().toISOString();
  const updatedAt = whyArticle.updatedAt ? new Date(whyArticle.updatedAt).toISOString() : new Date().toISOString();
  
  const row = [
    whyArticle.id,
    `"${whyArticle.title.replace(/"/g, '""')}"`,
    `"${whyArticle.text.replace(/"/g, '""')}"`,
    whyArticle.image ? `"${whyArticle.image}"` : '',
    whyArticle.href ? `"${whyArticle.href}"` : '',
    whyArticle.span ? `"${whyArticle.span}"` : '',
    whyArticle.order || 0,
    whyArticle.isActive ? 'true' : 'false',
    whyArticle.content ? `"${whyArticle.content.replace(/"/g, '""')}"` : '',
    whyArticle.images ? `"${whyArticle.images}"` : '',
    `"${createdAt}"`,
    `"${updatedAt}"`
  ].join(',');
  
  whyArticlesCSV += row + '\n';
});

fs.writeFileSync('why_articles.csv', whyArticlesCSV);
console.log('✅ Создан файл why_articles.csv');

// 6. Создаем CSV для Settings
console.log('⚙️ Генерируем CSV для Settings...');
let settingsCSV = 'key,value,description,category,createdAt,updatedAt\n';

const settings = [
  { key: 'site_name', value: 'PixelPrint', description: 'Название сайта', category: 'general' },
  { key: 'site_description', value: 'Профессиональная печать в Лондоне', description: 'Описание сайта', category: 'general' },
  { key: 'contact_email', value: 'info@pixelprint.com', description: 'Контактный email', category: 'contact' },
  { key: 'contact_phone', value: '+44 20 1234 5678', description: 'Контактный телефон', category: 'contact' }
];

const now = new Date().toISOString();
settings.forEach(setting => {
  const row = [
    `"${setting.key}"`,
    `"${setting.value}"`,
    `"${setting.description}"`,
    `"${setting.category}"`,
    `"${now}"`,
    `"${now}"`
  ].join(',');
  
  settingsCSV += row + '\n';
});

fs.writeFileSync('settings.csv', settingsCSV);
console.log('✅ Создан файл settings.csv');

console.log('\n🎉 Все CSV файлы созданы!');
console.log('📁 Файлы для импорта в Supabase:');
console.log('- services.csv');
console.log('- price_rows.csv');
console.log('- tiers.csv');
console.log('- menu_tiles.csv');
console.log('- why_articles.csv');
console.log('- settings.csv');
console.log('\n📋 Порядок импорта:');
console.log('1. services.csv');
console.log('2. price_rows.csv');
console.log('3. tiers.csv');
console.log('4. menu_tiles.csv');
console.log('5. why_articles.csv');
console.log('6. settings.csv');

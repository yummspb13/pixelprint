const fs = require('fs');

// 1. Генерируем SQL для Services
console.log('📦 Генерируем SQL для Services...');
const services = JSON.parse(fs.readFileSync('services.json', 'utf8'));

let servicesSQL = '-- Импорт Services в Supabase\n';
servicesSQL += '-- Сначала очищаем таблицу\n';
servicesSQL += 'DELETE FROM "Service";\n\n';
servicesSQL += '-- Вставляем данные\n';
servicesSQL += 'INSERT INTO "Service" (id, slug, name, description, image, category, "order", "categoryOrder", "isActive", "configuratorEnabled", "calculatorAvailable", "clickCount", "createdAt", "updatedAt") VALUES\n';

const serviceValues = services.map(service => {
  const createdAt = service.createdAt ? new Date(service.createdAt).toISOString() : new Date().toISOString();
  const updatedAt = service.updatedAt ? new Date(service.updatedAt).toISOString() : new Date().toISOString();
  
  return `(${service.id}, '${service.slug}', '${service.name.replace(/'/g, "''")}', ${service.description ? `'${service.description.replace(/'/g, "''")}'` : 'null'}, ${service.image ? `'${service.image}'` : 'null'}, '${service.category}', ${service.order || 0}, ${service.categoryOrder || 0}, ${service.isActive ? 'true' : 'false'}, ${service.configuratorEnabled ? 'true' : 'false'}, ${service.calculatorAvailable ? 'true' : 'false'}, ${service.clickCount || 0}, '${createdAt}', '${updatedAt}')`;
}).join(',\n');

servicesSQL += serviceValues + ';';
fs.writeFileSync('import-services-full.sql', servicesSQL);
console.log('✅ Создан файл import-services-full.sql');

// 2. Генерируем SQL для PriceRows
console.log('💰 Генерируем SQL для PriceRows...');
const priceRows = JSON.parse(fs.readFileSync('price_rows.json', 'utf8'));

let priceRowsSQL = '-- Импорт PriceRows в Supabase\n';
priceRowsSQL += '-- Сначала очищаем таблицу\n';
priceRowsSQL += 'DELETE FROM "PriceRow";\n\n';
priceRowsSQL += '-- Вставляем данные\n';
priceRowsSQL += 'INSERT INTO "PriceRow" (id, "serviceId", attrs, "ruleKind", unit, setup, fixed, "originalRowId", "isActive", "createdAt", "updatedAt") VALUES\n';

const priceRowValues = priceRows.map(priceRow => {
  const createdAt = priceRow.createdAt ? new Date(priceRow.createdAt).toISOString() : new Date().toISOString();
  const updatedAt = priceRow.updatedAt ? new Date(priceRow.updatedAt).toISOString() : new Date().toISOString();
  
  return `(${priceRow.id}, ${priceRow.serviceId}, '${priceRow.attrs}', '${priceRow.ruleKind}', ${priceRow.unit || 'null'}, ${priceRow.setup || 'null'}, ${priceRow.fixed || 'null'}, 'row_${priceRow.id}', ${priceRow.isActive ? 'true' : 'false'}, '${createdAt}', '${updatedAt}')`;
}).join(',\n');

priceRowsSQL += priceRowValues + ';';
fs.writeFileSync('import-price-rows-full.sql', priceRowsSQL);
console.log('✅ Создан файл import-price-rows-full.sql');

// 3. Генерируем SQL для Tiers
console.log('📊 Генерируем SQL для Tiers...');
const tiers = JSON.parse(fs.readFileSync('tiers.json', 'utf8'));

let tiersSQL = '-- Импорт Tiers в Supabase\n';
tiersSQL += '-- Сначала очищаем таблицу\n';
tiersSQL += 'DELETE FROM "Tier";\n\n';
tiersSQL += '-- Вставляем данные\n';
tiersSQL += 'INSERT INTO "Tier" (id, "rowId", qty, unit) VALUES\n';

const tierValues = tiers.map(tier => {
  return `(${tier.id}, ${tier.rowId}, ${tier.qty}, ${tier.unit})`;
}).join(',\n');

tiersSQL += tierValues + ';';
fs.writeFileSync('import-tiers-full.sql', tiersSQL);
console.log('✅ Создан файл import-tiers-full.sql');

// 4. Генерируем SQL для MenuTiles
console.log('🍽️ Генерируем SQL для MenuTiles...');
const menuTiles = JSON.parse(fs.readFileSync('menu_tiles.json', 'utf8'));

let menuTilesSQL = '-- Импорт MenuTiles в Supabase\n';
menuTilesSQL += '-- Сначала очищаем таблицу\n';
menuTilesSQL += 'DELETE FROM "MenuTile";\n\n';
menuTilesSQL += '-- Вставляем данные\n';
menuTilesSQL += 'INSERT INTO "MenuTile" (id, label, href, image, "order", "isActive", "createdAt", "updatedAt") VALUES\n';

const menuTileValues = menuTiles.map(menuTile => {
  const createdAt = menuTile.createdAt ? new Date(menuTile.createdAt).toISOString() : new Date().toISOString();
  const updatedAt = menuTile.updatedAt ? new Date(menuTile.updatedAt).toISOString() : new Date().toISOString();
  
  return `(${menuTile.id}, '${menuTile.label}', '${menuTile.href}', ${menuTile.image ? `'${menuTile.image}'` : 'null'}, ${menuTile.order || 0}, ${menuTile.isActive ? 'true' : 'false'}, '${createdAt}', '${updatedAt}')`;
}).join(',\n');

menuTilesSQL += menuTileValues + ';';
fs.writeFileSync('import-menu-tiles-full.sql', menuTilesSQL);
console.log('✅ Создан файл import-menu-tiles-full.sql');

// 5. Генерируем SQL для WhyArticles
console.log('📝 Генерируем SQL для WhyArticles...');
const whyArticles = JSON.parse(fs.readFileSync('why_articles.json', 'utf8'));

let whyArticlesSQL = '-- Импорт WhyArticles в Supabase\n';
whyArticlesSQL += '-- Сначала очищаем таблицу\n';
whyArticlesSQL += 'DELETE FROM "WhyArticle";\n\n';
whyArticlesSQL += '-- Вставляем данные\n';
whyArticlesSQL += 'INSERT INTO "WhyArticle" (id, title, text, image, href, span, "order", "isActive", content, images, "createdAt", "updatedAt") VALUES\n';

const whyArticleValues = whyArticles.map(whyArticle => {
  const createdAt = whyArticle.createdAt ? new Date(whyArticle.createdAt).toISOString() : new Date().toISOString();
  const updatedAt = whyArticle.updatedAt ? new Date(whyArticle.updatedAt).toISOString() : new Date().toISOString();
  
  return `(${whyArticle.id}, '${whyArticle.title.replace(/'/g, "''")}', '${whyArticle.text.replace(/'/g, "''")}', ${whyArticle.image ? `'${whyArticle.image}'` : 'null'}, ${whyArticle.href ? `'${whyArticle.href}'` : 'null'}, ${whyArticle.span ? `'${whyArticle.span}'` : 'null'}, ${whyArticle.order || 0}, ${whyArticle.isActive ? 'true' : 'false'}, ${whyArticle.content ? `'${whyArticle.content.replace(/'/g, "''")}'` : 'null'}, ${whyArticle.images ? `'${whyArticle.images}'` : 'null'}, '${createdAt}', '${updatedAt}')`;
}).join(',\n');

whyArticlesSQL += whyArticleValues + ';';
fs.writeFileSync('import-why-articles-full.sql', whyArticlesSQL);
console.log('✅ Создан файл import-why-articles-full.sql');

// 6. Создаем общий файл для всех данных
console.log('🎯 Создаем общий файл импорта...');
const allSQL = `-- Полный импорт данных в Supabase
-- Выполняйте команды по порядку

-- 1. Services
${servicesSQL}

-- 2. PriceRows  
${priceRowsSQL}

-- 3. Tiers
${tiersSQL}

-- 4. MenuTiles
${menuTilesSQL}

-- 5. WhyArticles
${whyArticlesSQL}

-- 6. Базовые настройки
INSERT INTO "Settings" (key, value, description, category) VALUES
('site_name', 'PixelPrint', 'Название сайта', 'general'),
('site_description', 'Профессиональная печать в Лондоне', 'Описание сайта', 'general'),
('contact_email', 'info@pixelprint.com', 'Контактный email', 'contact'),
('contact_phone', '+44 20 1234 5678', 'Контактный телефон', 'contact')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Проверка данных
SELECT 'Services' as table_name, COUNT(*) as count FROM "Service"
UNION ALL
SELECT 'PriceRows', COUNT(*) FROM "PriceRow"
UNION ALL
SELECT 'Tiers', COUNT(*) FROM "Tier"
UNION ALL
SELECT 'MenuTiles', COUNT(*) FROM "MenuTile"
UNION ALL
SELECT 'WhyArticles', COUNT(*) FROM "WhyArticle"
UNION ALL
SELECT 'Settings', COUNT(*) FROM "Settings";
`;

fs.writeFileSync('import-all-data.sql', allSQL);
console.log('✅ Создан файл import-all-data.sql');

console.log('\n🎉 Все SQL файлы созданы!');
console.log('📁 Файлы для импорта:');
console.log('- import-all-data.sql (все данные сразу)');
console.log('- import-services-full.sql');
console.log('- import-price-rows-full.sql');
console.log('- import-tiers-full.sql');
console.log('- import-menu-tiles-full.sql');
console.log('- import-why-articles-full.sql');

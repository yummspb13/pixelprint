# 📋 Инструкции по импорту данных в Supabase

## 🎯 Готовые файлы для импорта:

1. **`import-all-data.sql`** - Все данные сразу (рекомендуется)
2. **`import-services-full.sql`** - Только сервисы
3. **`import-price-rows-full.sql`** - Только строки цен
4. **`import-tiers-full.sql`** - Только уровни цен
5. **`import-menu-tiles-full.sql`** - Только плитки меню
6. **`import-why-articles-full.sql`** - Только статьи

## 🚀 Как импортировать:

### Вариант 1: Импорт всех данных сразу (рекомендуется)
1. Откройте Supabase Dashboard
2. Перейдите в SQL Editor
3. Скопируйте содержимое файла `import-all-data.sql`
4. Вставьте и выполните SQL

### Вариант 2: Поэтапный импорт
Выполните файлы в следующем порядке:
1. `import-services-full.sql`
2. `import-price-rows-full.sql`
3. `import-tiers-full.sql`
4. `import-menu-tiles-full.sql`
5. `import-why-articles-full.sql`

## 📊 Что будет импортировано:

- **Services**: 37 сервисов печати
- **PriceRows**: ~200+ строк цен с правильными `originalRowId`
- **Tiers**: ~1000+ уровней цен
- **MenuTiles**: 2 плитки меню
- **WhyArticles**: 2 статьи
- **Settings**: Базовые настройки сайта

## ✅ Проверка после импорта:

После выполнения SQL проверьте количество записей:
```sql
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
```

## 🔧 Важные моменты:

1. **Поле `originalRowId`** - генерируется автоматически как `row_{id}`
2. **Boolean значения** - правильно конвертируются из 1/0 в true/false
3. **Даты** - конвертируются из timestamp в ISO формат
4. **Кавычки** - экранируются для безопасности SQL

## 🎯 После импорта:

1. Проверьте работу админки
2. Убедитесь что API эндпоинты работают
3. Протестируйте калькулятор цен
4. Проверьте отображение сервисов на сайте

## 🆘 Если что-то пошло не так:

1. Очистите таблицы: `DELETE FROM "Tier"; DELETE FROM "PriceRow"; DELETE FROM "Service";`
2. Повторите импорт
3. Проверьте логи ошибок в Supabase

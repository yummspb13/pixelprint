# 🎯 Финальные инструкции по импорту данных в Supabase

## ⚠️ КРИТИЧЕСКИ ВАЖНО: Сначала исправьте структуру таблицы!

### Шаг 0: Исправьте тип поля originalRowId

1. Откройте Supabase Dashboard
2. Перейдите в **SQL Editor**
3. Выполните SQL команду:

```sql
-- Исправляем тип поля originalRowId в таблице PriceRow
ALTER TABLE "PriceRow" DROP COLUMN IF EXISTS "originalRowId";
ALTER TABLE "PriceRow" ADD COLUMN "originalRowId" TEXT UNIQUE;
```

4. Нажмите **Run**

## 🎯 Готовые файлы для импорта:

1. **`services.csv`** - 37 сервисов печати
2. **`price_rows_fixed.csv`** - ~200 строк цен (ИСПРАВЛЕННЫЙ файл!)
3. **`tiers.csv`** - ~1000 уровней цен
4. **`menu_tiles.csv`** - 2 плитки меню
5. **`why_articles.csv`** - 2 статьи
6. **`settings.csv`** - Базовые настройки

## 🚀 Как импортировать в Supabase:

### Шаг 1: Откройте Supabase Dashboard
1. Перейдите на https://supabase.com/dashboard
2. Выберите ваш проект
3. Перейдите в раздел **Table Editor**

### Шаг 2: Импортируйте файлы по порядку

#### 1. Services (services.csv)
1. В Table Editor выберите таблицу **Service**
2. Нажмите **Import** → **Upload CSV**
3. Выберите файл `services.csv`
4. Нажмите **Import**

#### 2. PriceRows (price_rows_fixed.csv) ⚠️ ВАЖНО!
1. Выберите таблицу **PriceRow**
2. Нажмите **Import** → **Upload CSV**
3. Выберите файл `price_rows_fixed.csv` (НЕ price_rows.csv!)
4. Нажмите **Import**

#### 3. Tiers (tiers.csv)
1. Выберите таблицу **Tier**
2. Нажмите **Import** → **Upload CSV**
3. Выберите файл `tiers.csv`
4. Нажмите **Import**

#### 4. MenuTiles (menu_tiles.csv)
1. Выберите таблицу **MenuTile**
2. Нажмите **Import** → **Upload CSV**
3. Выберите файл `menu_tiles.csv`
4. Нажмите **Import**

#### 5. WhyArticles (why_articles.csv)
1. Выберите таблицу **WhyArticle**
2. Нажмите **Import** → **Upload CSV**
3. Выберите файл `why_articles.csv`
4. Нажмите **Import**

#### 6. Settings (settings.csv)
1. Выберите таблицу **Settings**
2. Нажмите **Import** → **Upload CSV**
3. Выберите файл `settings.csv`
4. Нажмите **Import**

## ✅ Что исправлено в price_rows_fixed.csv:

- ✅ **Пустые значения заменены на 0** - вместо null для unit, setup, fixed
- ✅ **Поле originalRowId** - правильно сформировано как "row_{id}"
- ✅ **Типы данных** - соответствуют ожиданиям Supabase
- ✅ **CSV формат** - корректный для импорта

## ✅ Проверка после импорта:

После импорта всех файлов проверьте количество записей:

1. В Table Editor перейдите в каждую таблицу
2. Убедитесь что данные загружены:
   - **Service**: ~37 записей
   - **PriceRow**: ~200 записей (с полем originalRowId)
   - **Tier**: ~1000 записей
   - **MenuTiles**: 2 записи
   - **WhyArticles**: 2 записи
   - **Settings**: 4 записи

## 🎯 После импорта:

1. **Проверьте работу админки** - должны исчезнуть ошибки "Failed to fetch"
2. **Убедитесь что API эндпоинты работают**
3. **Протестируйте калькулятор цен**
4. **Проверьте отображение сервисов на сайте**

## 🆘 Если что-то пошло не так:

1. **Очистите таблицы** в Table Editor (кнопка Delete All)
2. **Убедитесь что поле originalRowId имеет тип TEXT**
3. **Используйте price_rows_fixed.csv** (НЕ price_rows.csv)
4. **Повторите импорт** в правильном порядке
5. **Проверьте логи ошибок** в Supabase

## 📊 Ожидаемый результат:

После успешного импорта:
- ✅ Админка будет работать без ошибок
- ✅ API эндпоинты будут возвращать данные
- ✅ Калькулятор цен будет работать
- ✅ Сайт будет отображать все сервисы
- ✅ Поле originalRowId будет корректно заполнено

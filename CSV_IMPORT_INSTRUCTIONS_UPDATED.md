# 📋 Обновленные инструкции по импорту CSV файлов в Supabase

## ⚠️ ВАЖНО: Сначала добавьте поле originalRowId!

### Шаг 0: Добавьте поле originalRowId в таблицу PriceRow

1. Откройте Supabase Dashboard
2. Перейдите в **SQL Editor**
3. Выполните SQL команду:

```sql
ALTER TABLE "PriceRow" 
ADD COLUMN "originalRowId" TEXT UNIQUE;
```

4. Нажмите **Run**

## 🎯 Готовые CSV файлы:

1. **`services.csv`** - 37 сервисов печати
2. **`price_rows.csv`** - ~200 строк цен с `originalRowId`
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

#### 2. PriceRows (price_rows.csv)
1. Выберите таблицу **PriceRow**
2. Нажмите **Import** → **Upload CSV**
3. Выберите файл `price_rows.csv`
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
3. Выберите файл `settings.csv**
4. Нажмите **Import**

## ✅ Проверка после импорта:

После импорта всех файлов проверьте количество записей:

1. В Table Editor перейдите в каждую таблицу
2. Убедитесь что данные загружены:
   - **Service**: ~37 записей
   - **PriceRow**: ~200 записей (с полем originalRowId)
   - **Tier**: ~1000 записей
   - **MenuTile**: 2 записи
   - **WhyArticle**: 2 записи
   - **Settings**: 4 записи

## 🔧 Важные моменты:

1. **Сначала добавьте поле originalRowId** - это критически важно!
2. **Порядок импорта важен** - сначала Services, потом PriceRows, потом Tiers
3. **Поле `originalRowId`** - генерируется как `row_{id}`
4. **Boolean значения** - правильно конвертируются
5. **Даты** - в ISO формате
6. **Кавычки** - экранированы для CSV

## 🎯 После импорта:

1. **Проверьте работу админки** - должны исчезнуть ошибки "Failed to fetch"
2. **Убедитесь что API эндпоинты работают**
3. **Протестируйте калькулятор цен**
4. **Проверьте отображение сервисов на сайте**

## 🆘 Если что-то пошло не так:

1. **Очистите таблицы** в Table Editor (кнопка Delete All)
2. **Убедитесь что поле originalRowId добавлено**
3. **Повторите импорт** в правильном порядке
4. **Проверьте логи ошибок** в Supabase

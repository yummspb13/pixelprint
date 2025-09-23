# Миграция на PostgreSQL - Полное руководство

## Проблема
Vercel не поддерживает SQLite файлы в продакшене. Нужно переключиться на PostgreSQL.

## Решение
Мигрируем все данные из SQLite в PostgreSQL и обновляем конфигурацию.

## Пошаговая инструкция

### 1. Создайте PostgreSQL базу данных в Vercel

1. Перейдите на https://vercel.com/dashboard
2. Выберите ваш проект `pixelprint1`
3. Перейдите в раздел "Storage"
4. Нажмите "Create Database"
5. Выберите "Postgres"
6. Создайте базу данных с именем `pixelprint-db`
7. После создания скопируйте `DATABASE_URL`

### 2. Добавьте переменную окружения

```bash
vercel env add DATABASE_URL
```

Вставьте ваш `DATABASE_URL` когда система попросит.

### 3. Обновите Prisma клиент

```bash
npx prisma generate
```

### 4. Примените миграции

```bash
npx prisma db push
```

### 5. Запустите миграцию данных

```bash
node migrate-to-postgresql.js
```

### 6. Проверьте подключение

```bash
node test-postgresql-connection.js
```

### 7. Деплойте на Vercel

```bash
vercel --prod
```

## Файлы для миграции

- `migrate-to-postgresql.js` - скрипт для миграции данных из SQLite в PostgreSQL
- `test-postgresql-connection.js` - скрипт для проверки подключения к PostgreSQL
- `prisma/schema.prisma` - уже настроен для PostgreSQL

## Что будет мигрировано

- ✅ Services (сервисы)
- ✅ PriceRows (строки цен)
- ✅ Tiers (уровни цен)
- ✅ MenuTiles (плитки меню)
- ✅ WhyArticles (статьи "Почему мы")
- ✅ Settings (настройки)
- ✅ ChangeHistory (история изменений)
- ✅ Orders (заказы)
- ✅ OrderItems (элементы заказов)
- ✅ Invoices (счета)
- ✅ Users (пользователи)
- ✅ Accounts (аккаунты)
- ✅ Sessions (сессии)

## После миграции

Все ваши данные будут сохранены и приложение будет работать на PostgreSQL в продакшене.

## Поддержка

Если возникнут проблемы, проверьте:
1. Правильность `DATABASE_URL`
2. Доступность базы данных
3. Логи миграции
4. Подключение к интернету

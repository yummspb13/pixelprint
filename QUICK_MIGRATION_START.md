# 🚀 Быстрый старт миграции на PostgreSQL

## 1. Создайте базу данных в Vercel
- Перейдите на https://vercel.com/dashboard
- Выберите проект `pixelprint1`
- Storage → Create Database → Postgres
- Скопируйте `DATABASE_URL`

## 2. Добавьте переменную окружения
```bash
vercel env add DATABASE_URL
```

## 3. Запустите миграцию
```bash
npx prisma generate
npx prisma db push
node migrate-to-postgresql.js
node check-migration-status.js
```

## 4. Деплойте
```bash
vercel --prod
```

## ✅ Готово!
Ваше приложение теперь работает на PostgreSQL в продакшене.

---
**Подробная инструкция**: `POSTGRESQL_MIGRATION_GUIDE.md`
**Статус миграции**: `MIGRATION_READY_REPORT.md`

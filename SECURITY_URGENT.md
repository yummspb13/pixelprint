# 🚨 СРОЧНО: Смена пароля базы данных

**ВАЖНО:** Пароль базы данных был показан публично в логах. Немедленно смените пароль!

## Как сменить пароль в Supabase:

1. **Зайдите в Supabase Dashboard**
2. **Перейдите в Project Settings → Database**
3. **Найдите раздел "Database Password"**
4. **Нажмите "Reset database password"**
5. **Сгенерируйте новый пароль**
6. **Скопируйте новый пароль**

## Обновите переменные окружения:

### В Vercel:
- `DATABASE_URL` = `postgresql://postgres.nrtznccqxnfbvgarbqua:НОВЫЙ_ПАРОЛЬ@aws-1-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require`
- `DIRECT_URL` = `postgresql://postgres:НОВЫЙ_ПАРОЛЬ@db.nrtznccqxnfbvgarbqua.supabase.co:5432/postgres?sslmode=require`

### В локальном .env.local:
```bash
DATABASE_URL="postgresql://postgres.nrtznccqxnfbvgarbqua:НОВЫЙ_ПАРОЛЬ@aws-1-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
DIRECT_URL="postgresql://postgres:НОВЫЙ_ПАРОЛЬ@db.nrtznccqxnfbvgarbqua.supabase.co:5432/postgres?sslmode=require"
```

## После смены пароля:

1. **Очистите prepared statements в Supabase SQL Editor:**
   ```sql
   DEALLOCATE ALL;
   ```

2. **Запустите миграции:**
   ```bash
   export DATABASE_URL='postgresql://postgres.nrtznccqxnfbvgarbqua:НОВЫЙ_ПАРОЛЬ@aws-1-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require'
   export DIRECT_URL='postgresql://postgres:НОВЫЙ_ПАРОЛЬ@db.nrtznccqxnfbvgarbqua.supabase.co:5432/postgres?sslmode=require'
   npx prisma db push
   ```

3. **Проверьте подключение:**
   ```bash
   npx prisma db pull
   ```

**НЕ ИСПОЛЬЗУЙТЕ старый пароль!** 🔒

# Настройка подключения к базе данных Supabase

## Текущая конфигурация

Приложение настроено для автоматического использования правильного подключения:

- **В development (локально):** Используется `DIRECT_URL` - прямое подключение (порт 5432)
- **В production:** Используется `DATABASE_URL` - connection pooling через PgBouncer (порт 6543)

## Формат переменных окружения

### DATABASE_URL (для production и connection pooling)
```env
DATABASE_URL="postgresql://postgres.nrtznccqxnfbvgarbqua:[YOUR-PASSWORD]@aws-1-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

### DIRECT_URL (для разработки и миграций)
```env
DIRECT_URL="postgresql://postgres.nrtznccqxnfbvgarbqua:[YOUR-PASSWORD]@aws-1-eu-west-2.pooler.supabase.com:5432/postgres"
```

ИЛИ (альтернативный формат от Supabase):
```env
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.nrtznccqxnfbvgarbqua.supabase.co:5432/postgres"
```

## Проверка подключения

После обновления `.env` файла:

1. **Перезапустите dev сервер:**
   ```bash
   npm run dev
   ```

2. **Проверьте подключение:**
   - Откройте: `http://localhost:3010/api/test-db-connection`
   - Должен вернуться успешный ответ с данными

3. **Проверьте логи:**
   - В консоли сервера должно быть: `Prisma client configured with: DIRECT_URL (direct connection)`

## Важные замечания

- **PgBouncer (порт 6543)** может вызывать проблемы с Prisma из-за transaction pooling
- **Direct connection (порт 5432)** рекомендуется для локальной разработки
- В production на Vercel можно использовать pooler, но иногда лучше также использовать direct connection

## Решение проблем

### Ошибка: "Can't reach database server"

1. Проверьте, что проект активен в Supabase Dashboard
2. Проверьте правильность пароля в `DIRECT_URL`
3. Убедитесь, что используется правильный хост:
   - Pooler: `aws-1-eu-west-2.pooler.supabase.com`
   - Direct: `aws-1-eu-west-2.pooler.supabase.com:5432` или `db.nrtznccqxnfbvgarbqua.supabase.co:5432`

### Ошибка: "Connection limit exceeded"

- Убедитесь, что используете `DIRECT_URL` для разработки
- Проверьте количество активных подключений в Supabase

## Миграции

Для миграций Prisma всегда используйте `DIRECT_URL`:

```bash
# Prisma автоматически использует DIRECT_URL для миграций, если он настроен
npx prisma migrate dev
npx prisma migrate deploy
```
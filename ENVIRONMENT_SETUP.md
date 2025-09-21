# Настройка переменных окружения

## Локальная разработка

Скопируйте файл `env.template` в `.env.local`:

```bash
cp env.template .env.local
```

## Деплой в Vercel

### Переменные окружения для Vercel

Добавьте следующие переменные в настройках проекта Vercel:

#### Обязательные переменные:
- `DATABASE_URL` - URL базы данных PostgreSQL (например, от Neon, Supabase, или PlanetScale)
- `NEXTAUTH_URL` - URL вашего домена (например, `https://your-domain.vercel.app`)
- `NEXTAUTH_SECRET` - Секретный ключ для NextAuth (сгенерируйте случайную строку)

#### Дополнительные переменные:
- `ADMIN_EMAIL` - Email администратора (по умолчанию: `admin@pixelprint.com`)
- `ADMIN_PASSWORD` - Пароль администратора (по умолчанию: `admin123`)
- `NEXT_PUBLIC_SITE_URL` - Публичный URL сайта
- `NEXT_PUBLIC_FX_ENABLED` - Включить/выключить эффекты (1 или 0)
- `NODE_ENV` - Окружение (production для продакшена)

### Пример для Vercel:

```
DATABASE_URL=postgresql://username:password@host:port/database
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-super-secret-key-here
ADMIN_EMAIL=admin@pixelprint.com
ADMIN_PASSWORD=admin123
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
NEXT_PUBLIC_FX_ENABLED=1
NODE_ENV=production
```

### Генерация NEXTAUTH_SECRET

Для генерации безопасного секретного ключа используйте:

```bash
openssl rand -base64 32
```

Или онлайн генератор: https://generate-secret.vercel.app/32

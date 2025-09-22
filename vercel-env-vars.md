# Переменные окружения для Vercel

## Обязательные переменные для Vercel:

### Database
```
DATABASE_URL=postgresql://postgres.nrtznccqxnfbvgarbqua:Rat606727931@aws-1-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
```

```
DIRECT_URL=postgresql://postgres:Rat606727931@db.nrtznccqxnfbvgarbqua.supabase.co:5432/postgres?sslmode=require
```

### NextAuth Configuration
```
NEXTAUTH_URL=https://pixelprint.vercel.app
```

```
NEXTAUTH_SECRET=your-secret-key-here-change-in-production
```

### Admin Credentials
```
ADMIN_EMAIL=admin@pixelprint.com
```

```
ADMIN_PASSWORD=admin123
```

### Site Configuration
```
NEXT_PUBLIC_SITE_URL=https://pixelprint.vercel.app
```

```
NEXT_PUBLIC_FX_ENABLED=1
```

### Environment
```
NODE_ENV=production
```

## Инструкции по настройке:

1. Зайдите в Vercel Dashboard
2. Выберите проект "pixelprint"
3. Перейдите в Settings → Environment Variables
4. Добавьте каждую переменную выше
5. Убедитесь, что выбраны все окружения: Production, Preview, Development
6. Нажмите "Save"
7. Перейдите в Deployments и нажмите "Redeploy" на последнем деплое

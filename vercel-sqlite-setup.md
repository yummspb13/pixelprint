# Настройка Vercel с SQLite

## Переменные окружения для Vercel:

### Database
```
DATABASE_URL=file:./prisma/dev.db
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

## Важно:

1. **SQLite файл будет включен в деплой** - база данных будет работать на Vercel
2. **Данные сохраняются** между перезапусками
3. **Проще в настройке** - не нужен Supabase
4. **Бесплатно** - нет ограничений на запросы

## Инструкции:

1. Зайдите в Vercel Dashboard
2. Выберите проект "pixelprint"
3. Перейдите в Settings → Environment Variables
4. Добавьте переменные выше
5. Убедитесь, что выбраны все окружения
6. Нажмите "Save"
7. Перейдите в Deployments и нажмите "Redeploy"

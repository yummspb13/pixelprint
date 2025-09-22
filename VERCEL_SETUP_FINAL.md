# 🚨 КРИТИЧЕСКИ ВАЖНО: Правильная настройка Vercel

## Проблема
Vercel не видит переменные окружения, поэтому Prisma не может подключиться к базе данных.

## Решение согласно официальной документации Vercel

### 1. Откройте Vercel Dashboard
- Перейдите на https://vercel.com/dashboard
- Выберите проект `pixelprint`

### 2. Перейдите в Settings → Environment Variables
- В левом меню нажмите **Settings**
- Выберите **Environment Variables**

### 3. Добавьте каждую переменную (ВАЖНО: для Production environment):

#### DATABASE_URL
```
postgresql://postgres.nrtznccqxnfbvgarbqua:Rat606727931@aws-1-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true
```

#### DIRECT_URL
```
postgresql://postgres.nrtznccqxnfbvgarbqua:Rat606727931@aws-1-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true
```

#### NEXTAUTH_URL
```
https://pixelprint.vercel.app
```

#### NEXTAUTH_SECRET
```
YiKvmPodG1vruzLhJnNKSFUsY3IRdSFLchOfG9Reiwg=
```

#### NODE_ENV
```
production
```

### 4. После добавления всех переменных:
- Нажмите **Save**
- Сделайте **Redeploy** проекта

## Почему это важно?
- Vercel игнорирует переменные в `vercel.json` (устаревший подход)
- Prisma требует `DATABASE_URL` во время сборки
- Без переменных - сборка падает с ошибкой
- База данных работает (мы проверили), но приложение не может к ней подключиться

## Проверка
После деплоя проверьте:
```bash
curl -L https://pixelprint.vercel.app/api/health
```

Должно вернуть:
```json
{
  "ok": true,
  "rows": [{"ok": 1}],
  "env": {
    "DATABASE_URL_EXISTS": true,
    "DIRECT_URL_EXISTS": true,
    "NODE_ENV": "production"
  }
}
```

## Альтернативный способ - через Vercel CLI:
```bash
vercel env add DATABASE_URL
# Вставьте: postgresql://postgres.nrtznccqxnfbvgarbqua:Rat606727931@aws-1-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true

vercel env add DIRECT_URL  
# Вставьте: postgresql://postgres.nrtznccqxnfbvgarbqua:Rat606727931@aws-1-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true

vercel env add NEXTAUTH_URL
# Вставьте: https://pixelprint.vercel.app

vercel env add NEXTAUTH_SECRET
# Вставьте: YiKvmPodG1vruzLhJnNKSFUsY3IRdSFLchOfG9Reiwg=

vercel env add NODE_ENV
# Вставьте: production
```

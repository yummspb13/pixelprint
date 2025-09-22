# 🚨 КРИТИЧЕСКИ ВАЖНО: Настройка переменных окружения в Vercel

## Проблема
Vercel не видит переменные окружения, поэтому Prisma не может подключиться к базе данных.

## Решение
Нужно **ВРУЧНУЮ** добавить переменные в Vercel Dashboard:

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
**ВАЖНО**: Используем тот же URL что и для DATABASE_URL, так как direct connection не работает!

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

## Почему это важно?
- Vercel игнорирует переменные в vercel.json
- Prisma требует DATABASE_URL во время сборки
- Без переменных - сборка падает с ошибкой
- База данных работает (мы проверили), но приложение не может к ней подключиться

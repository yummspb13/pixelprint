# 🚀 Руководство по деплою на Vercel

## ✅ Что готово:

1. **Приложение собирается** без ошибок
2. **API эндпоинты работают** локально
3. **База данных загружена** с данными
4. **Переменные окружения** настроены

## 🔧 Шаги для деплоя:

### 1. Подготовка к деплою

```bash
# Убедитесь что все изменения закоммичены
git add .
git commit -m "Fix API endpoints and prepare for deployment"
git push origin main
```

### 2. Деплой на Vercel

1. Перейдите на https://vercel.com/dashboard
2. Выберите проект `pixelprint1`
3. Нажмите **Deploy** или **Redeploy**

### 3. Проверка переменных окружения

Убедитесь что в Vercel Dashboard настроены переменные:

```
DATABASE_URL=postgresql://postgres.nrtznccqxnfbvgarbqua:Rat606727931@aws-1-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:Rat606727931@db.nrtznccqxnfbvgarbqua.supabase.co:5432/postgres
NEXTAUTH_URL=https://pixelprint1.vercel.app
NEXTAUTH_SECRET=YiKvmPodG1vruzLhJnNKSFUsY3IRdSFLchOfG9Reiwg=
NEXT_PUBLIC_SITE_URL=https://pixelprint1.vercel.app
NODE_ENV=production
```

### 4. Проверка после деплоя

После успешного деплоя проверьте:

1. **Основной сайт**: https://pixelprint1.vercel.app
2. **API Health**: https://pixelprint1.vercel.app/api/health
3. **Test Connection**: https://pixelprint1.vercel.app/api/test-connection
4. **Test Environment**: https://pixelprint1.vercel.app/api/test-env
5. **Debug Admin**: https://pixelprint1.vercel.app/api/debug-admin

### 5. Проверка админки

1. **Админка**: https://pixelprint1.vercel.app/admin
2. **Recent Orders API**: https://pixelprint1.vercel.app/api/admin/dashboard/recent-orders
3. **Popular Services API**: https://pixelprint1.vercel.app/api/admin/dashboard/popular-services

## 🐛 Если есть ошибки:

### Ошибка "Internal Server Error"

1. Проверьте логи в Vercel Dashboard
2. Убедитесь что переменные окружения настроены
3. Проверьте что база данных доступна

### Ошибка "Failed to fetch" в админке

1. Проверьте API эндпоинты напрямую
2. Убедитесь что Prisma подключение работает
3. Проверьте CORS настройки

### Ошибка подключения к базе данных

1. Проверьте DATABASE_URL
2. Убедитесь что Supabase доступен
3. Проверьте SSL настройки

## 📊 Ожидаемый результат:

После успешного деплоя:
- ✅ Сайт загружается без ошибок
- ✅ Админка работает корректно
- ✅ API эндпоинты возвращают данные
- ✅ Калькулятор цен работает
- ✅ Все сервисы отображаются

## 🔍 Тестовые эндпоинты:

- `/api/health` - проверка здоровья API
- `/api/test-connection` - проверка подключения к базе
- `/api/test-env` - проверка переменных окружения
- `/api/debug-admin` - отладка админ API

## 📞 Поддержка:

Если возникли проблемы:
1. Проверьте логи в Vercel Dashboard
2. Используйте тестовые эндпоинты для диагностики
3. Убедитесь что все переменные окружения настроены правильно

# 🔍 Проверка деплоя на Vercel

## 📋 Шаги для проверки:

### 1. Проверьте статус деплоя
1. Перейдите на https://vercel.com/dashboard
2. Выберите проект `pixelprint1`
3. Проверьте статус последнего деплоя

### 2. Проверьте тестовые эндпоинты

После успешного деплоя проверьте эти URL:

#### Основные проверки:
- **Сайт**: https://pixelprint1.vercel.app
- **Health Check**: https://pixelprint1.vercel.app/api/health
- **Test Connection**: https://pixelprint1.vercel.app/api/test-connection
- **Test Environment**: https://pixelprint1.vercel.app/api/test-env
- **Diagnose**: https://pixelprint1.vercel.app/api/diagnose

#### API эндпоинты админки:
- **Recent Orders**: https://pixelprint1.vercel.app/api/admin/dashboard/recent-orders
- **Popular Services**: https://pixelprint1.vercel.app/api/admin/dashboard/popular-services
- **Debug Admin**: https://pixelprint1.vercel.app/api/debug-admin

### 3. Проверьте админку

1. **Админка**: https://pixelprint1.vercel.app/admin
2. Убедитесь что нет ошибок "Failed to fetch"
3. Проверьте что данные загружаются

### 4. Если есть ошибки

#### Ошибка "Internal Server Error":
1. Проверьте логи в Vercel Dashboard
2. Убедитесь что переменные окружения настроены
3. Проверьте `/api/diagnose` для детальной диагностики

#### Ошибка "Failed to fetch" в админке:
1. Проверьте API эндпоинты напрямую
2. Убедитесь что Prisma подключение работает
3. Проверьте CORS настройки

#### Ошибка подключения к базе данных:
1. Проверьте DATABASE_URL в Vercel Dashboard
2. Убедитесь что Supabase доступен
3. Проверьте SSL настройки

### 5. Переменные окружения для Vercel

Убедитесь что в Vercel Dashboard настроены:

```
DATABASE_URL=postgresql://postgres.nrtznccqxnfbvgarbqua:Rat606727931@aws-1-eu-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:Rat606727931@db.nrtznccqxnfbvgarbqua.supabase.co:5432/postgres
NEXTAUTH_URL=https://pixelprint1.vercel.app
NEXTAUTH_SECRET=YiKvmPodG1vruzLhJnNKSFUsY3IRdSFLchOfG9Reiwg=
NEXT_PUBLIC_SITE_URL=https://pixelprint1.vercel.app
NODE_ENV=production
```

### 6. Ожидаемый результат

После успешного деплоя:
- ✅ Сайт загружается без ошибок
- ✅ Админка работает корректно
- ✅ API эндпоинты возвращают данные
- ✅ Калькулятор цен работает
- ✅ Все сервисы отображаются

### 7. Диагностика

Если что-то не работает, используйте `/api/diagnose` для получения детальной информации о:
- Переменных окружения
- Подключении к базе данных
- Работе API эндпоинтов
- Общем состоянии системы

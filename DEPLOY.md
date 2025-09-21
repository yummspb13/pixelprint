# Деплой в Vercel

## Шаги для деплоя:

### 1. Подготовка базы данных
- Создайте PostgreSQL базу данных (например, на Neon, Supabase, или PlanetScale)
- Скопируйте URL базы данных

### 2. Настройка переменных окружения в Vercel
Добавьте следующие переменные в настройках проекта Vercel:

```
DATABASE_URL=postgresql://username:password@host:port/database
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-secret-key-here
ADMIN_EMAIL=admin@pixelprint.com
ADMIN_PASSWORD=admin123
```

### 3. Деплой
1. Подключите GitHub репозиторий к Vercel
2. Vercel автоматически обнаружит Next.js проект
3. Настройте переменные окружения
4. Задеплойте проект

### 4. Инициализация базы данных
После деплоя выполните:
```bash
npx prisma db push
npx prisma db seed
```

### 5. Загрузка данных
Используйте админ панель для загрузки сервисов и статей.

## Структура проекта:
- `/app` - Next.js App Router
- `/components` - React компоненты
- `/lib` - Утилиты и конфигурация
- `/prisma` - Схема базы данных
- `/public` - Статические файлы

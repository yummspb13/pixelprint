# Быстрый деплой в Vercel

## ✅ Проект готов к деплою!

### Шаги для деплоя:

1. **Подключите репозиторий к Vercel:**
   - Зайдите на [vercel.com](https://vercel.com)
   - Нажмите "New Project"
   - Подключите ваш GitHub репозиторий `yummspb13/pixelprint`

2. **Настройте переменные окружения в Vercel:**
   - В настройках проекта перейдите в "Environment Variables"
   - Добавьте следующие переменные:

   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=your-secret-key-here
   ADMIN_EMAIL=admin@pixelprint.com
   ADMIN_PASSWORD=admin123
   NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
   NEXT_PUBLIC_FX_ENABLED=1
   NODE_ENV=production
   ```

3. **Деплой:**
   - Vercel автоматически обнаружит Next.js проект
   - Нажмите "Deploy"
   - Дождитесь завершения сборки

4. **Настройка базы данных:**
   - После деплоя выполните в терминале Vercel:
   ```bash
   npx prisma db push
   ```

### Что уже настроено:
- ✅ `vercel.json` - конфигурация Vercel
- ✅ `package.json` - скрипты сборки
- ✅ `prisma/schema.prisma` - схема базы данных
- ✅ Next.js 15.5.3 с App Router
- ✅ Все зависимости установлены

### Важно:
- Замените `your-domain.vercel.app` на ваш реальный домен
- Создайте PostgreSQL базу данных (Neon, Supabase, или PlanetScale)
- Сгенерируйте безопасный `NEXTAUTH_SECRET`

Проект готов к деплою прямо сейчас! 🚀

#!/bin/bash

echo "🔍 Проверяем деплой на Vercel..."

# Проверяем основной сайт
echo "1. Проверяем основной сайт..."
curl -s -o /dev/null -w "%{http_code}" https://pixelprint1.vercel.app
echo " - Статус: $?"

# Проверяем API health
echo "2. Проверяем API health..."
curl -s https://pixelprint1.vercel.app/api/health | head -c 100
echo ""

# Проверяем API diagnose
echo "3. Проверяем API diagnose..."
curl -s https://pixelprint1.vercel.app/api/diagnose | head -c 100
echo ""

# Проверяем админ API
echo "4. Проверяем админ API..."
curl -s https://pixelprint1.vercel.app/api/admin/dashboard/recent-orders | head -c 100
echo ""

echo "✅ Проверка завершена!"

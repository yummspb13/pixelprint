import { PrismaClient } from "@prisma/client";
import { logger } from "./logger";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

// Подробное логирование переменных окружения
logger.info("=== DATABASE CONNECTION DEBUG ===");
logger.info("NODE_ENV:", process.env.NODE_ENV);
logger.info("DATABASE_URL exists:", !!process.env.DATABASE_URL);
logger.info("DATABASE_URL length:", process.env.DATABASE_URL?.length || 0);
logger.info("DATABASE_URL starts with postgresql:", process.env.DATABASE_URL?.startsWith('postgresql://') || false);
logger.info("All environment variables:", Object.keys(process.env).filter(key => key.includes('DATABASE') || key.includes('NEXT')));
logger.info("=== END DATABASE DEBUG ===");

// Проверяем наличие DATABASE_URL
if (!process.env.DATABASE_URL) {
  logger.error("❌ DATABASE_URL environment variable is not set!");
  // Во время сборки на Vercel используем fallback
  if (process.env.VERCEL) {
    logger.warn("⚠️ Running on Vercel without DATABASE_URL - using fallback for build");
    process.env.DATABASE_URL = 'postgresql://fallback:fallback@localhost:5432/fallback';
  } else {
    throw new Error("DATABASE_URL environment variable is required");
  }
}

// Создаем PrismaClient правильно с SSL настройками для Supabase
// ВРЕМЕННО: Используем DATABASE_URL (pooler) и в development, и в production
// DIRECT_URL может быть недоступен, поэтому используем проверенный pooler
// В будущем можно вернуться к DIRECT_URL для development после решения проблем с подключением
let databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Добавляем SSL параметры для Supabase, если их нет
if (databaseUrl.includes('supabase') && !databaseUrl.includes('sslmode')) {
  const separator = databaseUrl.includes('?') ? '&' : '?';
  databaseUrl = `${databaseUrl}${separator}sslmode=require`;
  logger.info("Added sslmode=require to database URL for Supabase");
}

logger.info(`Using DATABASE_URL (pooler) for connection`);

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: databaseUrl
    }
  }
});

logger.info(`Prisma client configured with: ${databaseUrl === process.env.DIRECT_URL ? 'DIRECT_URL (direct connection)' : 'DATABASE_URL (pooler)'}`);

logger.info("Prisma client created successfully");

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  logger.info("Prisma client cached for development");
}

export { prisma };

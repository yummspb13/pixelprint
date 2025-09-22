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
  throw new Error("DATABASE_URL environment variable is required");
}

// Создаем PrismaClient правильно с SSL настройками для Supabase
const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
});

logger.info("Prisma client created successfully");

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  logger.info("Prisma client cached for development");
}

export { prisma };

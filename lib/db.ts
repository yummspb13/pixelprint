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

// Создаем PrismaClient правильно
const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

logger.info("Prisma client created successfully");

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  logger.info("Prisma client cached for development");
}

export { prisma };

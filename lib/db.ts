import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

// Debug: проверяем переменные окружения
console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
console.log("NODE_ENV:", process.env.NODE_ENV);

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

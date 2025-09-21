import { PrismaClient } from "@prisma/client";

// Для production используем явную конфигурацию
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

export { prisma };

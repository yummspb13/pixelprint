import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

export async function GET() {
  logger.info("=== TEST-DB ENDPOINT CALLED ===");
  
  try {
    // Подробная отладочная информация
    logger.info("Environment check:");
    logger.info("DATABASE_URL exists:", !!process.env.DATABASE_URL);
    logger.info("DATABASE_URL length:", process.env.DATABASE_URL?.length || 0);
    logger.info("DATABASE_URL starts with postgresql:", process.env.DATABASE_URL?.startsWith('postgresql://') || false);
    logger.info("NODE_ENV:", process.env.NODE_ENV);
    logger.info("All env vars with DATABASE:", Object.keys(process.env).filter(key => key.includes('DATABASE')));
    logger.info("All env vars with NEXT:", Object.keys(process.env).filter(key => key.includes('NEXT')));
    
    logger.info("Attempting database connection...");
    
    // Тестируем подключение к базе данных
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    logger.info("Database connection successful!", result);
    
    return NextResponse.json({ 
      ok: true, 
      message: "Database connection successful",
      result: result,
      env: {
        DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
        DATABASE_URL_LENGTH: process.env.DATABASE_URL?.length || 0,
        NODE_ENV: process.env.NODE_ENV,
        ALL_DATABASE_VARS: Object.keys(process.env).filter(key => key.includes('DATABASE')),
        ALL_NEXT_VARS: Object.keys(process.env).filter(key => key.includes('NEXT'))
      }
    });
  } catch (error) {
    logger.error("Database connection error:", error);
    logger.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    
    return NextResponse.json({ 
      ok: false, 
      error: "Database connection failed",
      details: error instanceof Error ? error.message : "Unknown error",
      env: {
        DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
        DATABASE_URL_LENGTH: process.env.DATABASE_URL?.length || 0,
        NODE_ENV: process.env.NODE_ENV,
        ALL_DATABASE_VARS: Object.keys(process.env).filter(key => key.includes('DATABASE')),
        ALL_NEXT_VARS: Object.keys(process.env).filter(key => key.includes('NEXT'))
      }
    }, { status: 500 });
  }
}

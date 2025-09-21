import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Отладочная информация
    console.log("Environment check:");
    console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
    console.log("DATABASE_URL value:", process.env.DATABASE_URL ? "SET" : "NOT SET");
    console.log("NODE_ENV:", process.env.NODE_ENV);
    
    // Тестируем подключение к базе данных
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    return NextResponse.json({ 
      ok: true, 
      message: "Database connection successful",
      result: result,
      env: {
        DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
        NODE_ENV: process.env.NODE_ENV
      }
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json({ 
      ok: false, 
      error: "Database connection failed",
      details: error instanceof Error ? error.message : "Unknown error",
      env: {
        DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
        NODE_ENV: process.env.NODE_ENV
      }
    }, { status: 500 });
  }
}

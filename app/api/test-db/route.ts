import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    // Тестируем подключение к базе данных
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    return NextResponse.json({ 
      ok: true, 
      message: "Database connection successful",
      result: result
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json({ 
      ok: false, 
      error: "Database connection failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

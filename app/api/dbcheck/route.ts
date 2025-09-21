import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    console.log("🔍 DBCHECK: Starting database health check...");
    console.log("🔍 DBCHECK: DATABASE_URL exists:", !!process.env.DATABASE_URL);
    console.log("🔍 DBCHECK: DIRECT_URL exists:", !!process.env.DIRECT_URL);
    
    const ping = await prisma.$queryRaw`select 1 as ok`;
    console.log("✅ DBCHECK: Database ping successful:", ping);
    
    return NextResponse.json({ 
      ok: true, 
      ping,
      env: {
        DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
        DIRECT_URL_EXISTS: !!process.env.DIRECT_URL,
        NODE_ENV: process.env.NODE_ENV
      }
    });
  } catch (e: any) {
    console.error("❌ DBCHECK: Database health check failed:", e);
    return NextResponse.json({ 
      ok: false, 
      error: e.message,
      stack: e.stack,
      env: {
        DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
        DIRECT_URL_EXISTS: !!process.env.DIRECT_URL,
        NODE_ENV: process.env.NODE_ENV
      }
    }, { status: 500 });
  }
}

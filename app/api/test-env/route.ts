import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    DATABASE_URL: process.env.DATABASE_URL ? "SET" : "NOT SET",
    DIRECT_URL: process.env.DIRECT_URL ? "SET" : "NOT SET",
    NODE_ENV: process.env.NODE_ENV,
    ALL_ENV_VARS: Object.keys(process.env).filter(key => 
      key.includes('DATABASE') || 
      key.includes('DIRECT') || 
      key.includes('NEXT')
    )
  });
}

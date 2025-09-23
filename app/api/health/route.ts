import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log('🔍 HEALTH CHECK: Starting database health check...')
    console.log('🔍 HEALTH CHECK: DATABASE_URL exists:', !!process.env.DATABASE_URL)
    console.log('🔍 HEALTH CHECK: DIRECT_URL exists:', !!process.env.DIRECT_URL)
    
    const rows = await prisma.$queryRaw`select 1 as ok`
    console.log('✅ HEALTH CHECK: Database ping successful:', rows)
    
    return NextResponse.json({ 
      ok: true, 
      rows: Array.isArray(rows) ? rows.map(row => ({ ...row, ok: Number(row.ok) })) : rows,
      env: {
        DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
        DIRECT_URL_EXISTS: !!process.env.DIRECT_URL,
        NODE_ENV: process.env.NODE_ENV
      }
    })
  } catch (e: any) {
    console.error('❌ HEALTH CHECK: Database health check failed:', e)
    return NextResponse.json({ 
      ok: false, 
      error: e.message,
      stack: e.stack,
      env: {
        DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
        DIRECT_URL_EXISTS: !!process.env.DIRECT_URL,
        NODE_ENV: process.env.NODE_ENV
      }
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

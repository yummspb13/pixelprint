import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    console.log('🔍 TEST-DB-SIMPLE: Starting...');
    
    // Простая проверка подключения
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ TEST-DB-SIMPLE: Database connection successful!', result);
    
    // Проверяем, есть ли таблицы
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('📊 TEST-DB-SIMPLE: Tables:', tables);
    
    // Проверяем количество записей в каждой таблице
    const serviceCount = await prisma.service.count();
    const menuCount = await prisma.menuTile.count();
    const articleCount = await prisma.whyArticle.count();
    
    console.log('📊 TEST-DB-SIMPLE: Counts:', {
      services: serviceCount,
      menuTiles: menuCount,
      articles: articleCount
    });
    
    return NextResponse.json({
      ok: true,
      message: "Database connection successful",
      result: result,
      tables: tables,
      counts: {
        services: serviceCount,
        menuTiles: menuCount,
        articles: articleCount
      }
    });
  } catch (error: any) {
    console.error('❌ TEST-DB-SIMPLE: Database connection failed:', error);
    return NextResponse.json({
      ok: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

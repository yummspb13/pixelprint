import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { query, resultsCount, userAgent, ip } = await request.json();
    
    if (!query || query.length < 2) {
      return NextResponse.json({ 
        ok: false, 
        error: "Query must be at least 2 characters long"
      }, { status: 400 });
    }

    console.log('📝 SEARCH LOG: Logging search query:', { query, resultsCount, userAgent, ip });

    // Сохраняем лог поиска
    await prisma.searchLog.create({
      data: {
        query: query.trim(),
        resultsCount: resultsCount || 0,
        userAgent: userAgent || '',
        ip: ip || ''
      }
    });

    console.log('✅ SEARCH LOG: Search query logged successfully');

    return NextResponse.json({
      ok: true,
      message: "Search query logged successfully"
    });

  } catch (error) {
    console.error('❌ SEARCH LOG: Error:', error);
    return NextResponse.json({
      ok: false,
      error: "Failed to log search query"
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📊 SEARCH LOG: Fetching search logs...');

    // Простой тест - получаем все логи
    const logs = await prisma.$queryRaw`SELECT * FROM SearchLog ORDER BY timestamp DESC LIMIT 10`;

    console.log('📊 SEARCH LOG: Retrieved logs:', logs);

    return NextResponse.json({
      ok: true,
      logs: logs,
      stats: {
        total: Array.isArray(logs) ? logs.length : 0,
        popularQueries: [],
        dailyStats: []
      }
    });

  } catch (error) {
    console.error('❌ SEARCH LOG: Error fetching logs:', error);
    return NextResponse.json({
      ok: false,
      error: "Failed to fetch search logs",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query || query.length < 2) {
      return NextResponse.json({ 
        ok: true, 
        results: [],
        message: "Query must be at least 2 characters long"
      });
    }

    console.log('🔍 SEARCH API: Searching for:', query);

    // Поиск услуг по названию и описанию (case-insensitive для SQLite)
    const services = await prisma.$queryRaw`
      SELECT 
        id,
        name,
        slug,
        category,
        description,
        image,
        "clickCount"
      FROM Service 
      WHERE isActive = 1 
        AND (
          LOWER(name) LIKE LOWER(${'%' + query + '%'}) 
          OR LOWER(description) LIKE LOWER(${'%' + query + '%'})
          OR LOWER(category) LIKE LOWER(${'%' + query + '%'})
        )
      ORDER BY "clickCount" DESC, name ASC
      LIMIT 10
    `;

    console.log('🔍 SEARCH API: Found services:', Array.isArray(services) ? services.length : 0);

    return NextResponse.json({
      ok: true,
      results: Array.isArray(services) ? services : [],
      query: query,
      count: Array.isArray(services) ? services.length : 0
    });

  } catch (error) {
    console.error('❌ SEARCH API: Error:', error);
    return NextResponse.json({
      ok: false,
      error: "Search failed",
      results: []
    }, { status: 500 });
  }
}

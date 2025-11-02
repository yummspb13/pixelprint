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

    // Поиск услуг по названию, описанию и категории (case-insensitive для PostgreSQL)
    // Используем Prisma ORM с mode: 'insensitive' для совместимости с PostgreSQL
    // Если это не работает, можно использовать ILIKE через raw SQL
    const services = await prisma.service.findMany({
      where: {
        isActive: true,
        OR: [
          { 
            name: { 
              contains: query, 
              mode: 'insensitive' 
            } 
          },
          { 
            description: { 
              contains: query, 
              mode: 'insensitive' 
            } 
          },
          { 
            category: { 
              contains: query, 
              mode: 'insensitive' 
            } 
          }
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        category: true,
        description: true,
        image: true,
        clickCount: true
      },
      orderBy: [
        { clickCount: 'desc' },
        { name: 'asc' }
      ],
      take: 10
    });

    console.log('🔍 SEARCH API: Found services:', services.length);

    return NextResponse.json({
      ok: true,
      results: services,
      query: query,
      count: services.length
    });

  } catch (error) {
    console.error('❌ SEARCH API: Error:', error);
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : "Search failed",
      results: []
    }, { status: 500 });
  }
}

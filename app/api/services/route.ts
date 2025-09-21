import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/services - Get all services grouped by category
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const format = searchParams.get('format'); // 'grouped' or 'flat'
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const whereClause: any = {};
    
    if (category) {
      whereClause.category = category;
    }
    
    if (!includeInactive) {
      whereClause.isActive = true;
    }

    // Получаем уникальные категории с пагинацией
    const categories = await prisma.service.findMany({
      where: whereClause,
      select: { category: true, categoryOrder: true },
      distinct: ['category'],
      orderBy: { categoryOrder: 'asc' }
    });

    const totalCategories = categories.length;
    const totalPages = Math.ceil(totalCategories / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCategories = categories.slice(startIndex, endIndex);

    // Получаем сервисы только для пагинированных категорий
    const services = await prisma.service.findMany({
      where: {
        ...whereClause,
        category: {
          in: paginatedCategories.map(c => c.category)
        }
      },
      orderBy: [
        { categoryOrder: 'asc' },
        { order: 'asc' },
        { clickCount: 'desc' }
      ]
    });

    // Return grouped or flat format based on request
    if (format === 'flat') {
        return NextResponse.json({ 
          services,
          pagination: {
            page,
            limit,
            totalCategories,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }, {
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          }
        });
    }

    // Group services by category (default behavior)
    const groupedServices = services.reduce((acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = [];
      }
      acc[service.category].push(service);
      return acc;
    }, {} as Record<string, typeof services>);

        return NextResponse.json({ 
          services: groupedServices,
          pagination: {
            page,
            limit,
            totalCategories,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }, {
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // 5 min cache, 10 min stale
          }
        });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

// POST /api/services - Create new service
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      image,
      category,
      categoryOrder = 1,
      calculatorAvailable = false,
      slug,
      isActive = true
    } = body;

    if (!name || !category || !slug) {
      return NextResponse.json(
        { error: 'Name, category, and slug are required' },
        { status: 400 }
      );
    }

    // Get the next order number for this category
    const lastService = await prisma.service.findFirst({
      where: { category },
      orderBy: { order: 'desc' }
    });
    const nextOrder = lastService ? lastService.order + 1 : 1;

    const service = await prisma.service.create({
      data: {
        name,
        description,
        image,
        category,
        order: nextOrder,
        categoryOrder,
        calculatorAvailable,
        slug,
        isActive,
        clickCount: 0
      }
    });

    return NextResponse.json({ service });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    );
  }
}

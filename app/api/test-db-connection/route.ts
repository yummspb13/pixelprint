import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = 'nodejs';

export async function GET() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Простой тест - подсчет сервисов
    const servicesCount = await prisma.service.count();
    console.log('✅ Services count:', servicesCount);
    
    // Тест поиска конкретного сервиса
    const service = await prisma.service.findUnique({
      where: { slug: 'digital-business-cards' }
    });
    console.log('✅ Service found:', service ? service.name : 'not found');
    
    // Тест получения строк
    if (service) {
      const rows = await prisma.priceRow.findMany({
        where: { 
          serviceId: service.id,
          isActive: true 
        },
        include: { tiers: true },
        take: 5
      });
      console.log('✅ Rows found:', rows.length);
    }
    
    return NextResponse.json({
      ok: true,
      servicesCount,
      serviceFound: !!service,
      serviceName: service?.name,
      test: 'Database connection is working'
    });
  } catch (error: any) {
    console.error('❌ Database connection test failed:', error);
    return NextResponse.json({
      ok: false,
      error: error?.message || 'Unknown error',
      code: error?.code,
      name: error?.name,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected');
    
    // Test simple query
    const serviceCount = await prisma.service.count();
    console.log(`✅ Services count: ${serviceCount}`);
    
    // Test recent orders query
    const recentOrders = await prisma.order.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        customerName: true,
        status: true,
        createdAt: true
      }
    });
    
    console.log(`✅ Recent orders: ${recentOrders.length}`);
    
    return NextResponse.json({
      ok: true,
      message: 'Database connection successful',
      data: {
        serviceCount,
        recentOrdersCount: recentOrders.length,
        recentOrders: recentOrders.map(order => ({
          id: order.id,
          customerName: order.customerName,
          status: order.status,
          createdAt: order.createdAt.toISOString()
        }))
      }
    });
    
  } catch (error) {
    console.error('❌ Database connection error:', error);
    
    return NextResponse.json({
      ok: false,
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

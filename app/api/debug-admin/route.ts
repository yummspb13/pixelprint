import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug admin API...');
    
    // Test 1: Basic connection
    await prisma.$connect();
    console.log('✅ Prisma connected');
    
    // Test 2: Recent orders query (same as in recent-orders route)
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        customerName: true,
        customerEmail: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        orderItems: {
          select: {
            serviceName: true,
            quantity: true
          },
          take: 1
        }
      }
    });
    
    console.log(`✅ Recent orders query successful: ${recentOrders.length} orders`);
    
    // Test 3: Popular services query (same as in popular-services route)
    const services = await prisma.service.findMany({
      where: {
        isActive: true
      },
      take: 5
    });
    
    const orderItems = await prisma.orderItem.findMany({
      where: {
        serviceSlug: {
          in: services.map(s => s.slug)
        }
      }
    });
    
    console.log(`✅ Popular services query successful: ${services.length} services, ${orderItems.length} order items`);
    
    // Test 4: Format data like the actual API
    const formattedOrders = recentOrders.map(order => ({
      id: order.id.toString(),
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      service: order.orderItems[0]?.serviceName || 'Unknown Service',
      quantity: order.orderItems[0] ? `${order.orderItems[0].quantity} pcs` : 'N/A',
      totalAmount: order.totalAmount,
      status: order.status.toLowerCase(),
      createdAt: order.createdAt.toISOString()
    }));
    
    const servicesWithStats = services.map(service => {
      const serviceOrderItems = orderItems.filter(item => item.serviceSlug === service.slug);
      const totalOrders = serviceOrderItems.length;
      const totalQuantity = serviceOrderItems.reduce((sum, item) => sum + item.quantity, 0);
      
      return {
        id: service.id,
        name: service.name,
        slug: service.slug,
        totalOrders,
        totalQuantity,
        clickCount: service.clickCount || 0
      };
    });
    
    servicesWithStats.sort((a, b) => b.totalOrders - a.totalOrders);
    
    console.log('✅ Data formatting successful');
    
    return NextResponse.json({
      ok: true,
      message: 'Admin API debug successful',
      data: {
        recentOrders: formattedOrders,
        popularServices: servicesWithStats,
        stats: {
          totalOrders: recentOrders.length,
          totalServices: services.length,
          totalOrderItems: orderItems.length
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Admin API debug error:', error);
    
    return NextResponse.json({
      ok: false,
      error: 'Admin API debug failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

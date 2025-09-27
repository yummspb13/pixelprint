import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercel: !!process.env.VERCEL,
    vercelEnv: process.env.VERCEL_ENV,
    vercelUrl: process.env.VERCEL_URL,
    tests: {}
  };

  try {
    // Test 1: Environment variables
    results.tests.envVars = {
      DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
      DATABASE_URL_LENGTH: process.env.DATABASE_URL?.length || 0,
      DATABASE_URL_STARTS_WITH_POSTGRESQL: process.env.DATABASE_URL?.startsWith('postgresql://') || false,
      DIRECT_URL_EXISTS: !!process.env.DIRECT_URL,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET_EXISTS: !!process.env.NEXTAUTH_SECRET,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL
    };

    // Test 2: Prisma connection
    try {
      await prisma.$connect();
      results.tests.prismaConnection = { success: true, message: 'Connected successfully' };
    } catch (error) {
      results.tests.prismaConnection = { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }

    // Test 3: Basic queries
    try {
      const serviceCount = await prisma.service.count();
      const orderCount = await prisma.order.count();
      results.tests.basicQueries = { 
        success: true, 
        serviceCount, 
        orderCount 
      };
    } catch (error) {
      results.tests.basicQueries = { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }

    // Test 4: Recent orders query (exact same as in recent-orders route)
    try {
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

      results.tests.recentOrdersQuery = { 
        success: true, 
        count: recentOrders.length,
        orders: recentOrders.map(order => ({
          id: order.id,
          customerName: order.customerName,
          status: order.status,
          createdAt: order.createdAt.toISOString()
        }))
      };
    } catch (error) {
      results.tests.recentOrdersQuery = { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }

    // Test 5: Popular services query (exact same as in popular-services route)
    try {
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

      results.tests.popularServicesQuery = { 
        success: true, 
        servicesCount: services.length,
        orderItemsCount: orderItems.length,
        services: services.map(s => ({ id: s.id, name: s.name, slug: s.slug }))
      };
    } catch (error) {
      results.tests.popularServicesQuery = { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }

    // Test 6: API endpoints simulation
    try {
      // Simulate recent-orders API response
      const recentOrders = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
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

      results.tests.recentOrdersAPI = { 
        success: true, 
        response: { orders: formattedOrders }
      };
    } catch (error) {
      results.tests.recentOrdersAPI = { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }

    results.overall = {
      success: Object.values(results.tests).every((test: any) => test.success),
      totalTests: Object.keys(results.tests).length,
      passedTests: Object.values(results.tests).filter((test: any) => test.success).length
    };

    return NextResponse.json({
      ok: true,
      message: 'Diagnostic completed',
      results
    });

  } catch (error) {
    console.error('❌ Diagnostic error:', error);
    
    return NextResponse.json({
      ok: false,
      error: 'Diagnostic failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      results
    }, { status: 500 });
  }
}

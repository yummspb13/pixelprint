import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const runtime = 'nodejs';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
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

    return NextResponse.json({
      orders: formattedOrders
    });

  } catch (error) {
    console.error('Error fetching recent orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent orders' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

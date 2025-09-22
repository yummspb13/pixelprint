import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const runtime = 'nodejs';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get recent orders for notifications
    const recentOrders = await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 5,
      include: {
        orderItems: true
      }
    });

    // Generate notifications based on recent orders
    const notifications = recentOrders.map((order, index) => {
      const serviceNames = order.orderItems.map(item => item.serviceName || 'Unknown Service').join(', ');
      const totalQuantity = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
      
      // Calculate time ago
      const now = new Date();
      const orderTime = new Date(order.createdAt);
      const diffInMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));
      
      let timeAgo = '';
      if (diffInMinutes < 60) {
        timeAgo = `${diffInMinutes} minutes ago`;
      } else if (diffInMinutes < 1440) {
        const hours = Math.floor(diffInMinutes / 60);
        timeAgo = `${hours} hour${hours > 1 ? 's' : ''} ago`;
      } else {
        const days = Math.floor(diffInMinutes / 1440);
        timeAgo = `${days} day${days > 1 ? 's' : ''} ago`;
      }

      // Determine notification type and color
      let type = 'info';
      let color = 'px-cyan';
      let message = '';

      if (order.status === 'PENDING') {
        type = 'new';
        color = 'px-cyan';
        message = `New order #${order.id}`;
      } else if (order.status === 'COMPLETED') {
        type = 'completed';
        color = 'px-magenta';
        message = `Order #${order.id} completed`;
      } else if (order.status === 'CANCELLED') {
        type = 'cancelled';
        color = 'px-yellow';
        message = `Order #${order.id} cancelled`;
      } else {
        type = 'processing';
        color = 'px-cyan';
        message = `Order #${order.id} processing`;
      }

      return {
        id: order.id,
        type,
        color,
        message,
        description: `${serviceNames} - ${totalQuantity} pcs`,
        timeAgo,
        orderId: order.id,
        status: order.status
      };
    });

    return NextResponse.json({
      ok: true,
      notifications
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

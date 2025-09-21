import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get all active services
    const services = await prisma.service.findMany({
      where: {
        isActive: true
      },
      take: 5
    });

    // Get order items for these services
    const orderItems = await prisma.orderItem.findMany({
      where: {
        serviceSlug: {
          in: services.map(s => s.slug)
        }
      }
    });

    // Calculate stats for each service
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

    // Sort by total orders (most popular first)
    servicesWithStats.sort((a, b) => b.totalOrders - a.totalOrders);

    return NextResponse.json({
      ok: true,
      services: servicesWithStats
    });

  } catch (error) {
    console.error('Error fetching popular services:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch popular services' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

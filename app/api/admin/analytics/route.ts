import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = parseInt(searchParams.get('range') || '30');
    
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999); // End of today
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - range);
    startDate.setHours(0, 0, 0, 0); // Start of day
    
    // Convert to ISO strings for consistent timezone handling
    const startDateISO = startDate.toISOString();
    const endDateISO = endDate.toISOString();
    
    const previousStartDate = new Date();
    previousStartDate.setDate(previousStartDate.getDate() - (range * 2));
    const previousEndDate = new Date(startDate);

    // Current period data (all time for demo)
    const [currentOrders, currentRevenue, currentCustomers] = await Promise.all([
      prisma.order.findMany({
        include: {
          orderItems: true
        }
      }),
      prisma.order.aggregate({
        _sum: {
          totalAmount: true
        }
      }),
      prisma.order.groupBy({
        by: ['customerEmail']
      })
    ]);

    // Previous period data
    const [previousOrders, previousRevenue, previousCustomers] = await Promise.all([
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: previousStartDate,
            lt: previousEndDate
          }
        },
        include: {
          orderItems: true
        }
      }),
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: previousStartDate,
            lt: previousEndDate
          }
        },
        _sum: {
          totalAmount: true
        }
      }),
      prisma.order.groupBy({
        by: ['customerEmail'],
        where: {
          createdAt: {
            gte: previousStartDate,
            lt: previousEndDate
          }
        }
      })
    ]);

    // Calculate metrics
    const totalRevenue = currentRevenue._sum.totalAmount || 0;
    const previousTotalRevenue = previousRevenue._sum.totalAmount || 0;
    const revenueChange = previousTotalRevenue > 0 
      ? ((totalRevenue - previousTotalRevenue) / previousTotalRevenue) * 100 
      : 0;

    const newCustomers = currentCustomers.length;
    const previousNewCustomers = previousCustomers.length;
    const customersChange = previousNewCustomers > 0 
      ? ((newCustomers - previousNewCustomers) / previousNewCustomers) * 100 
      : 0;

    const averageOrder = currentOrders.length > 0 ? totalRevenue / currentOrders.length : 0;
    const previousAverageOrder = previousOrders.length > 0 ? (previousTotalRevenue / previousOrders.length) : 0;
    const averageOrderChange = previousAverageOrder > 0 
      ? ((averageOrder - previousAverageOrder) / previousAverageOrder) * 100 
      : 0;

    const conversionRate = newCustomers > 0 ? (currentOrders.length / newCustomers) * 100 : 0;
    const previousConversionRate = previousNewCustomers > 0 ? (previousOrders.length / previousNewCustomers) * 100 : 0;
    const conversionChange = previousConversionRate > 0 
      ? ((conversionRate - previousConversionRate) / previousConversionRate) * 100 
      : 0;

    // Top services
    const serviceStats = new Map();
    currentOrders.forEach(order => {
      order.orderItems.forEach(item => {
        const serviceName = item.serviceName;
        if (serviceStats.has(serviceName)) {
          const stats = serviceStats.get(serviceName);
          stats.orders += 1;
          stats.revenue += item.totalPrice;
        } else {
          serviceStats.set(serviceName, {
            name: serviceName,
            orders: 1,
            revenue: item.totalPrice,
            growth: 0 // Simplified for now
          });
        }
      });
    });

    const topServices = Array.from(serviceStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Recent activity (simplified)
    const recentActivity = [
      { action: "Analytics updated", user: "System", time: "Just now", type: "system" },
      { action: "Data refreshed", user: "Admin", time: "1 minute ago", type: "refresh" }
    ];

    return NextResponse.json({
      totalRevenue,
      newCustomers,
      conversionRate,
      averageOrder,
      revenueChange,
      customersChange,
      conversionChange,
      averageOrderChange,
      topServices,
      recentActivity
    });

  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

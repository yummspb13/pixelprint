import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Получаем данные за последние 30 дней
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Текущие данные (последние 30 дней)
    const [currentOrders, currentRevenue, currentCustomers] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      }),
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
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
            gte: thirtyDaysAgo
          }
        }
      })
    ]);

    // Предыдущие данные (30-60 дней назад)
    const [previousOrders, previousRevenue, previousCustomers] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo
          }
        }
      }),
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo
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
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo
          }
        }
      })
    ]);

    // Рассчитываем изменения в процентах
    const ordersChange = previousOrders > 0 
      ? ((currentOrders - previousOrders) / previousOrders) * 100 
      : 0;

    const currentRevenueValue = currentRevenue._sum.totalAmount || 0;
    const previousRevenueValue = previousRevenue._sum.totalAmount || 0;
    const revenueChange = previousRevenueValue > 0 
      ? ((currentRevenueValue - previousRevenueValue) / previousRevenueValue) * 100 
      : 0;

    const currentCustomersCount = currentCustomers.length;
    const previousCustomersCount = previousCustomers.length;
    const customersChange = previousCustomersCount > 0 
      ? ((currentCustomersCount - previousCustomersCount) / previousCustomersCount) * 100 
      : 0;

    // Конверсия (примерная - заказы / уникальные посетители)
    // Для простоты используем фиксированное значение, но можно интегрировать с аналитикой
    const conversionRate = currentOrders > 0 ? (currentOrders / Math.max(currentCustomersCount, 1)) * 100 : 0;
    const previousConversionRate = previousOrders > 0 ? (previousOrders / Math.max(previousCustomersCount, 1)) * 100 : 0;
    const conversionChange = previousConversionRate > 0 
      ? ((conversionRate - previousConversionRate) / previousConversionRate) * 100 
      : 0;

    return NextResponse.json({
      totalOrders: currentOrders,
      totalRevenue: currentRevenueValue,
      totalCustomers: currentCustomersCount,
      conversionRate: conversionRate,
      ordersChange: ordersChange,
      revenueChange: revenueChange,
      customersChange: customersChange,
      conversionChange: conversionChange
    });

  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    console.error('Error details:', {
      message: error?.message,
      name: error?.name,
      code: error?.code,
      meta: error?.meta
    });
    
    // Возвращаем валидную структуру данных даже при ошибке
    // Это предотвратит ошибки в UI
    return NextResponse.json({
      totalOrders: 0,
      totalRevenue: 0,
      totalCustomers: 0,
      conversionRate: 0,
      ordersChange: 0,
      revenueChange: 0,
      customersChange: 0,
      conversionChange: 0,
      error: process.env.NODE_ENV === 'development' ? error?.message : 'Failed to fetch dashboard statistics'
    }, { status: 200 }); // Возвращаем 200, чтобы не ломать UI, но включаем error в ответ
  }
}

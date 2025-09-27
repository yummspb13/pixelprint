import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching customers...');
    
    // Get all orders first
    const allOrders = await prisma.order.findMany({
      select: {
        customerEmail: true,
        customerName: true,
        customerPhone: true,
        totalAmount: true,
        createdAt: true,
        status: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('Found orders:', allOrders.length);

    // Group by customer email
    const customerMap = new Map();
    
    allOrders.forEach(order => {
      const email = order.customerEmail;
      if (!customerMap.has(email)) {
        customerMap.set(email, {
          email: order.customerEmail,
          name: order.customerName,
          phone: order.customerPhone,
          orders: [],
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: null,
          firstOrderDate: null
        });
      }
      
      const customer = customerMap.get(email);
      customer.orders.push(order);
      customer.totalOrders++;
      customer.totalSpent += order.totalAmount;
      
      if (!customer.lastOrderDate || order.createdAt > customer.lastOrderDate) {
        customer.lastOrderDate = order.createdAt;
      }
      if (!customer.firstOrderDate || order.createdAt < customer.firstOrderDate) {
        customer.firstOrderDate = order.createdAt;
      }
    });

    // Convert to array and calculate additional stats
    const customers = Array.from(customerMap.values()).map(customer => {
      const averageOrder = customer.totalOrders > 0 ? customer.totalSpent / customer.totalOrders : 0;
      
      // Count orders by status
      const statusCounts = customer.orders.reduce((acc: Record<string, number>, order: any) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});

      return {
        email: customer.email,
        name: customer.name,
        phone: customer.phone,
        totalOrders: customer.totalOrders,
        totalSpent: customer.totalSpent,
        averageOrder: Math.round(averageOrder * 100) / 100,
        lastOrderDate: customer.lastOrderDate?.toISOString() || null,
        firstOrderDate: customer.firstOrderDate?.toISOString() || null,
        statusCounts,
        recentOrders: customer.orders.slice(0, 3).map((order: any) => ({
          totalAmount: order.totalAmount,
          createdAt: order.createdAt.toISOString(),
          status: order.status
        }))
      };
    });

    // Sort by total spent (highest first)
    customers.sort((a, b) => b.totalSpent - a.totalSpent);

    console.log('Found customers:', customers.length);

    return NextResponse.json({
      ok: true,
      customers: customers
    });

  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

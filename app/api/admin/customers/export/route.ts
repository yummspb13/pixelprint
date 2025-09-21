import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
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

    // Group by customer email
    const customerMap = new Map();
    
    allOrders.forEach(order => {
      const email = order.customerEmail;
      if (!customerMap.has(email)) {
        customerMap.set(email, {
          email: order.customerEmail,
          name: order.customerName,
          phone: order.customerPhone,
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: null,
          firstOrderDate: null
        });
      }
      
      const customer = customerMap.get(email);
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
    const customersWithStats = Array.from(customerMap.values()).map(customer => {
      const averageOrder = customer.totalOrders > 0 ? customer.totalSpent / customer.totalOrders : 0;

      return {
        email: customer.email,
        name: customer.name,
        phone: customer.phone || '',
        totalOrders: customer.totalOrders,
        totalSpent: Math.round(customer.totalSpent * 100) / 100,
        averageOrder: Math.round(averageOrder * 100) / 100,
        lastOrderDate: customer.lastOrderDate?.toISOString().split('T')[0] || '',
        firstOrderDate: customer.firstOrderDate?.toISOString().split('T')[0] || ''
      };
    });

    // Sort by total spent (highest first)
    customersWithStats.sort((a, b) => b.totalSpent - a.totalSpent);

    // Convert to CSV
    const csvHeaders = [
      'Email',
      'Name', 
      'Phone',
      'Total Orders',
      'Total Spent (£)',
      'Average Order (£)',
      'Last Order Date',
      'First Order Date'
    ];

    const csvRows = customersWithStats.map(customer => [
      customer.email,
      customer.name,
      customer.phone,
      customer.totalOrders,
      customer.totalSpent,
      customer.averageOrder,
      customer.lastOrderDate,
      customer.firstOrderDate
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    // Generate filename with current date
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const filename = `customers-export-${dateStr}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });

  } catch (error) {
    console.error('Error exporting customers:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to export customers' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

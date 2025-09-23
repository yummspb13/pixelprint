import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest, context: { params: Promise<{ orderNumber: string }> }) {
  try {
    const { orderNumber } = await context.params;
    const { searchParams } = new URL(request.url);
    const customerEmail = searchParams.get('email');

    console.log('Tracking request:', { orderNumber, customerEmail });

    if (!customerEmail) {
      return NextResponse.json({ error: "Email required for tracking" }, { status: 400 });
    }

    // Find order in database
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: orderNumber,
        customerEmail: customerEmail
      },
      include: {
        orderItems: true
      }
    });

    console.log('Found order:', order);

    if (!order) {
      return NextResponse.json({ error: "Order not found or email mismatch" }, { status: 404 });
    }

    return NextResponse.json({ order });

  } catch (error) {
    console.error('Error fetching public tracking order:', error);
    return NextResponse.json(
      { error: "Failed to fetch order details" },
      { status: 500 }
    );
  }
}
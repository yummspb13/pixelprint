import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// PATCH order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    const order = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        orderItems: true
      }
    });

    return NextResponse.json({ order });

  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}

// GET single order for admin
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        orderItems: true
      }
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });

  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

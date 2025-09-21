import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { readFile } from "fs/promises";
import { join } from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string; itemId: string }> }
) {
  try {
    const { orderId, itemId } = await params;

    // Find the order item
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        id: parseInt(itemId),
        orderId: parseInt(orderId)
      },
      include: {
        order: true
      }
    });

    if (!orderItem) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (!orderItem.fileName || !orderItem.filePath) {
      return NextResponse.json({ error: "No file attached to this item" }, { status: 404 });
    }

    try {
      // Read the file from the server
      const filePath = join(process.cwd(), orderItem.filePath);
      const fileBuffer = await readFile(filePath);

      // Return the file as a download
      return new NextResponse(fileBuffer as any, {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${orderItem.fileName}"`,
          'Content-Length': fileBuffer.length.toString(),
        },
      });
    } catch (fileError) {
      console.error('Error reading file:', fileError);
      return NextResponse.json({ error: "File not found on server" }, { status: 404 });
    }

  } catch (error) {
    console.error('Error fetching file:', error);
    return NextResponse.json(
      { error: "Failed to fetch file" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { readFile } from "fs/promises";
import { join } from "path";

export async function GET(
  request: NextRequest,
  context: { params: Promise<any> }
) {
  try {
    const { orderId, itemId } = await context.params;

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

    // Check if filePath is a URL (cloud storage) or local path
    const isUrl = orderItem.filePath.startsWith('http://') || orderItem.filePath.startsWith('https://');

    if (isUrl) {
      // File is in cloud storage (Cloudinary, S3, etc.)
      // Redirect to the cloud URL or proxy it
      try {
        // Fetch the file from cloud storage
        const response = await fetch(orderItem.filePath);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch file from cloud: ${response.statusText}`);
        }

        const fileBuffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'application/octet-stream';

        // Return the file as a download
        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${orderItem.fileName}"`,
            'Content-Length': fileBuffer.byteLength.toString(),
          },
        });
      } catch (cloudError: any) {
        console.error('Error fetching file from cloud storage:', cloudError);
        // Fallback: redirect to the URL directly
        return NextResponse.redirect(orderItem.filePath);
      }
    } else {
      // File is stored locally
      try {
        // Read the file from the server
        const filePath = join(process.cwd(), orderItem.filePath);
        const fileBuffer = await readFile(filePath);

        // Return the file as a download
        return new NextResponse(fileBuffer, {
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
    }

  } catch (error) {
    console.error('Error fetching file:', error);
    return NextResponse.json(
      { error: "Failed to fetch file" },
      { status: 500 }
    );
  }
}

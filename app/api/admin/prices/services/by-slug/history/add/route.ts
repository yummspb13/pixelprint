import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const { changeType, description, rowId, oldData, newData } = await request.json();
    
    console.log('Adding change history:', { slug, changeType, description, rowId });

    const service = await prisma.service.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!service) {
      console.error('Service not found for slug:', slug);
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    console.log('Found service:', service.id);

    // Check if rowId exists (for row_delete operations)
    if (rowId) {
      const rowExists = await prisma.priceRow.findUnique({
        where: { id: rowId },
        select: { id: true }
      });
      
      if (!rowExists) {
        console.warn('Row does not exist, but continuing with history save:', rowId);
      } else {
        console.log('Row exists:', rowExists.id);
      }
    }

    const historyEntry = await prisma.changeHistory.create({
      data: {
        serviceId: service.id,
        rowId: rowId || null,
        changeType,
        description,
        oldData: oldData ? JSON.stringify(oldData) : null,
        newData: newData ? JSON.stringify(newData) : null
      }
    });

    console.log('History entry created successfully:', historyEntry.id);
    return NextResponse.json({ success: true, id: historyEntry.id });
  } catch (error) {
    console.error('Error adding change history:', error);
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

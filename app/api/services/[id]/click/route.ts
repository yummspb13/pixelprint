import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

// POST /api/services/[id]/click - Track service click
export async function POST(
  request: NextRequest,
  context: { params: Promise<any> }
) {
  try {
    const { id } = await context.params;
    const serviceId = parseInt(id);
    
    // Increment click count
    const service = await prisma.service.update({
      where: { id: serviceId },
      data: {
        clickCount: {
          increment: 1
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      clickCount: service.clickCount 
    });
  } catch (error) {
    console.error('Error tracking click:', error);
    return NextResponse.json(
      { error: 'Failed to track click' },
      { status: 500 }
    );
  }
}

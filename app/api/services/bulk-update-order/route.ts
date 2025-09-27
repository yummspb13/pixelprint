import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export const runtime = 'nodejs';

// POST /api/services/bulk-update-order - Bulk update service orders
export async function POST(request: NextRequest) {
  try {
    const { updates, useTempSwap } = await request.json();
    
    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'Updates must be an array' },
        { status: 400 }
      );
    }

    // Simple direct update for all cases
    const result = await prisma.$transaction(
      updates.map(({ id, order, categoryOrder }) =>
        prisma.service.update({
          where: { id },
          data: {
            ...(order !== undefined && { order }),
            ...(categoryOrder !== undefined && { categoryOrder })
          }
        })
      )
    );

    // Revalidate cache
    revalidatePath('/api/services');
    revalidatePath('/admin/configurator');
    
    return NextResponse.json({ 
      success: true, 
      updated: result.length 
    });
  } catch (error) {
    console.error('Error bulk updating orders:', error);
    return NextResponse.json(
      { error: 'Failed to update orders' },
      { status: 500 }
    );
  }
}

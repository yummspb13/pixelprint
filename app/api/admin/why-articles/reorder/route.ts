import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/admin/why-articles/reorder - Reorder articles
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { articleIds } = body; // Array of article IDs in new order

    if (!Array.isArray(articleIds)) {
      return NextResponse.json(
        { error: 'articleIds must be an array' },
        { status: 400 }
      );
    }

    // Update order for each article
    const updatePromises = articleIds.map((id: number, index: number) =>
      prisma.whyArticle.update({
        where: { id },
        data: { order: index + 1 }
      })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering articles:', error);
    return NextResponse.json(
      { error: 'Failed to reorder articles' },
      { status: 500 }
    );
  }
}

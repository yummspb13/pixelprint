import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

// GET /api/admin/why-articles/[id] - Get single article
export async function GET(
  request: NextRequest,
  context: { params: Promise<any> }
) {
  try {
    const { id } = await context.params;
    const article = await prisma.whyArticle.findUnique({
      where: { id: parseInt(id) }
    });

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ article });
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/why-articles/[id] - Update article
export async function PUT(
  request: NextRequest,
  context: { params: Promise<any> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { title, text, image, href, span, content, images, order, isActive } = body;

    const article = await prisma.whyArticle.update({
      where: { id: parseInt(id) },
      data: {
        title,
        text,
        image,
        href,
        span,
        content,
        images: images ? JSON.stringify(images) : null,
        order: order !== undefined ? order : undefined,
        isActive: isActive !== undefined ? isActive : undefined
      }
    });

    return NextResponse.json({ article });
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/why-articles/[id] - Delete article
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<any> }
) {
  try {
    const { id } = await context.params;
    
    await prisma.whyArticle.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}

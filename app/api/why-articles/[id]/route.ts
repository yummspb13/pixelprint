import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

// GET /api/why-articles/[id] - Get single article for frontend
export async function GET(
  request: NextRequest,
  context: { params: Promise<any> }
) {
  try {
    const { id } = await context.params;
    const article = await prisma.whyArticle.findFirst({
      where: { 
        id: parseInt(id),
        isActive: true 
      }
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

// PUT /api/why-articles/[id] - Update article
export async function PUT(
  request: NextRequest,
  context: { params: Promise<any> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    
    const article = await prisma.whyArticle.update({
      where: { id: parseInt(id) },
      data: {
        title: body.title,
        text: body.text,
        image: body.image,
        href: body.href,
        span: body.span,
        order: body.order,
        isActive: body.isActive
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

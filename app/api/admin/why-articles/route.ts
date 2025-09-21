import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/why-articles - Get all articles
export async function GET(request: NextRequest) {
  try {
    const articles = await prisma.whyArticle.findMany({
      orderBy: { order: 'asc' }
    });

    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

// POST /api/admin/why-articles - Create new article
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, text, image, href, span, content, images } = body;

    // Get the next order number
    const lastArticle = await prisma.whyArticle.findFirst({
      orderBy: { order: 'desc' }
    });
    const nextOrder = (lastArticle?.order || 0) + 1;

    const article = await prisma.whyArticle.create({
      data: {
        title,
        text,
        image,
        href,
        span,
        order: nextOrder,
        content,
        images: images ? JSON.stringify(images) : null
      }
    });

    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    );
  }
}

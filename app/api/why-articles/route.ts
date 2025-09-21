import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/why-articles - Get all active articles for frontend
export async function GET(request: NextRequest) {
  try {
    console.log('Fetching articles...');
    const articles = await prisma.whyArticle.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });
    console.log('Found articles:', articles.length);

    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/menu - Get all menu tiles
export async function GET() {
  try {
    const tiles = await prisma.menuTile.findMany({
      orderBy: { order: 'asc' }
    });
    return NextResponse.json({ tiles });
  } catch (error) {
    console.error('Error fetching menu tiles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu tiles' },
      { status: 500 }
    );
  }
}

// POST /api/admin/menu - Create new menu tile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { label, href, image, order = 0, isActive = true } = body;

    if (!label || !href) {
      return NextResponse.json(
        { error: 'Label and href are required' },
        { status: 400 }
      );
    }

    const tile = await prisma.menuTile.create({
      data: {
        label,
        href,
        image,
        order,
        isActive
      }
    });

    return NextResponse.json({ tile });
  } catch (error) {
    console.error('Error creating menu tile:', error);
    return NextResponse.json(
      { error: 'Failed to create menu tile' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

// GET /api/admin/menu/[id] - Get single menu tile
export async function GET(
  request: NextRequest,
  context: { params: Promise<any> }
) {
  try {
    const { id } = await context.params;
    const tile = await prisma.menuTile.findUnique({
      where: { id: parseInt(id) }
    });

    if (!tile) {
      return NextResponse.json(
        { error: 'Menu tile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ tile });
  } catch (error) {
    console.error('Error fetching menu tile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu tile' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/menu/[id] - Update menu tile
export async function PUT(
  request: NextRequest,
  context: { params: Promise<any> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { label, href, image, order, isActive } = body;

    const tile = await prisma.menuTile.update({
      where: { id: parseInt(id) },
      data: {
        ...(label && { label }),
        ...(href && { href }),
        ...(image !== undefined && { image }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive })
      }
    });

    return NextResponse.json({ tile });
  } catch (error) {
    console.error('Error updating menu tile:', error);
    return NextResponse.json(
      { error: 'Failed to update menu tile' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/menu/[id] - Delete menu tile
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<any> }
) {
  try {
    const { id } = await context.params;
    await prisma.menuTile.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting menu tile:', error);
    return NextResponse.json(
      { error: 'Failed to delete menu tile' },
      { status: 500 }
    );
  }
}

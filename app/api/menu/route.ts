import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = 'nodejs';

export async function GET() {
  try {
    const menuTiles = await prisma.menuTile.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json({
      ok: true,
      tiles: menuTiles
    });

  } catch (error) {
    console.error('Error fetching menu tiles:', error);
    return NextResponse.json({
      ok: false,
      error: "Failed to fetch menu tiles",
      tiles: []
    }, { status: 500 });
  }
}

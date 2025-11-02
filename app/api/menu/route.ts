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

  } catch (error: any) {
    console.error('Error fetching menu tiles:', error);
    console.error('Error details:', {
      message: error?.message,
      name: error?.name,
      code: error?.code,
      meta: error?.meta
    });
    
    // Если таблица не существует - возвращаем пустой массив
    if (error?.code === 'P2021' || error?.message?.includes('does not exist')) {
      console.warn('MenuTile table may not exist, returning empty array');
      return NextResponse.json({
        ok: true,
        tiles: []
      });
    }
    
    // Если проблема с подключением - возвращаем ошибку, но с понятным сообщением
    if (error?.code === 'P1001' || error?.message?.includes('connection') || error?.message?.includes('Can\'t reach database')) {
      console.error('❌ Database connection error in menu API');
      console.error('❌ Hint: Check DATABASE_SETUP.md for troubleshooting');
      return NextResponse.json({
        ok: false,
        error: "Database connection error",
        errorMessage: process.env.NODE_ENV === 'development' ? error?.message : undefined,
        hint: "Please check your DATABASE_URL in .env file",
        tiles: []
      }, { status: 503 });
    }
    
    return NextResponse.json({
      ok: false,
      error: "Failed to fetch menu tiles",
      errorMessage: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      errorCode: error?.code,
      tiles: []
    }, { status: 500 });
  }
}

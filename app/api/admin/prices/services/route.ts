import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = 'nodejs';

export async function GET() {
  try {
    const items = await prisma.service.findMany({
      select: { id:true, slug:true, name:true, category:true, _count: { select: { rows:true } } },
      orderBy: [{ category: "asc" }, { name: "asc" }]
    });
    return NextResponse.json(items);
  } catch (error: any) {
    console.error('Error fetching services:', error);
    console.error('Error details:', {
      message: error?.message,
      name: error?.name,
      code: error?.code,
      meta: error?.meta
    });
    
    // Если проблема с подключением к БД
    if (error?.code === 'P1001' || error?.message?.includes('connection') || error?.message?.includes('Can\'t reach database')) {
      console.error('❌ Database connection error in services API');
      return NextResponse.json(
        { 
          error: "Database connection error",
          items: []
        },
        { status: 503 }
      );
    }
    
    // Если таблица не существует
    if (error?.code === 'P2021' || error?.message?.includes('does not exist')) {
      console.warn('Service table may not exist, returning empty array');
      return NextResponse.json([]);
    }
    
    // Общая ошибка
    return NextResponse.json(
      { 
        error: "Failed to fetch services",
        items: []
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { slug, name, category } = await req.json();
  if (!slug || !name || !category) return NextResponse.json({ ok:false, error:"fields required" }, { status:400 });
  const s = await prisma.service.upsert({
    where: { slug },
    update: { name, category },
    create: { slug, name, category }
  });
  return NextResponse.json({ ok:true, service: s });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const ids = searchParams.get('ids');
  
  if (!ids) {
    return NextResponse.json({ ok: false, error: "No IDs provided" }, { status: 400 });
  }

  try {
    const serviceIds = ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    
    if (serviceIds.length === 0) {
      return NextResponse.json({ ok: false, error: "No valid IDs provided" }, { status: 400 });
    }

    // Delete services and their related data
    const result = await prisma.service.deleteMany({
      where: {
        id: { in: serviceIds }
      }
    });

    return NextResponse.json({ 
      ok: true, 
      deleted: result.count,
      message: `Successfully deleted ${result.count} service${result.count !== 1 ? 's' : ''}` 
    });
  } catch (error) {
    console.error('Error deleting services:', error);
    return NextResponse.json({ 
      ok: false, 
      error: "Failed to delete services" 
    }, { status: 500 });
  }
}

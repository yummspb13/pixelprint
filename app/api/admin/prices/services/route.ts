import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = 'nodejs';

export async function GET() {
  const items = await prisma.service.findMany({
    select: { id:true, slug:true, name:true, category:true, _count: { select: { rows:true } } },
    orderBy: [{ category: "asc" }, { name: "asc" }]
  });
  return NextResponse.json(items);
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

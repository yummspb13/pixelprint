import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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

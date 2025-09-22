import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidateTag } from "next/cache";
import { PRICING_TAG } from "@/lib/pricing-const";

export const runtime = 'nodejs';

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = await prisma.service.findUnique({
    where: { slug },
    include: { rows: { include: { tiers: true }, orderBy: { id: "asc" } } }
  });
  if (!s) return NextResponse.json({ ok:false, error:"not found" }, { status:404 });
  return NextResponse.json({ ok:true, service: { id:s.id, name:s.name, slug:s.slug, category:s.category }, rows: s.rows });
}

// создать новый ряд
export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { attrs = {}, ruleKind = "perUnit", unit = null, setup = null, fixed = null } = await req.json();
  const s = await prisma.service.findUnique({ where:{ slug } });
  if (!s) return NextResponse.json({ ok:false, error:"service not found" }, { status:404 });
  const row = await prisma.priceRow.create({
    data: { serviceId: s.id, attrs, ruleKind, unit, setup, fixed }
  });
  revalidateTag(PRICING_TAG);
  return NextResponse.json({ ok:true, row });
}

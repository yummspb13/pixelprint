import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidateTag } from "next/cache";
import { PRICING_TAG } from "@/lib/pricing-const";

export const runtime = 'nodejs';

export async function PUT(req: Request, context: { params: Promise<any> }) {
  const { id } = await context.params;
  const { tiers = [], setup = null } = await req.json(); // tiers: [{qty,unit}]
  const rowId = Number(id);
  await prisma.$transaction([
    prisma.tier.deleteMany({ where: { rowId } }),
    prisma.priceRow.update({ where: { id: rowId }, data: { setup } }),
    prisma.tier.createMany({
      data: tiers.map((t: any) => ({ rowId, qty: Number(t.qty), unit: Number(t.unit) }))
    })
  ]);
  revalidateTag(PRICING_TAG);
  return NextResponse.json({ ok:true });
}

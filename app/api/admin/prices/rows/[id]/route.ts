import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidateTag } from "next/cache";
import { PRICING_TAG } from "@/lib/pricing-const";

export const runtime = 'nodejs';

export async function PATCH(req: Request, context: { params: Promise<any> }) {
  const body = await req.json();
  const { id } = await context.params;
  const row = await prisma.priceRow.update({ where:{ id: Number(id) }, data: body });
  revalidateTag(PRICING_TAG);
  return NextResponse.json({ ok:true, row });
}

export async function DELETE(_: Request, context: { params: Promise<any> }) {
  const { id } = await context.params;
  await prisma.priceRow.delete({ where:{ id: Number(id) } });
  revalidateTag(PRICING_TAG);
  return NextResponse.json({ ok:true });
}

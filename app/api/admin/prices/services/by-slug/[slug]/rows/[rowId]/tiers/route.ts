import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidateTag } from "next/cache";
import { PRICING_TAG } from "@/lib/pricing-const";

export const runtime = 'nodejs';

export async function POST(req: Request, context: { params: Promise<any> }) {
  try {
    const { rowId } = await context.params;
    const { qty, unit } = await req.json();

    const tier = await prisma.tier.create({
      data: {
        rowId: Number(rowId),
        qty: Number(qty),
        unit: Number(unit),
      },
    });

    revalidateTag(PRICING_TAG);
    return NextResponse.json({ ok: true, tier });
  } catch (error) {
    console.error('API TIER POST ERROR:', error);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}
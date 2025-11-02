import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidateTag } from "next/cache";
import { PRICING_TAG } from "@/lib/pricing-const";

export const runtime = 'nodejs';

export async function PUT(req: Request, context: { params: Promise<any> }) {
  const { id } = await context.params;
  const { tiers = [], setup = null } = await req.json(); // tiers: [{qty, unit, vat?}]
  const rowId = Number(id);
  
  console.log('📥 Received tiers update request:', {
    rowId,
    tiersCount: tiers.length,
    tiers,
    setup
  });
  
  // Обрабатываем vat: null = auto-calculate, 0 = no VAT (явно), >0 = custom VAT
  // Важно: vat может быть 0 (число), что означает "без VAT"
  const processedTiers = tiers.map((t: any) => {
    let vatValue: number | null = null;
    
    if (t.vat !== undefined && t.vat !== null) {
      // Если значение передано (включая 0), используем его
      vatValue = Number(t.vat);
      // Если результат NaN, используем null (auto)
      if (isNaN(vatValue)) {
        vatValue = null;
      }
    } else {
      // Если не передано, используем null (auto-calculate)
      vatValue = null;
    }
    
    return {
      rowId,
      qty: Number(t.qty) || 0,
      unit: Number(t.unit) || 0,
      vat: vatValue
    };
  });
  
  console.log('📥 Processed tiers for DB:', processedTiers);
  
  await prisma.$transaction([
    prisma.tier.deleteMany({ where: { rowId } }),
    prisma.priceRow.update({ where: { id: rowId }, data: { setup } }),
    prisma.tier.createMany({
      data: processedTiers
    })
  ]);
  
  console.log('✅ Tiers saved successfully');
  
  revalidateTag(PRICING_TAG);
  return NextResponse.json({ ok: true });
}

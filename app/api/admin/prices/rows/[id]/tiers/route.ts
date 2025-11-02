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
  
  // Временно НЕ сохраняем vat, если колонка еще не создана в БД
  // Это предотвращает ошибку P2022 (column does not exist)
  // После миграции БД можно будет раскомментировать vat
  const processedTiers = tiers.map((t: any) => {
    const tierData: any = {
      rowId,
      qty: Number(t.qty) || 0,
      unit: Number(t.unit) || 0
    };
    
    // Пока НЕ добавляем vat, чтобы избежать ошибки P2022
    // TODO: Раскомментировать после миграции БД (добавления колонки vat)
    // if (t.vat !== undefined && t.vat !== null) {
    //   tierData.vat = Number(t.vat);
    // } else {
    //   tierData.vat = null;
    // }
    
    return tierData;
  });
  
  console.log('📥 Processed tiers for DB (without vat):', processedTiers);
  
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

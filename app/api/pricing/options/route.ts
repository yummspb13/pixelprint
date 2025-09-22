import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug") || "";
  if (!slug) return NextResponse.json({ ok: false, error: "slug required" }, { status: 400 });

  const svc = await prisma.service.findUnique({
    where: { slug },
    include: { 
      rows: { 
        select: { attrs: true }, 
        where: { isActive: true } 
      } 
    }
  });
  
  if (!svc) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });

  // собрать уникальные значения по каждому атрибуту (только для выбора, не цены)
  const map = new Map<string, Set<string>>();
  for (const r of svc.rows) {
    const a = (r.attrs ?? {}) as Record<string, string>;
    Object.entries(a).forEach(([k, v]) => {
      if (!v) return;
      // Исключаем поля с ценами и количеством - они рассчитываются калькулятором
      if (['PRICE', 'NET PRICE', 'VAT', 'Price +VAT', 'Qty'].includes(k)) return;
      if (!map.has(k)) map.set(k, new Set());
      map.get(k)!.add(String(v));
    });
  }
  
  const attributes = Array.from(map.entries())
    .map(([key, set]) => ({ key, values: Array.from(set).sort() }))
    // разумный порядок, если есть знакомые ключи
    .sort((a, b) => {
      const order = ["Size", "Sides", "Paper", "Stock", "GSM", "Colour", "Lamination", "Fold", "Corners"];
      const ia = order.indexOf(a.key);
      const ib = order.indexOf(b.key);
      if (ia === -1 && ib === -1) return a.key.localeCompare(b.key);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });

  return NextResponse.json({ 
    ok: true, 
    service: { slug, name: svc.name, category: svc.category }, 
    attributes 
  });
}

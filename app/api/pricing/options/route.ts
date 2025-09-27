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
  const mainParams = new Set<string>();
  const modifierParams = new Set<string>();
  
  // Сначала находим все строки с главными элементами
  const mainRows = svc.rows.filter(row => {
    const a = typeof row.attrs === 'string' ? JSON.parse(row.attrs) : (row.attrs ?? {}) as Record<string, string>;
    return a._isMain === 'true';
  });
  
  console.log('Main rows found:', mainRows.length);
  
  // Определяем основные параметры из главных строк
  for (const r of mainRows) {
    const a = typeof r.attrs === 'string' ? JSON.parse(r.attrs) : (r.attrs ?? {}) as Record<string, string>;
    Object.entries(a).forEach(([k, v]) => {
      if (!v || k === '_isMain') return;
      if (['PRICE', 'NET PRICE', 'VAT', 'Price +VAT', 'Qty'].includes(k)) return;
      mainParams.add(k);
    });
  }
  
  console.log('Main params identified:', Array.from(mainParams));
  
  // Если нет главных параметров, делаем первый параметр основным
  if (mainParams.size === 0) {
    const allParams = new Set<string>();
    for (const r of svc.rows) {
      const a = typeof r.attrs === 'string' ? JSON.parse(r.attrs) : (r.attrs ?? {}) as Record<string, string>;
      Object.entries(a).forEach(([k, v]) => {
        if (!v || k === '_isMain') return;
        if (['PRICE', 'NET PRICE', 'VAT', 'Price +VAT', 'Qty'].includes(k)) return;
        allParams.add(k);
      });
    }
    
    // Берем первый параметр как основной
    const firstParam = Array.from(allParams)[0];
    if (firstParam) {
      mainParams.add(firstParam);
      console.log('No main params found, using first param as main:', firstParam);
    }
  }
  
  // Теперь обрабатываем все строки для сбора значений
  for (const r of svc.rows) {
    const a = typeof r.attrs === 'string' ? JSON.parse(r.attrs) : (r.attrs ?? {}) as Record<string, string>;
    
    Object.entries(a).forEach(([k, v]) => {
      if (!v || k === '_isMain') return;
      if (['PRICE', 'NET PRICE', 'VAT', 'Price +VAT', 'Qty'].includes(k)) return;
      
      if (!map.has(k)) map.set(k, new Set());
      map.get(k)!.add(String(v));
      
      // Если параметр не основной, то он модификатор
      if (!mainParams.has(k)) {
        modifierParams.add(k);
      }
    });
  }
  
  const attributes = Array.from(map.entries())
    .map(([key, set]) => ({ 
      key, 
      values: Array.from(set).sort(),
      isMain: mainParams.has(key),
      isModifier: modifierParams.has(key)
    }))
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
    attributes,
    mainParams: Array.from(mainParams),
    modifierParams: Array.from(modifierParams)
  });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PRICING_TAG } from "@/lib/pricing-const";

export const runtime = 'nodejs';

export async function GET(_: Request, context: { params: Promise<any> }) {
  try {
    const { slug } = await context.params;
    
    // Находим услугу в базе данных
    const service = await prisma.service.findUnique({
      where: { slug },
      include: {
        rows: {
          where: { isActive: true },
          include: { 
            tiers: true
          }
        }
      }
    });
    
    if (!service) {
      return NextResponse.json({ 
        ok: false, 
        error: "Service not found" 
      }, { status: 404 });
    }
    
    // Собираем уникальные значения для каждого атрибута
    const optionKeys = new Set<string>();
    const options: Record<string, string[]> = {};
    
    for (const row of service.rows) {
      // Правильно парсим JSON строку в объект
      const attrs = typeof row.attrs === 'string' ? JSON.parse(row.attrs) : (row.attrs ?? {}) as Record<string, string>;
      
      for (const [key, value] of Object.entries(attrs)) {
        // Игнорируем служебные поля (начинающиеся с _) и системные поля
        if (key.startsWith('_')) continue;
        if (['PRICE', 'NET PRICE', 'VAT', 'Price +VAT', 'Qty'].includes(key)) continue;
        
        optionKeys.add(key);
        if (!options[key]) {
          options[key] = [];
        }
        if (typeof value === 'string' && !options[key].includes(value)) {
          options[key].push(value);
        }
      }
    }
    
    // Сортируем опции
    for (const key of Object.keys(options)) {
      options[key].sort();
    }
    
    const model = {
      slug: service.slug,
      title: service.name,
      category: service.category,
      optionKeys: Array.from(optionKeys),
      options: options,
      rows: service.rows.map(row => {
        // Очищаем attrs от служебных полей перед отправкой клиенту
        const rawAttrs = typeof row.attrs === 'string' ? JSON.parse(row.attrs) : (row.attrs ?? {});
        const cleanAttrs = Object.fromEntries(
          Object.entries(rawAttrs).filter(([k, v]) => 
            !k.startsWith('_') && // Исключаем все служебные поля
            !['PRICE', 'NET PRICE', 'VAT', 'Price +VAT', 'Qty'].includes(k) &&
            typeof v === 'string' && v.trim() !== ''
          )
        );
        
        return {
          id: row.id,
          attrs: cleanAttrs,
          rule: {
            kind: row.ruleKind,
            tiers: row.tiers.map(tier => ({
              qty: tier.qty,
              unit: tier.unit
            }))
          }
        };
      })
    };
    
    return NextResponse.json({ 
      ok: true, 
      model 
    }, { 
      headers: { "Cache-Tag": PRICING_TAG } 
    });
  } catch (error) {
    console.error("Model API error:", error);
    return NextResponse.json({ 
      ok: false, 
      error: "Failed to load model" 
    }, { status: 500 });
  }
}

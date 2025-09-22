import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PRICING_TAG } from "@/lib/pricing-const";

export const runtime = 'nodejs';

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    
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
      const attrs = row.attrs as Record<string, string>;
      
      for (const [key, value] of Object.entries(attrs)) {
        optionKeys.add(key);
        if (!options[key]) {
          options[key] = [];
        }
        if (!options[key].includes(value)) {
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
      rows: service.rows.map(row => ({
        attrs: row.attrs,
        rule: {
          kind: row.ruleKind,
          tiers: row.tiers.map(tier => ({
            qty: tier.qty,
            unit: tier.unit
          }))
        }
      }))
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

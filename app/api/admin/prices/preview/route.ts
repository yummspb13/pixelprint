import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { attrs, basePrice = 0 } = await req.json();
    
    // Простой расчет цены на основе attrs
    let finalPrice = basePrice;
    const modifiers: any[] = [];
    
    // Пример логики расчета (можно расширить)
    if (attrs.Color === 'Color') {
      const modifier = { option: 'Color', type: 'absolute', value: 100 };
      modifiers.push(modifier);
      finalPrice += modifier.value;
    }
    
    if (attrs.Lamination === 'Matte') {
      const modifier = { option: 'Lamination', type: 'absolute', value: 30 };
      modifiers.push(modifier);
      finalPrice += modifier.value;
    }
    
    if (attrs.Lamination === 'Gloss') {
      const modifier = { option: 'Lamination', type: 'absolute', value: 40 };
      modifiers.push(modifier);
      finalPrice += modifier.value;
    }
    
    return NextResponse.json({
      ok: true,
      finalPrice,
      modifiers,
      basePrice
    });
  } catch (error) {
    console.error('Preview API error:', error);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}

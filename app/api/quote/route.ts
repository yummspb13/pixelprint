import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { slug, qty, selection, extras } = await request.json();
    
    console.log('Quote API received:', { slug, qty, selection, extras });

    if (!slug || !qty || !selection) {
      return NextResponse.json({ 
        ok: false, 
        error: "Missing required fields" 
      }, { status: 400 });
    }

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

        // Находим подходящую строку цен
        let matchingRow = null;
        console.log('Available rows:', service.rows.map(r => ({ id: r.id, attrs: r.attrs, ruleKind: r.ruleKind })));
        
        // Сначала фильтруем по атрибутам (Sides, Color и т.д.)
        const attributeMatches = service.rows.filter(row => {
          const attrs = row.attrs as Record<string, string>;
          console.log('Checking row attributes:', { id: row.id, attrs, selection });
          
          const matches = Object.entries(selection).every(([key, value]) => {
            // Проверяем только поля, которые есть в attrs (из базы данных)
            // Исключаем поля с ценами - они не должны быть в selection
            if (['PRICE', 'NET PRICE', 'VAT', 'Price +VAT', 'Qty'].includes(key)) {
              console.log(`  ${key}: Skipping (price/quantity field)`);
              return true; // Игнорируем поля с ценами и количеством
            }
            if (!(key in attrs)) {
              console.log(`  ${key}: Skipping (not in database)`);
              return true; // Игнорируем поля, которых нет в базе
            }
            const match = attrs[key] === value;
            console.log(`  ${key}: ${value} === ${attrs[key]} ? ${match}`);
            return match;
          });
          
          console.log('Row attribute matches:', matches);
          return matches;
        });
        
        console.log('Attribute matches found:', attributeMatches.length);
        
        // Теперь из найденных строк выбираем ту, которая подходит по количеству
        if (attributeMatches.length > 0) {
          // Сортируем по количеству (ближайшее к запрашиваемому)
          const sortedByQty = attributeMatches.sort((a, b) => {
            const aQty = parseInt((a.attrs as any)?.Qty || '0') || (a.tiers?.length ? Math.min(...a.tiers.map(t => t.qty)) : 999999);
            const bQty = parseInt((b.attrs as any)?.Qty || '0') || (b.tiers?.length ? Math.min(...b.tiers.map(t => t.qty)) : 999999);
            
            // Находим строку с количеством >= запрашиваемого, или самую близкую
            const aDiff = aQty >= qty ? aQty - qty : 999999;
            const bDiff = bQty >= qty ? bQty - qty : 999999;
            
            return aDiff - bDiff;
          });
          
          matchingRow = sortedByQty[0];
          console.log('Selected row by quantity:', { id: matchingRow.id, attrs: matchingRow.attrs });
        }

    if (!matchingRow) {
      return NextResponse.json({ 
        ok: false, 
        error: "No matching price configuration found" 
      }, { status: 404 });
    }


    // Вычисляем базовую цену из тиров или attrs
    const attrs = matchingRow.attrs as Record<string, string>;
    let unitPrice = 0;
    
    if (matchingRow.tiers && matchingRow.tiers.length > 0) {
      // Используем тиры - находим подходящий тир для количества
      const sortedTiers = matchingRow.tiers.sort((a, b) => a.qty - b.qty);
      let selectedTier = sortedTiers[0];
      
      for (const tier of sortedTiers) {
        if (qty >= tier.qty) {
          selectedTier = tier;
        } else {
          break;
        }
      }
      
      unitPrice = selectedTier.unit;
      console.log('Using tier price:', { qty, selectedTier, unitPrice });
    } else {
      // Если нет тиров, это ошибка - все цены должны быть в тирах
      console.error('No tiers found for row:', matchingRow.id);
      return NextResponse.json({ 
        ok: false, 
        error: "No pricing tiers found for this configuration" 
      }, { status: 404 });
    }
    
    // Рассчитываем цену на основе количества
    const basePrice = unitPrice * qty;
    
    console.log('Price calculation:', {
      unitPrice,
      qty,
      basePrice
    });

    // Применяем модификаторы
    let modifierTotal = 0;
    const modifierItems: any[] = [];

    // Rush (срочность) - 20% к базовой цене
    if (selection.Rush && selection.Rush !== 'standard') {
      const rushMultiplier = selection.Rush === 'same-day' ? 0.20 : 0;
      if (rushMultiplier > 0) {
        const rushPrice = basePrice * rushMultiplier;
        modifierTotal += rushPrice;
        modifierItems.push({
          name: `Rush: ${selection.Rush === 'same-day' ? 'Same-day' : 'Express'}`,
          price: rushPrice
        });
      }
    }

    // Ламинация
    if (selection.Lamination && selection.Lamination !== 'None') {
      const laminationPrices: Record<string, number> = {
        'Matte': 0.05,
        'Gloss': 0.08,
        'Soft Touch': 0.12
      };
      const price = laminationPrices[selection.Lamination] || 0;
      modifierTotal += price * qty;
      modifierItems.push({
        name: `Lamination: ${selection.Lamination}`,
        price: price * qty
      });
    }

    // Углы
    if (selection.Corners && selection.Corners === 'Rounded') {
      const price = 0.02;
      modifierTotal += price * qty;
      modifierItems.push({
        name: 'Rounded Corners',
        price: price * qty
      });
    }

    // Срочность
    if (extras?.turnaround) {
      const turnaroundPrices: Record<string, number> = {
        'Express': 0.15,
        'Same-day': 0.25
      };
      const price = turnaroundPrices[extras.turnaround] || 0;
      if (price > 0) {
        modifierTotal += price * qty;
        modifierItems.push({
          name: `Turnaround: ${extras.turnaround}`,
          price: price * qty
        });
      }
    }

    // Доставка
    if (extras?.delivery) {
      const deliveryPrices: Record<string, number> = {
        'Courier': 5.00,
        'Post': 3.50
      };
      const price = deliveryPrices[extras.delivery] || 0;
      if (price > 0) {
        modifierTotal += price;
        modifierItems.push({
          name: `Delivery: ${extras.delivery}`,
          price: price
        });
      }
    }

    const netTotal = basePrice + modifierTotal;
    const vat = netTotal * 0.20;
    const grossTotal = netTotal + vat;
    const finalUnitPrice = grossTotal / qty;

    return NextResponse.json({
      ok: true,
      breakdown: {
        base: { net: basePrice },
        modifiers: { 
          add: modifierTotal,
          items: modifierItems
        },
        net: netTotal,
        vat: vat,
        gross: grossTotal,
        unit: finalUnitPrice
      },
      debug: {
        service: service.name,
        qty,
        selection,
        matchingRow: {
          id: matchingRow.id,
          ruleKind: matchingRow.ruleKind,
          attrs: matchingRow.attrs
        }
      }
    });

  } catch (error) {
    console.error('Quote API error:', error);
    return NextResponse.json({ 
      ok: false, 
      error: "Internal server error" 
    }, { status: 500 });
  }
}
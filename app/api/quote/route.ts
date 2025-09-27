import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { slug, qty, selection, extras } = await request.json();
    
    console.log('🔍 Quote API received:', { slug, qty, selection, extras });

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

        // Новая логика: главный элемент + модификаторы
        let mainRow = null;
        let modifierRows: any[] = [];
        
        console.log('Available rows:', service.rows.map(r => ({ id: r.id, attrs: r.attrs, ruleKind: r.ruleKind })));
        
        // Получаем информацию о том, какие параметры являются основными
        const optionsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3010'}/api/pricing/options?slug=${slug}`);
        const optionsData = await optionsResponse.json();
        const mainParams = optionsData.mainParams || [];
        const modifierParams = optionsData.modifierParams || [];
        
        console.log('Main params from options API:', mainParams);
        console.log('Modifier params from options API:', modifierParams);
        
    // Разделяем строки на главные и модификаторы
    console.log('🔍 Processing rows for main/modifier classification:');
    console.log('🔍 Service rows count:', service.rows.length);
    console.log('🔍 Main params:', mainParams);
    console.log('🔍 Modifier params:', modifierParams);
    
    for (const row of service.rows) {
      const attrs = typeof row.attrs === 'string' ? JSON.parse(row.attrs) : (row.attrs ?? {}) as Record<string, string>;
      
      // Проверяем, содержит ли строка основные параметры
      const hasMainParams = mainParams.some((param: string) => param in attrs);
      const hasModifierParams = modifierParams.some((param: string) => param in attrs);
      
      console.log(`Row ${row.id}:`, { attrs, hasMainParams, hasModifierParams });
      
      if (hasMainParams) {
        // Это главный элемент - проверяем соответствие основным параметрам
        const mainSelection = Object.fromEntries(
          Object.entries(selection).filter(([key, value]) => 
            !['PRICE', 'NET PRICE', 'VAT', 'Price +VAT', 'Qty'].includes(key) && 
            mainParams.includes(key) && 
            key in attrs && 
            attrs[key] === value
          )
        );
        
        console.log(`Row ${row.id} main selection:`, mainSelection);
        
        // Проверяем, что все основные параметры совпадают
        const mainMatches = Object.entries(mainSelection).every(([key, value]) => {
          return attrs[key] === value;
        });
        
        console.log(`Row ${row.id} main matches:`, mainMatches);
        
        if (mainMatches && Object.keys(mainSelection).length > 0) {
          mainRow = row;
          console.log('Found main row:', { id: row.id, attrs: row.attrs });
        }
      } else if (hasModifierParams) {
        // Это модификатор - проверяем соответствие выбранным модификаторам
        const modifierSelection = Object.fromEntries(
          Object.entries(selection).filter(([key, value]) => 
            !['PRICE', 'NET PRICE', 'VAT', 'Price +VAT', 'Qty'].includes(key) && 
            key in attrs && 
            attrs[key] === value
          )
        );
        
        console.log(`Row ${row.id} modifier selection:`, modifierSelection);
        
        // Проверяем, что все параметры модификатора совпадают с выбранными
        const modifierMatches = Object.entries(modifierSelection).every(([key, value]) => {
          return attrs[key] === value;
        });
        
        console.log(`Row ${row.id} modifier matches:`, modifierMatches);
        
        if (modifierMatches && Object.keys(modifierSelection).length > 0) {
          modifierRows.push(row);
          console.log('Found modifier row:', { id: row.id, attrs: row.attrs });
        }
      }
    }
        
        console.log('Main row found:', !!mainRow);
        console.log('Modifier rows found:', modifierRows.length);

    if (!mainRow) {
      console.error('No main row found!');
      console.error('Selection:', selection);
      console.error('Main params:', mainParams);
      console.error('Available rows:', service.rows.map(r => ({ id: r.id, attrs: r.attrs })));
      return NextResponse.json({ 
        ok: false, 
        error: "No matching main price configuration found" 
      }, { status: 404 });
    }


    // Вычисляем базовую цену из главного элемента
    const mainAttrs = mainRow.attrs as Record<string, string>;
    let baseUnitPrice = 0;
    let sortedTiers: any[] = [];
    
    if (mainRow.tiers && mainRow.tiers.length > 0) {
      // Используем тиры - находим подходящий тир для количества
      sortedTiers = mainRow.tiers.sort((a, b) => a.qty - b.qty);
      let selectedTier = sortedTiers[0];
      
      // Если количество меньше минимального тира, используем минимальный тир
      if (qty < sortedTiers[0].qty) {
        selectedTier = sortedTiers[0];
        console.log('Quantity below minimum tier, using minimum tier:', { qty, selectedTier });
      } else {
        // Находим подходящий тир для количества
        for (const tier of sortedTiers) {
          if (qty >= tier.qty) {
            selectedTier = tier;
          } else {
            break;
          }
        }
        console.log('Using main tier price:', { qty, selectedTier });
      }
      
      baseUnitPrice = selectedTier.unit;
    } else {
      // Если нет тиров, это ошибка - все цены должны быть в тирах
      console.error('No tiers found for main row:', mainRow.id);
      return NextResponse.json({ 
        ok: false, 
        error: "No pricing tiers found for main configuration" 
      }, { status: 404 });
    }
    
    // Рассчитываем базовую цену на основе количества
    // Если количество меньше минимального тира, используем цену минимального тира, но считаем по количеству
    const basePrice = qty < sortedTiers[0].qty 
      ? sortedTiers[0].unit * qty  // Используем цену минимального тира, но считаем по количеству
      : baseUnitPrice * qty;  // Платим по выбранному тиру
    
    console.log('Base price calculation:', {
      baseUnitPrice,
      qty,
      basePrice
    });

    // Применяем модификаторы из базы данных
    let modifierTotal = 0;
    const modifierItems: any[] = [];
    
    // Добавляем модификаторы из найденных строк
    for (const modifierRow of modifierRows) {
      if (modifierRow.tiers && modifierRow.tiers.length > 0) {
        const sortedTiers = modifierRow.tiers.sort((a: any, b: any) => a.qty - b.qty);
        let selectedTier = sortedTiers[0];
        
        // Если количество меньше минимального тира, используем минимальный тир
        if (qty < sortedTiers[0].qty) {
          selectedTier = sortedTiers[0];
        } else {
          // Находим подходящий тир для количества
          for (const tier of sortedTiers) {
            if (qty >= tier.qty) {
              selectedTier = tier;
            } else {
              break;
            }
          }
        }
        
        const modifierPrice = selectedTier.unit * qty;
        modifierTotal += modifierPrice;
        
        const modifierAttrs = typeof modifierRow.attrs === 'string' ? JSON.parse(modifierRow.attrs) : (modifierRow.attrs ?? {}) as Record<string, string>;
        const modifierName = Object.entries(modifierAttrs)
          .filter(([key, value]) => key !== '_isMain' && value)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
        
        modifierItems.push({
          name: modifierName,
          price: modifierPrice
        });
        
        console.log('Added modifier:', { name: modifierName, price: modifierPrice });
      }
    }

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
        mainRow: {
          id: mainRow.id,
          ruleKind: mainRow.ruleKind,
          attrs: mainRow.attrs
        },
        modifierRows: modifierRows.map(row => ({
          id: row.id,
          ruleKind: row.ruleKind,
          attrs: row.attrs
        }))
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
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
        // Используем прямой вызов функции вместо fetch для серверной стороны
        let mainParams: string[] = [];
        let modifierParams: string[] = [];
        
        try {
          // Пытаемся получить параметры из API, но не критично если не получится
          let baseUrl = 'http://localhost:3010';
          if (process.env.NEXT_PUBLIC_BASE_URL) {
            baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
          } else if (process.env.VERCEL_URL) {
            baseUrl = `https://${process.env.VERCEL_URL}`;
          }
          const optionsUrl = `${baseUrl}/api/pricing/options?slug=${slug}`;
          const optionsResponse = await fetch(optionsUrl, {
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (optionsResponse.ok) {
            const optionsData = await optionsResponse.json();
            mainParams = optionsData.mainParams || [];
            modifierParams = optionsData.modifierParams || [];
          } else {
            // Если API недоступен, определяем параметры напрямую из данных
            console.warn('Options API unavailable, determining params from service data');
            const mainRows = service.rows.filter(row => {
              const a = typeof row.attrs === 'string' ? JSON.parse(row.attrs) : (row.attrs ?? {}) as Record<string, string>;
              return a._isMain === 'true';
            });
            
            for (const r of mainRows) {
              const a = typeof r.attrs === 'string' ? JSON.parse(r.attrs) : (r.attrs ?? {}) as Record<string, string>;
              Object.entries(a).forEach(([k, v]) => {
                if (!v || k === '_isMain') return;
                if (['PRICE', 'NET PRICE', 'VAT', 'Price +VAT', 'Qty'].includes(k)) return;
                if (!mainParams.includes(k)) mainParams.push(k);
              });
            }
            
            // Остальные параметры - модификаторы
            service.rows.forEach(row => {
              const a = typeof row.attrs === 'string' ? JSON.parse(row.attrs) : (row.attrs ?? {}) as Record<string, string>;
              Object.keys(a).forEach(k => {
                if (!mainParams.includes(k) && !['PRICE', 'NET PRICE', 'VAT', 'Price +VAT', 'Qty', '_isMain'].includes(k)) {
                  if (!modifierParams.includes(k)) modifierParams.push(k);
                }
              });
            });
          }
        } catch (error) {
          console.warn('Error fetching options, using fallback logic:', error);
          // Fallback логика уже реализована выше
        }
        
        console.log('Main params from options API:', mainParams);
        console.log('Modifier params from options API:', modifierParams);
        
    // Разделяем строки на главные и модификаторы
    console.log('🔍 Processing rows for main/modifier classification:');
    console.log('🔍 Service rows count:', service.rows.length);
    console.log('🔍 Main params:', mainParams);
    console.log('🔍 Modifier params:', modifierParams);
    
    // Сначала ищем точное совпадение всех параметров из selection
    // (для случая, когда выбрана полная комбинация через бейдж)
    const selectionKeys = Object.keys(selection).filter(k => 
      !['PRICE', 'NET PRICE', 'VAT', 'Price +VAT', 'Qty', 'turnaround', 'delivery', 'notes', 'Rush', 'Lamination', 'Corners'].includes(k)
    );
    
    console.log('=====================================');
    console.log('🔍 SEARCHING FOR MAIN ROW');
    console.log('🔍 Selection keys:', selectionKeys);
    console.log('🔍 Selection:', Object.fromEntries(selectionKeys.map(k => [k, selection[k]])));
    console.log('🔍 Main params:', mainParams);
    console.log('🔍 Total rows to check:', service.rows.length);
    
    for (const row of service.rows) {
      const attrs = typeof row.attrs === 'string' ? JSON.parse(row.attrs) : (row.attrs ?? {}) as Record<string, string>;
      
      // Игнорируем системные поля и служебные поля
      const rowAttrs = Object.fromEntries(
        Object.entries(attrs).filter(([k, v]) => 
          !['_isMain'].includes(k) && 
          !['PRICE', 'NET PRICE', 'VAT', 'Price +VAT', 'Qty'].includes(k) &&
          typeof v === 'string' && v.trim() !== ''
        )
      );
      
      // ПРОВЕРКА: Точное совпадение всех параметров из selection с параметрами строки
      // Все параметры из selection должны быть в attrs с теми же значениями
      // И все параметры из attrs (основные) должны быть в selection с теми же значениями
      let exactMatch = true;
      const mismatches: string[] = [];
      
      // 1. Проверяем, что все параметры из selection есть в attrs и совпадают
      for (const key of selectionKeys) {
        if (!(key in rowAttrs)) {
          exactMatch = false;
          mismatches.push(`missing key: ${key}`);
          break;
        }
        if (rowAttrs[key] !== selection[key]) {
          exactMatch = false;
          mismatches.push(`${key}: selection="${selection[key]}" != row="${rowAttrs[key]}"`);
          break;
        }
      }
      
      // 2. Проверяем, что все основные параметры из attrs есть в selection
      // (чтобы не взять строку с дополнительными параметрами)
      if (exactMatch && mainParams.length > 0) {
        const rowMainParams = Object.keys(rowAttrs).filter(k => mainParams.includes(k));
        for (const key of rowMainParams) {
          if (!(key in selection)) {
            exactMatch = false;
            mismatches.push(`row has extra main param: ${key}`);
            break;
          }
          if (selection[key] !== rowAttrs[key]) {
            exactMatch = false;
            mismatches.push(`${key}: selection="${selection[key]}" != row="${rowAttrs[key]}"`);
            break;
          }
        }
      }
      
      if (exactMatch && selectionKeys.length > 0) {
        // Нашли точное совпадение - это главная строка
        mainRow = row;
        console.log('✅✅✅ EXACT MATCH FOUND - Row', row.id);
        console.log('   Row attrs:', rowAttrs);
        console.log('   Selection:', Object.fromEntries(selectionKeys.map(k => [k, selection[k]])));
        console.log('   Tiers count:', row.tiers?.length || 0);
        break; // Нашли точное совпадение - прекращаем поиск
      } else if (selectionKeys.length > 0 && mismatches.length > 0) {
        // Логируем почему не совпало (только первые 3 для экономии логов)
        if (service.rows.indexOf(row) < 5) {
          console.log(`❌ Row ${row.id} - no match:`, mismatches.slice(0, 3).join(', '));
          console.log(`   Row attrs:`, rowAttrs);
        }
      }
    }
    
    if (!mainRow) {
      console.log('❌ NO EXACT MATCH FOUND after checking all rows');
    }
    
    // После поиска точного совпадения, ищем модификаторы отдельно
    // Модификаторы - это строки, которые НЕ являются основными (не содержат все основные параметры),
    // но содержат ТОЛЬКО модификаторные параметры из selection
    if (mainRow) {
      console.log('🔍 Searching for modifiers...');
      
      for (const row of service.rows) {
        if (row.id === mainRow.id) continue; // Пропускаем основную строку
        
        const attrs = typeof row.attrs === 'string' ? JSON.parse(row.attrs) : (row.attrs ?? {}) as Record<string, string>;
        
        // Игнорируем системные поля
        const rowAttrs = Object.fromEntries(
          Object.entries(attrs).filter(([k, v]) => 
            !['_isMain'].includes(k) && 
            !['PRICE', 'NET PRICE', 'VAT', 'Price +VAT', 'Qty'].includes(k) &&
            typeof v === 'string' && v.trim() !== ''
          )
        );
        
        // Модификатор должен содержать ТОЛЬКО модификаторные параметры (не основные)
        const rowMainParams = Object.keys(rowAttrs).filter(k => mainParams.includes(k));
        
        // Если строка содержит основные параметры - это не модификатор, пропускаем
        if (rowMainParams.length > 0) {
          continue;
        }
        
        // Проверяем, что все параметры из модификаторной строки совпадают с selection
        // И что все параметры из selection, которые есть в строке, совпадают
        let isModifier = true;
        const modifierKeys = Object.keys(rowAttrs);
        
        // Проверяем, что все параметры строки есть в selection и совпадают
        for (const key of modifierKeys) {
          if (!(key in selection)) {
            isModifier = false;
            break;
          }
          if (selection[key] !== rowAttrs[key]) {
            isModifier = false;
            break;
          }
        }
        
        if (isModifier && modifierKeys.length > 0) {
          // Это валидный модификатор
          modifierRows.push(row);
          console.log('✅ Found modifier row:', { id: row.id, attrs: rowAttrs });
        }
      }
      
      console.log(`🔍 Total modifier rows found: ${modifierRows.length}`);
    }
        
        console.log('Main row found:', !!mainRow);
        console.log('Modifier rows found:', modifierRows.length);

    if (!mainRow) {
      console.error('❌ No main row found!');
      console.error('Selection:', selection);
      console.error('Selection keys:', selectionKeys);
      console.error('Main params:', mainParams);
      console.error('Available rows:', service.rows.map(r => {
        const attrs = typeof r.attrs === 'string' ? JSON.parse(r.attrs) : (r.attrs ?? {});
        const cleanAttrs = Object.fromEntries(
          Object.entries(attrs).filter(([k]) => !['_isMain'].includes(k))
        );
        return { id: r.id, attrs: cleanAttrs };
      }));
      
      // Формируем понятное сообщение об ошибке
      const selectedParams = selectionKeys.map(k => `${k}: ${selection[k]}`).join(', ');
      return NextResponse.json({ 
        ok: false, 
        error: `The selected combination (${selectedParams}) is not available. Please choose a preset from Quick Select or select a valid combination manually.`
      }, { status: 404 });
    }


    // Вычисляем базовую цену из главного элемента
    const mainAttrs = typeof mainRow.attrs === 'string' ? JSON.parse(mainRow.attrs) : (mainRow.attrs ?? {}) as Record<string, string>;
    
    console.log('💰 CALCULATING PRICE FOR MAIN ROW:');
    console.log('   Row ID:', mainRow.id);
    console.log('   Row attrs:', mainAttrs);
    console.log('   Selection:', selection);
    console.log('   Quantity:', qty);
    console.log('   Tiers count:', mainRow.tiers?.length || 0);
    
    let baseUnitPrice = 0;
    let sortedTiers: any[] = [];
    
    if (mainRow.tiers && mainRow.tiers.length > 0) {
      // Используем тиры - находим подходящий тир для количества
      sortedTiers = mainRow.tiers.sort((a, b) => a.qty - b.qty);
      console.log('   All tiers:', sortedTiers.map(t => ({ qty: t.qty, unit: t.unit })));
      
      let selectedTier = sortedTiers[0];
      
      // Если количество меньше минимального тира, используем минимальный тир
      if (qty < sortedTiers[0].qty) {
        selectedTier = sortedTiers[0];
        console.log('⚠️ Quantity below minimum tier, using minimum tier:', { qty, selectedTier: { qty: selectedTier.qty, unit: selectedTier.unit } });
      } else {
        // Находим подходящий тир для количества
        for (const tier of sortedTiers) {
          if (qty >= tier.qty) {
            selectedTier = tier;
          } else {
            break;
          }
        }
        console.log('✅ Using tier for qty:', { qty, selectedTier: { qty: selectedTier.qty, unit: selectedTier.unit } });
      }
      
      baseUnitPrice = selectedTier.unit;
      console.log('   Selected baseUnitPrice:', baseUnitPrice);
    } else {
      // Если нет тиров, это ошибка - все цены должны быть в тирах
      console.error('❌ No tiers found for main row:', mainRow.id);
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
    
    console.log('💰 BASE PRICE CALCULATION:');
    console.log('   baseUnitPrice:', baseUnitPrice);
    console.log('   qty:', qty);
    console.log('   basePrice:', basePrice);

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

    // Проверяем, нужно ли включать VAT для основной строки
    const mainRowAttrs = typeof mainRow.attrs === 'string' ? JSON.parse(mainRow.attrs) : (mainRow.attrs ?? {}) as Record<string, string>;
    const includeVat = mainRowAttrs._includeVat !== 'false'; // По умолчанию true (если поле не задано или равно 'true')
    
    const netTotal = basePrice + modifierTotal;
    const vat = includeVat ? netTotal * 0.20 : 0;
    const grossTotal = netTotal + vat;
    const finalUnitPrice = grossTotal / qty;

    console.log('💰 FINAL CALCULATION:');
    console.log('   includeVat:', includeVat);
    console.log('   basePrice:', basePrice);
    console.log('   modifierTotal:', modifierTotal);
    console.log('   netTotal:', netTotal);
    console.log('   vat:', vat, includeVat ? '(20%)' : '(excluded)');
    console.log('   grossTotal:', grossTotal);
    console.log('   finalUnitPrice:', finalUnitPrice);
    console.log('=====================================');

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
          attrs: typeof mainRow.attrs === 'string' ? JSON.parse(mainRow.attrs) : mainRow.attrs,
          tiers: mainRow.tiers?.map(t => ({ qty: t.qty, unit: t.unit })) || []
        },
        modifierRows: modifierRows.map(row => ({
          id: row.id,
          ruleKind: row.ruleKind,
          attrs: typeof row.attrs === 'string' ? JSON.parse(row.attrs) : row.attrs
        })),
        calculation: {
          baseUnitPrice,
          basePrice,
          modifierTotal,
          netTotal,
          vat,
          grossTotal,
          finalUnitPrice
        },
        selectedTier: mainRow.tiers?.length > 0 ? {
          qty: sortedTiers[0]?.qty,
          unit: baseUnitPrice
        } : null
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
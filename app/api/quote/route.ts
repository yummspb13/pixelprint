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
        console.log('📊 All service rows with tiers:', service.rows.map(row => {
          const attrs = typeof row.attrs === 'string' ? JSON.parse(row.attrs) : (row.attrs ?? {});
          return {
            id: row.id,
            attrs,
            tiers: row.tiers.map(t => ({ qty: t.qty, unit: t.unit, total: t.qty * t.unit }))
          };
        }));
        
    // Разделяем строки на главные и модификаторы
        console.log('🔍 Processing rows for main/modifier classification:');
        console.log('🔍 Service rows count:', service.rows.length);
        console.log('🔍 Main params:', mainParams);
        console.log('🔍 Modifier params:', modifierParams);
        console.log('🔍 User selection:', selection);
    
    // Сначала пытаемся найти mainRow среди строк с _isMain='true'
    // Если не найдем, ищем среди всех строк по лучшему совпадению
    let bestMatchScore = 0;
    let bestMatchRow: any = null;
    
    for (const row of service.rows) {
      const attrs = typeof row.attrs === 'string' ? JSON.parse(row.attrs) : (row.attrs ?? {}) as Record<string, string>;
      
      // Проверяем, содержит ли строка основные параметры
      const hasMainParams = mainParams.some((param: string) => param in attrs);
      const hasModifierParams = modifierParams.some((param: string) => param in attrs);
      
      console.log(`Row ${row.id}:`, { attrs, hasMainParams, hasModifierParams, _isMain: attrs._isMain });
      
      if (hasMainParams || attrs._isMain === 'true') {
        // Это главный элемент - проверяем соответствие всем выбранным параметрам
        // Считаем количество совпадающих параметров
        let matchCount = 0;
        let allMainParamsMatch = true;
        
        // Проверяем совпадение основных параметров
        for (const [key, value] of Object.entries(selection)) {
          if (['PRICE', 'NET PRICE', 'VAT', 'Price +VAT', 'Qty'].includes(key)) continue;
          
          if (key in attrs) {
            if (attrs[key] === value) {
              matchCount++;
              if (mainParams.includes(key)) {
                // Основной параметр совпал
              } else {
                // Модификатор совпал
              }
            } else {
              // Параметр не совпадает
              if (mainParams.includes(key)) {
                allMainParamsMatch = false;
              }
            }
          }
        }
        
        // Если это строка с _isMain='true', приоритет выше
        const isMainRow = attrs._isMain === 'true';
        const score = (isMainRow ? 1000 : 0) + matchCount * 10 + (allMainParamsMatch ? 100 : 0);
        
        console.log(`Row ${row.id} match score:`, { matchCount, allMainParamsMatch, isMainRow, score, attrs });
        
        if (score > bestMatchScore) {
          bestMatchScore = score;
          bestMatchRow = row;
        }
        
        // Проверяем точное совпадение ВСЕХ параметров (не только основных)
        const allSelectionKeys = Object.keys(selection).filter(k => !['PRICE', 'NET PRICE', 'VAT', 'Price +VAT', 'Qty'].includes(k));
        const allAttrsMatch = allSelectionKeys.every(key => {
          const selectionValue = selection[key];
          const attrsValue = attrs[key];
          return selectionValue && attrsValue && attrsValue === selectionValue;
        });
        
        // Если точное совпадение всех параметров - это лучший выбор
        if (allAttrsMatch && matchCount === allSelectionKeys.length) {
          mainRow = row;
          console.log('✅ Found main row (perfect match):', { 
            id: row.id, 
            attrs: row.attrs,
            selection: Object.fromEntries(allSelectionKeys.map(k => [k, selection[k]])),
            tiers: row.tiers.map((t: any) => ({ qty: t.qty, unit: t.unit, total: t.qty * t.unit }))
          });
          bestMatchRow = row; // Это лучший выбор
          break; // Прерываем, если нашли точное совпадение
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
        
        // Если mainRow не найден через _isMain, используем лучшее совпадение
        if (!mainRow && bestMatchRow) {
          mainRow = bestMatchRow;
          console.log('✅ Found main row (best match):', { 
            id: mainRow.id, 
            score: bestMatchScore,
            attrs: mainRow.attrs,
            tiers: mainRow.tiers.map((t: any) => ({ qty: t.qty, unit: t.unit, total: t.qty * t.unit }))
          });
        }
        
        console.log('Main row found:', !!mainRow, mainRow ? { id: mainRow.id, attrs: mainRow.attrs } : null);
        console.log('Modifier rows found:', modifierRows.length);

    if (!mainRow) {
      console.error('❌ No main row found!');
      console.error('Selection:', selection);
      console.error('Main params:', mainParams);
      console.error('Available rows:', service.rows.map(r => {
        const attrs = typeof r.attrs === 'string' ? JSON.parse(r.attrs) : (r.attrs ?? {});
        return { id: r.id, attrs, _isMain: attrs._isMain };
      }));
      return NextResponse.json({ 
        ok: false, 
        error: "No matching main price configuration found" 
      }, { status: 404 });
    }


    // Вычисляем базовую цену из главного элемента
    const mainAttrs = mainRow.attrs as Record<string, string>;
    let baseUnitPrice = 0;
    let sortedTiers: any[] = [];
    let selectedTier: any = null;
    
    if (mainRow.tiers && mainRow.tiers.length > 0) {
      // Используем тиры - находим подходящий тир для количества
      sortedTiers = mainRow.tiers.sort((a, b) => a.qty - b.qty);
      selectedTier = sortedTiers[0];
      
      // Ищем точное совпадение по количеству сначала
      const exactTier = sortedTiers.find(t => t.qty === qty);
      
      if (exactTier) {
        // Используем тир с точным совпадением количества
        selectedTier = exactTier;
        console.log('✅ Using exact tier match:', { qty, selectedTier: { qty: selectedTier.qty, unit: selectedTier.unit } });
      } else if (qty < sortedTiers[0].qty) {
        // Если количество меньше минимального тира, используем минимальный тир
        selectedTier = sortedTiers[0];
        console.log('⚠️ Quantity below minimum tier, using minimum tier:', { qty, selectedTier });
      } else {
        // Находим подходящий тир для количества
        // Выбираем максимальный тир, для которого qty >= tier.qty
        let bestTier = sortedTiers[0];
        for (const tier of sortedTiers) {
          if (qty >= tier.qty) {
            bestTier = tier;
          } else {
            break;
          }
        }
        selectedTier = bestTier;
        console.log('📊 Using tier for quantity:', { 
          qty, 
          selectedTier: { qty: selectedTier.qty, unit: selectedTier.unit },
          allAvailableTiers: sortedTiers.map(t => ({ qty: t.qty, unit: t.unit, total: t.qty * t.unit }))
        });
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
    
    console.log('💰 Price calculation details:', {
      qty,
      selectedMainRow: {
        id: mainRow.id,
        attrs: mainRow.attrs,
        allTiers: mainRow.tiers.map(t => ({ qty: t.qty, unit: t.unit, total: t.qty * t.unit }))
      },
      sortedTiers: sortedTiers.map(t => ({ qty: t.qty, unit: t.unit, total: t.qty * t.unit })),
      selectedTier: selectedTier ? { qty: selectedTier.qty, unit: selectedTier.unit } : null,
      baseUnitPrice,
      basePrice,
      calculatedTotal: baseUnitPrice * qty
    });
    
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
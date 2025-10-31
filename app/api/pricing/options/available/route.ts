import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = 'nodejs';

/**
 * Получает доступные опции для параметра на основе уже выбранных параметров
 * 
 * Query params:
 * - slug: slug сервиса
 * - paramKey: ключ параметра, для которого нужны доступные опции
 * - selectedParams: JSON строка с уже выбранными параметрами, например: {"Sides":"Single Sided (S/S)"}
 */
export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get("slug") || "";
    const paramKey = req.nextUrl.searchParams.get("paramKey") || "";
    const selectedParamsStr = req.nextUrl.searchParams.get("selectedParams") || "{}";
    
    if (!slug || !paramKey) {
      return NextResponse.json({ 
        ok: false, 
        error: "slug and paramKey required" 
      }, { status: 400 });
    }

    let selectedParams: Record<string, string> = {};
    try {
      selectedParams = JSON.parse(selectedParamsStr);
    } catch (e) {
      // Если не JSON, игнорируем
    }

    const service = await prisma.service.findUnique({
      where: { slug },
      include: { 
        rows: { 
          where: { isActive: true },
          select: { attrs: true }
        } 
      }
    });

    if (!service) {
      return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
    }

    // Находим все строки, которые соответствуют уже выбранным параметрам
    const matchingRows = service.rows.filter(row => {
      const rowAttrs = typeof row.attrs === 'string' 
        ? JSON.parse(row.attrs) 
        : (row.attrs ?? {}) as Record<string, string>;
      
      const rowAttrsForMatch = { ...rowAttrs };
      delete rowAttrsForMatch._isMain;
      
      // Проверяем, что все выбранные параметры есть в этой строке с теми же значениями
      for (const [key, value] of Object.entries(selectedParams)) {
        if (!(key in rowAttrsForMatch) || rowAttrsForMatch[key] !== value) {
          return false;
        }
      }
      
      return true;
    });

    // Из всех подходящих строк извлекаем уникальные значения для запрашиваемого параметра
    const availableValues = new Set<string>();
    
    for (const row of matchingRows) {
      const rowAttrs = typeof row.attrs === 'string' 
        ? JSON.parse(row.attrs) 
        : (row.attrs ?? {}) as Record<string, string>;
      
      if (paramKey in rowAttrs && rowAttrs[paramKey]) {
        availableValues.add(String(rowAttrs[paramKey]));
      }
    }

    return NextResponse.json({ 
      ok: true, 
      values: Array.from(availableValues).sort(),
      matchingRowsCount: matchingRows.length
    });
    
  } catch (error: any) {
    console.error('Error in available options API:', error);
    return NextResponse.json({ 
      ok: false, 
      error: error.message || "Internal server error" 
    }, { status: 500 });
  }
}


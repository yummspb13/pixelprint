import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get("slug") || "";

    if (!slug) {
      return NextResponse.json(
        { ok: false, error: "slug required" },
        { status: 400 }
      );
    }

    // Находим сервис со всеми активными строками (комбинациями параметров)
    const service = await prisma.service.findUnique({
      where: { slug },
      include: {
        rows: {
          where: { isActive: true },
          select: { 
            id: true,
            attrs: true,
            ruleKind: true
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json(
        { ok: false, error: "Service not found" },
        { status: 404 }
      );
    }

    // Main параметр - это первый параметр в каждой строке с несколькими параметрами
    // (потому что мы сохраняем Main параметр первым в attrs)
    const mainParams = new Set<string>();
    
    service.rows.forEach(r => {
      const a = typeof r.attrs === 'string' ? JSON.parse(r.attrs) : (r.attrs ?? {});
      const cleanKeys = Object.keys(a).filter(k => 
        !k.startsWith('_') &&
        !['PRICE', 'NET PRICE', 'VAT', 'Price +VAT', 'Qty'].includes(k) &&
        a[k]
      );
      
      // Если в строке несколько параметров - первый и есть Main
      if (cleanKeys.length > 1) {
        mainParams.add(cleanKeys[0]);
      }
    });
    
    // Формируем пресеты из строк с основными параметрами
    const presets: Array<{
      id: number;
      label: string;
      selection: Record<string, string>;
    }> = [];

    service.rows.forEach((row) => {
      const attrs =
        typeof row.attrs === "string"
          ? JSON.parse(row.attrs)
          : (row.attrs ?? {});
      
      // Игнорируем системные поля и служебные поля (начинающиеся с _)
      const cleanAttrs = Object.fromEntries(
        Object.entries(attrs).filter(
          ([k, v]) =>
            !k.startsWith('_') && // Исключаем все служебные поля (начинающиеся с _)
            !["PRICE", "NET PRICE", "VAT", "Price +VAT", "Qty"].includes(k) &&
            typeof v === 'string' && v.trim() !== ''
        )
      ) as Record<string, string>;

      // Определяем, является ли строка основной (не модификатором)
      // Основная строка: имеет _isMain === 'true' ИЛИ содержит несколько параметров (комбинация)
      // Модификатор: обычно содержит только один параметр (add-on)
      const isMainRow = 
        attrs._isMain === 'true' || 
        attrs._isMain === true ||
        Object.keys(cleanAttrs).length > 1; // Комбинация из нескольких параметров = основная строка
      
      // Если это строка с основными параметрами, создаем пресет
      if (Object.keys(cleanAttrs).length > 0 && isMainRow) {
        // Простое решение: первый параметр в строке = Main, остальные = доп опции
        // Сортируем: Main параметр (первый ключ) первым, остальные после
        const keys = Object.keys(cleanAttrs);
        const mainKey = keys[0]; // Первый параметр = Main
        const otherKeys = keys.slice(1);
        
        // Формируем label: Main первым, затем остальные
        const labelParts = [
          `${mainKey}: ${cleanAttrs[mainKey]}`,
          ...otherKeys.map(key => `${key}: ${cleanAttrs[key]}`)
        ];
        
        presets.push({
          id: row.id,
          label: labelParts.join(" - "),
          selection: cleanAttrs,
        });
      }
    });

    return NextResponse.json({
      ok: true,
      presets: presets.sort((a, b) => a.label.localeCompare(b.label)),
    });
  } catch (error: any) {
    console.error("Error fetching presets:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}


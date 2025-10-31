import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get("slug") || "";
    const paramKey = req.nextUrl.searchParams.get("paramKey") || "";
    const selectedParamsJson = req.nextUrl.searchParams.get("selectedParams") || "{}";

    if (!slug || !paramKey) {
      return NextResponse.json(
        { ok: false, error: "slug and paramKey required" },
        { status: 400 }
      );
    }

    const selectedParams: Record<string, string> = JSON.parse(selectedParamsJson);

    // Находим сервис со всеми активными строками
    const service = await prisma.service.findUnique({
      where: { slug },
      include: {
        rows: {
          where: { isActive: true },
          select: { attrs: true },
        },
      },
    });

    if (!service) {
      return NextResponse.json(
        { ok: false, error: "Service not found" },
        { status: 404 }
      );
    }

    // Собираем уникальные значения для paramKey из строк, которые соответствуют selectedParams
    const availableValues = new Set<string>();

    service.rows.forEach((row) => {
      const attrs =
        typeof row.attrs === "string"
          ? JSON.parse(row.attrs)
          : (row.attrs ?? {});
      
      // Проверяем, соответствует ли строка выбранным параметрам (исключая paramKey)
      let matches = true;
      for (const [key, value] of Object.entries(selectedParams)) {
        if (attrs[key] !== value) {
          matches = false;
          break;
        }
      }

      // Если строка соответствует, и у неё есть значение для paramKey - добавляем в доступные
      if (matches && attrs[paramKey]) {
        availableValues.add(String(attrs[paramKey]));
      }
    });

    return NextResponse.json({
      ok: true,
      values: Array.from(availableValues).sort(),
    });
  } catch (error: any) {
    console.error("Error fetching available options:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}


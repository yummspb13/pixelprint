import { NextResponse } from "next/server";
import { loadPricing, listServices } from "@/lib/pricing-loader";
import { PRICING_TAG } from "@/lib/pricing-const";
import { prisma } from "@/lib/db";

export const runtime = 'nodejs';

export async function GET() {
  try {
    // Получаем данные только из базы данных
    const dbServices = await prisma.service.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        image: true,
        category: true,
        order: true,
        isActive: true,
        configuratorEnabled: true,
        calculatorAvailable: true,
        clickCount: true
      },
      orderBy: [
        { category: 'asc' },
        { order: 'asc' },
        { clickCount: 'desc' }
      ]
    });

    // Преобразуем в формат, ожидаемый конфигуратором
    const services = dbServices.map(service => ({
      id: service.id,
      name: service.name,
      slug: service.slug,
      category: service.category,
      isActive: service.isActive,
      configuratorEnabled: service.configuratorEnabled,
      calculatorAvailable: service.calculatorAvailable,
      description: service.description,
      image: service.image,
      order: service.order,
      clickCount: service.clickCount
    }));

    return NextResponse.json({ 
      ok: true, 
      services: services 
    }, { 
      headers: { "Cache-Tag": PRICING_TAG } 
    });
  } catch (error) {
    console.error("Services API error:", error);
    return NextResponse.json({ 
      ok: false, 
      error: "Failed to load services" 
    }, { status: 500 });
  }
}

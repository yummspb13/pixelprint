import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidateTag } from "next/cache";
import { PRICING_TAG } from "@/lib/pricing-const";

export const runtime = 'nodejs';

// Получить строку по ID
export async function GET(_: Request, context: { params: Promise<any> }) {
  try {
    const { slug, rowId } = await context.params;
    
    const service = await prisma.service.findUnique({
      where: { slug },
      include: { rows: { where: { id: Number(rowId) }, include: { tiers: true } } }
    });
    
    if (!service || service.rows.length === 0) {
      return NextResponse.json({ ok: false, error: "Row not found" }, { status: 404 });
    }
    
    return NextResponse.json({ ok: true, row: service.rows[0] });
  } catch (error) {
    console.error('API ROW GET ERROR:', error);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}

// Обновить строку по ID
export async function PUT(req: Request, context: { params: Promise<any> }) {
  try {
    const { slug, rowId } = await context.params;
    const { attrs, ruleKind, unit, setup, fixed, tiers = [] } = await req.json();
    
    // Проверяем, что строка принадлежит указанному сервису
    const service = await prisma.service.findUnique({
      where: { slug },
      include: { rows: { where: { id: Number(rowId) } } }
    });
    
    if (!service || service.rows.length === 0) {
      return NextResponse.json({ ok: false, error: "Row not found" }, { status: 404 });
    }
    
    // Обновляем строку и тиры в транзакции
    await prisma.$transaction(async (tx) => {
      // Обновляем строку
      await tx.priceRow.update({
        where: { id: Number(rowId) },
        data: { attrs, ruleKind, unit, setup, fixed }
      });
      
      // Удаляем старые тиры
      await tx.tier.deleteMany({
        where: { rowId: Number(rowId) }
      });
      
      // Создаем новые тиры
      if (tiers.length > 0) {
        await tx.tier.createMany({
          data: tiers.map((tier: any) => ({
            rowId: Number(rowId),
            qty: Number(tier.qty),
            unit: Number(tier.unit)
          }))
        });
      }
    });
    
    revalidateTag(PRICING_TAG);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('API ROW PUT ERROR:', error);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}

// Удалить строку по ID
export async function DELETE(_: Request, context: { params: Promise<any> }) {
  try {
    const { slug, rowId } = await context.params;
    
    // Проверяем, что строка принадлежит указанному сервису
    const service = await prisma.service.findUnique({
      where: { slug },
      include: { rows: { where: { id: Number(rowId) } } }
    });
    
    if (!service || service.rows.length === 0) {
      return NextResponse.json({ ok: false, error: "Row not found" }, { status: 404 });
    }
    
    // Удаляем строку (тиры удалятся автоматически из-за CASCADE)
    await prisma.priceRow.delete({
      where: { id: Number(rowId) }
    });
    
    revalidateTag(PRICING_TAG);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('API ROW DELETE ERROR:', error);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}

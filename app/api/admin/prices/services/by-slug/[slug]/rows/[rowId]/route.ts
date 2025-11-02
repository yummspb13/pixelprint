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
    const body = await req.json();
    const { attrs, ruleKind, unit, setup, fixed, tiers = [], isActive } = body;
    
    console.log('🔍 API ROW PUT: Updating row', rowId);
    console.log('🔍 Received data:', { 
      attrs: typeof attrs === 'object' ? JSON.stringify(attrs).substring(0, 200) : attrs,
      ruleKind,
      tiersCount: tiers.length,
      isActive 
    });
    
    // Проверяем, что строка принадлежит указанному сервису
    const service = await prisma.service.findUnique({
      where: { slug },
      include: { rows: { where: { id: Number(rowId) } } }
    });
    
    if (!service || service.rows.length === 0) {
      console.error('❌ Row not found:', rowId);
      return NextResponse.json({ ok: false, error: "Row not found" }, { status: 404 });
    }
    
    // Обновляем строку и тиры в транзакции
    await prisma.$transaction(async (tx) => {
      // Обновляем строку - убеждаемся, что attrs это валидный JSON объект
      const updateData: any = { 
        attrs: typeof attrs === 'string' ? JSON.parse(attrs) : attrs, 
        ruleKind, 
        unit: unit !== null && unit !== undefined ? Number(unit) : null, 
        setup: setup !== null && setup !== undefined ? Number(setup) : null, 
        fixed: fixed !== null && fixed !== undefined ? Number(fixed) : null 
      };
      
      // Поддерживаем isActive если передан
      if (isActive !== undefined) {
        updateData.isActive = Boolean(isActive);
      }
      
      console.log('🔍 Updating row with data:', {
        attrs: typeof updateData.attrs === 'object' ? JSON.stringify(updateData.attrs).substring(0, 200) : updateData.attrs,
        ruleKind: updateData.ruleKind,
        isActive: updateData.isActive
      });
      
      await tx.priceRow.update({
        where: { id: Number(rowId) },
        data: updateData
      });
      
      // Удаляем старые тиры
      await tx.tier.deleteMany({
        where: { rowId: Number(rowId) }
      });
      
      // Создаем новые тиры
      if (tiers.length > 0) {
        const tiersData = tiers.map((tier: any) => ({
          rowId: Number(rowId),
          qty: Number(tier.qty) || 0,
          unit: Number(tier.unit) || 0
        }));
        
        console.log('🔍 Creating tiers:', tiersData.length);
        await tx.tier.createMany({
          data: tiersData
        });
      }
    });
    
    console.log('✅ Row updated successfully:', rowId);
    revalidateTag(PRICING_TAG);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('❌ API ROW PUT ERROR:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json({ 
      ok: false, 
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
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

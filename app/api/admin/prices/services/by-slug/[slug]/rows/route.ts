import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PRICING_TAG } from "@/lib/pricing-const";

export const runtime = 'nodejs';

export async function GET(_: Request, context: { params: Promise<any> }) {
  try {
    console.log('🔍 API ROWS GET: Starting request');
    const params = await context.params;
    console.log('🔍 API ROWS GET: Params received:', params);
    const { slug } = params;
    
    if (!slug || typeof slug !== 'string') {
      console.error('❌ Invalid slug parameter:', slug, typeof slug);
      return NextResponse.json({ ok: false, error: "Invalid slug parameter" }, { status: 400 });
    }
    
    console.log('🔍 API ROWS GET: Looking for service with slug:', slug);
    
    // Пытаемся загрузить с полем vat, если не получится - загружаем без него (обратная совместимость)
    let s;
    try {
      // Пробуем загрузить с vat (для новых БД)
      s = await prisma.service.findUnique({
        where: { slug },
        include: { rows: { 
          where: { isActive: true },
          include: { 
            tiers: {
              select: {
                id: true,
                rowId: true,
                qty: true,
                unit: true,
                vat: true // Включаем vat для корректной загрузки (может быть 0, число или null)
              },
              orderBy: { qty: 'asc' }
            }
          }, 
          orderBy: { id: "asc" } 
        } }
      });
    } catch (error: any) {
      // Если поле vat не существует (P2021 или похожая ошибка), загружаем без него
      if (error?.code === 'P2021' || error?.message?.includes('does not exist') || error?.message?.includes('Unknown column')) {
        console.warn('⚠️ VAT column does not exist, loading tiers without vat field');
        s = await prisma.service.findUnique({
          where: { slug },
          include: { rows: { 
            where: { isActive: true },
            include: { 
              tiers: {
                select: {
                  id: true,
                  rowId: true,
                  qty: true,
                  unit: true
                  // Не включаем vat - поле еще не существует
                },
                orderBy: { qty: 'asc' }
              }
            }, 
            orderBy: { id: "asc" } 
          } }
        });
        
        // Добавляем vat: null ко всем tiers для обратной совместимости
        if (s && s.rows) {
          s.rows = s.rows.map(row => ({
            ...row,
            tiers: row.tiers.map((tier: any) => ({
              ...tier,
              vat: null // По умолчанию null (auto-calculate) если поле не существует
            }))
          }));
        }
      } else {
        // Если другая ошибка - пробрасываем дальше
        throw error;
      }
    }
    
    console.log('🔍 API ROWS GET: Service found:', s ? `id=${s.id}, name=${s.name}, rows=${s.rows.length}` : 'null');
    
    if (!s) {
      console.warn('⚠️ API ROWS GET: Service not found for slug:', slug);
      return NextResponse.json({ ok:false, error:"not found" }, { status:404 });
    }
    
    console.log('✅ API ROWS GET: Returning success with', s.rows.length, 'rows');
    return NextResponse.json({ ok:true, service: { id:s.id, name:s.name, slug:s.slug, category:s.category }, rows: s.rows });
  } catch (error: any) {
    console.error('❌ API ROWS GET ERROR:', error);
    console.error('❌ Error details:', {
      message: error?.message,
      name: error?.name,
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack?.substring(0, 500)
    });
    
    // Обрабатываем ошибки подключения к базе данных
    if (error?.code === 'P1001' || error?.message?.includes('connection') || error?.message?.includes('Can\'t reach database')) {
      console.error('❌ Database connection error');
      console.error('❌ Database URL:', process.env.DATABASE_URL ? 'exists' : 'missing');
      console.error('❌ Hint: Check DATABASE_SETUP.md for troubleshooting');
      return NextResponse.json({ 
        ok: false, 
        error: "Database connection error",
        errorMessage: process.env.NODE_ENV === 'development' ? error?.message : undefined,
        hint: "Please check your DATABASE_URL in .env file. See DATABASE_SETUP.md for help."
      }, { status: 503 }); // 503 Service Unavailable - более подходящий статус для проблем с БД
    }
    
    return NextResponse.json({ 
      ok: false, 
      error: "Internal server error",
      errorMessage: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      errorCode: error?.code
    }, { status: 500 });
  }
}

// создать новый ряд
export async function POST(req: Request, context: { params: Promise<any> }) {
  try {
    const { slug } = await context.params;
    const { attrs = {}, ruleKind = "perUnit", unit = null, setup = null, fixed = null } = await req.json();
    
    const s = await prisma.service.findUnique({ 
      where: { slug },
      include: { rows: { where: { isActive: true } } }
    });
    
    if (!s) return NextResponse.json({ ok:false, error:"service not found" }, { status:404 });
    
    // Проверяем на дубликаты: нормализуем attrs для сравнения
    const normalizedAttrs: Record<string, string> = {};
    Object.entries(attrs).forEach(([key, value]) => {
      if (key !== '_isMain' && 
          key !== '_includeVat' &&
          !['PRICE', 'NET PRICE', 'VAT', 'Price +VAT', 'Qty'].includes(key) &&
          typeof value === 'string' && value.trim() !== '') {
        normalizedAttrs[key] = (value as string).trim();
      }
    });
    
    const attrsKey = JSON.stringify(
      Object.keys(normalizedAttrs).sort().reduce((acc, key) => {
        acc[key] = normalizedAttrs[key];
        return acc;
      }, {} as Record<string, string>)
    );
    
    // Проверяем, нет ли уже строки с такой же комбинацией параметров
    for (const existingRow of s.rows) {
      const existingAttrs = typeof existingRow.attrs === 'string' ? JSON.parse(existingRow.attrs) : existingRow.attrs;
      const existingNormalized: Record<string, string> = {};
      
      Object.entries(existingAttrs).forEach(([key, value]) => {
        if (key !== '_isMain' && 
            key !== '_includeVat' &&
            !['PRICE', 'NET PRICE', 'VAT', 'Price +VAT', 'Qty'].includes(key) &&
            typeof value === 'string' && value.trim() !== '') {
          existingNormalized[key] = (value as string).trim();
        }
      });
      
      const existingKey = JSON.stringify(
        Object.keys(existingNormalized).sort().reduce((acc, key) => {
          acc[key] = existingNormalized[key];
          return acc;
        }, {} as Record<string, string>)
      );
      
      if (attrsKey === existingKey) {
        console.log('⚠️ Duplicate row detected, skipping creation:', { attrs, existingRowId: existingRow.id });
        return NextResponse.json({ 
          ok: false, 
          error: "Row with this combination already exists",
          existingRowId: existingRow.id
        }, { status: 409 }); // 409 Conflict
      }
    }
    
    const row = await prisma.priceRow.create({
      data: { serviceId: s.id, attrs, ruleKind, unit, setup, fixed }
    });
    
    const { revalidateTag } = await import('next/cache');
    revalidateTag(PRICING_TAG);
    return NextResponse.json({ ok:true, row });
  } catch (error: any) {
    console.error('API ROW POST ERROR:', error);
    return NextResponse.json({ 
      ok: false, 
      error: "Internal server error",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

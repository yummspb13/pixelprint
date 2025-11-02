import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PRICING_TAG } from "@/lib/pricing-const";

export const runtime = 'nodejs';

export async function GET(_: Request, context: { params: Promise<any> }) {
  try {
    console.log('🔍 API ROWS GET: Starting request');
    let params;
    try {
      params = await context.params;
      console.log('🔍 API ROWS GET: Params received:', params);
    } catch (paramsError: any) {
      console.error('❌ Error getting params:', paramsError);
      return NextResponse.json({ 
        ok: false, 
        error: "Failed to get route parameters",
        errorMessage: process.env.NODE_ENV === 'development' ? paramsError?.message : undefined
      }, { status: 500 });
    }
    
    const { slug } = params || {};
    
    if (!slug || typeof slug !== 'string') {
      console.error('❌ Invalid slug parameter:', slug, typeof slug);
      return NextResponse.json({ ok: false, error: "Invalid slug parameter" }, { status: 400 });
    }
    
    console.log('🔍 API ROWS GET: Looking for service with slug:', slug);
    
    // Безопасная загрузка данных - сначала БЕЗ vat (обратная совместимость)
    let s;
    
    try {
      console.log('🔍 API ROWS GET: Attempting to query database...');
      // Сначала загружаем БЕЗ vat - это безопаснее для старых БД
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
                // Не включаем vat для безопасности - добавим позже если нужно
              },
              orderBy: { qty: 'asc' }
            }
          }, 
          orderBy: { id: "asc" } 
        } }
      });
      console.log('🔍 API ROWS GET: Database query completed');
    } catch (dbError: any) {
      console.error('❌ Database query error:', dbError);
      console.error('❌ DB Error details:', {
        message: dbError?.message,
        name: dbError?.name,
        code: dbError?.code,
        meta: dbError?.meta
      });
      
      // Специальная обработка для разных типов ошибок
      if (dbError?.code === 'P1001') {
        return NextResponse.json({ 
          ok: false, 
          error: "Database connection error",
          errorMessage: "Cannot reach database server"
        }, { status: 503 });
      }
      
      // P2022 = Column does not exist (например, vat в таблице Tier)
      // P2021 = Table does not exist
      if (dbError?.code === 'P2021' || dbError?.code === 'P2022' || dbError?.message?.includes('does not exist')) {
        console.error('❌ Database schema mismatch - column or table does not exist');
        console.error('❌ This usually means the database schema needs to be migrated');
        console.error('❌ Error:', dbError?.message);
        return NextResponse.json({ 
          ok: false, 
          error: "Database schema error",
          errorMessage: process.env.NODE_ENV === 'development' ? dbError?.message : undefined,
          errorCode: dbError?.code,
          hint: "Please run database migration: npm run db:push"
        }, { status: 500 });
      }
      
      // Пробрасываем дальше для общей обработки
      throw dbError;
    }
    
    // Если данные загрузились, добавляем vat: null ко всем tiers
    if (s && s.rows) {
      try {
        s.rows = s.rows.map(row => ({
          ...row,
          tiers: (row.tiers || []).map((tier: any) => ({
            ...tier,
            vat: null // По умолчанию null (auto-calculate) до миграции БД
          }))
        }));
      } catch (mapError: any) {
        console.error('❌ Error mapping tiers:', mapError);
        // Не прерываем выполнение, просто логируем
      }
    }
    
    console.log('🔍 API ROWS GET: Service found:', s ? `id=${s.id}, name=${s.name}, rows=${s.rows?.length || 0}` : 'null');
    
    if (!s) {
      console.warn('⚠️ API ROWS GET: Service not found for slug:', slug);
      return NextResponse.json({ ok:false, error:"not found" }, { status:404 });
    }
    
    console.log('✅ API ROWS GET: Returning success with', s.rows?.length || 0, 'rows');
    return NextResponse.json({ 
      ok: true, 
      service: { 
        id: s.id, 
        name: s.name, 
        slug: s.slug, 
        category: s.category 
      }, 
      rows: s.rows || [] 
    });
  } catch (error: any) {
    console.error('❌ API ROWS GET ERROR:', error);
    console.error('❌ Error details:', {
      message: error?.message,
      name: error?.name,
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack?.substring(0, 1000)
    });
    
    // Обрабатываем ошибки подключения к базе данных
    if (error?.code === 'P1001' || error?.message?.includes('connection') || error?.message?.includes('Can\'t reach database')) {
      console.error('❌ Database connection error');
      console.error('❌ Database URL:', process.env.DATABASE_URL ? 'exists' : 'missing');
      return NextResponse.json({ 
        ok: false, 
        error: "Database connection error",
        errorMessage: process.env.NODE_ENV === 'development' ? error?.message : undefined,
        hint: "Please check your DATABASE_URL in .env file."
      }, { status: 503 });
    }
    
    // Обрабатываем ошибки отсутствия таблиц/колонок
    if (error?.code === 'P2021' || error?.message?.includes('does not exist')) {
      console.error('❌ Database schema error:', error?.message);
      return NextResponse.json({ 
        ok: false, 
        error: "Database schema error",
        errorMessage: process.env.NODE_ENV === 'development' ? error?.message : undefined
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      ok: false, 
      error: "Internal server error",
      errorMessage: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      errorCode: error?.code,
      hint: "Check server logs for details"
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

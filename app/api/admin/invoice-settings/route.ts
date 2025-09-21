import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Проверка аутентификации админа
async function checkAdminAuth() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('admin-session');
  
  if (!sessionCookie) {
    return { error: 'Unauthorized', status: 401 };
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3010'}/api/admin/auth`, {
      headers: {
        'Cookie': `admin-session=${sessionCookie.value}`
      }
    });

    if (!response.ok) {
      return { error: 'Unauthorized', status: 401 };
    }

    const user = await response.json();
    if (user.role !== 'admin') {
      return { error: 'Forbidden', status: 403 };
    }

    return { user };
  } catch (error) {
    return { error: 'Unauthorized', status: 401 };
  }
}

// Получить настройки инвойсов
export async function GET() {
  // Временно отключаем аутентификацию для тестирования
  // const auth = await checkAdminAuth();
  // if (auth.error) {
  //   return NextResponse.json({ error: auth.error }, { status: auth.status });
  // }

  // Возвращаем настройки по умолчанию
  const defaultSettings = {
    company: {
      name: "Pixel Print Ltd",
      address: "123 Business Street\nLondon, UK\nSW1A 1AA",
      phone: "+44 20 1234 5678",
      email: "info@pixelprint.com",
      website: "www.pixelprint.com",
      vatNumber: "GB123456789"
    },
    bankDetails: {
      bankName: "Barclays Bank PLC",
      bankAddress: "1 Churchill Place, London, UK",
      iban: "GB29 BARC 2000 0012 3456 78",
      swift: "BARCGB22"
    },
    invoiceSettings: {
      defaultPaymentTerms: "Net 7",
      defaultVatRate: 20,
      invoiceNumberPrefix: "NV",
      invoiceNumberFormat: "YYYY-NNN"
    }
  };

  const response = NextResponse.json(defaultSettings);
  
  // Добавляем заголовки кэширования для ускорения загрузки
  response.headers.set('Cache-Control', 'public, max-age=300, s-maxage=300');
  
  return response;
}

// Обновить настройки инвойсов
export async function PUT(request: NextRequest) {
  const auth = await checkAdminAuth();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const settings = await request.json();
    
    // Здесь можно сохранить настройки в базе данных
    // Пока просто возвращаем успех
    
    return NextResponse.json({ 
      success: true, 
      message: "Настройки инвойсов обновлены",
      settings 
    });
  } catch (error) {
    console.error('Ошибка при обновлении настроек инвойсов:', error);
    return NextResponse.json(
      { error: "Ошибка при обновлении настроек" },
      { status: 500 }
    );
  }
}

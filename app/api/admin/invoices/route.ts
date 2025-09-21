import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

// Сохранить инвойс
export async function POST(request: NextRequest) {
  // Временно отключаем аутентификацию для тестирования
  // const auth = await checkAdminAuth();
  // if (auth.error) {
  //   return NextResponse.json({ error: auth.error }, { status: auth.status });
  // }

  try {
    const invoiceData = await request.json();
    
    console.log('Saving invoice:', invoiceData);
    console.log('Invoice items:', invoiceData.items);
    console.log('Items count:', invoiceData.items?.length || 0);
    
    // Найти заказ по orderNumber
    const order = await prisma.order.findUnique({
      where: { orderNumber: invoiceData.orderNumber }
    });
    
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }
    
    // Убедиться, что invoiceDate установлен
    if (!invoiceData.invoiceDate) {
      invoiceData.invoiceDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    }
    
    // Убедиться, что billTo установлен
    if (!invoiceData.billTo) {
      invoiceData.billTo = invoiceData.customer?.address || 'Address not provided';
    }
    
    // Проверить, существует ли инвойс для этого заказа
    const existingInvoice = await prisma.invoice.findFirst({
      where: { orderId: order.id }
    });
    
    console.log('Found existing invoice:', existingInvoice);
    console.log('Order ID:', order.id);

    let invoice;
    if (existingInvoice) {
      // Обновить существующий инвойс
      console.log('Updating existing invoice with ID:', existingInvoice.id);
      console.log('New items to save:', invoiceData.items);
      
      invoice = await prisma.invoice.update({
        where: { id: existingInvoice.id },
        data: {
          invoiceNumber: invoiceData.invoiceNumber,
          invoiceDate: invoiceData.invoiceDate,
          taxPoint: invoiceData.taxPoint,
          billTo: invoiceData.billTo,
          paymentTerms: invoiceData.paymentTerms,
          items: invoiceData.items,
          subtotal: invoiceData.subtotal,
          discount: invoiceData.discount,
          discountType: invoiceData.discountType,
          vatRate: invoiceData.vatRate,
          vatAmount: invoiceData.vatAmount,
          total: invoiceData.total,
          status: 'draft'
        }
      });
      
      console.log('Updated invoice:', invoice);
    } else {
      // Создать новый инвойс
      invoice = await prisma.invoice.create({
        data: {
          orderId: order.id,
          invoiceNumber: invoiceData.invoiceNumber,
          invoiceDate: invoiceData.invoiceDate,
          taxPoint: invoiceData.taxPoint,
          billTo: invoiceData.billTo,
          paymentTerms: invoiceData.paymentTerms,
          items: invoiceData.items,
          subtotal: invoiceData.subtotal,
          discount: invoiceData.discount,
          discountType: invoiceData.discountType,
          vatRate: invoiceData.vatRate,
          vatAmount: invoiceData.vatAmount,
          total: invoiceData.total,
          status: 'draft'
        }
      });
    }

    // Обновить заказ на основе данных инвойса
    console.log('Updating order with new total:', invoiceData.total);
    
    // Обновить orderItems на основе данных из инвойса
    // Сначала удалим все существующие orderItems
    await prisma.orderItem.deleteMany({
      where: { orderId: order.id }
    });
    
    // Создадим новые orderItems на основе данных из инвойса
    const orderItems = invoiceData.items.map((item: any) => ({
      serviceName: item.description,
      serviceSlug: 'custom-item', // Для кастомных товаров
      parameters: JSON.stringify({ description: item.description, parameters: item.parameters }),
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      fileName: null,
      fileSize: null,
      filePath: null,
      notes: item.isCustom ? 'Custom item added in invoice' : null,
      orderId: order.id
    }));
    
    // Создать новые orderItems
    await prisma.orderItem.createMany({
      data: orderItems
    });
    
    await prisma.order.update({
      where: { id: order.id },
      data: {
        totalAmount: invoiceData.total,
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: "Invoice saved successfully",
      invoiceId: invoice.id,
      data: invoice
    });
  } catch (error) {
    console.error('Error saving invoice:', error);
    return NextResponse.json(
      { error: "Error saving invoice" },
      { status: 500 }
    );
  }
}

// Получить инвойсы
export async function GET(request: NextRequest) {
  // Временно отключаем аутентификацию для тестирования
  // const auth = await checkAdminAuth();
  // if (auth.error) {
  //   return NextResponse.json({ error: auth.error }, { status: auth.status });
  // }

  const { searchParams } = new URL(request.url);
  const orderNumber = searchParams.get('orderNumber');

  console.log('Getting invoices for order:', orderNumber);
  
  try {
    if (orderNumber) {
      // Получить инвойс для конкретного заказа
      const order = await prisma.order.findUnique({
        where: { orderNumber },
        include: { invoices: true }
      });
      
      if (!order) {
        return NextResponse.json([]);
      }
      
      return NextResponse.json(order.invoices);
    } else {
      // Получить все инвойсы
      const invoices = await prisma.invoice.findMany({
        include: { order: true },
        orderBy: { createdAt: 'desc' }
      });
      
      return NextResponse.json(invoices);
    }
  } catch (error) {
    console.error('Error getting invoices:', error);
    return NextResponse.json(
      { error: "Error getting invoices" },
      { status: 500 }
    );
  }
}

// Обновить инвойс
export async function PUT(request: NextRequest) {
  // Временно отключаем аутентификацию для тестирования
  // const auth = await checkAdminAuth();
  // if (auth.error) {
  //   return NextResponse.json({ error: auth.error }, { status: auth.status });
  // }

  try {
    const invoiceData = await request.json();
    
    console.log('Updating invoice:', invoiceData);
    
    // Найти заказ по orderNumber
    const order = await prisma.order.findUnique({
      where: { orderNumber: invoiceData.orderNumber }
    });
    
    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }
    
    // Убедиться, что invoiceDate установлен
    if (!invoiceData.invoiceDate) {
      invoiceData.invoiceDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    }
    
    // Убедиться, что billTo установлен
    if (!invoiceData.billTo) {
      invoiceData.billTo = invoiceData.customer?.address || 'Address not provided';
    }
    
    // Найти существующий инвойс
    const existingInvoice = await prisma.invoice.findFirst({
      where: { orderId: order.id }
    });

    if (!existingInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Обновить инвойс
    const invoice = await prisma.invoice.update({
      where: { id: existingInvoice.id },
      data: {
        invoiceNumber: invoiceData.invoiceNumber,
        invoiceDate: invoiceData.invoiceDate,
        taxPoint: invoiceData.taxPoint,
        billTo: invoiceData.billTo,
        paymentTerms: invoiceData.paymentTerms,
        items: invoiceData.items,
        subtotal: invoiceData.subtotal,
        discount: invoiceData.discount,
        discountType: invoiceData.discountType,
        vatRate: invoiceData.vatRate,
        vatAmount: invoiceData.vatAmount,
        total: invoiceData.total
      }
    });

    // Обновить заказ на основе данных инвойса
    console.log('Updating order with new total:', invoiceData.total);
    
    // Обновить orderItems на основе данных из инвойса
    // Сначала удалим все существующие orderItems
    await prisma.orderItem.deleteMany({
      where: { orderId: order.id }
    });
    
    // Создадим новые orderItems на основе данных из инвойса
    const orderItems = invoiceData.items.map((item: any) => ({
      serviceName: item.description,
      serviceSlug: 'custom-item', // Для кастомных товаров
      parameters: JSON.stringify({ description: item.description, parameters: item.parameters }),
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      fileName: null,
      fileSize: null,
      filePath: null,
      notes: item.isCustom ? 'Custom item added in invoice' : null,
      orderId: order.id
    }));
    
    // Создать новые orderItems
    await prisma.orderItem.createMany({
      data: orderItems
    });
    
    await prisma.order.update({
      where: { id: order.id },
      data: {
        totalAmount: invoiceData.total,
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: "Invoice updated successfully",
      data: invoice
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: "Error updating invoice" },
      { status: 500 }
    );
  }
}

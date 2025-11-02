import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  console.log('🚀 ORDERS API: POST request received');
  console.log('📝 ORDERS API: Request headers:', Object.fromEntries(request.headers.entries()));
  console.log('📝 ORDERS API: Content-Type:', request.headers.get('content-type'));
  
  try {
    console.log('📝 ORDERS API: Parsing form data...');
    const formData = await request.formData();
    
    console.log('📝 ORDERS API: Form data keys:', Array.from(formData.keys()));
    console.log('📝 ORDERS API: Form data values:', {
      items: formData.get("items"),
      checkoutData: formData.get("checkoutData"),
      totalAmount: formData.get("totalAmount"),
      customerInfo: formData.get("customerInfo")
    });
    
    const items = JSON.parse(formData.get("items") as string);
    const checkoutData = JSON.parse(formData.get("checkoutData") as string);
    const totalAmount = parseFloat(formData.get("totalAmount") as string);
    const customerInfo = JSON.parse(formData.get("customerInfo") as string);

    console.log('📝 ORDERS API: Parsed data:', { 
      itemsCount: items?.length, 
      checkoutData: checkoutData?.paymentMethod, 
      totalAmount, 
      customerInfo: customerInfo?.name 
    });

    // Validate and set delivery date
    const requestedDeliveryDate = new Date(checkoutData.deliveryDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    // If delivery date is in the past, set it to tomorrow
    const deliveryDate = requestedDeliveryDate < today 
      ? new Date(today.getTime() + 24 * 60 * 60 * 1000) // Tomorrow
      : requestedDeliveryDate;
    
    if (requestedDeliveryDate < today) {
      console.log(`Delivery date was in the past (${checkoutData.deliveryDate}), adjusted to tomorrow (${deliveryDate.toISOString().split('T')[0]})`);
    }

    // Process files for each item
    const processedItems = await Promise.all(items.map(async (item: any, index: number) => {
      let filePath = null;
      let savedFileName = null;
      
      // If filePath already exists, file was uploaded earlier (from service page)
      if (item.filePath) {
        filePath = item.filePath;
        savedFileName = item.fileName || item.savedFileName;
        console.log(`✅ Item ${index}: Using existing filePath: ${filePath}`);
      } else {
        // Get file from FormData (fallback for files uploaded during checkout)
        const file = formData.get(`file_${index}`) as File;
        
        if (file) {
          try {
            // Upload file to server
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            
            const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3010'}/api/upload`, {
              method: 'POST',
              body: uploadFormData
            });
            
            if (uploadResponse.ok) {
              const uploadData = await uploadResponse.json();
              filePath = uploadData.filePath;
              savedFileName = uploadData.savedFileName;
              console.log(`✅ Item ${index}: Uploaded file to: ${filePath}`);
            }
          } catch (error) {
            console.error(`❌ Error uploading file for item ${index}:`, error);
          }
        }
      }
      
      return {
        ...item,
        filePath,
        savedFileName: savedFileName || item.fileName
      };
    }));

    // Create order in database
    console.log('💾 ORDERS API: Creating order in database...');
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const deliveryCost = 15.0; // Fixed delivery cost
    const totalAmountWithDelivery = totalAmount + deliveryCost;
    
    console.log('💾 ORDERS API: Order details:', {
      orderNumber,
      totalAmount,
      deliveryCost,
      totalAmountWithDelivery,
      itemsCount: processedItems.length
    });
    
    // Clean processedItems to remove any potential ID fields
    const cleanProcessedItems = processedItems.map((item: any) => {
      const { id, ...cleanItem } = item;
      return cleanItem;
    });
    
    console.log('💾 ORDERS API: Cleaned items (removed IDs):', cleanProcessedItems.length);
    
    // Check if orderNumber already exists
    const existingOrder = await prisma.order.findUnique({
      where: { orderNumber }
    });
    
    if (existingOrder) {
      console.log('⚠️ ORDERS API: Order number already exists, generating new one');
      const newOrderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      console.log('💾 ORDERS API: New order number:', newOrderNumber);
    }
    
    const order = await prisma.order.create({
      data: {
        // Don't include id - let Prisma auto-generate it
        orderNumber,
        customerName: customerInfo?.name || 'Guest',
        customerEmail: customerInfo?.email || '',
        customerPhone: customerInfo?.phone || '',
        totalAmount: totalAmountWithDelivery,
        status: checkoutData.paymentMethod === 'online' ? 'pending_payment' : 'pending_review',
        paymentMethod: checkoutData.paymentMethod,
        deliveryDate: deliveryDate,
        specialInstructions: checkoutData.specialInstructions,
        // Delivery address fields
        deliveryAddress: checkoutData.deliveryInfo?.address || '',
        deliveryCity: checkoutData.deliveryInfo?.city || '',
        deliveryPostcode: checkoutData.deliveryInfo?.postcode || '',
        deliveryCountry: checkoutData.deliveryInfo?.country || 'UK',
        deliveryContactName: customerInfo?.name || '',
        deliveryContactPhone: customerInfo?.phone || '',
        deliveryCost: deliveryCost,
        orderItems: {
          create: cleanProcessedItems.map((item: any) => ({
            // Don't include id for OrderItem either
            serviceName: item.serviceName,
            serviceSlug: item.serviceSlug,
            parameters: JSON.stringify(item.parameters),
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            fileName: item.savedFileName,
            fileSize: item.fileSize,
            filePath: item.filePath,
            notes: item.notes
          }))
        }
      },
      include: {
        orderItems: true
      }
    });

    console.log('✅ ORDERS API: Order created successfully:', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status
    });

    // If online payment, redirect to payment gateway
    if (checkoutData.paymentMethod === 'online') {
      console.log('💳 ORDERS API: Online payment requested');
      // Here you would integrate with your payment provider (Stripe, PayPal, etc.)
      return NextResponse.json({ 
        success: true, 
        orderId: order.id,
        orderNumber: order.orderNumber,
        redirectToPayment: true,
        paymentUrl: `/payment/${order.id}` // Placeholder
      });
    }

    // If manager review, send notification
    if (checkoutData.paymentMethod === 'manager') {
      // Here you would send email notification to manager
      console.log('Manager notification needed for order:', order.orderNumber);
    }

    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
      orderNumber: order.orderNumber,
      message: checkoutData.paymentMethod === 'manager' 
        ? 'Запрос отправлен менеджеру. Ответим в течение 1 рабочего дня.'
        : 'Заказ создан успешно.'
    });

  } catch (error) {
    console.error('❌ ORDERS API: Error creating order:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    });
    
    return NextResponse.json(
      { 
        error: "Failed to create order",
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerEmail = searchParams.get('email');
    
    if (!customerEmail) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const orders = await prisma.order.findMany({
      where: { customerEmail },
      include: { orderItems: true }
    });

    return NextResponse.json({ orders });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: "Failed to fetch orders" }, 
      { status: 500 }
    );
  }
}
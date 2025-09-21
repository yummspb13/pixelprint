"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, ArrowLeft } from 'lucide-react';
import PDFGenerator from '@/components/invoice/PDFGenerator';

interface OrderItem {
  id: number;
  serviceName: string;
  serviceSlug: string;
  parameters: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  fileName?: string;
  fileSize?: number;
  notes?: string;
  createdAt: string;
}

interface InvoiceData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  totalAmount: number;
  items: OrderItem[];
  date: string;
  status: string;
}

function AdminInvoicePageContent() {
  const searchParams = useSearchParams();
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [invoiceType, setInvoiceType] = useState<'standard' | 'simplified'>('standard');
  const [companySettings, setCompanySettings] = useState<any>(null);

  useEffect(() => {
    // Получить данные из URL параметров
    const dataParam = searchParams.get('data');
    const typeParam = searchParams.get('type');
    
    if (dataParam) {
      try {
        const data = JSON.parse(decodeURIComponent(dataParam));
        setInvoiceData(data);
        setInvoiceType(typeParam === 'simplified' ? 'simplified' : 'standard');
      } catch (error) {
        console.error('Ошибка при парсинге данных инвойса:', error);
      }
    }

    // Загрузить настройки компании
    loadCompanySettings();
  }, [searchParams]);

  const loadCompanySettings = async () => {
    try {
      const response = await fetch('/api/admin/invoice-settings');
      if (response.ok) {
        const settings = await response.json();
        setCompanySettings(settings);
      }
    } catch (error) {
      console.error('Ошибка при загрузке настроек компании:', error);
    }
  };

  if (!invoiceData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-px-bg via-zinc-50 to-px-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-px-fg mb-4">Ошибка загрузки данных</h1>
          <p className="text-px-muted mb-4">Не удалось загрузить данные заказа для создания инвойса</p>
          <Button onClick={() => window.close()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Закрыть
          </Button>
        </div>
      </div>
    );
  }

  // Подготовить данные для инвойса
  const prepareInvoiceData = () => {
    const subtotal = invoiceData.totalAmount / 1.2; // Предполагаем 20% VAT
    const vatAmount = invoiceData.totalAmount - subtotal;
    const vatRate = 20;

    return {
      invoiceNumber: `NV-2025-${invoiceData.orderNumber.split('-')[1] || '001'}`,
      date: invoiceData.date,
      taxPoint: "В течение 7 дней",
      
      company: companySettings?.company || {
        name: "Pixel Print Ltd",
        address: "123 Business Street\nLondon, UK\nSW1A 1AA",
        phone: "+44 20 1234 5678",
        email: "info@pixelprint.com",
        website: "www.pixelprint.com",
        vatNumber: "GB123456789"
      },
      
      customer: {
        name: invoiceData.customerName,
        address: invoiceData.customerAddress
      },
      
      items: invoiceData.items.map(item => ({
        description: item.serviceName,
        parameters: Object.entries(JSON.parse(item.parameters)).map(([key, value]) => `${key}: ${value}`).join(', '),
        quantity: item.quantity,
        unit: "pcs",
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      })),
      
      subtotal: subtotal,
      discount: 0,
      vatRate: vatRate,
      vatAmount: vatAmount,
      total: invoiceData.totalAmount,
      
      paymentTerms: companySettings?.invoiceSettings?.defaultPaymentTerms || "Net 7",
      bankDetails: companySettings?.bankDetails || {
        bankName: "Barclays Bank PLC",
        bankAddress: "1 Churchill Place, London, UK",
        iban: "GB29 BARC 2000 0012 3456 78",
        swift: "BARCGB22"
      }
    };
  };

  const invoiceDataPrepared = prepareInvoiceData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-px-bg via-zinc-50 to-px-bg">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-playfair font-bold text-px-fg mb-2">
              {invoiceType === 'standard' ? 'Standard Invoice' : 'Simplified Invoice'}
            </h1>
            <p className="text-px-muted">
              Order: {invoiceData.orderNumber} | Customer: {invoiceData.customerName}
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={() => setInvoiceType(invoiceType === 'standard' ? 'simplified' : 'standard')}
              variant="outline"
            >
              Switch to {invoiceType === 'standard' ? 'Simplified' : 'Standard'}
            </Button>
            <Button onClick={() => window.close()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </div>

        {/* Invoice */}
        <Card className="bg-white shadow-lg">
          <CardContent className="p-8">
            <PDFGenerator filename={`${invoiceType}-invoice-${invoiceData.orderNumber}.pdf`}>
              <div className="hidden">
                {invoiceType === 'standard' ? (
                  <StandardInvoice data={invoiceDataPrepared} />
                ) : (
                  <SimplifiedInvoice data={{
                    invoiceNumber: invoiceDataPrepared.invoiceNumber,
                    date: invoiceDataPrepared.date,
                    company: invoiceDataPrepared.company,
                    description: `Printing Services - ${invoiceData.items.map(item => item.serviceName).join(', ')}`,
                    vatRate: invoiceDataPrepared.vatRate,
                    total: invoiceDataPrepared.total
                  }} />
                )}
              </div>
            </PDFGenerator>
            
            {invoiceType === 'standard' ? (
              <StandardInvoice data={invoiceDataPrepared} />
            ) : (
              <SimplifiedInvoice data={{
                invoiceNumber: invoiceDataPrepared.invoiceNumber,
                date: invoiceDataPrepared.date,
                company: invoiceDataPrepared.company,
                description: `Printing Services - ${invoiceData.items.map(item => item.serviceName).join(', ')}`,
                vatRate: invoiceDataPrepared.vatRate,
                total: invoiceDataPrepared.total
              }} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Компонент стандартного инвойса
function StandardInvoice({ data }: { data: any }) {
  return (
    <div className="space-y-8">
      {/* Заголовок */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-px-fg mb-2">INVOICE</h1>
          <div className="text-sm text-px-muted">
            <p>Invoice Number: <span className="font-semibold text-px-fg">{data.invoiceNumber}</span></p>
            <p>Date: <span className="font-semibold text-px-fg">{data.date}</span></p>
            <p>Tax Point: <span className="font-semibold text-px-fg">{data.taxPoint}</span></p>
          </div>
        </div>
        
        {/* Логотип */}
        <div className="text-right">
          <div className="text-2xl font-playfair font-bold bg-gradient-to-r from-px-cyan to-px-magenta bg-clip-text text-transparent">
            Pixel Print
          </div>
          <div className="text-sm text-px-muted">Professional Printing Services</div>
        </div>
      </div>

      {/* Данные компании и клиента */}
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h3 className="font-playfair font-semibold text-px-fg mb-2">From:</h3>
          <div className="text-sm space-y-1">
            <p className="font-semibold">{data.company.name}</p>
            <div className="whitespace-pre-line text-px-muted">{data.company.address}</div>
            <p>Phone: {data.company.phone}</p>
            <p>Email: {data.company.email}</p>
            <p>Website: {data.company.website}</p>
            <p className="font-semibold">VAT Number: {data.company.vatNumber}</p>
          </div>
        </div>
        
        <div>
          <h3 className="font-playfair font-semibold text-px-fg mb-2">Bill To:</h3>
          <div className="text-sm space-y-1">
            <p className="font-semibold">{data.customer.name}</p>
            <div className="whitespace-pre-line text-px-muted">{data.customer.address}</div>
          </div>
        </div>
      </div>

      {/* Таблица товаров */}
      <div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-px-cyan">
              <th className="text-left py-2 font-playfair text-px-fg">Description</th>
              <th className="text-center py-2 font-playfair text-px-fg">Qty</th>
              <th className="text-right py-2 font-playfair text-px-fg">Unit Price</th>
              <th className="text-right py-2 font-playfair text-px-fg">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item: any, index: number) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="py-3">
                  <div className="font-semibold">{item.description}</div>
                  <div className="text-sm text-px-muted">{item.parameters}</div>
                </td>
                <td className="text-center py-3">{item.quantity} {item.unit}</td>
                <td className="text-right py-3">£{item.unitPrice.toFixed(2)}</td>
                <td className="text-right py-3">£{item.totalPrice.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Итоги */}
      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>£{data.subtotal.toFixed(2)}</span>
          </div>
          {data.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount:</span>
              <span>-£{data.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>VAT ({data.vatRate}%):</span>
            <span>£{data.vatAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total:</span>
            <span>£{data.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Платежные условия */}
      <div className="border-t pt-6 space-y-4">
        <div>
          <h3 className="font-playfair font-semibold text-px-fg mb-2">Payment Terms:</h3>
          <p className="text-sm">{data.paymentTerms}</p>
        </div>
        
        <div>
          <h3 className="font-playfair font-semibold text-px-fg mb-2">Bank Details:</h3>
          <div className="text-sm space-y-1">
            <p>{data.bankDetails.bankName}</p>
            <p>{data.bankDetails.bankAddress}</p>
            <p>IBAN: {data.bankDetails.iban}</p>
            <p>SWIFT: {data.bankDetails.swift}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Компонент упрощенного инвойса
function SimplifiedInvoice({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-px-fg mb-2">SIMPLIFIED INVOICE</h1>
          <div className="text-sm text-px-muted">
            <p>Invoice Number: <span className="font-semibold text-px-fg">{data.invoiceNumber}</span></p>
            <p>Date: <span className="font-semibold text-px-fg">{data.date}</span></p>
          </div>
        </div>
        
        {/* Логотип */}
        <div className="text-right">
          <div className="text-2xl font-playfair font-bold bg-gradient-to-r from-px-cyan to-px-magenta bg-clip-text text-transparent">
            Pixel Print
          </div>
          <div className="text-sm text-px-muted">Professional Printing Services</div>
        </div>
      </div>

      {/* Данные компании */}
      <div>
        <h3 className="font-playfair font-semibold text-px-fg mb-2">Business Details:</h3>
        <div className="text-sm space-y-1">
          <p className="font-semibold">{data.company.name}</p>
          <p>{data.company.address}</p>
          <p className="font-semibold">VAT Number: {data.company.vatNumber}</p>
        </div>
      </div>

      {/* Описание услуг */}
      <div>
        <h3 className="font-playfair font-semibold text-px-fg mb-2">Services:</h3>
        <p className="text-sm">{data.description}</p>
      </div>

      {/* Итог */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm">VAT Rate: {data.vatRate}%</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-px-fg">Total (inc. VAT): £{data.total.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminInvoicePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminInvoicePageContent />
    </Suspense>
  );
}

"use client";
import { useState } from 'react';
import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Eye } from 'lucide-react';
import PDFGenerator from '@/components/invoice/PDFGenerator';

// Тестовые данные для инвойса
const sampleInvoiceData = {
  // Стандартный инвойс (> £250)
  standard: {
    invoiceNumber: "NV-2025-001",
    date: "2025-01-19",
    taxPoint: "В течение 7 дней",
    
    // Данные компании
    company: {
      name: "Pixel Print Ltd",
      address: "123 Business Street\nLondon, UK\nSW1A 1AA",
      phone: "+44 20 1234 5678",
      email: "info@pixelprint.com",
      website: "www.pixelprint.com",
      vatNumber: "GB123456789"
    },
    
    // Данные клиента
    customer: {
      name: "John Smith",
      address: "456 Customer Road\nManchester, UK\nM1 1AA"
    },
    
    // Товары
    items: [
      {
        description: "Digital Business Cards",
        parameters: "Single Sided (S/S), 300gsm, Matt Finish",
        quantity: 1000,
        unit: "pcs",
        unitPrice: 0.15,
        totalPrice: 150.00
      },
      {
        description: "Appointment Cards", 
        parameters: "Double Sided (D/S), Color, 250gsm",
        quantity: 500,
        unit: "pcs",
        unitPrice: 0.20,
        totalPrice: 100.00
      }
    ],
    
    // Финансы
    subtotal: 250.00,
    discount: 0,
    vatRate: 20,
    vatAmount: 50.00,
    total: 300.00,
    
    // Платежные условия
    paymentTerms: "Net 7",
    bankDetails: {
      bankName: "Barclays Bank PLC",
      bankAddress: "1 Churchill Place, London, UK",
      iban: "GB29 BARC 2000 0012 3456 78",
      swift: "BARCGB22"
    }
  },
  
  // Упрощенный инвойс (≤ £250)
  simplified: {
    invoiceNumber: "NV-2025-002",
    date: "2025-01-19",
    
    company: {
      name: "Pixel Print Ltd",
      address: "123 Business Street, London, UK, SW1A 1AA",
      vatNumber: "GB123456789"
    },
    
    description: "Printing Services - Business Cards & Promotional Materials",
    vatRate: 20,
    total: 240.00
  }
};

export default function TestInvoicePage() {
  const [invoiceType, setInvoiceType] = useState<'standard' | 'simplified'>('standard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-px-bg via-zinc-50 to-px-bg">
      <Header />
      
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-playfair text-px-fg mb-2">
            Тест системы инвойсов
          </h1>
          <p className="text-lg text-px-muted">
            Предварительный просмотр инвойсов для Pixel Print
          </p>
        </div>

        {/* Переключатель типов инвойсов */}
        <div className="flex gap-4 mb-8">
          <Button
            onClick={() => setInvoiceType('standard')}
            variant={invoiceType === 'standard' ? 'default' : 'outline'}
            className={invoiceType === 'standard' ? 'bg-gradient-to-r from-px-cyan to-px-magenta text-white' : ''}
          >
            Стандартный VAT-инвойс (&gt; £250)
          </Button>
          <Button
            onClick={() => setInvoiceType('simplified')}
            variant={invoiceType === 'simplified' ? 'default' : 'outline'}
            className={invoiceType === 'simplified' ? 'bg-gradient-to-r from-px-cyan to-px-magenta text-white' : ''}
          >
            Упрощенный VAT-инвойс (&le; £250)
          </Button>
        </div>

        {/* Кнопки действий */}
        <div className="flex gap-4 mb-8">
          <PDFGenerator filename={`${invoiceType === 'standard' ? 'standard' : 'simplified'}-invoice-${sampleInvoiceData[invoiceType].invoiceNumber}.pdf`}>
            <div className="hidden">
              {invoiceType === 'standard' ? (
                <StandardInvoice data={sampleInvoiceData.standard} />
              ) : (
                <SimplifiedInvoice data={sampleInvoiceData.simplified} />
              )}
            </div>
          </PDFGenerator>
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Предварительный просмотр
          </Button>
        </div>

        {/* Инвойс */}
        <Card className="bg-white shadow-lg">
          <CardContent className="p-8">
            {invoiceType === 'standard' ? (
              <StandardInvoice data={sampleInvoiceData.standard} />
            ) : (
              <SimplifiedInvoice data={sampleInvoiceData.simplified} />
            )}
          </CardContent>
        </Card>
      </div>
      
      <Footer />
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
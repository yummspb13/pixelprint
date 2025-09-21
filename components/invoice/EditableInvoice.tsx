"use client";
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Download, Mail, Save } from 'lucide-react';
import { toast } from 'sonner';
import PDFGenerator from './PDFGenerator';

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

interface EditableInvoiceProps {
  orderData: InvoiceData;
  onClose: () => void;
  onSave?: (invoiceData: any) => void;
}

interface InvoiceItem {
  id: string;
  description: string;
  parameters: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  isCustom?: boolean;
}

export default function EditableInvoice({ orderData, onClose, onSave }: EditableInvoiceProps) {
  const [invoiceNumber, setInvoiceNumber] = useState(`NV-2025-${orderData.orderNumber.split('-')[1] || '001'}`);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [taxPoint, setTaxPoint] = useState("В течение 7 дней");
  const [customerName, setCustomerName] = useState(orderData.customerName);
  const [customerAddress, setCustomerAddress] = useState(orderData.customerAddress);
  const [paymentTerms, setPaymentTerms] = useState("Net 7");
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [companySettings, setCompanySettings] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Загрузить настройки компании и существующий инвойс
  useEffect(() => {
    const loadData = async () => {
      try {
        // Загрузить настройки компании
        const settingsResponse = await fetch('/api/admin/invoice-settings');
        if (settingsResponse.ok) {
          const settings = await settingsResponse.json();
          setCompanySettings(settings);
        }

        // Попробовать загрузить существующий инвойс
        const invoiceResponse = await fetch(`/api/admin/invoices?orderNumber=${orderData.orderNumber}`);
        if (invoiceResponse.ok) {
          const invoices = await invoiceResponse.json();
          if (invoices.length > 0) {
            const existingInvoice = invoices[0];
            // Загрузить данные существующего инвойса
            setInvoiceNumber(existingInvoice.invoiceNumber || invoiceNumber);
            setInvoiceDate(existingInvoice.invoiceDate || existingInvoice.date || invoiceDate);
            setTaxPoint(existingInvoice.taxPoint || taxPoint);
            setCustomerName(existingInvoice.customer?.name || customerName);
            setCustomerAddress(existingInvoice.customer?.address || customerAddress);
            setPaymentTerms(existingInvoice.paymentTerms || paymentTerms);
            setDiscount(existingInvoice.discount || 0);
            setDiscountType(existingInvoice.discountType || 'percentage');
            
            if (existingInvoice.items && existingInvoice.items.length > 0) {
              setItems(existingInvoice.items);
            }
          }
        }
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
      }
    };
    loadData();
  }, [orderData.orderNumber]);

  // Инициализировать товары из заказа (только при первой загрузке)
  useEffect(() => {
    // Проверяем, что items еще не инициализированы
    if (items.length === 0) {
      const initialItems: InvoiceItem[] = orderData.items.map((item, index) => ({
        id: `item-${index}`,
        description: item.serviceName,
        parameters: Object.entries(JSON.parse(item.parameters)).map(([key, value]) => `${key}: ${value}`).join(', '),
        quantity: item.quantity,
        unit: "pcs",
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        isCustom: false
      }));

      // Добавить стоимость доставки как отдельный товар, если она есть
      if ((orderData as any).deliveryCost && (orderData as any).deliveryCost > 0) {
        const deliveryItem: InvoiceItem = {
          id: 'delivery-item',
          description: 'Delivery & Shipping',
          parameters: 'Standard delivery',
          quantity: 1,
          unit: 'service',
          unitPrice: (orderData as any).deliveryCost,
          totalPrice: (orderData as any).deliveryCost,
          isCustom: false
        };

        setItems([...initialItems, deliveryItem]);
      } else {
        setItems(initialItems);
      }
    }
  }, [orderData, items.length]);

  // Добавить новый товар
  const addItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      description: 'New Item', // Даем начальное описание
      parameters: '',
      quantity: 1,
      unit: 'pcs',
      unitPrice: 0,
      totalPrice: 0,
      isCustom: true
    };
    setItems([...items, newItem]);
    markAsUnsaved();
  };

  // Удалить товар
  const removeItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
    markAsUnsaved();
  };

  // Сбросить флаг сохранения при изменении данных
  const markAsUnsaved = () => {
    if (isSaved) {
      setIsSaved(false);
    }
  };

  // Обновить товар
  const updateItem = (itemId: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };
        
        // Пересчитать итог если изменились количество или цена
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice;
        }
        
        return updatedItem;
      }
      return item;
    }));
    
    markAsUnsaved();
  };

  // Рассчитать итоги
  const calculateTotals = () => {
    // Для товаров из заказа (isCustom: false) - цены уже включают НДС
    // Для кастомных товаров - цены вводятся как есть (могут включать или не включать НДС)
    const vatRate = 20;
    
    let subtotal = 0;
    let vatAmount = 0;
    
    items.forEach(item => {
      if (item.isCustom) {
        // Для кастомных товаров - считаем что цены включают НДС (как в заказе)
        // Разделяем на net price и VAT
        const itemGross = item.totalPrice;
        const itemNet = itemGross / (1 + vatRate / 100);
        const itemVat = itemGross - itemNet;
        subtotal += itemNet;
        vatAmount += itemVat;
      } else {
        // Для товаров из заказа - цены включают НДС, нужно разделить
        const itemGross = item.totalPrice;
        const itemNet = itemGross / (1 + vatRate / 100);
        const itemVat = itemGross - itemNet;
        subtotal += itemNet;
        vatAmount += itemVat;
      }
    });
    
    const discountAmount = discountType === 'percentage' 
      ? (subtotal * discount / 100) 
      : discount;
    const afterDiscount = subtotal - discountAmount;
    const total = afterDiscount + vatAmount;

    return { subtotal: afterDiscount, discountAmount, afterDiscount, vatRate, vatAmount, total };
  };

  const totals = calculateTotals();

  // Подготовить данные для PDF
  const preparePDFData = () => {
    return {
      invoiceNumber,
      invoiceDate: invoiceDate, // Добавляем invoiceDate
      date: invoiceDate,
      taxPoint,
      billTo: customerAddress, // Добавляем billTo
      company: companySettings?.company || {
        name: "Pixel Print Ltd",
        address: "123 Business Street\nLondon, UK\nSW1A 1AA",
        phone: "+44 20 1234 5678",
        email: "info@pixelprint.com",
        website: "www.pixelprint.com",
        vatNumber: "GB123456789"
      },
      customer: {
        name: customerName,
        address: customerAddress
      },
      items: items.filter(item => {
        // Сохраняем товары с описанием и количеством > 0
        const hasDescription = item.description && item.description.trim() !== '';
        const hasQuantity = item.quantity > 0;
        const hasPrice = item.unitPrice > 0;
        
        console.log('Filtering item:', {
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          hasDescription,
          hasQuantity,
          hasPrice,
          willInclude: hasDescription && hasQuantity
        });
        
        return hasDescription && hasQuantity;
      }),
      subtotal: totals.subtotal,
      discount: totals.discountAmount,
      vatRate: totals.vatRate,
      vatAmount: totals.vatAmount,
      total: totals.total,
      paymentTerms,
      bankDetails: companySettings?.bankDetails || {
        bankName: "Barclays Bank PLC",
        bankAddress: "1 Churchill Place, London, UK",
        iban: "GB29 BARC 2000 0012 3456 78",
        swift: "BARCGB22"
      }
    };
  };

  // Сохранить инвойс
  const handleSave = async () => {
    if (isSaving) return;
    
    // Проверяем, есть ли товары для сохранения
    const validItems = items.filter(item => 
      item.description && item.description.trim() !== '' && item.quantity > 0
    );
    
    if (validItems.length === 0) {
      toast.error('Add at least one item with description and quantity');
      return;
    }
    
    // Автоматически удаляем пустые товары
    if (validItems.length !== items.length) {
      setItems(validItems);
      // Уведомление о удалении пустых товаров убрано для упрощения
    }
    
    setIsSaving(true);
    try {
      const pdfData = preparePDFData();
      
      // Логируем данные для отладки
      console.log('Saving invoice with items:', pdfData.items);
      console.log('All items before filter:', items);
      console.log('Full PDF data being sent:', pdfData);
      console.log('invoiceDate:', pdfData.invoiceDate);
      console.log('billTo:', pdfData.billTo);
      
      // Сохранить в API
      const response = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...pdfData,
          orderNumber: orderData.orderNumber,
          originalOrderData: orderData
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Invoice saved successfully:', result);
        toast.success('Invoice saved and switched to Preview mode');
        setIsSaved(true);
        
        // Автоматически переключаемся в режим Preview после сохранения
        setIsEditing(false);
        
        // Плавно прокручиваем к верху модального окна
        setTimeout(() => {
          const modal = document.querySelector('.fixed.inset-0');
          if (modal) {
            modal.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 100);
        
        if (onSave) {
          onSave(pdfData);
        }
      } else {
        const error = await response.json();
        console.error('Error saving invoice:', error);
        toast.error('Error saving invoice');
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error('Error saving invoice');
    } finally {
      setIsSaving(false);
    }
  };

  // Отправить по email
  const handleEmail = () => {
    const emailSubject = `Invoice ${invoiceNumber} - Pixel Print`;
    const emailBody = `Dear ${customerName},\n\nPlease find attached your invoice ${invoiceNumber}.\n\nBest regards,\nPixel Print Team`;
    const mailtoLink = `mailto:${orderData.customerEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(mailtoLink);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-playfair font-bold text-px-fg">
              {isEditing ? 'Edit Invoice' : 'Invoice Preview'}
              {isSaving && (
                <span className="ml-2 text-sm text-px-muted">(Saving...)</span>
              )}
              {isSaved && !isEditing && (
                <span className="ml-2 text-sm text-green-600">(Saved ✓)</span>
              )}
            </h2>
            <div className="flex gap-2">
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant="outline"
              >
                {isEditing ? 'Preview Invoice' : 'Edit Invoice'}
              </Button>
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isEditing ? (
            <div className="space-y-6 transition-all duration-300">
              {/* Invoice Header */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-playfair">Invoice Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="invoice-number">Invoice Number</Label>
                    <Input
                      id="invoice-number"
                      value={invoiceNumber}
                      onChange={(e) => {
                        setInvoiceNumber(e.target.value);
                        markAsUnsaved();
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="invoice-date">Date</Label>
                    <Input
                      id="invoice-date"
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => {
                        setInvoiceDate(e.target.value);
                        markAsUnsaved();
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tax-point">Tax Point</Label>
                    <Input
                      id="tax-point"
                      value={taxPoint}
                      onChange={(e) => {
                        setTaxPoint(e.target.value);
                        markAsUnsaved();
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="payment-terms">Payment Terms</Label>
                    <Input
                      id="payment-terms"
                      value={paymentTerms}
                      onChange={(e) => {
                        setPaymentTerms(e.target.value);
                        markAsUnsaved();
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Customer Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-playfair">Customer Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="customer-name">Customer Name</Label>
                    <Input
                      id="customer-name"
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        markAsUnsaved();
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer-address">Address</Label>
                    <Textarea
                      id="customer-address"
                      value={customerAddress}
                      onChange={(e) => {
                        setCustomerAddress(e.target.value);
                        markAsUnsaved();
                      }}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Items */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="font-playfair">
                      Items ({items.filter(item => item.description && item.description.trim() !== '' && item.quantity > 0).length})
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button onClick={addItem} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                      {items.some(item => !item.description || item.description.trim() === '' || item.quantity <= 0) && (
                        <Button 
                          onClick={() => {
                            const validItems = items.filter(item => 
                              item.description && item.description.trim() !== '' && item.quantity > 0
                            );
                            setItems(validItems);
                            markAsUnsaved();
                            toast.info(`Removed ${items.length - validItems.length} empty items`);
                          }}
                          size="sm"
                          variant="outline"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Clear Empty
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item, index) => {
                    const isValid = item.description && item.description.trim() !== '' && item.quantity > 0;
                    return (
                    <div key={item.id} className={`border rounded-lg p-4 ${!isValid ? 'border-yellow-300 bg-yellow-50' : ''}`}>
                      {!isValid && (
                        <div className="text-yellow-600 text-sm mb-2 flex items-center">
                          ⚠️ Fill in description and quantity to save item
                        </div>
                      )}
                      <div className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-4">
                          <Label>Description</Label>
                          <Input
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            placeholder="Item description"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Parameters</Label>
                          <Input
                            value={item.parameters}
                            onChange={(e) => updateItem(item.id, 'parameters', e.target.value)}
                            placeholder="Specifications"
                          />
                        </div>
                        <div className="col-span-1">
                          <Label>Qty</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                          />
                        </div>
                        <div className="col-span-1">
                          <Label>Unit</Label>
                          <Input
                            value={item.unit}
                            onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Unit Price</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <div className="col-span-1">
                          <Label>Total</Label>
                          <Input
                            value={item.totalPrice.toFixed(2)}
                            disabled
                          />
                        </div>
                        <div className="col-span-1">
                          <Button
                            onClick={() => removeItem(item.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Discount */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-playfair">Discount</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Discount Type</Label>
                    <Select value={discountType} onValueChange={(value: 'percentage' | 'fixed') => {
                      setDiscountType(value);
                      markAsUnsaved();
                    }}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed Amount (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Discount Value</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={discount}
                      onChange={(e) => {
                        setDiscount(parseFloat(e.target.value) || 0);
                        markAsUnsaved();
                      }}
                    />
                  </div>
                  <div className="flex items-end">
                    <Badge variant="outline" className="text-lg">
                      {discountType === 'percentage' ? `${discount}%` : `£${discount.toFixed(2)}`}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Preview Mode */
            <div className="transition-all duration-300">
              <PDFGenerator filename={`invoice-${invoiceNumber}.pdf`}>
                <div className="hidden">
                  <StandardInvoice data={preparePDFData()} />
                </div>
              </PDFGenerator>
              <StandardInvoice data={preparePDFData()} />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center mt-6 pt-6 border-t">
            <div className="text-lg font-semibold">
              Total: £{totals.total.toFixed(2)}
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleSave} 
                variant="outline"
                disabled={isSaving}
                className={isSaved ? 'bg-green-50 border-green-300 text-green-700' : ''}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : isSaved ? 'Saved ✓' : 'Save'}
              </Button>
              <Button onClick={handleEmail} variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button 
                onClick={() => {
                  // Найти кнопку PDFGenerator и кликнуть по ней
                  const pdfButton = document.querySelector('[data-pdf-button]') as HTMLButtonElement;
                  if (pdfButton) {
                    pdfButton.click();
                  } else {
                    toast.error('PDF generation not available');
                  }
                }}
                className="bg-gradient-to-r from-px-cyan to-px-magenta text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Компонент стандартного инвойса (копируем из test-invoice)
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

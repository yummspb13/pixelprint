"use client";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, RefreshCw } from 'lucide-react';
import { WaveLoader } from '@/components/ui/loaders';
import { toast } from 'sonner';

interface InvoiceSettings {
  company: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    vatNumber: string;
  };
  bankDetails: {
    bankName: string;
    bankAddress: string;
    iban: string;
    swift: string;
  };
  invoiceSettings: {
    defaultPaymentTerms: string;
    defaultVatRate: number;
    invoiceNumberPrefix: string;
    invoiceNumberFormat: string;
  };
}

export default function InvoiceSettingsPage() {
  const [settings, setSettings] = useState<InvoiceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Загрузить настройки
  const loadSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/invoice-settings');
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        const errorText = await response.text();
        console.error('Ошибка загрузки настроек:', response.status, errorText);
        toast.error(`Ошибка при загрузке настроек: ${response.status}`);
      }
    } catch (error) {
      console.error('Ошибка при загрузке настроек:', error);
      toast.error('Ошибка при загрузке настроек');
    } finally {
      setLoading(false);
    }
  }, []);

  // Сохранить настройки
  const saveSettings = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const response = await fetch('/api/admin/invoice-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success('Настройки сохранены');
      } else {
        toast.error('Ошибка при сохранении настроек');
      }
    } catch (error) {
      console.error('Ошибка при сохранении настроек:', error);
      toast.error('Ошибка при сохранении настроек');
    } finally {
      setSaving(false);
    }
  };

  // Обновить поле
  const updateField = useCallback((path: string, value: string | number) => {
    if (!settings) return;

    const keys = path.split('.');
    const newSettings = { ...settings };
    let current: any = newSettings;

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setSettings(newSettings);
  }, [settings]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <WaveLoader 
          size="md" 
          text="Загрузка настроек..." 
          className="animate-fade-in"
        />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">Ошибка загрузки настроек</p>
          <Button onClick={loadSettings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Попробовать снова
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-playfair font-bold text-px-fg">
          Настройки инвойсов
        </h1>
        <Button 
          onClick={saveSettings} 
          disabled={saving}
          className="bg-gradient-to-r from-px-cyan to-px-magenta text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </div>

      {/* Данные компании */}
      <Card>
        <CardHeader>
          <CardTitle className="font-playfair">Данные компании</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company-name">Название компании</Label>
              <Input
                id="company-name"
                value={settings.company.name}
                onChange={(e) => updateField('company.name', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="vat-number">VAT номер</Label>
              <Input
                id="vat-number"
                value={settings.company.vatNumber}
                onChange={(e) => updateField('company.vatNumber', e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="company-address">Адрес компании</Label>
            <Textarea
              id="company-address"
              value={settings.company.address}
              onChange={(e) => updateField('company.address', e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company-phone">Телефон</Label>
              <Input
                id="company-phone"
                value={settings.company.phone}
                onChange={(e) => updateField('company.phone', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="company-email">Email</Label>
              <Input
                id="company-email"
                type="email"
                value={settings.company.email}
                onChange={(e) => updateField('company.email', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="company-website">Веб-сайт</Label>
            <Input
              id="company-website"
              value={settings.company.website}
              onChange={(e) => updateField('company.website', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Банковские реквизиты */}
      <Card>
        <CardHeader>
          <CardTitle className="font-playfair">Банковские реквизиты</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="bank-name">Название банка</Label>
            <Input
              id="bank-name"
              value={settings.bankDetails.bankName}
              onChange={(e) => updateField('bankDetails.bankName', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="bank-address">Адрес банка</Label>
            <Textarea
              id="bank-address"
              value={settings.bankDetails.bankAddress}
              onChange={(e) => updateField('bankDetails.bankAddress', e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="iban">IBAN</Label>
              <Input
                id="iban"
                value={settings.bankDetails.iban}
                onChange={(e) => updateField('bankDetails.iban', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="swift">SWIFT</Label>
              <Input
                id="swift"
                value={settings.bankDetails.swift}
                onChange={(e) => updateField('bankDetails.swift', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Настройки инвойсов */}
      <Card>
        <CardHeader>
          <CardTitle className="font-playfair">Настройки инвойсов</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="payment-terms">Платежные условия по умолчанию</Label>
              <Input
                id="payment-terms"
                value={settings.invoiceSettings.defaultPaymentTerms}
                onChange={(e) => updateField('invoiceSettings.defaultPaymentTerms', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="vat-rate">Ставка НДС по умолчанию (%)</Label>
              <Input
                id="vat-rate"
                type="number"
                value={settings.invoiceSettings.defaultVatRate}
                onChange={(e) => updateField('invoiceSettings.defaultVatRate', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoice-prefix">Префикс номера инвойса</Label>
              <Input
                id="invoice-prefix"
                value={settings.invoiceSettings.invoiceNumberPrefix}
                onChange={(e) => updateField('invoiceSettings.invoiceNumberPrefix', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="invoice-format">Формат номера инвойса</Label>
              <Input
                id="invoice-format"
                value={settings.invoiceSettings.invoiceNumberFormat}
                onChange={(e) => updateField('invoiceSettings.invoiceNumberFormat', e.target.value)}
                placeholder="YYYY-NNN"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

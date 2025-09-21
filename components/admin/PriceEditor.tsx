"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Edit, Save, Plus, Trash2 } from "lucide-react";

interface PriceTier {
  qty: number;
  price: number;
  netPrice: number;
  vat: number;
  totalPrice: number;
}

interface PriceEditorProps {
  service: {
    id: number;
    name: string;
    slug: string;
    category: string;
  };
  onSaved: () => void;
}

const VAT_RATE = 0.2; // 20% VAT

export default function PriceEditor({ service, onSaved }: PriceEditorProps) {
  const [open, setOpen] = useState(false);
  const [tiers, setTiers] = useState<PriceTier[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadTiers();
    }
  }, [open, service.slug]);

  async function loadTiers() {
    try {
      const response = await fetch(`/api/admin/prices/services/${service.slug}/rows/`);
      const data = await response.json();
      
      if (data.ok && data.rows.length > 0) {
        // Преобразуем ряды в тиры для отображения
        const priceTiers: PriceTier[] = [];
        
        for (const row of data.rows) {
          if (row.ruleKind === 'tiers' && row.tiers) {
            // Если это tiers, берем данные из tiers
            for (const tier of row.tiers) {
              const netPrice = tier.unit * tier.qty;
              const vat = netPrice * VAT_RATE;
              const totalPrice = netPrice + vat;
              
              priceTiers.push({
                qty: tier.qty,
                price: tier.unit,
                netPrice,
                vat,
                totalPrice
              });
            }
          } else if (row.ruleKind === 'perUnit') {
            // Если это perUnit, создаем один тир
            const netPrice = (row.unit || 0) * 100; // Примерное количество
            const vat = netPrice * VAT_RATE;
            const totalPrice = netPrice + vat;
            
            priceTiers.push({
              qty: 100,
              price: row.unit || 0,
              netPrice,
              vat,
              totalPrice
            });
          }
        }
        
        setTiers(priceTiers);
      } else {
        setTiers([]);
      }
    } catch (error) {
      console.error('Error loading tiers:', error);
      toast.error('Ошибка загрузки цен');
    }
  }

  function calculatePrices(tier: PriceTier) {
    const netPrice = tier.price * tier.qty;
    const vat = netPrice * VAT_RATE;
    const totalPrice = netPrice + vat;
    
    return { netPrice, vat, totalPrice };
  }

  function updateTier(index: number, field: keyof PriceTier, value: number) {
    const newTiers = [...tiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    
    if (field === 'qty' || field === 'price') {
      const { netPrice, vat, totalPrice } = calculatePrices(newTiers[index]);
      newTiers[index] = { ...newTiers[index], netPrice, vat, totalPrice };
    }
    
    setTiers(newTiers);
  }

  function addTier() {
    const newTier: PriceTier = {
      qty: 100,
      price: 0.22,
      netPrice: 22.00,
      vat: 4.40,
      totalPrice: 26.40
    };
    setTiers([...tiers, newTier]);
  }

  function removeTier(index: number) {
    setTiers(tiers.filter((_, i) => i !== index));
  }

  async function savePrices() {
    setLoading(true);
    try {
      // Создаем или обновляем ряды цен
      for (const tier of tiers) {
        const response = await fetch(`/api/admin/prices/services/${service.slug}/rows/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            attrs: {
              'Service': service.name,
              'Sides': 'Single Sided (S/S)'
            },
            ruleKind: 'tiers',
            setup: 0
          })
        });
        
        const data = await response.json();
        if (data.ok) {
          // Обновляем тиры для этого ряда
          await fetch(`/api/admin/prices/rows/${data.row.id}/tiers/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tiers: tiers.map(t => ({ qty: t.qty, unit: t.price })),
              setup: 0
            })
          });
        }
      }
      
      toast.success('Цены сохранены');
      setOpen(false);
      onSaved();
    } catch (error) {
      console.error('Error saving prices:', error);
      toast.error('Ошибка сохранения цен');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Редактировать цены
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактирование цен - {service.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Заголовок таблицы */}
          <div className="grid grid-cols-6 gap-4 p-3 bg-gray-50 rounded-lg font-medium text-sm">
            <div>Количество</div>
            <div>Цена за шт.</div>
            <div>Нетто</div>
            <div>НДС (20%)</div>
            <div>Итого с НДС</div>
            <div>Действия</div>
          </div>
          
          {/* Строки с ценами */}
          {tiers.map((tier, index) => (
            <div key={index} className="grid grid-cols-6 gap-4 p-3 border rounded-lg">
              <Input
                type="number"
                value={tier.qty}
                onChange={(e) => updateTier(index, 'qty', Number(e.target.value))}
                className="text-center"
              />
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  step="0.01"
                  value={tier.price}
                  onChange={(e) => updateTier(index, 'price', Number(e.target.value))}
                  className="text-center"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newPrice = prompt('Введите новую цену:', tier.price.toString());
                    if (newPrice !== null) {
                      updateTier(index, 'price', Number(newPrice));
                    }
                  }}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex items-center justify-center text-sm font-medium">
                £{tier.netPrice.toFixed(2)}
              </div>
              <div className="flex items-center justify-center text-sm font-medium">
                £{tier.vat.toFixed(2)}
              </div>
              <div className="flex items-center justify-center text-sm font-bold">
                £{tier.totalPrice.toFixed(2)}
              </div>
              <div className="flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeTier(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {/* Кнопки управления */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={addTier}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить строку
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Отмена
              </Button>
              <Button onClick={savePrices} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";

type Model = {
  slug: string;
  title: string;
  category: string;
  optionKeys: string[];
  options: Record<string, string[]>;
};

export default function GenericCalculator({ model }: { model: Model }) {
  const [selection, setSel] = useState<Record<string, string>>({});
  const [qty, setQty] = useState(100);
  const [res, setRes] = useState<{ net: number | null; vat: number | null; gross: number | null; modifiers?: { add: number; items: any[] } } | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [availableQuantities, setAvailableQuantities] = useState<number[]>([]);
  const [minQty, setMinQty] = useState<number>(1);
  const [maxQty, setMaxQty] = useState<number>(10000);
  const [modelData, setModelData] = useState<any>(null);
  const { addItem, openCart } = useCart();
  const router = useRouter();

  // Функция для обновления доступных количеств на основе выбранных параметров
  const updateAvailableQuantities = (modelData: any, currentSelection: Record<string, string>) => {
    if (!modelData || !modelData.rows) return;
    
    // Находим строку, которая соответствует выбранным параметрам
    const matchingRow = modelData.rows.find((row: any) => {
      const rowAttrs = row.attrs || {};
      return Object.keys(currentSelection).every(key => 
        rowAttrs[key] === currentSelection[key]
      );
    });
    
    if (matchingRow && matchingRow.rule && matchingRow.rule.tiers) {
      const quantities = matchingRow.rule.tiers
        .map((tier: any) => tier.qty)
        .sort((a: number, b: number) => a - b);
      
      setAvailableQuantities(quantities);
      
      if (quantities.length > 0) {
        setMinQty(quantities[0]);
        setMaxQty(quantities[quantities.length - 1]);
        
        // Устанавливаем первое доступное количество, если текущее не подходит
        if (qty < quantities[0] || qty > quantities[quantities.length - 1]) {
          setQty(quantities[0]);
        }
      }
    } else {
      // Если не найдена подходящая строка, показываем все количества
      const allQuantities = new Set<number>();
      modelData.rows.forEach((row: any) => {
        if (row.rule && row.rule.tiers) {
          row.rule.tiers.forEach((tier: any) => {
            allQuantities.add(tier.qty);
          });
        }
      });
      
      const sortedQuantities = Array.from(allQuantities).sort((a, b) => a - b);
      setAvailableQuantities(sortedQuantities);
      
      if (sortedQuantities.length > 0) {
        setMinQty(sortedQuantities[0]);
        setMaxQty(sortedQuantities[sortedQuantities.length - 1]);
      }
    }
  };

  // Автоподбор дефолтов (первые значения)
  useEffect(() => {
    const next: Record<string, string> = {};
    for (const k of model.optionKeys) {
      const vals = model.options[k];
      if (vals?.length) next[k] = vals[0];
    }
    // Добавляем дополнительные поля для заказа (не для расчета цены)
    next["Rush"] = "standard";
    setSel(next);
    
    // Загружаем данные модели
    const fetchModelData = async () => {
      try {
        const response = await fetch(`/api/pricing/models/${model.slug}`, { cache: 'no-store' });
        const data = await response.json();
        if (data.ok) {
          setModelData(data.model);
          updateAvailableQuantities(data.model, next);
        }
      } catch (error) {
        console.error('Error fetching model data:', error);
      }
    };
    
    fetchModelData();
  }, [model]);

  // Обновляем доступные количества при изменении выбора
  useEffect(() => {
    if (modelData && Object.keys(selection).length > 0) {
      updateAvailableQuantities(modelData, selection);
    }
  }, [selection, modelData]);

  const canQuote = useMemo(() => qty > 0 && Object.keys(selection).length > 0, [qty, selection]);

  async function quote() {
    try {
      // Отправляем данные из базы + Rush для расчета цены
      const dbSelection: Record<string, string> = {};
      for (const key of model.optionKeys) {
        if (selection[key]) {
          dbSelection[key] = selection[key];
        }
      }
      // Добавляем Rush для расчета модификаторов цены
      if (selection.Rush) {
        dbSelection.Rush = selection.Rush;
      }

      const r = await fetch("/api/quote/", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug: model.slug, selection: dbSelection, qty })
      });
      const data = await r.json();
      if (!data?.ok) return toast.error(data?.error ?? "Cannot calculate");
      setRes({ 
        net: data.breakdown?.net || 0, 
        vat: data.breakdown?.vat || 0, 
        gross: data.breakdown?.gross || 0,
        modifiers: data.breakdown?.modifiers || { add: 0, items: [] }
      });
    } catch {
      toast.error("Network error");
    }
  }

  const addToCart = () => {
    if (!res) {
      toast.error("Please calculate price first");
      return;
    }

    addItem({
      serviceName: model.title,
      serviceSlug: model.slug,
      parameters: { ...selection, Quantity: qty.toString() },
      quantity: qty,
      unitPrice: (res.gross || 0) / qty, // Цена за единицу включая VAT
      uploadedFile: uploadedFile || undefined, // Добавляем файл в корзину
      fileName: uploadedFile?.name,
      fileSize: uploadedFile?.size,
    });

    setAddedToCart(true);
    toast.success("Added to cart!");
    openCart();
  };

  const goToCheckout = () => {
    router.push('/checkout');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calculator Card - слева */}
      <Card className="border-px-cyan/20">
        <CardContent className="py-6">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-px-fg mb-2 font-playfair">Get Your Instant Quote</h3>
            <p className="text-px-muted">Configure your order and get pricing instantly</p>
          </div>

          <div className="space-y-4">
            {/* Quantity */}
            <div className="grid gap-2">
              <label className="text-sm font-medium text-px-fg">Quantity</label>
              
              {/* Кнопки с доступными количествами */}
              {availableQuantities.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {availableQuantities.map(n => (
                    <Button
                      key={n}
                      variant={qty === n ? "default" : "outline"}
                      size="sm"
                      onClick={() => setQty(n)}
                      className={`${qty === n ? "bg-px-cyan text-white" : ""} text-xs`}
                    >
                      {n}
                    </Button>
                  ))}
                </div>
              )}
              
              <Input
                type="number"
                min={minQty}
                max={maxQty}
                value={qty}
                onChange={(e) => {
                  const newQty = parseInt(e.target.value || minQty.toString(), 10);
                  // Ограничиваем введенное значение диапазоном
                  const clampedQty = Math.max(minQty, Math.min(maxQty, newQty));
                  setQty(clampedQty);
                }}
                className="border-zinc-200 focus:border-px-cyan focus:ring-px-cyan/20"
              />
              
              {availableQuantities.length > 0 && (
                <div className="text-xs text-px-muted">
                  Available range: {minQty} - {maxQty} pieces
                </div>
              )}
            </div>

            {/* Options */}
            {model.optionKeys.map((k, index) => (
              <div key={k} className="grid gap-2">
                <label className="text-sm font-medium text-px-fg">{k}</label>
                <Select value={selection[k]} onValueChange={(v) => setSel(prev => ({ ...prev, [k]: v }))}>
                  <SelectTrigger className="border-zinc-200 focus:border-px-cyan focus:ring-px-cyan/20">
                    <SelectValue placeholder={`Choose ${k}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {(model.options[k] ?? []).map(v => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}

            {/* Rush поле */}
            {!model.optionKeys.includes("Rush") && (
              <div className="grid gap-2">
                <label className="text-sm font-medium text-px-fg">Rush</label>
                <Select value={selection["Rush"]} onValueChange={(v) => setSel(prev => ({ ...prev, Rush: v }))}>
                  <SelectTrigger className="border-zinc-200 focus:border-px-cyan focus:ring-px-cyan/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="same-day">Same-day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Кнопка Calculate */}
            <div className="pt-4">
              <Button 
                onClick={quote} 
                disabled={!canQuote}
                className="w-full bg-gradient-to-r from-px-cyan to-px-magenta hover:from-px-cyan/90 hover:to-px-magenta/90 text-white py-2"
              >
                Calculate Price
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Summary - справа */}
      <Card className="border-px-cyan/20">
        <CardContent className="py-6">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-px-fg font-playfair">Order Summary</h3>
            <p className="text-sm text-px-muted">Review your order details</p>
          </div>
          
          {res ? (
            <div className="space-y-4">
              <div className="bg-zinc-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-px-muted">Base Price</span>
                  <span className="font-medium">£{((res.net || 0) - (res.modifiers?.add || 0)).toFixed(2)}</span>
                </div>
                
                {/* Модификаторы */}
                {res.modifiers?.items && res.modifiers.items.length > 0 && (
                  <div className="space-y-1">
                    {res.modifiers.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-px-muted">{item.name}</span>
                        <span className="font-medium">£{item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Rush информация */}
                <div className="flex justify-between text-sm">
                  <span className="text-px-muted">
                    Rush: {selection.Rush === 'same-day' ? 'Same-day (+20%)' : 'Standard (0%)'}
                  </span>
                  <span className="font-medium">
                    {selection.Rush === 'same-day' ? `+£${(((res.net || 0) - (res.modifiers?.add || 0)) * 0.20).toFixed(2)}` : '£0.00'}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-px-muted">Net Amount</span>
                  <span className="font-medium">£{res.net?.toFixed(2) ?? '0.00'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-px-muted">VAT (20%)</span>
                  <span className="font-medium">£{res.vat?.toFixed(2) ?? '0.00'}</span>
                </div>
                <div className="border-t border-zinc-200 pt-2">
                  <div className="flex justify-between text-lg font-bold text-px-fg">
                    <span>Total</span>
                    <span className="text-px-cyan">£{res.gross?.toFixed(2) ?? '0.00'}</span>
                  </div>
                </div>
              </div>

              {/* File Upload - только после расчета */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-px-fg">Upload Design File (Optional)</label>
                <Input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.ai,.eps,.psd"
                  className="border-zinc-200 focus:border-px-cyan focus:ring-px-cyan/20"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      // Проверяем размер файла (50MB)
                      if (file.size > 50 * 1024 * 1024) {
                        toast.error('File size must be less than 50MB');
                        return;
                      }
                      setUploadedFile(file);
                      toast.success(`File "${file.name}" selected`);
                    }
                  }}
                />
                {uploadedFile && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-800">{uploadedFile.name}</span>
                      <span className="text-xs text-green-600">
                        ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                  </div>
                )}
                <p className="text-xs text-px-muted">
                  Supported formats: PDF, JPG, PNG, AI, EPS, PSD (Max 10MB)
                </p>
              </div>
              
              <div className="pt-2">
                {!addedToCart ? (
                  <Button 
                    variant="outline" 
                    className="w-full border-px-magenta text-px-magenta hover:bg-px-magenta hover:text-white"
                    onClick={addToCart}
                  >
                    Add to Cart
                  </Button>
                ) : (
                  <Button 
                    className="w-full bg-gradient-to-r from-px-cyan to-px-magenta hover:from-px-cyan/90 hover:to-px-magenta/90 text-white"
                    onClick={goToCheckout}
                  >
                    Перейти в корзину
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-px-muted mb-2">No quote yet</div>
              <div className="text-sm text-px-muted">Configure your options and click "Calculate Price"</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

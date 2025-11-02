"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Calculator, ArrowRight, Star, Clock, Shield, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import { fetchOptions, fetchQuote, Attribute } from "@/lib/pricing-client";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTextSize } from "@/lib/languageStyles";

type ServiceData = {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: string;
  image: string | null;
  isActive: boolean;
  calculatorAvailable: boolean;
};

type ServiceMeta = { slug: string; name: string; category: string };

export default function ServicePage() {
  const { slug } = useParams() as { slug: string };
  const sp = useSearchParams();
  const { addItem, openCart } = useCart();
  const router = useRouter();
  const { t, language } = useLanguage();
  
  const [service, setService] = useState<ServiceData | null>(null);
  const [meta, setMeta] = useState<ServiceMeta | null>(null);
  const [attrs, setAttrs] = useState<Attribute[]>([]);
  const [selection, setSelection] = useState<Record<string, string>>({});
  const [qty, setQty] = useState<number>(Number(sp.get("qty") || 500));
  const [turnaround, setTurnaround] = useState("Standard");
  const [delivery, setDelivery] = useState("Pickup");
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quoteLoading, setQuoteLoading] = useState(false);
  interface UploadedFileInfo {
    id: string;
    file: File;
    filePath?: string;
    fileName: string;
    fileSize: number;
    uploading?: boolean;
    error?: string;
  }
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileInfo[]>([]);
  const [availableQuantities, setAvailableQuantities] = useState<number[]>([]);
  const [minQty, setMinQty] = useState<number>(1);
  const [maxQty, setMaxQty] = useState<number>(10000);
  const [modelData, setModelData] = useState<any>(null);
  const [presets, setPresets] = useState<Array<{id: number; label: string; selection: Record<string, string>}>>([]); // Готовые комбинации параметров
  const [availableOptions, setAvailableOptions] = useState<Record<string, string[]>>({}); // Доступные опции для каждого параметра на основе выбранных
  const [showHint, setShowHint] = useState<string | null>(null); // Ключ поля, над которым показывать подсказку

  // Функция для получения доступных количеств на основе выбранных параметров
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
        const currentQty = qty;
        if (currentQty < quantities[0] || currentQty > quantities[quantities.length - 1]) {
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

  useEffect(() => {
    const fetchService = async () => {
      try {
        // Сначала получаем данные услуги
        const servicesResponse = await fetch(`/api/pricing/services?t=${Date.now()}`, { cache: 'no-store' });
        const servicesData = await servicesResponse.json();
        
        if (servicesData.ok && servicesData.services) {
          const foundService = servicesData.services.find((s: any) => s.slug === slug);
          if (foundService) {
            setService(foundService);
            setMeta({ slug: foundService.slug, name: foundService.name, category: foundService.category });
          }
        }

        // Если есть калькулятор, загружаем опции
        if (service?.calculatorAvailable) {
          try {
            const d = await fetchOptions(slug);
            setAttrs(d.attributes);
            
            // Не устанавливаем автоматический выбор по умолчанию
            // Пользователь должен сам выбрать параметры или использовать бейджи
            setSelection({});
            console.log('No default selection - user should select from badges or manually');
            
            // Загружаем готовые комбинации параметров (пресеты)
            try {
              const presetsResponse = await fetch(`/api/pricing/presets?slug=${slug}`, { cache: 'no-store' });
              const presetsData = await presetsResponse.json();
              if (presetsData.ok) {
                setPresets(presetsData.presets);
                console.log('Loaded presets:', presetsData.presets.length);
              }
            } catch (e) {
              console.error('Error loading presets:', e);
            }
            
            // Инициализируем доступные опции - для первого параметра все опции доступны
            const mainAttrs = d.attributes.filter(a => a.isMain);
            if (mainAttrs.length > 0) {
              const firstMainKey = mainAttrs[0].key;
              setAvailableOptions({ [firstMainKey]: mainAttrs[0].values });
            }
            
            // Загружаем данные модели для расчета количеств
            const modelResponse = await fetch(`/api/pricing/models/${slug}`, { cache: 'no-store' });
            const modelData = await modelResponse.json();
            if (modelData.ok) {
              setModelData(modelData.model);
              updateAvailableQuantities(modelData.model, {});
            }
          } catch (e: any) { 
            console.error('Error fetching options:', e);
          }
        }
      } catch (error) {
        console.error('Error fetching service:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [slug, service?.calculatorAvailable]);

  // Обновляем доступные количества при изменении выбора
  useEffect(() => {
    if (modelData && Object.keys(selection).length > 0) {
      updateAvailableQuantities(modelData, selection);
    }
  }, [selection, modelData]);

  // Auto-scroll to calculator when coming from Quick Quote
  useEffect(() => {
    if (sp.get("qty") && !loading) {
      setTimeout(() => {
        const calculatorElement = document.getElementById("calculator-section");
        if (calculatorElement) {
          calculatorElement.scrollIntoView({ 
            behavior: "smooth", 
            block: "start" 
          });
        }
      }, 500); // Small delay to ensure page is loaded
    }
  }, [sp, loading]);

  // fetch quote
  async function recalc() {
    if (!meta || !service?.calculatorAvailable) return;
    
    // Проверяем, что selection не пустой
    if (!selection || Object.keys(selection).length === 0) {
      console.log('🔍 Recalc skipped - selection is empty');
      return;
    }
    
    setQuoteLoading(true);
    try {
      console.log('🔍 Recalc called with:', { slug, qty, selection, extras: { turnaround, delivery } });
      
      // Проверяем, что selection содержит основные параметры
      const mainAttrs = attrs.filter(a => a.isMain);
      const hasMainSelection = mainAttrs.every(attr => 
        selection[attr.key] && selection[attr.key].trim() !== ''
      );
      
      if (!hasMainSelection) {
        console.warn('Missing main parameter selection:', { mainAttrs, selection });
        // Находим первое незаполненное обязательное поле
        const firstMissingAttr = mainAttrs.find(attr => 
          !selection[attr.key] || selection[attr.key].trim() === ''
        );
        
        if (firstMissingAttr) {
          // Показываем дружелюбное сообщение
          toast.info('Please select all required options', {
            duration: 3000,
          });
          // Показываем подсказку над первым незаполненным полем
          setShowHint(firstMissingAttr.key);
          // Убираем подсказку через 5 секунд или при взаимодействии
          setTimeout(() => setShowHint(null), 5000);
        }
        setQuote(null);
        return;
      }
      
      // Если все обязательные поля заполнены, скрываем подсказки
      setShowHint(null);
      
      const q = await fetchQuote({ slug, qty, selection, extras: { turnaround, delivery } });
      
      // Если quote не валиден (комбинация не существует), просто не показываем цену
      if (!q || (q as any).ok === false) {
        console.log('Combination not available, clearing quote');
        setQuote(null);
        return;
      }
      
      setQuote(q);
    } catch (e: any) { 
      console.error('Quote calculation error:', e);
      
      // Если комбинация не существует - просто не показываем цену, без ошибки
      const errorMsg = e.message || '';
      if (errorMsg.includes('No matching') || errorMsg.includes('not found') || errorMsg.includes('not available')) {
        console.log('Combination not available, clearing quote');
        setQuote(null);
      } else {
        // Только для реальных ошибок показываем сообщение
        toast.error(errorMsg || t('service.messages.failedCalculate'));
        setQuote(null);
      }
    }
    finally { 
      setQuoteLoading(false); 
    }
  }
  
  // Загружаем доступные опции при изменении выбора (каскадный выбор)
  useEffect(() => {
    if (!slug || attrs.length === 0 || presets.length === 0) return;
    
    const mainAttrs = attrs.filter(a => a.isMain);
    console.log('🔄 Cascading selection update:', {
      selectionKeys: Object.keys(selection),
      mainAttrs: mainAttrs.map(a => a.key),
      presetsCount: presets.length
    });
    
    // Для каждого основного параметра загружаем доступные опции на основе предыдущих выборов
    mainAttrs.forEach((attr, index) => {
      if (index === 0) {
        // Первый параметр - всегда доступны все опции
        if (!availableOptions[attr.key]) {
          const allValues = new Set<string>();
          presets.forEach(p => {
            if (p.selection[attr.key]) allValues.add(p.selection[attr.key]);
          });
          const options = allValues.size > 0 ? Array.from(allValues).sort() : attr.values;
          setAvailableOptions(prev => ({ ...prev, [attr.key]: options }));
          console.log(`✅ First param "${attr.key}": ${options.length} options available`);
        }
      } else {
        // Для последующих - загружаем динамически на основе предыдущих выборов
        const previousSelection: Record<string, string> = {};
        for (let i = 0; i < index; i++) {
          const prevKey = mainAttrs[i].key;
          if (selection[prevKey]) {
            previousSelection[prevKey] = selection[prevKey];
          }
        }
        
        // Загружаем доступные опции для текущего параметра только если есть предыдущие выборы
        if (Object.keys(previousSelection).length > 0) {
          // Используем пресеты для определения доступных опций
          // Опция доступна, если есть пресет, где предыдущие параметры совпадают
          const availableForThisParam = new Set<string>();
          
          console.log(`🔍 Finding options for "${attr.key}" based on:`, previousSelection);
          
          presets.forEach(preset => {
            // Проверяем, совпадают ли предыдущие параметры
            const prevMatch = mainAttrs.slice(0, index).every(prevAttr => {
              const prevValue = previousSelection[prevAttr.key];
              const presetValue = preset.selection[prevAttr.key];
              return prevValue && presetValue && prevValue === presetValue;
            });
            
            if (prevMatch && preset.selection[attr.key]) {
              availableForThisParam.add(preset.selection[attr.key]);
            }
          });
          
          if (availableForThisParam.size > 0) {
            const sortedOptions = Array.from(availableForThisParam).sort();
            setAvailableOptions(prev => ({ 
              ...prev, 
              [attr.key]: sortedOptions 
            }));
            console.log(`✅ Param "${attr.key}": ${sortedOptions.length} options available:`, sortedOptions);
            
            // Если текущее значение не в доступных - сбрасываем его
            if (selection[attr.key] && !availableForThisParam.has(selection[attr.key])) {
              console.log(`⚠️ Current value "${selection[attr.key]}" for "${attr.key}" is not available, resetting`);
              const newSelection = { ...selection };
              delete newSelection[attr.key];
              
              // Также сбрасываем все последующие параметры
              for (let i = index; i < mainAttrs.length; i++) {
                delete newSelection[mainAttrs[i].key];
              }
              setSelection(newSelection);
            }
          } else {
            // Нет доступных опций - очищаем
            console.log(`⚠️ No options available for "${attr.key}"`);
            setAvailableOptions(prev => {
              const newOptions = { ...prev };
              delete newOptions[attr.key];
              return newOptions;
            });
          }
        } else {
          // Если нет предыдущих выборов - очищаем опции для этого параметра
          setAvailableOptions(prev => {
            const newOptions = { ...prev };
            delete newOptions[attr.key];
            return newOptions;
          });
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(selection), slug, attrs.length, presets.length]);
  
  useEffect(() => { 
    if (service?.calculatorAvailable && selection && Object.keys(selection).length > 0) {
      recalc(); 
    }
    /* eslint-disable-next-line */ 
  }, [meta, JSON.stringify(selection), qty, turnaround, delivery, service?.calculatorAvailable]);

  const addToCart = () => {
    if (!quote || !meta) {
      toast.error(t('service.messages.calculateFirst'));
      return;
    }

    const firstFile = uploadedFiles[0];
    addItem({
      serviceName: meta.name,
      serviceSlug: slug,
      parameters: selection,
      quantity: qty,
      unitPrice: quote.breakdown.gross / qty, // Цена за единицу включая VAT
      uploadedFile: firstFile?.file, // File объект (если нужен для совместимости)
      fileName: firstFile?.fileName,
      fileSize: firstFile?.fileSize,
      filePath: firstFile?.filePath, // URL в облачном хранилище
    });

    toast.success(t('service.messages.addedToCart'));
    openCart();
  };

  const proceedToCheckout = () => {
    if (!quote || !meta) {
      toast.error(t('service.messages.calculateFirst'));
      return;
    }

    // Добавляем в корзину и переходим к чекауту
    const firstFile = uploadedFiles[0];
    addItem({
      serviceName: meta.name,
      serviceSlug: slug,
      parameters: selection,
      quantity: qty,
      unitPrice: quote.breakdown.gross / qty,
      uploadedFile: firstFile?.file, // File объект (если нужен для совместимости)
      fileName: firstFile?.fileName,
      fileSize: firstFile?.fileSize,
      filePath: firstFile?.filePath, // URL в облачном хранилище
    });

    router.push('/checkout');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Добавляем файлы в состояние с флагом загрузки
    const newFiles: UploadedFileInfo[] = files.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
      file,
      fileName: file.name,
      fileSize: file.size,
      uploading: true,
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Загружаем каждый файл через API
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const baseIndex = uploadedFiles.length;
      
      try {
        // Проверка размера файла (300MB максимум)
        if (file.size > 300 * 1024 * 1024) {
          throw new Error(`File "${file.name}" is too large. Maximum size is 300MB.`);
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || result.message || 'Failed to upload file');
        }

        // Обновляем файл с полученным filePath используя базовый индекс
        setUploadedFiles(prev => prev.map((f, idx) => 
          idx === baseIndex + i
            ? { ...f, filePath: result.filePath, uploading: false }
            : f
        ));

        toast.success(`File "${file.name}" uploaded successfully`);
      } catch (error: any) {
        console.error('Error uploading file:', error);
        
        // Обновляем файл с ошибкой
        setUploadedFiles(prev => prev.map((f, idx) => 
          idx === baseIndex + i
            ? { ...f, uploading: false, error: error.message || 'Failed to upload file' }
            : f
        ));

        toast.error(`Failed to upload "${file.name}": ${error.message || 'Unknown error'}`);
      }
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-px-bg">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-px-cyan"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-px-bg">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className={`${getTextSize(language, 'sectionTitle')} font-bold text-px-fg mb-4`}>{t('service.messages.serviceNotFound')}</h1>
          <p className={`${getTextSize(language, 'description')} text-px-muted mb-8`}>{t('service.messages.serviceNotFoundDesc')}</p>
          <Link href="/pricing">
            <Button>{t('service.messages.viewAllServices')}</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const features = [
    {
      icon: Star,
      title: t('service.features.premiumQuality'),
      description: "High-quality printing with professional results",
      color: "px-cyan"
    },
    {
      icon: Clock,
      title: t('service.features.fastTurnaround'),
      description: "Quick delivery with same-day options available",
      color: "px-magenta"
    },
    {
      icon: Shield,
      title: t('service.features.secureProcessing'),
      description: "Safe file handling and secure payment processing",
      color: "px-yellow"
    },
    {
      icon: Truck,
      title: t('service.features.flexibleDelivery'),
      description: "Pickup, courier, or postal delivery options",
      color: "px-cyan"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-px-bg via-zinc-50 to-px-bg">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Badge variant="outline" className="mb-4 text-px-cyan border-px-cyan">
              {service.category}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight font-playfair mb-4">
              <span className="text-px-fg">{service.name}</span>
            </h1>
            <p className="text-xl text-px-muted max-w-3xl">
              {service.description}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
            {/* Main Content */}
            <div className="space-y-8">
              {/* Features */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('service.messages.whyChoose')} {service.name}?</CardTitle>
                  <CardDescription>{t('service.messages.professionalPrinting')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {features.map((feature, index) => (
                      <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="flex items-start space-x-3"
                      >
                        <div className={`w-10 h-10 rounded-full bg-${feature.color}/10 flex items-center justify-center flex-shrink-0`}>
                          <feature.icon className={`h-5 w-5 text-${feature.color}`} />
                        </div>
                        <div>
                          <h3 className="font-medium text-px-fg">{feature.title}</h3>
                          <p className="text-sm text-px-muted">{feature.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Calculator Section */}
              {service.calculatorAvailable && (
                <div id="calculator-section" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Calculator className="mr-2 h-5 w-5" />
                        {t('service.messages.calculateOrder')}
                      </CardTitle>
                      <CardDescription>{t('service.messages.configureService')} {service.name.toLowerCase()} {t('service.messages.getInstantQuote')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Main Options */}
                      {attrs.filter(a => a.isMain).length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 bg-px-cyan rounded-full"></div>
                            <h3 className="text-lg font-semibold text-px-fg">Main Options</h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {attrs.filter(a => a.isMain).map(a => {
                              const isMissing = !selection[a.key] || selection[a.key].trim() === '';
                              const showHintForThis = showHint === a.key && isMissing;
                              
                              return (
                                <div key={a.key} className="relative">
                                  <label className="block text-sm font-medium text-px-fg mb-2">{a.key}</label>
                                  
                                  {/* Подсказка-облачко */}
                                  {showHintForThis && (
                                    <div className="absolute -top-14 left-0 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                      <div className="bg-px-cyan text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap relative">
                                        <div className="absolute -bottom-1 left-4 w-2 h-2 bg-px-cyan rotate-45"></div>
                                        Please select {a.key} to continue
                                        <span className="ml-1">👇</span>
                                      </div>
                                    </div>
                                  )}
                                  
                                  <Select 
                                    value={selection[a.key] ?? ""} 
                                    onValueChange={(v) => {
                                      // При изменении параметра обновляем selection
                                      const newSelection: Record<string, string> = {};
                                      const paramIndex = attrs.filter(attr => attr.isMain).findIndex(attr => attr.key === a.key);
                                      
                                      // Сохраняем все предыдущие параметры
                                      attrs.filter(attr => attr.isMain).forEach((attr, idx) => {
                                        if (idx < paramIndex && selection[attr.key]) {
                                          newSelection[attr.key] = selection[attr.key];
                                        }
                                      });
                                      
                                      // Устанавливаем новое значение текущего параметра
                                      if (v) {
                                        newSelection[a.key] = v;
                                      }
                                      
                                      // Модификаторы сохраняем отдельно
                                      attrs.filter(attr => attr.isModifier).forEach(attr => {
                                        if (selection[attr.key]) {
                                          newSelection[attr.key] = selection[attr.key];
                                        }
                                      });
                                      
                                      setSelection(newSelection);
                                      setQuote(null); // Сбрасываем цену при изменении
                                      // Убираем подсказку при взаимодействии с полем
                                      if (showHint === a.key) {
                                        setShowHint(null);
                                      }
                                    }}
                                  >
                                    <SelectTrigger className={showHintForThis ? "ring-2 ring-px-cyan ring-offset-2" : ""}>
                                      <SelectValue placeholder={`${t('service.messages.chooseOption')} ${a.key}`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {(() => {
                                        const options = availableOptions[a.key] || [];
                                        return options.length > 0 ? (
                                          a.values.map(v => {
                                            const isAvailable = options.includes(v);
                                            return (
                                              <SelectItem 
                                                key={v} 
                                                value={v}
                                                disabled={!isAvailable}
                                                className={!isAvailable ? "opacity-50 cursor-not-allowed" : ""}
                                              >
                                                {v} {!isAvailable && "(Not available)"}
                                              </SelectItem>
                                            );
                                          })
                                        ) : (
                                          a.values.map(v => (
                                            <SelectItem key={v} value={v} disabled>No options available</SelectItem>
                                          ))
                                        );
                                      })()}
                                    </SelectContent>
                                  </Select>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Presets - готовые комбинации под Main Options */}
                      {presets.length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 bg-px-cyan rounded-full"></div>
                            <h3 className="text-lg font-semibold text-px-fg">Quick Select</h3>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {presets.map((preset) => {
                              // Проверяем, активен ли этот пресет (все его параметры выбраны)
                              const isActive = Object.keys(preset.selection).every(
                                key => selection[key] === preset.selection[key]
                              );
                              
                              return (
                                <Badge
                                  key={preset.id}
                                  variant={isActive ? "default" : "outline"}
                                  className={`cursor-pointer px-4 py-2 text-sm transition-all ${
                                    isActive 
                                      ? "bg-px-cyan text-white border-px-cyan" 
                                      : "hover:bg-px-cyan/10 hover:border-px-cyan"
                                  }`}
                                  onClick={() => {
                                    // При клике заполняем все параметры из пресета
                                    setSelection(preset.selection);
                                  }}
                                >
                                  {preset.label}
                                </Badge>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Modifier Options */}
                      {attrs.filter(a => a.isModifier).length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 bg-px-magenta rounded-full"></div>
                            <h3 className="text-lg font-semibold text-px-fg">Add-ons (optional)</h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {attrs.filter(a => a.isModifier).map(a => (
                              <div key={a.key}>
                                <label className="block text-sm font-medium text-px-fg mb-2">{a.key}</label>
                                <Select 
                                  value={selection[a.key] || "None"} 
                                  onValueChange={(v) => {
                                    if (v === "None") {
                                      const newSelection = { ...selection };
                                      delete newSelection[a.key];
                                      setSelection(newSelection);
                                    } else {
                                      setSelection({ ...selection, [a.key]: v });
                                    }
                                  }}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder={`Choose ${a.key}`} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="None">None</SelectItem>
                                    {a.values.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Fallback for non-main, non-modifier attributes */}
                      {attrs.filter(a => !a.isMain && !a.isModifier).length > 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <h3 className="text-lg font-semibold text-px-fg">Additional Options</h3>
                          </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {attrs.filter(a => !a.isMain && !a.isModifier).map(a => {
                              return (
                                <div key={a.key}>
                                  <label className="block text-sm font-medium text-px-fg mb-2">{a.key}</label>
                                  <Select 
                                    value={selection[a.key] ?? ""} 
                                    onValueChange={(v) => {
                                      const newSelection: Record<string, string> = { ...selection };
                                      const paramIndex = attrs.filter(attr => !attr.isMain && !attr.isModifier).findIndex(attr => attr.key === a.key);
                                      
                                      // Сбрасываем последующие параметры
                                      attrs.filter(attr => !attr.isMain && !attr.isModifier).forEach((attr, idx) => {
                                        if (idx > paramIndex) {
                                          delete newSelection[attr.key];
                                        }
                                      });
                                      
                                      if (v) {
                                        newSelection[a.key] = v;
                                      } else {
                                        delete newSelection[a.key];
                                      }
                                      
                                      setSelection(newSelection);
                                    }}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder={`${t('service.messages.chooseOption')} ${a.key}`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {a.values.length > 0 ? (
                                        a.values.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)
                                      ) : (
                                        <SelectItem value="" disabled>No options available</SelectItem>
                                      )}
                                    </SelectContent>
                                  </Select>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Quantity */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className={`block ${getTextSize(language, 'small')} font-medium text-px-fg`}>{t('service.quantity')}</label>
                          {sp.get("qty") && (
                            <span className="text-xs text-px-cyan bg-px-cyan/10 px-2 py-1 rounded-full">
                              Pre-filled from Quick Quote
                            </span>
                          )}
                        </div>
                        <div className="space-y-4">
                          <div className="flex flex-wrap gap-2">
                            {availableQuantities.map(n => (
                              <Button 
                                key={n} 
                                variant={qty === n ? "default" : "outline"} 
                                size="sm"
                                onClick={() => setQty(n)}
                                className={`${qty === n ? "bg-px-cyan text-white" : ""} text-xs sm:text-sm`}
                              >
                                {n}
                              </Button>
                            ))}
                          </div>
                          <div className="flex items-center space-x-2">
                            <Input 
                              type="number" 
                              min={1}
                              value={qty} 
                              onChange={e => {
                                const newQty = Number(e.target.value || 1);
                                // Убираем ограничения - клиент может ввести любое количество
                                setQty(Math.max(1, newQty));
                              }} 
                              className="w-24 sm:w-32"
                            />
                            <span className="text-sm text-px-muted">pcs</span>
                          </div>
                          <div className="text-xs text-px-muted">
                            Enter any quantity - pricing will be calculated automatically
                          </div>
                        </div>
                      </div>

                      {/* Turnaround & Delivery */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className={`block ${getTextSize(language, 'small')} font-medium text-px-fg mb-2`}>{t('service.turnaround')}</label>
                          <Select value={turnaround} onValueChange={setTurnaround}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Standard">{t('service.standard')} (2–3 days)</SelectItem>
                              <SelectItem value="Express">{t('service.express')} (next day)</SelectItem>
                              <SelectItem value="Same-day">Same-day (order by 1pm)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className={`block ${getTextSize(language, 'small')} font-medium text-px-fg mb-2`}>{t('service.delivery')}</label>
                          <Select value={delivery} onValueChange={setDelivery}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pickup">{t('service.pickup')} (EC1A)</SelectItem>
                              <SelectItem value="Courier">{t('service.courier')} (London same-day)</SelectItem>
                              <SelectItem value="Post">Post (UK)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* File Upload */}
                      <div>
                        <label className={`block ${getTextSize(language, 'small')} font-medium text-px-fg mb-2`}>{t('service.uploadArtwork')}</label>
                        <div className="space-y-3">
                          <div className="relative group">
                            <div className="border-2 border-dashed border-gray-300 hover:border-px-cyan transition-colors duration-200 rounded-lg p-4 text-center bg-gradient-to-r from-gray-50 to-white hover:from-px-cyan/5 hover:to-px-magenta/5">
                              <div className="flex items-center justify-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-px-cyan to-px-magenta rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                  </svg>
                                </div>
                                <div className="text-left">
                                  <p className={`${getTextSize(language, 'small')} font-medium text-px-fg`}>{t('service.messages.dropFiles')}</p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <div className="flex space-x-1">
                                      <span className="px-1.5 py-0.5 bg-px-cyan/10 text-px-cyan rounded text-xs">PDF</span>
                                      <span className="px-1.5 py-0.5 bg-px-magenta/10 text-px-magenta rounded text-xs">AI</span>
                                      <span className="px-1.5 py-0.5 bg-px-yellow/10 text-px-yellow rounded text-xs">PSD</span>
                                      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">JPG/PNG</span>
                                    </div>
                                    <span className="text-xs text-px-muted">• Max 300MB</span>
                                  </div>
                                </div>
                              </div>
                              <input 
                                type="file" 
                                accept=".pdf,.ai,.psd,.tif,.tiff,.jpg,.jpeg,.png" 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                multiple
                                onChange={handleFileUpload}
                              />
                            </div>
                          </div>
                          
                          {/* Uploaded Files List */}
                          {uploadedFiles.length > 0 && (
                            <div className="space-y-2">
                              <p className={`${getTextSize(language, 'small')} font-medium text-px-fg`}>{t('service.uploadedFiles')}:</p>
                              {uploadedFiles.map((fileInfo, index) => (
                                <div key={fileInfo.id} className={`flex items-center justify-between p-2 rounded-lg ${
                                  fileInfo.error ? 'bg-red-50 border border-red-200' : 
                                  fileInfo.uploading ? 'bg-blue-50 border border-blue-200' : 
                                  fileInfo.filePath ? 'bg-green-50 border border-green-200' : 
                                  'bg-gray-50'
                                }`}>
                                  <div className="flex items-center space-x-2 flex-1">
                                    {fileInfo.uploading ? (
                                      <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                                        <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                      </div>
                                    ) : fileInfo.error ? (
                                      <div className="w-6 h-6 bg-red-100 rounded flex items-center justify-center">
                                        <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </div>
                                    ) : fileInfo.filePath ? (
                                      <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                                        <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                      </div>
                                    ) : (
                                      <div className="w-6 h-6 bg-px-cyan/10 rounded flex items-center justify-center">
                                        <svg className="w-3 h-3 text-px-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-px-fg truncate">{fileInfo.fileName}</p>
                                      <div className="flex items-center space-x-2">
                                        <p className="text-xs text-px-muted">{(fileInfo.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                                        {fileInfo.uploading && (
                                          <span className="text-xs text-blue-600">Uploading...</span>
                                        )}
                                        {fileInfo.error && (
                                          <span className="text-xs text-red-600 truncate">{fileInfo.error}</span>
                                        )}
                                        {fileInfo.filePath && (
                                          <span className="text-xs text-green-600">✓ Uploaded</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  {!fileInfo.uploading && (
                                    <button
                                      onClick={() => removeFile(index)}
                                      className="text-red-500 hover:text-red-700 transition-colors ml-2 flex-shrink-0"
                                      title="Remove file"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Sidebar - Quote Summary */}
            {service.calculatorAvailable && (
              <div 
                className="lg:sticky lg:top-[76px] lg:self-start lg:h-fit"
              >
                <Card className="p-6 shadow-lg">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-px-fg">{service.name}</h3>
                    <p className="text-sm text-px-muted">Quantity: {qty} pieces</p>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {quoteLoading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-px-cyan mx-auto"></div>
                        <p className="text-sm text-px-muted mt-2">Calculating...</p>
                      </div>
                    ) : quote ? (
                      <>
                        <div className="flex justify-between text-sm">
                          <span>Items (net)</span>
                          <span>£{(quote.breakdown.base.net || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-px-muted">
                          <span>Modifiers</span>
                          <span>£{(quote.breakdown.modifiers.add || 0).toFixed(2)}</span>
                        </div>
                        <div className="border-t pt-2">
                          <div className="flex justify-between text-sm">
                            <span>Subtotal</span>
                            <span>£{(quote.breakdown.net || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm text-px-muted">
                            <span>
                              {(() => {
                                const net = quote.breakdown.net || 0;
                                const vat = quote.breakdown.vat || 0;
                                // Вычисляем процент VAT: если net > 0, то процент = (vat / net) * 100, иначе 0%
                                const vatPercent = net > 0 ? Math.round((vat / net) * 100) : 0;
                                return `VAT (${vatPercent}%)`;
                              })()}
                            </span>
                            <span>£{(quote.breakdown.vat || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-lg font-semibold mt-2">
                            <span>Total (inc VAT)</span>
                            <span>£{(quote.breakdown.gross || 0).toFixed(2)}</span>
                          </div>
                          {quote.breakdown.unit && (
                            <p className="text-xs text-px-muted mt-1">
                              ~ £{quote.breakdown.unit.toFixed(3)} per unit
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4">
                        <p className={`${getTextSize(language, 'small')} text-px-muted`}>{t('service.messages.selectOptions')}</p>
                      </div>
                    )}
                  </div>

                  {quote && (
                    <div className="space-y-3">
                      <Button 
                        onClick={addToCart}
                        className="w-full bg-gradient-to-r from-px-cyan to-px-magenta hover:from-px-cyan/90 hover:to-px-magenta/90 text-white"
                      >
{t('service.addToCart')}
                      </Button>
                      <Button 
                        onClick={proceedToCheckout}
                        variant="outline"
                        className="w-full"
                      >
{t('service.messages.proceedCheckout')}
                      </Button>
                    </div>
                  )}
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

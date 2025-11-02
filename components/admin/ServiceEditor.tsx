"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface Parameter {
  id: string;
  name: string;
  affectsPrice: boolean;
  priceType?: 'add' | 'all'; // 'add' = добавляет к цене, 'all' = заменяет цену
  parameterType?: 'single' | 'multi' | 'boolean' | 'numeric'; // Тип параметра
  isMain: boolean; // Главный элемент (базовая цена)
  isAddon: boolean; // Уникальная опция (add-on), не включается в комбинации базовых параметров
  options: ParameterOption[];
}

interface AddOnOption {
  id: string;
  name: string; // Название доп опции (например "Paper", "Lamination")
  value: string; // Значение доп опции (например "Glossy", "Matte")
  modifier: number; // Модификатор цены за штуку (+0.5£)
}

interface ParameterOption {
  id: string;
  name: string;
  tiers: PriceTier[];
  addOnOptions: AddOnOption[]; // Массив доп опций для Main параметра
  originalRowId?: number; // ID оригинальной строки в базе данных
  originalName?: string; // Исходное имя опции для отслеживания переименований
  modifierType?: 'absolute' | 'percent' | 'none'; // Тип модификатора цены
  modifierValue?: number; // Значение модификатора
}

interface PriceTier {
  id: string;
  quantity: number;
  price: number;
  includeVat?: boolean; // Включен ли VAT для этого тира (по умолчанию true)
  originalTierId?: number; // ID оригинального тира в базе данных
}

interface ServiceEditorProps {
  serviceSlug: string;
  serviceName: string;
  onClose: () => void;
}

export default function ServiceEditor({ serviceSlug, serviceName, onClose }: ServiceEditorProps) {
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showExistingParams, setShowExistingParams] = useState(false);
  const [previewPrice, setPreviewPrice] = useState<number | null>(null);
  const [previewModifiers, setPreviewModifiers] = useState<any[]>([]);
  const [initialParameters, setInitialParameters] = useState<Parameter[]>([]); // Для отслеживания удаленных параметров

  useEffect(() => {
    loadExistingParameters();
  }, [serviceSlug]);

  const loadExistingParameters = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/prices/services/by-slug/${serviceSlug}/rows`);
      const data = await response.json();
      
      if (data.ok) {
        console.log('🔍 ServiceEditor: Loaded rows from API:', data.rows);
        // Парсим существующие параметры из attrs
        const existingParams = parseExistingParameters(data.rows);
        console.log('🔍 ServiceEditor: Parsed parameters:', existingParams);
        setParameters(existingParams);
        setInitialParameters(existingParams); // Сохраняем начальное состояние для отслеживания удалений
      }
    } catch (error) {
      console.error('Error loading parameters:', error);
      toast.error('Failed to load existing parameters');
    } finally {
      setLoading(false);
    }
  };

  const parseExistingParameters = (rows: any[]) => {
    console.log('🔍 Parsing existing rows:', rows);
    
    // Фильтруем только активные строки
    const activeRows = rows.filter((row: any) => row.isActive !== false);
    console.log(`🔍 Active rows: ${activeRows.length} out of ${rows.length}`);
    
    // Структура для хранения данных всех строк
    const rowsData: Array<{
      attrs: Record<string, string>;
      tiers: any[];
      rowId: number;
      includeVat: boolean;
      paramCount: number;
    }> = [];
    
    // ПРОХОД 1: Собираем данные всех строк
    activeRows.forEach(row => {
      const attrs = typeof row.attrs === 'string' ? JSON.parse(row.attrs) : row.attrs;
      const cleanAttrs: Record<string, string> = {};
      
      // Очищаем от служебных полей
      Object.entries(attrs).forEach(([key, value]) => {
        if (key.startsWith('_') || 
            ['PRICE', 'NET PRICE', 'VAT', 'Price +VAT', 'Qty'].includes(key)) {
          return;
        }
        if (typeof value === 'string' && value.trim() !== '') {
          cleanAttrs[key] = value.trim();
        }
      });
      
      if (Object.keys(cleanAttrs).length === 0) return;
      
      const paramCount = Object.keys(cleanAttrs).length;
      const includeVat = attrs._includeVat !== 'false';
      
      // Сохраняем данные строки
      rowsData.push({
        attrs: cleanAttrs,
        tiers: row.tiers || [],
        rowId: row.id,
        includeVat,
        paramCount
      });
    });
    
    // Определяем все уникальные параметры для понимания структуры
    const allParams = new Set<string>();
    rowsData.forEach(rowData => {
      Object.keys(rowData.attrs).forEach(param => allParams.add(param));
    });
    
    // Определяем Main параметр (параметр, который встречается чаще всего и имеет больше всего уникальных значений)
    const paramStats = new Map<string, { count: number; uniqueValues: Set<string> }>();
    rowsData.forEach(rowData => {
      Object.entries(rowData.attrs).forEach(([paramName, value]) => {
        if (!paramStats.has(paramName)) {
          paramStats.set(paramName, { count: 0, uniqueValues: new Set() });
        }
        const stat = paramStats.get(paramName)!;
        stat.count++;
        stat.uniqueValues.add(value);
      });
    });
    
    // Находим параметр с наибольшим количеством уникальных значений
    let mainParamName: string | null = null;
    let maxUniqueValues = 0;
    paramStats.forEach((stat, paramName) => {
      if (stat.uniqueValues.size > maxUniqueValues) {
        maxUniqueValues = stat.uniqueValues.size;
        mainParamName = paramName;
      }
    });
    
    console.log('🔍 Main parameter identified:', mainParamName);
    
    // ПРОХОД 2: Группируем rows по Main параметру и извлекаем доп опции
    const paramMap = new Map<string, Parameter>();
    
    if (mainParamName) {
      // Создаем Main параметр
      const mainParamNameString: string = mainParamName;
      const mainParam: Parameter = {
        id: mainParamNameString.toLowerCase().replace(/\s+/g, '-'),
        name: mainParamNameString,
        affectsPrice: true,
        priceType: 'all',
        parameterType: 'single',
        isMain: true,
        isAddon: false,
        options: []
      };
      paramMap.set(mainParamNameString, mainParam);
      
      // Группируем rows по значению Main параметра
      const groupedByMainValue = new Map<string, typeof rowsData>();
      
      rowsData.forEach(rowData => {
        const mainValue = rowData.attrs[mainParamNameString];
        if (!mainValue) return;
        
        if (!groupedByMainValue.has(mainValue)) {
          groupedByMainValue.set(mainValue, []);
        }
        groupedByMainValue.get(mainValue)!.push(rowData);
      });
      
      // Создаем опции Main параметра с доп опциями
      groupedByMainValue.forEach((groupRows, mainValue) => {
        // Берем tiers из первой строки группы (они должны быть одинаковыми)
        const firstRow = groupRows[0];
        const tiers: PriceTier[] = (firstRow.tiers || []).map((tier: any) => ({
          id: `tier-${tier.id}-${firstRow.rowId}`,
          quantity: tier.qty,
          price: tier.unit,
          includeVat: firstRow.includeVat,
          originalTierId: tier.id
        }));
        
        // Извлекаем доп опции из attrs (все кроме Main параметра)
        const addOnOptions: AddOnOption[] = [];
        const addOnMap = new Map<string, Set<string>>(); // name -> values
        
        groupRows.forEach(rowData => {
          Object.entries(rowData.attrs).forEach(([paramName, value]) => {
            if (paramName !== mainParamNameString) {
              if (!addOnMap.has(paramName)) {
                addOnMap.set(paramName, new Set());
              }
              addOnMap.get(paramName)!.add(value);
            }
          });
        });
        
        // Создаем доп опции (для каждого уникального name-value сочетания)
        // ВАЖНО: Модификатор (modifier) не хранится в БД, его нужно будет задавать вручную
        // Или можно попробовать вычислить из tiers, но это сложно
        addOnMap.forEach((values, addOnName) => {
          values.forEach(value => {
            addOnOptions.push({
              id: `addon-${addOnName}-${value}-${firstRow.rowId}`,
              name: addOnName,
              value: value,
              modifier: 0 // По умолчанию 0, нужно будет задать вручную
            });
          });
        });
        
        // Создаем опцию Main параметра
        const option: ParameterOption = {
          id: `${mainParamNameString.toLowerCase().replace(/\s+/g, '-')}-${mainValue.toLowerCase().replace(/\s+/g, '-')}-${firstRow.rowId}`,
          name: mainValue,
          tiers,
          addOnOptions,
          originalRowId: firstRow.rowId,
          originalName: mainValue
        };
        
        mainParam.options.push(option);
      });
      
      // Создаем остальные параметры как обычные (не Main, не Addon)
      allParams.forEach(paramName => {
        if (paramName === mainParamNameString) return;
        
        if (!paramMap.has(paramName)) {
          paramMap.set(paramName, {
            id: paramName.toLowerCase().replace(/\s+/g, '-'),
            name: paramName,
            affectsPrice: true,
            priceType: 'add',
            parameterType: 'single',
            isMain: false,
            isAddon: false,
            options: []
          });
        }
        
        const param = paramMap.get(paramName)!;
        
        // Собираем уникальные значения этого параметра
        const uniqueValues = new Set<string>();
        rowsData.forEach(rowData => {
          const value = rowData.attrs[paramName];
          if (value) uniqueValues.add(value);
        });
        
        uniqueValues.forEach(value => {
          const existingOption = param.options.find(opt => opt.name === value);
          if (!existingOption) {
            param.options.push({
              id: `${paramName.toLowerCase().replace(/\s+/g, '-')}-${value.toLowerCase().replace(/\s+/g, '-')}`,
              name: value,
              tiers: [],
              addOnOptions: []
            });
          }
        });
      });
    } else {
      // Fallback: старая логика, если Main параметр не определен
      console.warn('⚠️ Main parameter not found, using fallback logic');
      
      rowsData.forEach(rowData => {
        Object.entries(rowData.attrs).forEach(([paramName, optionValue]) => {
          if (!paramMap.has(paramName)) {
            paramMap.set(paramName, {
              id: paramName.toLowerCase().replace(/\s+/g, '-'),
              name: paramName,
              affectsPrice: true,
              priceType: 'all',
              parameterType: 'single',
              isMain: false,
              isAddon: false,
              options: []
            });
          }
          
          const param = paramMap.get(paramName)!;
          const existingOption = param.options.find(opt => opt.name === optionValue);
          if (!existingOption) {
            param.options.push({
              id: `${paramName.toLowerCase().replace(/\s+/g, '-')}-${optionValue.toLowerCase().replace(/\s+/g, '-')}`,
              name: optionValue,
              tiers: [],
              addOnOptions: []
            });
          }
        });
      });
    }
    
    const result = Array.from(paramMap.values());
    
    console.log('🔍 Parsed parameters:', result);
    console.log(`🔍 Total parameters: ${result.length}, Total rows processed: ${rowsData.length}`);
    return result;
  };

  const addParameter = () => {
    const newParam: Parameter = {
      id: `param-${Date.now()}`,
      name: '',
      affectsPrice: true,
      priceType: 'all',
      parameterType: 'single',
      isMain: false,
      isAddon: false,
      options: []
    };
    setParameters([...parameters, newParam]);
  };

  const updateParameter = (paramId: string, updates: Partial<Parameter>) => {
    setParameters(prev => 
      prev.map(param => 
        param.id === paramId ? { ...param, ...updates } : param
      )
    );
  };

  const toggleMainParameter = (paramId: string) => {
    setParameters(prev => 
      prev.map(param => {
        if (param.id === paramId) {
          return {
        ...param,
            isMain: !param.isMain,
            isAddon: false // Если делаем главным, убираем add-on
          };
        }
        return {
          ...param,
          isMain: false // Только один может быть главным
        };
      })
    );
  };

  const toggleAddonParameter = (paramId: string) => {
    setParameters(prev => 
      prev.map(param => {
        if (param.id === paramId) {
          return {
            ...param,
            isAddon: !param.isAddon,
            isMain: false // Если делаем add-on, убираем главный
          };
        }
        return param;
      })
    );
  };

  const deleteParameter = (paramId: string) => {
    const param = parameters.find(p => p.id === paramId);
    if (!param) return;
    
    // Валидация: проверяем, есть ли у параметра опции с тирами
    const optionsWithTiers = param.options.filter(opt => opt.tiers && opt.tiers.length > 0);
    if (optionsWithTiers.length > 0) {
      const totalTiers = optionsWithTiers.reduce((sum, opt) => sum + opt.tiers.length, 0);
      toast.error(`Cannot delete parameter "${param.name}" because it has ${totalTiers} price tier(s) in ${optionsWithTiers.length} option(s). Please delete all tiers first.`);
      return;
    }
    
    setParameters(prev => prev.filter(param => param.id !== paramId));
  };

  const addOption = (paramId: string) => {
    const newOption: ParameterOption = {
      id: `option-${Date.now()}`,
      name: '',
      tiers: [{ id: `tier-${Date.now()}`, quantity: 100, price: 1 }],
      addOnOptions: []
    };
    
    updateParameter(paramId, {
      options: [...parameters.find(p => p.id === paramId)?.options || [], newOption]
    });
  };

  const addAddOnOption = (paramId: string, optionId: string) => {
    const newAddOn: AddOnOption = {
      id: `addon-${Date.now()}`,
      name: '',
      value: '',
      modifier: 0
    };
    
    const param = parameters.find(p => p.id === paramId);
    const option = param?.options.find(o => o.id === optionId);
    if (!option) return;
    
    updateOption(paramId, optionId, {
      addOnOptions: [...(option.addOnOptions || []), newAddOn]
    });
  };

  const updateAddOnOption = (paramId: string, optionId: string, addOnId: string, updates: Partial<AddOnOption>) => {
    const param = parameters.find(p => p.id === paramId);
    const option = param?.options.find(o => o.id === optionId);
    if (!option) return;
    
    updateOption(paramId, optionId, {
      addOnOptions: (option.addOnOptions || []).map(addOn =>
        addOn.id === addOnId ? { ...addOn, ...updates } : addOn
      )
    });
  };

  const deleteAddOnOption = (paramId: string, optionId: string, addOnId: string) => {
    const param = parameters.find(p => p.id === paramId);
    const option = param?.options.find(o => o.id === optionId);
    if (!option) return;
    
    updateOption(paramId, optionId, {
      addOnOptions: (option.addOnOptions || []).filter(addOn => addOn.id !== addOnId)
    });
  };

  const updateOption = (paramId: string, optionId: string, updates: Partial<ParameterOption>) => {
    updateParameter(paramId, {
      options: parameters.find(p => p.id === paramId)?.options.map(opt => 
        opt.id === optionId ? { ...opt, ...updates } : opt
      ) || []
    });
  };

  const deleteOption = (paramId: string, optionId: string) => {
    const param = parameters.find(p => p.id === paramId);
    if (!param) return;
    
    const option = param.options.find(opt => opt.id === optionId);
    if (!option) return;
    
    // Валидация: нельзя удалить опцию, если у нее есть тиры
    if (option.tiers && option.tiers.length > 0) {
      toast.error(`Cannot delete option "${option.name}" because it has ${option.tiers.length} price tier(s). Please delete all tiers first.`);
      return;
    }
    
    updateParameter(paramId, {
      options: param.options.filter(opt => opt.id !== optionId)
    });
  };

  const addTier = (paramId: string, optionId: string) => {
    const param = parameters.find(p => p.id === paramId);
    const option = param?.options.find(o => o.id === optionId);
    if (!option) return;

    const newTier: PriceTier = {
      id: `tier-${Date.now()}`,
      quantity: 100,
      price: 1,
      includeVat: true // По умолчанию VAT включен
    };

    updateOption(paramId, optionId, {
      tiers: [...option.tiers, newTier]
    });
  };

  const updateTier = (paramId: string, optionId: string, tierId: string, updates: Partial<PriceTier>) => {
    const param = parameters.find(p => p.id === paramId);
    const option = param?.options.find(o => o.id === optionId);
    if (!option) return;

    updateOption(paramId, optionId, {
      tiers: option.tiers.map(tier => 
        tier.id === tierId ? { ...tier, ...updates } : tier
      )
    });
  };

  const deleteTier = (paramId: string, optionId: string, tierId: string) => {
    const param = parameters.find(p => p.id === paramId);
    const option = param?.options.find(o => o.id === optionId);
    if (!option) return;

    // Валидация: нельзя удалить последний тир, если это единственный тир в опции
    if (option.tiers.length === 1) {
      toast.error('Cannot delete the last price tier. Please add another tier first or delete the option.');
      return;
    }

    updateOption(paramId, optionId, {
      tiers: option.tiers.filter(tier => tier.id !== tierId)
    });
  };


  const calculatePreviewPrice = async (selectedAttrs: any) => {
    try {
      const response = await fetch('/api/admin/prices/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attrs: selectedAttrs,
          basePrice: 500 // Базовая цена
        })
      });
      
      const data = await response.json();
      if (data.ok) {
        setPreviewPrice(data.finalPrice);
        setPreviewModifiers(data.modifiers);
      }
    } catch (error) {
      console.error('Preview calculation error:', error);
    }
  };


  const saveParameters = async () => {
    try {
      setSaving(true);
      
      console.log('🔍 Starting save process...');
      console.log('🔍 Current parameters:', parameters);
      
      // Валидация: проверяем, что есть хотя бы один параметр с опциями
      const validParams = parameters.filter(p => p.name.trim() && p.options.length > 0);
      if (validParams.length === 0) {
        toast.error('Please add at least one parameter with options before saving');
        setSaving(false);
        return;
      }
      
      // Валидация: проверяем, что все опции имеют непустые имена
      for (const param of validParams) {
        for (const option of param.options) {
          if (!option.name.trim()) {
            toast.error(`Please fill in all option names for parameter "${param.name}"`);
            setSaving(false);
            return;
          }
        }
      }
      
      // Получаем существующие строки
      const response = await fetch(`/api/admin/prices/services/by-slug/${serviceSlug}/rows`);
      const data = await response.json();
      
      if (!data.ok) {
        throw new Error('Failed to load existing data');
      }
      
      console.log('🔍 Existing rows before save:', data.rows);
      
      // Определяем удаленные параметры (сравниваем initialParameters с текущими)
      const currentParamNames = new Set(parameters.map(p => p.name));
      const deletedParamNames = initialParameters
        .filter(p => !currentParamNames.has(p.name))
        .map(p => p.name);
      
      if (deletedParamNames.length > 0) {
        console.log(`🗑️ Detected deleted parameters: ${deletedParamNames.join(', ')}`);
      }
      
      // Определяем удаленные опции для каждого параметра
      // Структура: paramName -> Set<deletedOptionNames>
      // ВАЖНО: Сравниваем по ID опций, а не по именам, чтобы не удалять переименованные опции
      const deletedOptionsMap = new Map<string, Set<string>>();
      initialParameters.forEach(initialParam => {
        const currentParam = parameters.find(p => p.id === initialParam.id);
        if (!currentParam) return; // Параметр удален полностью - это обрабатывается отдельно
        
        // Сравниваем по originalRowId или id опции, а не по имени
        const currentOptionIds = new Set(
          currentParam.options.map(opt => opt.originalRowId?.toString() || opt.id)
        );
        const deletedOptions = initialParam.options
          .filter(opt => {
            const optId = opt.originalRowId?.toString() || opt.id;
            return !currentOptionIds.has(optId);
          })
          .map(opt => opt.name);
        
        if (deletedOptions.length > 0) {
          deletedOptionsMap.set(currentParam.name, new Set(deletedOptions));
          console.log(`🗑️ Detected deleted options in "${currentParam.name}": ${deletedOptions.join(', ')}`);
        }
      });
      
      // Создаем карту исходных имен для отслеживания переименований
      // Структура: paramName -> optionOriginalName -> optionCurrentName
      const originalToCurrentNamesMap = new Map<string, Map<string, string>>();
      initialParameters.forEach(initialParam => {
        const currentParam = parameters.find(p => p.id === initialParam.id);
        if (!currentParam) return; // Параметр удален
        
        const optionMap = new Map<string, string>();
        initialParam.options.forEach(initialOption => {
          const currentOption = currentParam.options.find(opt => opt.id === initialOption.id);
          if (currentOption && currentOption.name !== initialOption.name) {
            // Опция переименована
            optionMap.set(initialOption.name, currentOption.name);
            console.log(`🔄 Renamed option: "${initialParam.name}" "${initialOption.name}" → "${currentOption.name}"`);
          }
        });
        if (optionMap.size > 0) {
          originalToCurrentNamesMap.set(currentParam.name, optionMap);
        }
      });
      
      // Также проверяем переименование параметров
      const renamedParamsMap = new Map<string, string>(); // oldName -> newName
      initialParameters.forEach(initialParam => {
        const currentParam = parameters.find(p => p.id === initialParam.id);
        if (currentParam && initialParam.name !== currentParam.name) {
          renamedParamsMap.set(initialParam.name, currentParam.name);
          console.log(`🔄 Renamed parameter: "${initialParam.name}" → "${currentParam.name}"`);
        }
      });
      
      // Объявляем processedRowIds один раз для всей функции
      const processedRowIds = new Set<number>();
      
      // Функция миграции: создаем новые строки без удаленных параметров, сохраняя тиры
      const migrateDeletedParameterRows = async (deletedParams: string[]) => {
        if (deletedParams.length === 0) return;
        
        // Находим все строки, содержащие удаленные параметры
        const rowsToMigrate: Array<{
          row: any;
          newAttrs: Record<string, string>;
          tiers: any[];
          includeVat: boolean;
        }> = [];
        
        data.rows.forEach((row: any) => {
          if (row.isActive === false) return;
          
          const rowAttrs = typeof row.attrs === 'string' ? JSON.parse(row.attrs) : row.attrs;
          const cleanAttrs: Record<string, string> = {};
          
          // Очищаем от служебных полей
          Object.entries(rowAttrs).forEach(([key, value]) => {
            if (key.startsWith('_') || 
                ['PRICE', 'NET PRICE', 'VAT', 'Price +VAT', 'Qty'].includes(key)) {
              return;
            }
            if (typeof value === 'string' && value.trim() !== '') {
              cleanAttrs[key] = value.trim();
            }
          });
          
          // Проверяем, содержит ли строка удаленные параметры
          const containsDeletedParam = deletedParams.some(deletedParam => cleanAttrs[deletedParam]);
          if (!containsDeletedParam) return;
          
          // Создаем новые attrs без удаленных параметров
          const newAttrs: Record<string, string> = {};
          Object.entries(cleanAttrs).forEach(([key, value]) => {
            if (!deletedParams.includes(key)) {
              newAttrs[key] = value;
            }
          });
          
          // Если после удаления остались параметры - мигрируем
          if (Object.keys(newAttrs).length > 0) {
            rowsToMigrate.push({
              row,
              newAttrs,
              tiers: row.tiers || [],
              includeVat: rowAttrs._includeVat !== 'false'
            });
          }
        });
        
        // Обрабатываем строки, которые нужно полностью удалить (не осталось параметров)
        const rowsToDelete: any[] = [];
        data.rows.forEach((row: any) => {
          if (row.isActive === false) return;
          
          const rowAttrs = typeof row.attrs === 'string' ? JSON.parse(row.attrs) : row.attrs;
          const cleanAttrs: Record<string, string> = {};
          
          Object.entries(rowAttrs).forEach(([key, value]) => {
            if (key.startsWith('_') || 
                ['PRICE', 'NET PRICE', 'VAT', 'Price +VAT', 'Qty'].includes(key)) {
              return;
            }
            if (typeof value === 'string' && value.trim() !== '') {
              cleanAttrs[key] = value.trim();
            }
          });
          
          const containsDeletedParam = deletedParams.some(deletedParam => cleanAttrs[deletedParam]);
          if (!containsDeletedParam) return;
          
          const newAttrs: Record<string, string> = {};
          Object.entries(cleanAttrs).forEach(([key, value]) => {
            if (!deletedParams.includes(key)) {
              newAttrs[key] = value;
            }
          });
          
          // Если после удаления не осталось параметров - удаляем строку
          if (Object.keys(newAttrs).length === 0) {
            rowsToDelete.push(row);
          }
        });
        
        // Удаляем строки без параметров
        for (const row of rowsToDelete) {
          await fetch(`/api/admin/prices/services/by-slug/${serviceSlug}/rows/${row.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              attrs: row.attrs,
              ruleKind: row.ruleKind,
              unit: row.unit,
              setup: row.setup,
              fixed: row.fixed,
              isActive: false
            })
          });
          processedRowIds.add(row.id);
          console.log(`🗑️ Deactivated row ${row.id} (no parameters left after deletion)`);
        }
        
        console.log(`🔄 Migrating ${rowsToMigrate.length} rows after parameter deletion`);
        
        // Создаем новые строки с мигрированными данными
        for (const migration of rowsToMigrate) {
          const finalAttrs: Record<string, any> = {
            ...migration.newAttrs,
            _includeVat: migration.includeVat ? 'true' : 'false'
          };
          
          // Проверяем, нет ли уже такой строки
          const existingRow = data.rows.find((r: any) => {
            if (r.isActive === false) return false;
            const rAttrs = typeof r.attrs === 'string' ? JSON.parse(r.attrs) : r.attrs;
            const rCleanAttrs: Record<string, string> = {};
            
            Object.entries(rAttrs).forEach(([key, value]) => {
              if (key.startsWith('_') || 
                  ['PRICE', 'NET PRICE', 'VAT', 'Price +VAT', 'Qty'].includes(key)) {
                return;
              }
              if (typeof value === 'string' && value.trim() !== '') {
                rCleanAttrs[key] = value.trim();
              }
            });
            
            const matches = JSON.stringify(Object.keys(rCleanAttrs).sort().reduce((acc, k) => {
              acc[k] = rCleanAttrs[k];
              return acc;
            }, {} as Record<string, string>)) === JSON.stringify(Object.keys(migration.newAttrs).sort().reduce((acc, k) => {
              acc[k] = migration.newAttrs[k];
              return acc;
            }, {} as Record<string, string>));
            
            return matches;
          });
          
          if (!existingRow) {
            // Создаем новую строку
            const createResponse = await fetch(`/api/admin/prices/services/by-slug/${serviceSlug}/rows`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                attrs: finalAttrs,
                ruleKind: 'tiers',
                unit: null,
                setup: migration.row.setup || 0,
                fixed: migration.row.fixed || 0
              })
            });
            
            if (createResponse.ok) {
              const result = await createResponse.json();
              const newRowId = result.row.id;
              
              // Добавляем тиры
              if (migration.tiers.length > 0) {
                const tiersResponse = await fetch(`/api/admin/prices/services/by-slug/${serviceSlug}/rows/${newRowId}/tiers`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    tiers: migration.tiers.map((t: any) => ({
                      qty: Number(t.qty) || 0,
                      unit: Number(t.unit) || 0
                    }))
                  })
                });
                
                if (tiersResponse.ok) {
                  console.log(`✅ Migrated row ${migration.row.id} → ${newRowId} with ${migration.tiers.length} tiers`);
                }
              }
            }
          } else {
            // Обновляем существующую строку тирами из мигрированной
            if (migration.tiers.length > 0) {
              const tiersResponse = await fetch(`/api/admin/prices/services/by-slug/${serviceSlug}/rows/${existingRow.id}/tiers`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  tiers: migration.tiers.map((t: any) => ({
                    qty: Number(t.qty) || 0,
                    unit: Number(t.unit) || 0
                  }))
                })
              });
              
              if (tiersResponse.ok) {
                console.log(`✅ Updated existing row ${existingRow.id} with migrated tiers from row ${migration.row.id}`);
              }
            }
          }
          
          // Помечаем старую строку как неактивную
          await fetch(`/api/admin/prices/services/by-slug/${serviceSlug}/rows/${migration.row.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              attrs: migration.row.attrs,
              ruleKind: migration.row.ruleKind,
              unit: migration.row.unit,
              setup: migration.row.setup,
              fixed: migration.row.fixed,
              isActive: false
            })
          });
          
          processedRowIds.add(migration.row.id); // Отмечаем как обработанную
          console.log(`🗑️ Deactivated old row ${migration.row.id}`);
        }
      };
      
      // Выполняем миграцию перед основной обработкой
      await migrateDeletedParameterRows(deletedParamNames);
      
      // Перезагружаем строки после миграции
      const refreshResponse = await fetch(`/api/admin/prices/services/by-slug/${serviceSlug}/rows`);
      const refreshData = await refreshResponse.json();
      if (refreshData.ok) {
        data.rows = refreshData.rows;
      }
      
      // Создаем карту существующих строк по ID
      const existingRowsMap = new Map();
      data.rows.forEach((row: any) => {
        existingRowsMap.set(row.id, row);
      });
      
      // КРИТИЧЕСКИ ВАЖНО: Обновляем existingRowsMap свежими данными с tiers из БД
      // Это гарантирует, что tiers всегда актуальны при поиске существующих строк
      console.log(`🔄 Refreshing existingRowsMap with fresh tiers from DB for ${existingRowsMap.size} rows...`);
      const rowsWithTiers = await Promise.all(
        Array.from(existingRowsMap.keys()).map(async (rowId) => {
          try {
            const rowResponse = await fetch(`/api/admin/prices/services/by-slug/${serviceSlug}/rows/${rowId}`);
            const rowData = await rowResponse.json();
            if (rowData.ok && rowData.row) {
              const tiersCount = rowData.row.tiers?.length || 0;
              console.log(`✅ Refreshed row ${rowId} with ${tiersCount} tiers from DB`);
              return rowData.row;
            } else {
              console.warn(`⚠️ Failed to refresh row ${rowId}: API returned not ok or no row data`);
              return existingRowsMap.get(rowId); // Fallback на старое значение
            }
          } catch (error) {
            console.warn(`⚠️ Failed to refresh row ${rowId}, using cached data:`, error);
            return existingRowsMap.get(rowId); // Fallback на старое значение
          }
        })
      );
      
      // Обновляем карту свежими данными
      rowsWithTiers.forEach(row => {
        if (row) {
          existingRowsMap.set(row.id, row);
          const tiersCount = row.tiers?.length || 0;
          if (tiersCount === 0) {
            console.warn(`⚠️ Row ${row.id} has NO tiers in DB after refresh!`);
          }
        }
      });
      
      // УПРОЩЕНИЕ: НЕ деактивируем строки заранее
      // При переименовании опции строка обновится с новым именем в attrs
      // Tiers останутся автоматически, так как привязаны к rowId, а не к имени
      
      // Трекер обработанных комбинаций для предотвращения дубликатов в текущей сессии
      const processedCombinations = new Set<string>();
      
      // Находим Main параметр
      const mainParam = parameters.find(p => p.isMain);
      
      console.log(`📊 Main parameter: ${mainParam?.name || 'none'}`);
      
      // НОВАЯ ЛОГИКА: Создаем rows для каждой опции Main параметра с её доп опциями
      if (!mainParam || mainParam.options.length === 0) {
        console.warn('⚠️ No main parameter found, skipping save');
        toast.error('Please set a Main parameter first');
        return;
      }
      
      // Создаем комбинации для каждой опции Main параметра
      const combinationsToSave: Array<{
        attrs: Record<string, string>;
        tiers: Array<{ qty: number; unit: number; includeVat?: boolean }>;
        option: ParameterOption;
      }> = [];
      
      for (const mainOption of mainParam.options) {
        if (!mainOption.name.trim()) continue;
        
        // Берем tiers из опции (или из БД если пустые)
        let tiers: Array<{ qty: number; unit: number; includeVat?: boolean }> = [];
        
        if (mainOption.tiers && mainOption.tiers.length > 0) {
          tiers = mainOption.tiers.map(t => ({
            qty: t.quantity,
            unit: t.price,
            includeVat: t.includeVat !== false
          }));
          console.log(`✅ Using ${tiers.length} tiers from UI for option "${mainOption.name}"`);
        } else if (mainOption.originalRowId) {
          const existingRow = existingRowsMap.get(mainOption.originalRowId);
          if (existingRow && existingRow.tiers && existingRow.tiers.length > 0) {
            tiers = existingRow.tiers.map((t: any) => ({
              qty: Number(t.qty) || 0,
              unit: Number(t.unit) || 0,
              includeVat: true
            }));
            console.log(`✅ Loaded ${tiers.length} tiers from DB for option "${mainOption.name}"`);
          }
        }
        
        // ВАЖНО: Если есть доп опции, группируем их по name
        // Если несколько addOn с одинаковым name - создаем отдельные комбинации для каждого
        const addOnGroups = new Map<string, AddOnOption[]>(); // name -> [addOns]
        
        if (mainOption.addOnOptions && mainOption.addOnOptions.length > 0) {
          mainOption.addOnOptions.forEach(addOn => {
            if (addOn.name.trim() && addOn.value.trim()) {
              if (!addOnGroups.has(addOn.name)) {
                addOnGroups.set(addOn.name, []);
              }
              addOnGroups.get(addOn.name)!.push(addOn);
            }
          });
        }
        
        // Создаем комбинации: если есть addOn с одинаковым name - создаем комбинации для всех возможных сочетаний
        const combinations: Array<AddOnOption[]> = [];
        
        if (addOnGroups.size === 0) {
          // Нет доп опций - одна комбинация без addOn
          combinations.push([]);
        } else {
          // Генерируем все возможные комбинации addOn
          const groupNames = Array.from(addOnGroups.keys());
          const groupArrays = groupNames.map(name => addOnGroups.get(name)!);
          
          // Декартово произведение всех групп
          function generateCombinations(arrays: AddOnOption[][], index = 0, current: AddOnOption[] = []): AddOnOption[][] {
            if (index === arrays.length) {
              return [current];
            }
            const result: AddOnOption[][] = [];
            for (const addOn of arrays[index]) {
              result.push(...generateCombinations(arrays, index + 1, [...current, addOn]));
            }
            return result;
          }
          
          combinations.push(...generateCombinations(groupArrays));
        }
        
        // Создаем строку для каждой комбинации
        combinations.forEach(addOnCombo => {
          const attrs: Record<string, string> = {
            [mainParam.name]: mainOption.name
          };
          
          // Добавляем доп опции из комбинации
          addOnCombo.forEach(addOn => {
            attrs[addOn.name] = addOn.value;
          });
          
          combinationsToSave.push({
            attrs,
            tiers,
            option: mainOption
          });
        });
        
        console.log(`✅ Created ${combinations.length} combination(s) for option "${mainOption.name}" with ${mainOption.addOnOptions?.length || 0} add-ons`);
      }
      
      console.log(`🔢 Generated ${combinationsToSave.length} combinations from Main parameter options`);
      
      for (const combo of combinationsToSave) {
        try {
          // Фильтруем пустые значения из attrs
          const cleanAttrs: Record<string, string> = {};
          Object.entries(combo.attrs).forEach(([key, value]) => {
            if (typeof value === 'string' && value.trim() !== '') {
              cleanAttrs[key] = value.trim();
            }
          });
          
          if (Object.keys(cleanAttrs).length === 0) {
            console.log('⚠️ Skipping empty combination');
            continue;
          }
          
          // Создаем уникальный ключ для комбинации
          const combinationKey = JSON.stringify(
            Object.keys(cleanAttrs).sort().reduce((acc, key) => {
              acc[key] = cleanAttrs[key];
              return acc;
            }, {} as Record<string, string>)
          );
          
          // Проверяем, не обрабатывали ли мы уже эту комбинацию в текущей сессии
          if (processedCombinations.has(combinationKey)) {
            console.log(`⚠️ Skipping duplicate combination in current session:`, cleanAttrs);
            continue;
          }
          
          // Ищем существующую строку по ID опции (originalRowId)
          // Тиры привязаны к rowId, поэтому поиск по именам неправилен!
          let existingRow: any = null;
          const relatedRowIds = new Set<number>(); // Все строки, связанные с этой опцией
          
          if (combo.option.originalRowId) {
            // Используем originalRowId как основной способ найти строку
            const rowById = existingRowsMap.get(combo.option.originalRowId);
            if (rowById && rowById.isActive !== false) {
              existingRow = rowById;
              relatedRowIds.add(combo.option.originalRowId);
              console.log(`✅ Found row by originalRowId ${combo.option.originalRowId} - tiers preserved regardless of name`);
            }
          }
          
          // КРИТИЧЕСКИ ВАЖНО: Если не нашли по originalRowId, ищем по старому имени
          // Это нужно для случаев, когда originalRowId потерян или не установлен при загрузке
          if (!existingRow && mainParam && combo.option.originalName) {
            for (const [rowId, row] of Array.from(existingRowsMap.entries())) {
              if (row.isActive === false) continue;
              if (relatedRowIds.has(rowId)) continue; // Уже обработали
              
              const rowAttrs = typeof row.attrs === 'string' ? JSON.parse(row.attrs) : row.attrs;
              const rowMainValue = rowAttrs[mainParam.name];
              
              // Если это строка с тем же Main параметром и старым именем опции
              if (rowMainValue === combo.option.originalName) {
                relatedRowIds.add(rowId);
                console.log(`🔗 Found related row ${rowId} with old name "${combo.option.originalName}"`);
              }
            }
          }
          
          // Также ищем по текущему имени, если originalRowId не установлен
          // Это защита от потери originalRowId при переименовании
          if (!existingRow && !combo.option.originalRowId && mainParam) {
            for (const [rowId, row] of Array.from(existingRowsMap.entries())) {
              if (row.isActive === false) continue;
              if (relatedRowIds.has(rowId)) continue;
              
              const rowAttrs = typeof row.attrs === 'string' ? JSON.parse(row.attrs) : row.attrs;
              const rowMainValue = rowAttrs[mainParam.name];
              
              // Проверяем, совпадает ли имя опции (может быть переименована, но не сохранена)
              if (rowMainValue === combo.option.name) {
                // Также проверяем совпадение доп опций для точности
                const rowAddOnKeys = Object.keys(rowAttrs)
                  .filter(k => k !== mainParam.name && !k.startsWith('_') && !['PRICE', 'NET PRICE', 'VAT', 'Price +VAT', 'Qty'].includes(k))
                  .sort()
                  .map(k => `${k}:${rowAttrs[k]}`)
                  .join(',');
                
                const comboAddOnKeys = Object.keys(cleanAttrs)
                  .filter(k => k !== mainParam.name && !k.startsWith('_') && !['PRICE', 'NET PRICE', 'VAT', 'Price +VAT', 'Qty'].includes(k))
                  .sort()
                  .map(k => `${k}:${cleanAttrs[k]}`)
                  .join(',');
                
                if (rowAddOnKeys === comboAddOnKeys || (rowAddOnKeys === '' && comboAddOnKeys === '')) {
                  relatedRowIds.add(rowId);
                  console.log(`🔗 Found row ${rowId} by current name "${combo.option.name}" - will update originalRowId`);
                }
              }
            }
          }
          
          // Если не нашли по originalRowId, но есть связанные строки - используем первую
          if (!existingRow && relatedRowIds.size > 0) {
            const firstRelatedId = Array.from(relatedRowIds)[0];
            const relatedRow = existingRowsMap.get(firstRelatedId);
            if (relatedRow && relatedRow.isActive !== false) {
              existingRow = relatedRow;
              // ВАЖНО: Обновляем originalRowId опции, чтобы в следующий раз найти сразу
              combo.option.originalRowId = firstRelatedId;
              console.log(`✅ Using first related row ${firstRelatedId} for option - originalRowId updated to ${firstRelatedId}`);
            }
          }
          
          if (!existingRow) {
            // Если originalRowId нет и нет связанных строк - это новая опция
            console.log(`🆕 New option without originalRowId - will create new row`);
          }
          
          if (existingRow) {
            // ПРОСТАЯ ЛОГИКА: Для существующих строк ВСЕГДА загружаем tiers из БД перед сохранением
            // Это гарантирует, что tiers не потеряются при обновлении attrs (переименовании)
            
            // 1. Сначала загружаем актуальные tiers из БД
            let tiersFromDB: Array<{ qty: number; unit: number }> = [];
            let finalAttrs: Record<string, any> = { ...cleanAttrs };
            
            try {
              const rowResponse = await fetch(`/api/admin/prices/services/by-slug/${serviceSlug}/rows/${existingRow.id}`);
              const rowData = await rowResponse.json();
              if (rowData.ok && rowData.row?.tiers && rowData.row.tiers.length > 0) {
                tiersFromDB = rowData.row.tiers.map((t: any) => ({
                  qty: Number(t.qty) || 0,
                  unit: Number(t.unit) || 0
                }));
                const rowAttrs = typeof rowData.row.attrs === 'string' ? JSON.parse(rowData.row.attrs) : rowData.row.attrs;
                finalAttrs._includeVat = rowAttrs._includeVat || 'true';
                console.log(`✅ Loaded ${tiersFromDB.length} tiers from DB for row ${existingRow.id}`);
              } else {
                // Нет tiers в БД - используем tiers из UI если есть
                if (combo.tiers && combo.tiers.length > 0) {
                  tiersFromDB = combo.tiers.map((t: any) => ({
                    qty: Number(t.qty || t.quantity || 0) || 0,
                    unit: Number(t.unit || t.price || 0) || 0
                  }));
                  const hasNoVatTier = combo.tiers.some((t: any) => t.includeVat === false);
                  finalAttrs._includeVat = hasNoVatTier ? 'false' : 'true';
                  console.log(`✅ Using ${tiersFromDB.length} tiers from UI for row ${existingRow.id} (no tiers in DB)`);
                } else {
                  console.log(`ℹ️ No tiers in DB or UI for row ${existingRow.id}`);
                }
              }
            } catch (e) {
              console.warn(`⚠️ Failed to load tiers from DB for row ${existingRow.id}, using UI tiers if available:`, e);
              // Fallback на tiers из UI
              if (combo.tiers && combo.tiers.length > 0) {
                tiersFromDB = combo.tiers.map((t: any) => ({
                  qty: Number(t.qty || t.quantity || 0) || 0,
                  unit: Number(t.unit || t.price || 0) || 0
                }));
                const hasNoVatTier = combo.tiers.some((t: any) => t.includeVat === false);
                finalAttrs._includeVat = hasNoVatTier ? 'false' : 'true';
              }
            }
            
            // 2. Строим запрос: обновляем attrs и tiers (если есть)
            const requestBody: any = {
              attrs: finalAttrs,
              ruleKind: 'tiers',
              unit: null,
              setup: existingRow.setup || 0,
              fixed: existingRow.fixed || 0,
              isActive: true
            };
            
            // 3. Отправляем tiers только если они есть (либо из БД, либо из UI)
            if (tiersFromDB.length > 0) {
              requestBody.tiers = tiersFromDB;
              console.log(`📤 Updating row ${existingRow.id}: attrs + ${tiersFromDB.length} tiers`);
            } else {
              // Нет tiers - не отправляем (API сохранит существующие если они есть)
              console.log(`📤 Updating row ${existingRow.id}: attrs only (no tiers to save)`);
            }
            
            const updateResponse = await fetch(`/api/admin/prices/services/by-slug/${serviceSlug}/rows/${existingRow.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(requestBody)
            });
            
            if (!updateResponse.ok) {
              const errorText = await updateResponse.text();
              throw new Error(`Failed to update row ${existingRow.id}: ${errorText}`);
            }
            
            processedRowIds.add(existingRow.id);
            processedCombinations.add(combinationKey);
            console.log(`✅ Successfully updated row ${existingRow.id} - tiers preserved by ID`);
            
            // Обрабатываем остальные связанные строки (если есть)
            // Это строки с тем же Main параметром и старым именем опции
            // Их нужно либо обновить, либо деактивировать, чтобы не было мусора в БД
            for (const relatedRowId of relatedRowIds) {
              if (relatedRowId === existingRow.id) continue; // Уже обработали
              
              const relatedRow = existingRowsMap.get(relatedRowId);
              if (!relatedRow || relatedRow.isActive === false) continue;
              
              // Проверяем, совпадает ли комбинация доп опций
              const relatedAttrs = typeof relatedRow.attrs === 'string' ? JSON.parse(relatedRow.attrs) : relatedRow.attrs;
              const relatedCleanAttrs: Record<string, string> = {};
              Object.entries(relatedAttrs).forEach(([key, value]) => {
                if (key.startsWith('_') || ['PRICE', 'NET PRICE', 'VAT', 'Price +VAT', 'Qty'].includes(key)) {
                  return;
                }
                if (typeof value === 'string' && value.trim() !== '') {
                  relatedCleanAttrs[key] = value.trim();
                }
              });
              
              // Создаем ключ для сравнения (исключаем Main параметр, так как имя могло измениться)
              const relatedKey = JSON.stringify(
                Object.keys(relatedCleanAttrs)
                  .filter(k => k !== mainParam.name)
                  .sort()
                  .reduce((acc, key) => {
                    acc[key] = relatedCleanAttrs[key];
                    return acc;
                  }, {} as Record<string, string>)
              );
              
              const currentKey = JSON.stringify(
                Object.keys(cleanAttrs)
                  .filter(k => k !== mainParam.name)
                  .sort()
                  .reduce((acc, key) => {
                    acc[key] = cleanAttrs[key];
                    return acc;
                  }, {} as Record<string, string>)
              );
              
              if (relatedKey === currentKey) {
                // Комбинация доп опций совпадает - обновляем строку с новым именем Main опции
                console.log(`🔄 Updating related row ${relatedRowId} with new Main option name`);
                const relatedUpdateAttrs: Record<string, any> = {
                  ...relatedCleanAttrs,
                  [mainParam.name]: combo.option.name // Обновляем имя Main опции
                };
                relatedUpdateAttrs._includeVat = relatedAttrs._includeVat || 'true';
                
                await fetch(`/api/admin/prices/services/by-slug/${serviceSlug}/rows/${relatedRowId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    attrs: relatedUpdateAttrs,
                    ruleKind: 'tiers',
                    unit: null,
                    setup: relatedRow.setup || 0,
                    fixed: relatedRow.fixed || 0,
                    tiers: (relatedRow.tiers || []).map((t: any) => ({
                      qty: Number(t.qty) || 0,
                      unit: Number(t.unit) || 0
                    })),
                    isActive: true
                  })
                });
                
                processedRowIds.add(relatedRowId);
              } else {
                // Комбинация доп опций не совпадает - деактивируем как устаревшую
                console.log(`🗑️ Deactivating related row ${relatedRowId} - different add-on combination`);
                await fetch(`/api/admin/prices/services/by-slug/${serviceSlug}/rows/${relatedRowId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    attrs: relatedRow.attrs,
                    ruleKind: relatedRow.ruleKind,
                    unit: relatedRow.unit,
                    setup: relatedRow.setup,
                    fixed: relatedRow.fixed,
                    tiers: (relatedRow.tiers || []).map((t: any) => ({
                      qty: Number(t.qty) || 0,
                      unit: Number(t.unit) || 0
                    })),
                    isActive: false
                  })
                });
                
                processedRowIds.add(relatedRowId);
              }
            }
          } else {
            // Это новая строка - создаем её с tiers из combo
            const tiersFromCombo = combo.tiers || [];
            
            // Определяем, нужно ли включать VAT для новой строки
            const hasNoVatTier = tiersFromCombo.length > 0 && tiersFromCombo.some((t: any) => t.includeVat === false);
            const finalAttrs: Record<string, any> = {
              ...cleanAttrs,
              _includeVat: hasNoVatTier ? 'false' : 'true'
            };
            
            console.log(`🆕 CREATING new row:`, {
              attrs: finalAttrs,
              tiersCount: tiersFromCombo.length,
              includeVat: finalAttrs._includeVat
            });
            
            const createResponse = await fetch(`/api/admin/prices/services/by-slug/${serviceSlug}/rows`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                attrs: finalAttrs,
                ruleKind: 'tiers',
                unit: null,
                setup: 0,
                fixed: 0
              })
            });
            
            if (!createResponse.ok) {
              const errorText = await createResponse.text();
              throw new Error(`Failed to create combination row: ${errorText}`);
            }
            
            const result = await createResponse.json();
            const newRowId = result.row.id;
            
            // ВАЖНО: Обновляем originalRowId опции, чтобы при следующем сохранении она находилась по ID
            // Это нужно сделать в параметрах, но так как мы уже создали строку - просто логируем
            // На практике originalRowId обновится при следующей загрузке из БД
            console.log(`📝 New row ${newRowId} created - option should be updated with originalRowId=${newRowId} on next load`);
            
            processedRowIds.add(newRowId);
            processedCombinations.add(combinationKey);
            
            // Создаем тиры если есть - обновляем строку с tiers сразу
            if (tiersFromCombo.length > 0) {
              const tiersData = tiersFromCombo.map((t: any) => ({
                qty: Number(t.qty || t.quantity || 0) || 0,
                unit: Number(t.unit || t.price || 0) || 0
              }));
              
              const updateResponse = await fetch(`/api/admin/prices/services/by-slug/${serviceSlug}/rows/${newRowId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  attrs: finalAttrs,
                  ruleKind: 'tiers',
                  unit: null,
                  setup: 0,
                  fixed: 0,
                  tiers: tiersData // Отправляем tiers вместе с обновлением строки
                })
              });
              
              if (!updateResponse.ok) {
                console.warn(`⚠️ Failed to save tiers for row ${newRowId}`);
              } else {
                console.log(`✅ Created combination row ${newRowId} with ${tiersFromCombo.length} tiers`);
              }
            } else {
              console.log(`⚠️ Created combination row ${newRowId} without tiers (needs manual setup)`);
            }
          }
        } catch (error: any) {
          console.error(`❌ Error processing combination:`, error);
          throw error;
        }
      }
      
      // 2. Add-on параметры больше не обрабатываются отдельно
      // Доп опции теперь являются частью Main опций и обрабатываются выше
      
      // Старая логика addonParams удалена, так как теперь доп опции хранятся в addOnOptions
      // Если нужно обработать старые add-on параметры, можно добавить миграцию здесь
      
      /* REMOVED: Add-on parameters processing
      const addonParams = parameters.filter(p => p.isAddon && p.options.length > 0);
      for (const addonParam of addonParams) {
        console.log(`🔍 Processing add-on parameter: ${addonParam.name}`);
        
        if (!addonParam.name.trim()) {
          console.warn(`⚠️ Skipping add-on parameter with empty name`);
          continue;
        }
        
        for (const option of addonParam.options) {
          if (!option.name.trim()) {
            console.warn(`⚠️ Skipping add-on option with empty name for parameter ${addonParam.name}`);
            continue;
          }
          
          const attrs = { [addonParam.name]: option.name.trim() };
          const tiers = option.tiers
            .filter((tier: any) => tier.quantity > 0 && tier.price >= 0)
            .map((tier: any) => ({
              qty: tier.quantity,
              unit: tier.price
            }));
          
          // Ищем существующую строку add-on (должна содержать только этот параметр)
          // Сначала по текущему имени, потом по исходному (на случай переименования)
          let existingRow: any = null;
          
          // Сначала проверяем переименование параметра
          let searchParamName = addonParam.name;
          for (const [oldParamName, newParamName] of renamedParamsMap.entries()) {
            if (newParamName === addonParam.name) {
              searchParamName = oldParamName;
              break;
            }
          }
          
          // Получаем исходное имя опции
          const optionNameMap = originalToCurrentNamesMap.get(addonParam.name);
          let originalOptionName = option.name.trim();
          if (optionNameMap) {
            for (const [origName, currName] of optionNameMap.entries()) {
              if (currName === option.name.trim()) {
                originalOptionName = origName;
                break;
              }
            }
          }
          
          for (const [rowId, row] of Array.from(existingRowsMap.entries())) {
            if (row.isActive === false) continue;
            
            const rowAttrs = typeof row.attrs === 'string' ? JSON.parse(row.attrs) : row.attrs;
            const rowAttrsClean: Record<string, string> = {};
            
            // Очищаем от служебных полей
            Object.entries(rowAttrs).forEach(([key, value]) => {
              if (key.startsWith('_') || 
                  ['PRICE', 'NET PRICE', 'VAT', 'Price +VAT', 'Qty'].includes(key)) {
                return;
              }
              if (typeof value === 'string' && value.trim() !== '') {
                rowAttrsClean[key] = value.trim();
              }
            });
            
            // Проверяем, что это add-on строка (только один параметр)
            if (Object.keys(rowAttrsClean).length === 1) {
              const rowParamName = Object.keys(rowAttrsClean)[0];
              const rowOptionName = rowAttrsClean[rowParamName];
              
              // Проверяем совпадение по текущим именам
              if (rowParamName === addonParam.name && rowOptionName === option.name.trim()) {
                existingRow = row;
                break;
              }
              
              // Проверяем совпадение по исходным именам (переименование)
              if (rowParamName === searchParamName && rowOptionName === originalOptionName) {
                console.log(`✅ Found add-on row by original names: row ${row.id}`);
                console.log(`   Old: ${rowParamName}: ${rowOptionName} → New: ${addonParam.name}: ${option.name.trim()}`);
                existingRow = row;
                break;
              }
            }
          }
          
          if (existingRow) {
            // Обновляем существующую строку add-on (НЕ создаем новую!)
            const oldAttrs = typeof existingRow.attrs === 'string' ? JSON.parse(existingRow.attrs) : existingRow.attrs;
            console.log(`✅ UPDATING add-on row ${existingRow.id} (NOT creating new):`, {
              oldAttrs: oldAttrs,
              newAttrs: attrs,
              note: 'This prevents duplicate rows when renaming add-on options/parameters'
            });
            
            const updateResponse = await fetch(`/api/admin/prices/services/by-slug/${serviceSlug}/rows/${existingRow.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                attrs, // Используем новые имена
                ruleKind: 'tiers',
                unit: null,
                setup: existingRow.setup || 0,
                fixed: existingRow.fixed || 0,
                tiers: tiers.length > 0 ? tiers : (existingRow.tiers || []).map((t: any) => ({
                  qty: t.qty,
                  unit: t.unit
                })),
                isActive: true
              })
            });
            
            if (updateResponse.ok) {
              processedRowIds.add(existingRow.id);
              console.log(`✅ Updated add-on row ${existingRow.id}`);
            } else {
              const errorText = await updateResponse.text();
              console.error(`❌ Failed to update add-on row ${existingRow.id}: ${errorText}`);
            }
          } else {
            // Создаем новую строку add-on
            const createResponse = await fetch(`/api/admin/prices/services/by-slug/${serviceSlug}/rows`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                attrs,
                ruleKind: 'tiers',
                unit: null,
                setup: 0,
                fixed: 0
                  })
                });
                
            if (createResponse.ok) {
              const result = await createResponse.json();
              const newRowId = result.row.id;
              
              if (tiers.length > 0) {
                const tiersResponse = await fetch(`/api/admin/prices/services/by-slug/${serviceSlug}/rows/${newRowId}/tiers`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ tiers })
                });
                
                if (!tiersResponse.ok) {
                  console.warn(`⚠️ Failed to save tiers for add-on row ${newRowId}`);
                } else {
                  console.log(`✅ Created add-on row ${newRowId} with ${tiers.length} tiers`);
                }
              } else {
                console.log(`⚠️ Created add-on row ${newRowId} without tiers`);
              }
            } else {
              const errorText = await createResponse.text();
              console.error(`❌ Failed to create add-on row: ${errorText}`);
            }
          }
        }
      }
      */
      
      // 3. НЕ помечаем необработанные строки как неактивные!
      // Это может привести к потере тиров при переименовании опций.
      // Если строка не обработана, она может быть:
      // - Переименованной опцией (будет обработана в следующем сохранении)
      // - Строкой, которая была временно пропущена
      // Вместо деактивации, просто логируем для отладки
      for (const [rowId, row] of Array.from(existingRowsMap.entries())) {
        if (!processedRowIds.has(rowId) && row.isActive !== false) {
          const rowAttrs = typeof row.attrs === 'string' ? JSON.parse(row.attrs) : row.attrs;
          const rowAttrsForMatch: Record<string, string> = {};
          
          Object.entries(rowAttrs).forEach(([key, value]) => {
            if (key.startsWith('_') || 
                ['PRICE', 'NET PRICE', 'VAT', 'Price +VAT', 'Qty'].includes(key)) {
              return;
            }
            if (typeof value === 'string' && value.trim() !== '') {
              rowAttrsForMatch[key] = value.trim();
            }
          });
          
          // Только логируем, но НЕ деактивируем
          if (Object.keys(rowAttrsForMatch).length > 0) {
            console.log(`ℹ️ Unprocessed row ${rowId} (may be renamed option or missing from current selection):`, rowAttrsForMatch);
          }
        }
      }
      
      toast.success('Successfully saved parameters!');
      
      // Обновляем страницу
      window.location.reload();
      
      onClose();
    } catch (error) {
      console.error('Error saving parameters:', error);
      toast.error('Failed to save parameters');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-px-cyan mx-auto mb-4"></div>
          <p>Loading parameters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Edit Service: {serviceName}</h2>
          <p className="text-gray-600">Configure parameters and pricing for this service</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>

      {parameters.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500 mb-4">No parameters found for this service</p>
            <p className="text-sm text-gray-400">Add parameters to configure pricing options</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {parameters.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Service Structure
              </span>
            </div>
            <p className="text-sm text-blue-900 mt-2 font-semibold">
              Service = {parameters.map((p, i) => (
                <span key={p.id}>
                  <strong className="text-blue-700">{p.name}</strong>
                  {i < parameters.length - 1 ? ' + ' : ''}
                </span>
              ))} = <span className="text-green-700">{parameters.reduce((total, param) => 
                total + param.options.reduce((optTotal, opt) => optTotal + opt.tiers.length, 0), 0
              )} price tier{parameters.reduce((total, param) => 
                total + param.options.reduce((optTotal, opt) => optTotal + opt.tiers.length, 0), 0
              ) !== 1 ? 's' : ''}</span>
            </p>
            <p className="text-xs text-blue-600 mt-2">
              Each combination of parameter options will use price tiers from the main parameter
            </p>
            <div className="mt-3 text-xs text-blue-700 space-y-1 border-t border-blue-200 pt-2">
              {parameters.map(param => (
                <div key={param.id} className="flex items-center gap-2">
                  <span className="font-medium">{param.name}:</span>
                  <span>{param.options.length} option{param.options.length !== 1 ? 's' : ''}</span>
                  {param.affectsPrice && (
                    <span className="text-green-600 font-medium">
                      • {param.options.reduce((total, opt) => total + opt.tiers.length, 0)} tier{param.options.reduce((total, opt) => total + opt.tiers.length, 0) !== 1 ? 's' : ''}
                    </span>
                  )}
                  {param.isMain && (
                    <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">MAIN</Badge>
                  )}
                  {param.isAddon && (
                    <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-300">ADD-ON</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {parameters.map((param, paramIndex) => (
          <Card key={param.id} className={param.isMain ? "border-2 border-blue-500 bg-blue-50" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Input
                      value={param.name}
                      onChange={(e) => updateParameter(param.id, { name: e.target.value })}
                      placeholder="Parameter name (e.g., Color)"
                      className="w-64"
                    />
                    {param.isMain && (
                      <Badge variant="default" className="bg-blue-500">
                        MAIN
                      </Badge>
                    )}
                    {param.isAddon && (
                      <Badge variant="default" className="bg-purple-500">
                        ADD-ON
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`is-main-${param.id}`}
                        checked={param.isMain}
                        onCheckedChange={() => toggleMainParameter(param.id)}
                        disabled={param.isAddon} // Add-ons не могут быть главными
                      />
                      <Label htmlFor={`is-main-${param.id}`}>
                        Main element
                      </Label>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`is-addon-${param.id}`}
                        checked={param.isAddon}
                        onCheckedChange={() => toggleAddonParameter(param.id)}
                        disabled={param.isMain} // Главный параметр не может быть add-on
                      />
                      <Label htmlFor={`is-addon-${param.id}`}>
                        Add-on (modifier)
                      </Label>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`affects-price-${param.id}`}
                        checked={param.affectsPrice}
                        onCheckedChange={(checked) => 
                          updateParameter(param.id, { affectsPrice: checked as boolean })
                        }
                      />
                      <Label htmlFor={`affects-price-${param.id}`}>
                        Affects price?
                      </Label>
                    </div>
                    
                    {param.affectsPrice && param.id !== 'sides' && (
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Price type:</Label>
                        <select
                          value={param.priceType || 'add'}
                          onChange={(e) => updateParameter(param.id, { 
                            priceType: e.target.value as 'add' | 'all' 
                          })}
                          className="px-2 py-1 border rounded text-sm"
                        >
                          <option value="add">Add to price (+0.2£)</option>
                          <option value="all">All price (1£)</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteParameter(param.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {param.options.map((option, optionIndex) => (
                  <div key={option.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        <Input
                          value={option.name}
                          onChange={(e) => updateOption(param.id, option.id, { name: e.target.value })}
                          placeholder="Option name (e.g., Black & White, Color)"
                          className="w-64"
                        />
                        {option.tiers && option.tiers.length > 0 && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                            {option.tiers.length} tier{option.tiers.length !== 1 ? 's' : ''}
                          </Badge>
                        )}
                        {param.isMain && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addAddOnOption(param.id, option.id)}
                            className="ml-auto"
                            title="Add add-on option"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                          </Button>
                        )}
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteOption(param.id, option.id)}
                        title={option.tiers && option.tiers.length > 0 ? `Cannot delete: has ${option.tiers.length} tier(s)` : 'Delete option'}
                        disabled={option.tiers && option.tiers.length > 0}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {/* Display add-on options for Main parameter */}
                    {param.isMain && option.addOnOptions && option.addOnOptions.length > 0 && (
                      <div className="mb-4 space-y-2 border-t pt-3">
                        <Label className="text-sm font-medium text-gray-700">Add-ons:</Label>
                        {option.addOnOptions.map((addOn) => (
                          <div key={addOn.id} className="flex items-center gap-2 bg-white p-2 rounded border">
                            <Input
                              value={addOn.name}
                              onChange={(e) => updateAddOnOption(param.id, option.id, addOn.id, { name: e.target.value })}
                              placeholder="Add-on name (e.g., Paper)"
                              className="w-32 text-sm"
                            />
                            <span className="text-gray-400">:</span>
                            <Input
                              value={addOn.value}
                              onChange={(e) => updateAddOnOption(param.id, option.id, addOn.id, { value: e.target.value })}
                              placeholder="Value (e.g., Glossy)"
                              className="w-32 text-sm"
                            />
                            <Input
                              type="number"
                              step="0.01"
                              value={addOn.modifier}
                              onChange={(e) => updateAddOnOption(param.id, option.id, addOn.id, { modifier: parseFloat(e.target.value) || 0 })}
                              placeholder="Modifier"
                              className="w-24 text-sm"
                            />
                            <span className="text-sm text-gray-600">£/unit</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteAddOnOption(param.id, option.id, addOn.id)}
                              className="ml-auto"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {param.affectsPrice && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">
                            Price Tiers
                        </Label>
                          {option.tiers.length === 0 && (
                            <span className="text-xs text-amber-600">⚠️ Add at least one tier</span>
                          )}
                        </div>
                        {option.tiers.length === 0 && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs text-yellow-800">
                            This option needs at least one price tier to calculate pricing.
                          </div>
                        )}
                        {option.tiers.map((tier, tierIndex) => (
                          <div key={tier.id} className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={tier.quantity}
                              onChange={(e) => updateTier(param.id, option.id, tier.id, { 
                                quantity: parseInt(e.target.value) || 0 
                              })}
                              placeholder="Quantity"
                              className="w-24"
                            />
                            <span className="text-sm">pieces</span>
                            <Input
                              type="number"
                              step="0.01"
                              value={tier.price}
                              onChange={(e) => updateTier(param.id, option.id, tier.id, { 
                                price: parseFloat(e.target.value) || 0 
                              })}
                              placeholder="Price"
                              className="w-24"
                            />
                            <span className="text-sm">£</span>
                            <div className="flex items-center gap-1">
                              <Checkbox
                                id={`vat-${tier.id}`}
                                checked={tier.includeVat !== false} // По умолчанию true
                                onCheckedChange={(checked) => updateTier(param.id, option.id, tier.id, { 
                                  includeVat: checked as boolean 
                                })}
                              />
                              <Label htmlFor={`vat-${tier.id}`} className="text-xs text-gray-600 cursor-pointer">
                                VAT
                              </Label>
                            </div>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteTier(param.id, option.id, tier.id)}
                              title={option.tiers.length === 1 ? 'Cannot delete: this is the last tier' : 'Delete tier'}
                              disabled={option.tiers.length === 1}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addTier(param.id, option.id)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Tier
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  onClick={() => addOption(param.id)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Option
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button onClick={addParameter} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Parameter
        </Button>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={saveParameters} disabled={saving}>
          {saving ? 'Saving...' : 'Save Parameters'}
        </Button>
      </div>
    </div>
  );
}

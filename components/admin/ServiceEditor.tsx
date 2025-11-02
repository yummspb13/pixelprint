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

interface ParameterOption {
  id: string;
  name: string;
  tiers: PriceTier[];
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
    
    // НОВАЯ УПРОЩЕННАЯ ЛОГИКА: собираем ВСЕ параметры из ВСЕХ строк
    const paramMap = new Map<string, Parameter>();
    
    // Структура для хранения данных всех строк
    const rowsData: Array<{
      attrs: Record<string, string>;
      tiers: any[];
      rowId: number;
      includeVat: boolean;
      paramCount: number;
    }> = [];
    
    // ПРОХОД 1: Собираем все параметры и опции из всех строк
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
      
      // Извлекаем все параметры и опции из этой строки
      Object.entries(cleanAttrs).forEach(([paramName, optionValue]) => {
        // Создаем параметр, если его еще нет
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
        const optionName = optionValue as string;
        
        // Создаем опцию, если ее еще нет
        let existingOption = param.options.find(opt => opt.name === optionName);
        if (!existingOption) {
          existingOption = {
            id: `${paramName.toLowerCase().replace(/\s+/g, '-')}-${optionName.toLowerCase().replace(/\s+/g, '-')}-${row.id}`,
            name: optionName,
            tiers: [],
            originalRowId: row.id,
            originalName: optionName // Сохраняем исходное имя при создании
          };
          param.options.push(existingOption);
        } else {
          // Если опция уже существует, обновляем originalName если его нет
          if (!existingOption.originalName) {
            existingOption.originalName = optionName;
          }
        }
      });
      
      // Сохраняем данные строки для второго прохода
      rowsData.push({
        attrs: cleanAttrs,
        tiers: row.tiers || [],
        rowId: row.id,
        includeVat,
        paramCount
      });
    });
    
    // ПРОХОД 2: Собираем тиры для каждой опции
    // Приоритет: комбинации (paramCount > 1) имеют приоритет над одиночными параметрами
    // Сначала обрабатываем комбинации, потом одиночные параметры
    const sortedRowsData = [...rowsData].sort((a, b) => {
      // Комбинации первыми, потом одиночные
      if (a.paramCount > 1 && b.paramCount === 1) return -1;
      if (a.paramCount === 1 && b.paramCount > 1) return 1;
      return 0;
    });
    
    sortedRowsData.forEach(rowData => {
      if (rowData.tiers.length === 0) return;
      
      // Для каждой опции в этой строке добавляем тиры
      Object.entries(rowData.attrs).forEach(([paramName, optionValue]) => {
        const param = paramMap.get(paramName);
        if (!param) return;
        
        const option = param.options.find(opt => opt.name === optionValue);
        if (!option) return;
        
        // Логика добавления тиров:
        // - Если это комбинация (paramCount > 1): заменяем тиры полностью
        // - Если это одиночный параметр (paramCount === 1): добавляем только если опция пустая
        const isCombination = rowData.paramCount > 1;
        const shouldReplaceTiers = isCombination;
        const shouldAddTiers = !isCombination && option.tiers.length === 0;
        
        if (shouldReplaceTiers) {
          // Очищаем и добавляем тиры из комбинации
          option.tiers = [];
          rowData.tiers.forEach((tier: any) => {
            const duplicateTier = option.tiers.find(t => 
              t.originalTierId === tier.id || 
              (t.quantity === tier.qty && t.price === tier.unit)
            );
            
            if (!duplicateTier) {
              option.tiers.push({
                id: `tier-${tier.id}-${rowData.rowId}`,
                quantity: tier.qty,
                price: tier.unit,
                includeVat: rowData.includeVat,
                originalTierId: tier.id
              });
            }
          });
        } else if (shouldAddTiers) {
          // Добавляем тиры для одиночного параметра только если опция пустая
          rowData.tiers.forEach((tier: any) => {
            const duplicateTier = option.tiers.find(t => 
              t.originalTierId === tier.id || 
              (t.quantity === tier.qty && t.price === tier.unit)
            );
            
            if (!duplicateTier) {
              option.tiers.push({
                id: `tier-${tier.id}-${rowData.rowId}`,
                quantity: tier.qty,
                price: tier.unit,
                includeVat: rowData.includeVat,
                originalTierId: tier.id
              });
            }
          });
        }
      });
    });
    
    const result = Array.from(paramMap.values());
    
    // Определяем главный элемент (параметр с наибольшим количеством опций среди не-addon)
    const nonAddonParams = result.filter(p => !p.isAddon);
    if (nonAddonParams.length > 0) {
      const mainParam = nonAddonParams.reduce((prev, current) => 
        current.options.length > prev.options.length ? current : prev
      );
      mainParam.isMain = true;
      console.log('🔍 Main parameter identified:', mainParam.name);
    }
    
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
      tiers: [{ id: `tier-${Date.now()}`, quantity: 100, price: 1 }]
    };
    
    updateParameter(paramId, {
      options: [...parameters.find(p => p.id === paramId)?.options || [], newOption]
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
      const deletedOptionsMap = new Map<string, Set<string>>();
      initialParameters.forEach(initialParam => {
        const currentParam = parameters.find(p => p.id === initialParam.id);
        if (!currentParam) return; // Параметр удален полностью - это обрабатывается отдельно
        
        const currentOptionNames = new Set(currentParam.options.map(opt => opt.name));
        const deletedOptions = initialParam.options
          .filter(opt => !currentOptionNames.has(opt.name))
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
      
      // ШАГ 1: Помечаем как неактивные все строки, содержащие удаленные опции
      for (const [paramName, deletedOptionNames] of deletedOptionsMap.entries()) {
        for (const [rowId, row] of Array.from(existingRowsMap.entries())) {
          if (row.isActive === false) continue; // Уже деактивирована
          
          const rowAttrs = typeof row.attrs === 'string' ? JSON.parse(row.attrs) : row.attrs;
          const rowParamValue = rowAttrs[paramName];
          
          // Если строка содержит удаленную опцию этого параметра - деактивируем её
          if (rowParamValue && typeof rowParamValue === 'string' && deletedOptionNames.has(rowParamValue.trim())) {
            console.log(`🗑️ Deactivating row ${row.id} because it contains deleted option "${paramName}: ${rowParamValue}"`);
            
            try {
              await fetch(`/api/admin/prices/services/by-slug/${serviceSlug}/rows/${row.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  attrs: rowAttrs,
                  ruleKind: row.ruleKind,
                  unit: row.unit,
                  setup: row.setup,
                  fixed: row.fixed,
                  isActive: false // Деактивируем строку
                })
              });
              
              // Обновляем в карте
              existingRowsMap.set(row.id, { ...row, isActive: false });
              processedRowIds.add(row.id);
              
              console.log(`✅ Deactivated row ${row.id}`);
            } catch (error) {
              console.error(`❌ Failed to deactivate row ${row.id}:`, error);
            }
          }
        }
      }
      
      // Трекер обработанных комбинаций для предотвращения дубликатов в текущей сессии
      const processedCombinations = new Set<string>();
      
      // Разделяем параметры на базовые (не add-ons) и add-ons
      const baseParams = parameters.filter(p => !p.isAddon && p.options.length > 0);
      const addonParams = parameters.filter(p => p.isAddon && p.options.length > 0);
      
      console.log(`📊 Base parameters: ${baseParams.length}, Add-on parameters: ${addonParams.length}`);
      
      // Функция генерации декартова произведения комбинаций
      const generateCombinations = (params: Parameter[]): Array<Record<string, string>> => {
        if (params.length === 0) return [];
        
        const paramOptions = params.map(p => ({
          paramName: p.name,
          options: p.options.filter(opt => opt.name.trim()).map(opt => opt.name)
        }));
        
        if (paramOptions.length === 0) return [];
        
        function cartesianProduct<T>(arrays: T[][]): T[][] {
          if (arrays.length === 0) return [[]];
          if (arrays.length === 1) return arrays[0].map(item => [item]);
          
          const [first, ...rest] = arrays;
          const restProduct = cartesianProduct(rest);
          
          const result: T[][] = [];
          for (const item of first) {
            for (const combination of restProduct) {
              result.push([item, ...combination]);
            }
          }
          return result;
        }
        
        const optionArrays = paramOptions.map(p => p.options);
        const combinations = cartesianProduct(optionArrays);
        
        return combinations.map(combo => {
          const result: Record<string, string> = {};
          paramOptions.forEach((param, index) => {
            result[param.paramName] = combo[index];
          });
          return result;
        });
      };
      
      // 1. Создаем комбинации для базовых параметров
      const combinations = generateCombinations(baseParams);
      console.log(`🔢 Generated ${combinations.length} combinations`);
      
      // Находим главный параметр для наследования тиров
      const mainParam = baseParams.find(p => p.isMain) || baseParams[0];
      console.log(`🎯 Main parameter for tier inheritance: ${mainParam?.name || 'none'}`);
      
      for (const combination of combinations) {
        try {
          // Фильтруем пустые значения из комбинации
          const cleanCombination: Record<string, string> = {};
          Object.entries(combination).forEach(([key, value]) => {
            if (typeof value === 'string' && value.trim() !== '') {
              cleanCombination[key] = value.trim();
            }
          });
          
          if (Object.keys(cleanCombination).length === 0) {
            console.log('⚠️ Skipping empty combination');
            continue;
          }
          
          // Создаем уникальный ключ для комбинации (без служебных полей)
          const combinationKey = JSON.stringify(
            Object.keys(cleanCombination).sort().reduce((acc, key) => {
              acc[key] = cleanCombination[key];
              return acc;
            }, {} as Record<string, string>)
          );
          
          // Проверяем, не обрабатывали ли мы уже эту комбинацию в текущей сессии
          if (processedCombinations.has(combinationKey)) {
            console.log(`⚠️ Skipping duplicate combination in current session:`, cleanCombination);
            continue;
          }
          
          // Ищем существующую строку с такой комбинацией
          // Пытаемся найти по текущим именам, а также по исходным именам (на случай переименования)
          let existingRow: any = null;
          
          // Сначала пытаемся найти точное совпадение по текущим именам
          for (const [rowId, row] of Array.from(existingRowsMap.entries())) {
            if (row.isActive === false) continue;
            
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
            
            const rowKey = JSON.stringify(
              Object.keys(rowAttrsForMatch).sort().reduce((acc, key) => {
                acc[key] = rowAttrsForMatch[key];
                return acc;
              }, {} as Record<string, string>)
            );
            
            if (combinationKey === rowKey) {
              existingRow = row;
              break;
            }
          }
          
          // Если не нашли точное совпадение, ищем по исходным именам (переименование опций или параметров)
          if (!existingRow) {
            // Создаем комбинацию с исходными именами для поиска
            const originalCombination: Record<string, string> = {};
            Object.entries(cleanCombination).forEach(([paramName, currentOptionName]) => {
              // Сначала проверяем, переименован ли параметр
              let originalParamName = paramName;
              for (const [oldParamName, newParamName] of renamedParamsMap.entries()) {
                if (newParamName === paramName) {
                  originalParamName = oldParamName;
                  break;
                }
              }
              
              // Теперь проверяем, переименована ли опция
              const optionNameMap = originalToCurrentNamesMap.get(paramName);
              let originalOptionName = currentOptionName;
              if (optionNameMap) {
                // Ищем обратное соответствие (currentName -> originalName)
                for (const [origName, currName] of optionNameMap.entries()) {
                  if (currName === currentOptionName) {
                    originalOptionName = origName;
                    break;
                  }
                }
              }
              
              originalCombination[originalParamName] = originalOptionName;
            });
            
            const originalCombinationKey = JSON.stringify(
              Object.keys(originalCombination).sort().reduce((acc, key) => {
                acc[key] = originalCombination[key];
                return acc;
              }, {} as Record<string, string>)
            );
            
            console.log(`🔍 Searching by original names:`, {
              current: cleanCombination,
              original: originalCombination,
              originalKey: originalCombinationKey
            });
            
            // Ищем по исходным именам
            for (const [rowId, row] of Array.from(existingRowsMap.entries())) {
              if (row.isActive === false) continue;
              
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
              
              const rowKey = JSON.stringify(
                Object.keys(rowAttrsForMatch).sort().reduce((acc, key) => {
                  acc[key] = rowAttrsForMatch[key];
                  return acc;
                }, {} as Record<string, string>)
              );
              
              if (originalCombinationKey === rowKey) {
                console.log(`✅ Found existing row by original names: row ${row.id}`);
                console.log(`   Old attrs:`, rowAttrsForMatch);
                console.log(`   Will update to:`, cleanCombination);
                existingRow = row;
                break;
              }
            }
          }
          
          // Получаем тиры для этой комбинации
          // Приоритет: 1) существующая строка, 2) главный параметр, 3) любой параметр с тирами
          let tiers: Array<{ qty: number; unit: number }> = [];
          
          // Если в существующей строке есть тиры - используем их (это сохраняет существующие тиры комбинации)
          if (existingRow && existingRow.tiers && existingRow.tiers.length > 0) {
            const rowAttrs = typeof existingRow.attrs === 'string' ? JSON.parse(existingRow.attrs) : existingRow.attrs;
            const defaultIncludeVat = rowAttrs._includeVat !== 'false'; // По умолчанию true
            tiers = existingRow.tiers.map((t: any) => ({
              qty: t.qty,
              unit: t.unit,
              includeVat: defaultIncludeVat
            }));
          } else {
            // Если тиров в существующей строке нет, ищем тиры из параметров комбинации
            // Сначала пробуем главный параметр
            if (mainParam && combination[mainParam.name]) {
              const mainOptionValue = combination[mainParam.name];
              const mainOption = mainParam.options.find(opt => opt.name === mainOptionValue);
              if (mainOption && mainOption.tiers.length > 0) {
                tiers = mainOption.tiers.map(t => ({
                  qty: t.quantity,
                  unit: t.price,
                  includeVat: t.includeVat !== false // По умолчанию true
                }));
              }
            }
            
            // Если главный параметр не дал тиров, ищем в любом параметре комбинации
            if (tiers.length === 0) {
              for (const [paramName, optionValue] of Object.entries(combination)) {
                const param = parameters.find((p: Parameter) => p.name === paramName);
                if (param) {
                  const option = param.options.find((opt: ParameterOption) => opt.name === optionValue);
                  if (option && option.tiers.length > 0) {
                    tiers = option.tiers.map((t: PriceTier) => ({
                      qty: t.quantity,
                      unit: t.price,
                      includeVat: t.includeVat !== false
                    }));
                    break; // Используем первые найденные тиры
                  }
                }
              }
            }
          }
          
          
          if (existingRow) {
            // Определяем, нужно ли включать VAT
            // Если есть тиры с includeVat: false, то не включаем VAT для строки
            const hasNoVatTier = tiers.length > 0 && tiers.some((t: any) => t.includeVat === false);
            
            // Сохраняем флаг VAT в attrs
            const finalAttrs: Record<string, any> = {
              ...cleanCombination
            };
            
            // Если есть новые тиры, используем их флаг, иначе проверяем существующие тиры
            if (tiers.length > 0) {
              finalAttrs._includeVat = hasNoVatTier ? 'false' : 'true';
            } else if (existingRow.tiers && existingRow.tiers.length > 0) {
              // Если новых тиров нет, проверяем существующие
              const existingRowAttrs = typeof existingRow.attrs === 'string' ? JSON.parse(existingRow.attrs) : existingRow.attrs;
              finalAttrs._includeVat = existingRowAttrs._includeVat || 'true';
            } else {
              finalAttrs._includeVat = 'true'; // По умолчанию
            }
            
            // Готовим тиры для сохранения
            const tiersToSave = tiers.length > 0 
              ? tiers.map((t: any) => ({
                  qty: Number(t.qty) || 0,
                  unit: Number(t.unit) || 0
                }))
              : (existingRow.tiers || []).map((t: any) => ({
                  qty: Number(t.qty) || 0,
                  unit: Number(t.unit) || 0
                }));
            
            console.log(`🔍 Updating row ${existingRow.id}:`, {
              attrs: finalAttrs,
              tiersCount: tiersToSave.length,
              includeVat: finalAttrs._includeVat
            });
            
            // Обновляем существующую строку (НЕ создаем новую!)
            const oldAttrs = typeof existingRow.attrs === 'string' ? JSON.parse(existingRow.attrs) : existingRow.attrs;
            const oldCleanAttrs: Record<string, string> = {};
            Object.entries(oldAttrs).forEach(([key, value]) => {
              if (!key.startsWith('_') && !['PRICE', 'NET PRICE', 'VAT', 'Price +VAT', 'Qty'].includes(key)) {
                if (typeof value === 'string' && value.trim()) {
                  oldCleanAttrs[key] = value.trim();
                }
              }
            });
            
            console.log(`✅ UPDATING existing row ${existingRow.id} (NOT creating new):`, {
              oldAttrs: oldCleanAttrs,
              newAttrs: cleanCombination,
              tiersCount: tiersToSave.length,
              note: 'This prevents duplicate rows when renaming options/parameters'
            });
            
            const updateResponse = await fetch(`/api/admin/prices/services/by-slug/${serviceSlug}/rows/${existingRow.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                attrs: finalAttrs, // Обновляем attrs с новыми именами
                ruleKind: 'tiers',
                unit: null,
                setup: existingRow.setup || 0,
                fixed: existingRow.fixed || 0,
                tiers: tiersToSave,
                isActive: true // Явно активируем строку
              })
            });
            
            if (!updateResponse.ok) {
              const errorText = await updateResponse.text();
              throw new Error(`Failed to update row ${existingRow.id}: ${errorText}`);
            }
            
            processedRowIds.add(existingRow.id);
            processedCombinations.add(combinationKey); // Отмечаем комбинацию как обработанную
            console.log(`✅ Successfully updated row ${existingRow.id} (no duplicate created)`);
          } else {
            // Определяем, нужно ли включать VAT для новой строки
            const hasNoVatTier = tiers.length > 0 && tiers.some((t: any) => t.includeVat === false);
            const finalAttrs: Record<string, any> = {
              ...cleanCombination,
              _includeVat: hasNoVatTier ? 'false' : 'true'
            };
            
            console.log(`🆕 CREATING new row (no existing match found):`, {
              attrs: finalAttrs,
              tiersCount: tiers.length,
              includeVat: finalAttrs._includeVat,
              note: 'This is a truly new combination, not a rename'
            });
            
            // Создаем новую строку только если комбинация не пустая
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
            
            // Отмечаем комбинацию и строку как обработанную
            processedRowIds.add(newRowId);
            processedCombinations.add(combinationKey);
            
            // Создаем тиры если есть
            if (tiers.length > 0) {
              const tiersResponse = await fetch(`/api/admin/prices/services/by-slug/${serviceSlug}/rows/${newRowId}/tiers`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tiers })
              });
              
              if (!tiersResponse.ok) {
                console.warn(`⚠️ Failed to save tiers for row ${newRowId}`);
              } else {
                console.log(`✅ Created combination row ${newRowId} with ${tiers.length} tiers`);
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
      
      // 2. Создаем отдельные строки для add-ons (модификаторы)
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
      
      // 3. Помечаем необработанные строки как неактивные только если они не являются комбинациями
      // (это старые строки, которые больше не нужны)
      for (const [rowId, row] of Array.from(existingRowsMap.entries())) {
        if (!processedRowIds.has(rowId) && row.isActive !== false) {
          // Проверяем, что это действительно старая строка, а не просто необработанная
          const rowAttrs = typeof row.attrs === 'string' ? JSON.parse(row.attrs) : row.attrs;
          const rowAttrsForMatch: Record<string, string> = {};
          
          Object.entries(rowAttrs).forEach(([key, value]) => {
            // Исключаем все служебные поля начинающиеся с _ и стандартные поля
            if (key.startsWith('_') || 
                ['PRICE', 'NET PRICE', 'VAT', 'Price +VAT', 'Qty'].includes(key)) {
              return;
            }
            if (typeof value === 'string' && value.trim() !== '') {
              rowAttrsForMatch[key] = value.trim();
            }
          });
          
          // Если это комбинация параметров, которая не была обработана - помечаем как неактивную
          if (Object.keys(rowAttrsForMatch).length > 1) {
            console.log(`🔍 Marking unprocessed combination row ${rowId} as inactive`);
            await fetch(`/api/admin/prices/services/by-slug/${serviceSlug}/rows/${rowId}`, {
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
                      <div className="flex items-center gap-3">
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

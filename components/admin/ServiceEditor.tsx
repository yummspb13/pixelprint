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
  options: ParameterOption[];
}

interface ParameterOption {
  id: string;
  name: string;
  tiers: PriceTier[];
  originalRowId?: number; // ID оригинальной строки в базе данных
  modifierType?: 'absolute' | 'percent' | 'none'; // Тип модификатора цены
  modifierValue?: number; // Значение модификатора
}

interface PriceTier {
  id: string;
  quantity: number;
  price: number;
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
    
    // Создаем карту параметров
    const paramMap = new Map<string, Parameter>();
    
    // Проходим по каждой строке и извлекаем параметры
    rows.forEach(row => {
      const attrs = typeof row.attrs === 'string' ? JSON.parse(row.attrs) : row.attrs;
      console.log('🔍 Processing row attrs:', attrs, 'rowId:', row.id);
      
      // Для каждого атрибута в строке создаем параметр
      Object.entries(attrs).forEach(([paramName, optionValue]) => {
        if (!paramMap.has(paramName)) {
          paramMap.set(paramName, {
            id: paramName.toLowerCase().replace(/\s+/g, '-'),
            name: paramName,
            affectsPrice: true,
            priceType: 'all', // По умолчанию заменяет цену
            parameterType: 'single', // По умолчанию single select
            isMain: false, // По умолчанию не главный
            options: []
          });
        }
        
        const param = paramMap.get(paramName)!;
        const optionName = optionValue as string;
        
        // Проверяем, есть ли уже такая опция
        let existingOption = param.options.find(opt => opt.name === optionName);
        
        if (!existingOption) {
          // Создаем новую опцию
          existingOption = {
            id: `${paramName.toLowerCase().replace(/\s+/g, '-')}-${optionName.toLowerCase().replace(/\s+/g, '-')}`,
            name: optionName,
            tiers: [],
            originalRowId: row.id // Сохраняем ID строки для обновления
          };
          param.options.push(existingOption);
        }
        
        // Добавляем тиры из текущей строки к существующей опции
        if (row.tiers && row.tiers.length > 0) {
          row.tiers.forEach((tier: any) => {
            // Проверяем, что тир еще не добавлен
            if (!existingOption.tiers.find(t => t.originalTierId === tier.id)) {
              existingOption.tiers.push({
                id: `tier-${tier.id}`,
                quantity: tier.qty,
                price: tier.unit,
                originalTierId: tier.id
              });
            }
          });
        }
      });
    });
    
    const result = Array.from(paramMap.values());
    
    // Определяем главный элемент (первый параметр с наибольшим количеством опций)
    if (result.length > 0) {
      const mainParam = result.reduce((prev, current) => 
        current.options.length > prev.options.length ? current : prev
      );
      mainParam.isMain = true;
      console.log('🔍 Main parameter identified:', mainParam.name);
    }
    
    console.log('🔍 Parsed parameters:', result);
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
      prev.map(param => ({
        ...param,
        isMain: param.id === paramId ? !param.isMain : false // Только один может быть главным
      }))
    );
  };

  const deleteParameter = (paramId: string) => {
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
    updateParameter(paramId, {
      options: parameters.find(p => p.id === paramId)?.options.filter(opt => opt.id !== optionId) || []
    });
  };

  const addTier = (paramId: string, optionId: string) => {
    const param = parameters.find(p => p.id === paramId);
    const option = param?.options.find(o => o.id === optionId);
    if (!option) return;

    const newTier: PriceTier = {
      id: `tier-${Date.now()}`,
      quantity: 100,
      price: 1
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
      
      // Получаем существующие строки
      const response = await fetch(`/api/admin/prices/services/by-slug/${serviceSlug}/rows`);
      const data = await response.json();
      
      if (!data.ok) {
        throw new Error('Failed to load existing data');
      }
      
      console.log('🔍 Existing rows before save:', data.rows);
      
      // Создаем карту существующих строк по ID
      const existingRowsMap = new Map();
      data.rows.forEach((row: any) => {
        existingRowsMap.set(row.id, row);
      });
      
      const processedRowIds = new Set<number>();
      
      // Обрабатываем каждый параметр и его опции
      for (const param of parameters) {
        console.log(`🔍 Processing parameter: ${param.name}`);
        
        for (const option of param.options) {
          if (!option.name.trim()) continue;
          
          console.log(`🔍 Processing option: ${option.name} (originalRowId: ${option.originalRowId})`);
          
          // Создаем attrs для строки (только один параметр)
          const attrs = { [param.name]: option.name };
          const tiers = option.tiers.map((tier: any) => ({
            qty: tier.quantity,
            unit: tier.price
          }));
          
          // Если это главный элемент, добавляем специальный флаг
          if (param.isMain) {
            attrs['_isMain'] = 'true';
          }
          
          if (option.originalRowId && existingRowsMap.has(option.originalRowId)) {
            // Обновляем существующую строку
            console.log(`🔍 Updating existing row ${option.originalRowId} for ${param.name}: ${option.name}`);
            
            const updateResponse = await fetch(`/api/admin/prices/services/by-slug/${serviceSlug}/rows/${option.originalRowId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                attrs,
                ruleKind: 'tiers',
                unit: null,
                setup: 0,
                fixed: 0,
                tiers
              })
            });
            
            if (!updateResponse.ok) {
              const errorText = await updateResponse.text();
              console.error(`Failed to update row ${option.originalRowId}:`, errorText);
              throw new Error(`Failed to update row ${option.originalRowId}: ${errorText}`);
            }
            
            processedRowIds.add(option.originalRowId);
            console.log(`✅ Updated row ${option.originalRowId}`);
          } else {
            // Создаем новую строку
            console.log(`🔍 Creating new row for ${param.name}: ${option.name}`);
            
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
            
            if (!createResponse.ok) {
              const errorText = await createResponse.text();
              console.error(`Failed to create row for ${param.name}: ${option.name}:`, errorText);
              throw new Error(`Failed to create row for ${param.name}: ${option.name}: ${errorText}`);
            }
            
            const result = await createResponse.json();
            console.log(`✅ Created new row ${result.row.id}`);
            
            // Создаем тиры для новой строки
            if (tiers.length > 0) {
              for (const tier of tiers) {
                const tierResponse = await fetch(`/api/admin/prices/services/by-slug/${serviceSlug}/rows/${result.row.id}/tiers`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    qty: tier.qty,
                    unit: tier.unit
                  })
                });
                
                if (!tierResponse.ok) {
                  console.warn(`Failed to create tier for row ${result.row.id}`);
                }
              }
            }
          }
        }
      }
      
      // Удаляем строки, которые больше не нужны
      console.log(`🔍 Checking for rows to delete. Processed: ${Array.from(processedRowIds)}`);
      for (const [rowId, row] of existingRowsMap) {
        if (!processedRowIds.has(rowId)) {
          console.log(`🔍 Deleting unused row ${rowId}`);
          
          const deleteResponse = await fetch(`/api/admin/prices/services/by-slug/${serviceSlug}/rows/${rowId}`, {
            method: 'DELETE'
          });
          
          if (!deleteResponse.ok) {
            console.warn(`Failed to delete row ${rowId}`);
          } else {
            console.log(`✅ Deleted row ${rowId}`);
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
                Found {parameters.length} existing parameter{parameters.length !== 1 ? 's' : ''} from current pricing table
              </span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              You can edit existing parameters or add new ones
            </p>
            <div className="mt-2 text-xs text-blue-700">
              {parameters.map(param => (
                <div key={param.id} className="flex items-center gap-2">
                  <span className="font-medium">{param.name}:</span>
                  <span>{param.options.length} option{param.options.length !== 1 ? 's' : ''}</span>
                  {param.affectsPrice && (
                    <span className="text-green-600">
                      ({param.options.reduce((total, opt) => total + opt.tiers.length, 0)} price tiers)
                    </span>
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
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`is-main-${param.id}`}
                        checked={param.isMain}
                        onCheckedChange={() => toggleMainParameter(param.id)}
                      />
                      <Label htmlFor={`is-main-${param.id}`}>
                        Main element
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
                  <div key={option.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <Input
                        value={option.name}
                        onChange={(e) => updateOption(param.id, option.id, { name: e.target.value })}
                        placeholder="Option name (e.g., Black & White, Color)"
                        className="w-64"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteOption(param.id, option.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {param.affectsPrice && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          {param.id === 'sides' ? 'Price Tiers' : 
                           param.priceType === 'add' ? 'Add to Price (per piece)' : 
                           'All Price Tiers'}
                        </Label>
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
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteTier(param.id, option.id, tier.id)}
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

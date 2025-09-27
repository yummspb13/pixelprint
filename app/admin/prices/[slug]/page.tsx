"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Edit, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  GripVertical,
  RotateCcw,
  Package,
  BarChart3,
  TrendingUp,
  RefreshCw,
  Save
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AdminCard from "@/components/admin/AdminCard";
import ScrollReveal from "@/components/ux/ScrollReveal";
import ServiceEditor from "@/components/admin/ServiceEditor";

type Row = { id:number; attrs:Record<string,string>; ruleKind:"tiers"|"perUnit"|"fixed"; unit?:number|null; setup?:number|null; fixed?:number|null; tiers?:{id:number;qty:number;unit:number}[] };

type SortField = 'qty' | 'price' | 'netPrice' | 'vat' | 'priceWithVat' | 'ruleKind';
type SortDirection = 'asc' | 'desc' | null;

export default function Page() {
  const { slug } = useParams() as { slug: string };
  const router = useRouter();
  
  // Функция для парсинга attrs (может быть строкой JSON или объектом)
  function parseAttrs(attrs: any): Record<string, string> {
    if (!attrs) return {};
    if (typeof attrs === 'string') {
      try {
        return JSON.parse(attrs);
      } catch (e) {
        console.warn('Failed to parse attrs JSON:', attrs);
        return {};
      }
    }
    return attrs;
  }
  const [service, setService] = useState<any>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Sorting states with localStorage persistence
  const [sortField, setSortField] = useState<SortField>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`admin-prices-details-${slug}-sort-field`);
      if (saved && ['qty', 'price', 'netPrice', 'vat', 'priceWithVat', 'ruleKind'].includes(saved)) {
        return saved as SortField;
      }
    }
    return 'qty';
  });
  const [sortDirection, setSortDirection] = useState<SortDirection>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`admin-prices-details-${slug}-sort-direction`);
      if (saved && ['asc', 'desc', null].includes(saved)) {
        return saved as SortDirection;
      }
    }
    return 'asc';
  });
  
  // Column width states with localStorage persistence
  const [columnWidths, setColumnWidths] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`admin-prices-details-${slug}-column-widths`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.warn('Failed to parse saved column widths:', e);
        }
      }
    }
    return {
      qty: 120,
      price: 120,
      netPrice: 120,
      vat: 120,
      priceWithVat: 120,
      ruleKind: 120,
      actions: 100
    };
  });
  const [isResizing, setIsResizing] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Change history state
  const [changeHistory, setChangeHistory] = useState<Array<{
    id: string;
    date: string;
    time: string;
    change: string;
    changeType: string;
    rowId?: number;
  }>>([]);
  
  // Service editor state
  const [showServiceEditor, setShowServiceEditor] = useState(false);

  async function load() {
    try {
      setLoading(true);
    const r = await fetch(`/api/admin/prices/services/by-slug/${slug}/rows`, { cache:"no-store" });
      
      if (!r.ok) {
        console.error('Response not ok:', r.status, r.statusText);
        return;
      }
      
      const d = await r.json(); 
      
      if (!d?.ok) {
        console.error('Data not ok:', d);
        return;
      }
      
      setService(d.service); 
      setRows(d.rows);
      
      console.log('🔍 LOAD: Service loaded:', d.service);
      console.log('🔍 LOAD: Rows loaded:', d.rows.length, 'rows');
      console.log('🔍 LOAD: First row:', d.rows[0]);
      
      // Load change history
      await loadChangeHistory();
    } catch (error) {
      console.error('Error loading service details:', error);
      toast.error('Error loading service details');
    } finally {
      setLoading(false);
    }
  }

  async function loadChangeHistory() {
    try {
      console.log('Loading change history for slug:', slug);
      const response = await fetch(`/api/admin/prices/services/by-slug/${slug}/history`);
      const data = await response.json();
      console.log('History response:', data);
      if (data.history) {
        setChangeHistory(data.history);
        console.log('History loaded:', data.history.length, 'entries');
      }
    } catch (error) {
      console.error('Error loading change history:', error);
    }
  }
  useEffect(()=>{ load(); },[slug]);

  const allKeys = useMemo(()=>{
    const s = new Set<string>();
    rows.forEach(r=> Object.keys(r.attrs||{}).forEach(k=> s.add(k)));
    return Array.from(s);
  },[rows]);

  async function saveRow(id:number, patch: Partial<Row>) {
    const r = await fetch(`/api/admin/prices/rows/${id}`, { method:"PATCH", headers:{ "content-type":"application/json" }, body: JSON.stringify(patch) });
    const d = await r.json(); 
    if (d.ok) {
      toast.success("Saved");
      load();
      
      // Add to change history
      if (patch.attrs) {
        const changedAttrs = Object.keys(patch.attrs).filter(key => 
          patch.attrs![key] !== rows.find(r => r.id === id)?.attrs?.[key]
        );
        if (changedAttrs.length > 0) {
          await addChangeHistory(`Updated attributes: ${changedAttrs.join(', ')}`, 'row_update', id);
        }
      } else if (patch.ruleKind) {
        const oldRule = rows.find(r => r.id === id)?.ruleKind;
        await addChangeHistory(`Changed rule type from ${oldRule} to ${patch.ruleKind}`, 'row_update', id);
      } else if (patch.unit !== undefined) {
        const oldUnit = rows.find(r => r.id === id)?.unit;
        await addChangeHistory(`Changed unit price from £${oldUnit || 0} to £${patch.unit}`, 'row_update', id);
      } else if (patch.setup !== undefined) {
        const oldSetup = rows.find(r => r.id === id)?.setup;
        await addChangeHistory(`Changed setup cost from £${oldSetup || 0} to £${patch.setup}`, 'row_update', id);
      } else if (patch.fixed !== undefined) {
        const oldFixed = rows.find(r => r.id === id)?.fixed;
        await addChangeHistory(`Changed fixed price from £${oldFixed || 0} to £${patch.fixed}`, 'row_update', id);
      }
    } else {
      toast.error("Error");
    }
  }
  async function addRow() {
    const r = await fetch(`/api/admin/prices/services/by-slug/${slug}/rows`, { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify({ attrs:{}, ruleKind:"tiers", unit:0 }) });
    const d = await r.json(); 
    if (d.ok) {
      load();
      await addChangeHistory("Added new pricing row", 'row_create', d.rowId);
    } else {
      toast.error("Error");
    }
  }

  async function addRowToGroup(groupAttrs: any) {
    const attrs = parseAttrs(groupAttrs);
    const r = await fetch(`/api/admin/prices/services/by-slug/${slug}/rows`, { 
      method:"POST", 
      headers:{ "content-type":"application/json" }, 
      body: JSON.stringify({ 
        attrs: attrs, 
        ruleKind:"tiers", 
        unit:0 
      }) 
    });
    const d = await r.json(); 
    if (d.ok) {
      load();
      await addChangeHistory(`Added new pricing row to ${groupAttrs.Sides} ${groupAttrs.Color ? `(${groupAttrs.Color})` : ''}`, 'row_create', d.rowId);
    } else {
      toast.error("Error adding row to group");
    }
  }

  async function addNewType() {
    const sides = prompt("Enter Sides (e.g., 'Single Sided (S/S)', 'Double Sided (D/S)'):");
    if (!sides) return;
    
    const color = prompt("Enter Color (e.g., 'Color', 'BW', 'Color+BW', or leave empty):") || '';
    
    const attrs: { Sides: string; Color?: string } = { Sides: sides };
    if (color) attrs.Color = color;
    
    const r = await fetch(`/api/admin/prices/services/by-slug/${slug}/rows`, { 
      method:"POST", 
      headers:{ "content-type":"application/json" }, 
      body: JSON.stringify({ 
        attrs, 
        ruleKind:"tiers", 
        unit:0 
      }) 
    });
    const d = await r.json(); 
    if (d.ok) {
      load();
      await addChangeHistory(`Added new type: ${sides} ${color ? `(${color})` : ''}`, 'row_create', d.rowId);
    } else {
      toast.error("Error adding new type");
    }
  }
  async function delRow(id:number) {
    // First save to history before deleting
    try {
      await addChangeHistory("Deleted pricing row", 'row_delete', id);
    } catch (error) {
      console.warn('Failed to add delete to history:', error);
    }
    
    // Then delete the row
    const r = await fetch(`/api/admin/prices/rows/${id}`, { method:"DELETE" });
    const d = await r.json(); 
    if (d.ok) {
      load();
    } else {
      toast.error("Error");
    }
  }

  // Add change to history
  async function addChangeHistory(change: string, changeType: string = 'row_update', rowId?: number, oldData?: any, newData?: any) {
    try {
      console.log('Saving change history:', { change, changeType, rowId, slug });
      
      const response = await fetch(`/api/admin/prices/services/by-slug/${slug}/history/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          changeType,
          description: change,
          rowId,
          oldData,
          newData
        })
      });
      
      console.log('History save response:', response.status, response.ok);
      
      if (response.ok) {
        // Reload history from database
        await loadChangeHistory();
      } else {
        const errorData = await response.json();
        console.error('History save error:', errorData);
        // Don't show error to user for history saving failures
        console.warn('Failed to save change history, but operation completed successfully');
      }
    } catch (error) {
      console.error('Error saving change history:', error);
      // Don't show error to user for history saving failures
      console.warn('Failed to save change history, but operation completed successfully');
    }
  }

  // Add detailed tier change to history
  async function addTierChangeHistory(oldTiers: any[], newTiers: any[], rowId: number) {
    const changes: string[] = [];
    
    // Check for added tiers
    newTiers.forEach(newTier => {
      const oldTier = oldTiers.find(ot => ot.qty === newTier.qty);
      if (!oldTier) {
        changes.push(`Added tier: ${newTier.qty} qty at £${newTier.unit}`);
      } else if (oldTier.unit !== newTier.unit) {
        changes.push(`Changed price for ${newTier.qty} qty from £${oldTier.unit} to £${newTier.unit}`);
      }
    });
    
    // Check for removed tiers
    oldTiers.forEach(oldTier => {
      const newTier = newTiers.find(nt => nt.qty === oldTier.qty);
      if (!newTier) {
        changes.push(`Removed tier: ${oldTier.qty} qty at £${oldTier.unit}`);
      }
    });
    
    if (changes.length > 0) {
      await addChangeHistory(
        changes.join(', '), 
        'tier_change', 
        rowId, 
        oldTiers, 
        newTiers
      );
    }
  }

  // Sorting functions
  function handleSort(field: SortField) {
    let newDirection: SortDirection;
    
    if (sortField === field) {
      newDirection = sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc';
    } else {
      newDirection = 'asc';
    }
    
    setSortField(field);
    setSortDirection(newDirection);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(`admin-prices-details-${slug}-sort-field`, field);
      localStorage.setItem(`admin-prices-details-${slug}-sort-direction`, newDirection || '');
    }
  }

  function getSortIcon(field: SortField) {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    if (sortDirection === 'asc') return <ArrowUp className="h-4 w-4" />;
    if (sortDirection === 'desc') return <ArrowDown className="h-4 w-4" />;
    return <ArrowUpDown className="h-4 w-4" />;
  }

  // Group rows by attributes (Sides, Size, Paper, etc.)
  function getGroupedRows() {
    console.log('🔍 GET GROUPED ROWS: Processing', rows.length, 'rows');
    
    if (rows.length === 0) {
      console.log('🔍 GET GROUPED ROWS: No rows to process');
      return [];
    }
    
    const groups = new Map<string, Row[]>();
    
    try {
      rows.forEach((row, index) => {
        // Создаем ключ из основных атрибутов для группировки
        const attrs = parseAttrs(row.attrs);
        const keyAttrs: Record<string, string> = {};
        
        // Определяем приоритетные атрибуты для группировки
        const excludeFields = ['Qty', 'PRICE', 'NET PRICE', 'VAT', 'Price +VAT'];
        
        // Определяем приоритетные атрибуты для группировки
        const priorityFields = ['Sides', 'Color', 'Paper', 'Size'];
        
        // Сначала добавляем приоритетные поля
        priorityFields.forEach(field => {
          if (attrs[field] && !excludeFields.includes(field)) {
            keyAttrs[field] = attrs[field];
          }
        });
        
        // Если нет приоритетных полей, добавляем все остальные (кроме исключенных)
        if (Object.keys(keyAttrs).length === 0) {
          Object.entries(attrs).forEach(([key, value]) => {
            if (!excludeFields.includes(key) && value) {
              keyAttrs[key] = value;
            }
          });
        }
        
        const key = JSON.stringify(keyAttrs);
        console.log(`🔍 GET GROUPED ROWS: Row ${index} attrs:`, attrs, 'Key attrs:', keyAttrs, 'Key:', key);
        
        if (!groups.has(key)) {
          groups.set(key, []);
        }
        groups.get(key)!.push(row);
      });
      
      const result = Array.from(groups.entries()).map(([key, groupRows]) => {
        const attrs = JSON.parse(key);
        
        // Sort rows within group by quantity (from attrs.Qty or tiers)
        const sortedRows = groupRows.sort((a, b) => {
          const aQtyFromAttrs = parseInt(a.attrs?.Qty || '0');
          const bQtyFromAttrs = parseInt(b.attrs?.Qty || '0');
          const aQtyFromTiers = a.tiers?.length ? Math.min(...a.tiers.map(t => t.qty)) : 999999;
          const bQtyFromTiers = b.tiers?.length ? Math.min(...b.tiers.map(t => t.qty)) : 999999;
          
          const aQty = aQtyFromAttrs > 0 ? aQtyFromAttrs : aQtyFromTiers;
          const bQty = bQtyFromAttrs > 0 ? bQtyFromAttrs : bQtyFromTiers;
          return aQty - bQty;
        });
        
        return {
          key,
          attrs,
          rows: sortedRows
        };
      });
      
      // Сортируем группы по типу параметра, чтобы одинаковые параметры были рядом
      const sortedResult = result.sort((a, b) => {
        const aAttrs = a.attrs;
        const bAttrs = b.attrs;
        
        // Получаем первый ключ из каждого объекта для сравнения
        const aFirstKey = Object.keys(aAttrs)[0];
        const bFirstKey = Object.keys(bAttrs)[0];
        
        if (!aFirstKey || !bFirstKey) return 0;
        
        // Сортируем по типу параметра (например, все "Color" сначала, потом все "Sides")
        if (aFirstKey !== bFirstKey) {
          return aFirstKey.localeCompare(bFirstKey);
        }
        
        // Если тип параметра одинаковый, сортируем по значению
        const aValue = aAttrs[aFirstKey];
        const bValue = bAttrs[bFirstKey];
        
        return aValue.localeCompare(bValue);
      });
      
      console.log('🔍 GET GROUPED ROWS: Result:', sortedResult.length, 'groups');
      if (sortedResult.length > 0) {
        console.log('🔍 GET GROUPED ROWS: First group:', sortedResult[0]);
      }
      
      return sortedResult;
    } catch (error) {
      console.error('🔍 GET GROUPED ROWS ERROR:', error);
      return [];
    }
  }

  function getSortedRows() {
    if (!sortDirection) return rows;
    
    return [...rows].sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortField) {
        case 'qty':
          // Sort by quantity from attrs.Qty or minimum quantity in tiers
          const aQtyFromAttrs = parseInt(a.attrs?.Qty || '0');
          const bQtyFromAttrs = parseInt(b.attrs?.Qty || '0');
          const aQtyFromTiers = a.tiers?.length ? Math.min(...a.tiers.map(t => t.qty)) : 999999;
          const bQtyFromTiers = b.tiers?.length ? Math.min(...b.tiers.map(t => t.qty)) : 999999;
          
          // Use attrs.Qty if it exists and is not 0, otherwise use tiers
          aValue = aQtyFromAttrs > 0 ? aQtyFromAttrs : aQtyFromTiers;
          bValue = bQtyFromAttrs > 0 ? bQtyFromAttrs : bQtyFromTiers;
          break;
        case 'price':
          // Sort by unit price from attrs.PRICE or minimum unit price in tiers
          aValue = parseFloat(a.attrs?.PRICE || '0') || Math.min(...(a.tiers?.map(t => t.unit) || [0]));
          bValue = parseFloat(b.attrs?.PRICE || '0') || Math.min(...(b.tiers?.map(t => t.unit) || [0]));
          break;
        case 'netPrice':
          // Sort by minimum net price in tiers
          aValue = Math.min(...(a.tiers?.map(t => t.qty * t.unit) || [0]));
          bValue = Math.min(...(b.tiers?.map(t => t.qty * t.unit) || [0]));
          break;
        case 'vat':
          // Sort by minimum VAT in tiers
          aValue = Math.min(...(a.tiers?.map(t => t.qty * t.unit * 0.2) || [0]));
          bValue = Math.min(...(b.tiers?.map(t => t.qty * t.unit * 0.2) || [0]));
          break;
        case 'priceWithVat':
          // Sort by minimum total price in tiers
          aValue = Math.min(...(a.tiers?.map(t => t.qty * t.unit * 1.2) || [0]));
          bValue = Math.min(...(b.tiers?.map(t => t.qty * t.unit * 1.2) || [0]));
          break;
        case 'ruleKind':
          aValue = a.ruleKind;
          bValue = b.ruleKind;
          break;
        default:
          return 0;
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Column resizing functions
  function handleMouseDown(column: string, e: React.MouseEvent) {
    e.preventDefault();
    setIsResizing(column);
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isResizing) return;
    
    const deltaX = e.movementX;
    setColumnWidths((prev: any) => {
      const newWidths = {
        ...prev,
        [isResizing]: Math.max(50, prev[isResizing as keyof typeof prev] + deltaX)
      };
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(`admin-prices-details-${slug}-column-widths`, JSON.stringify(newWidths));
      }
      
      return newWidths;
    });
  }

  function handleMouseUp() {
    setIsResizing(null);
  }

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing]);

  // Reset column settings
  function resetColumnSettings() {
    const defaultWidths = {
      qty: 120,
      price: 120,
      netPrice: 120,
      vat: 120,
      priceWithVat: 120,
      ruleKind: 120,
      actions: 100
    };
    
    setColumnWidths(defaultWidths);
    setSortField('qty');
    setSortDirection('asc');
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`admin-prices-details-${slug}-column-widths`);
      localStorage.removeItem(`admin-prices-details-${slug}-sort-field`);
      localStorage.removeItem(`admin-prices-details-${slug}-sort-direction`);
    }
    
    toast.success('Column settings reset to default');
  }

  const groupedRows = getGroupedRows();
  const sortedRows = getSortedRows();
  
  // Pagination calculations
  const totalItems = groupedRows.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedGroupedRows = groupedRows.slice(startIndex, endIndex);
  
  console.log('🔍 RENDER: groupedRows.length:', groupedRows.length);
  console.log('🔍 RENDER: paginatedGroupedRows.length:', paginatedGroupedRows.length);
  console.log('🔍 RENDER: totalItems:', totalItems, 'totalPages:', totalPages);
  console.log('🔍 RENDER: currentPage:', currentPage, 'itemsPerPage:', itemsPerPage);
  console.log('🔍 RENDER: startIndex:', startIndex, 'endIndex:', endIndex);
  console.log('🔍 RENDER: service:', service);
  console.log('🔍 RENDER: rows.length:', rows.length);
  console.log('🔍 RENDER: loading:', loading);
  
  const totalTiers = rows.reduce((sum, row) => sum + (row.tiers?.length || 0), 0);
  const minPrice = Math.min(...rows.flatMap(row => row.tiers?.map(t => t.qty * t.unit * 1.2) || [0]));
  const maxPrice = Math.max(...rows.flatMap(row => row.tiers?.map(t => t.qty * t.unit * 1.2) || [0]));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-px-cyan mx-auto"></div>
          <p className="text-px-muted">Loading service details...</p>
        </div>
      </div>
    );
  }


  if (!service) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="text-gray-400 text-6xl">📄</div>
          <h2 className="text-xl font-semibold text-px-fg">Service not found</h2>
          <p className="text-px-muted">The requested service could not be found.</p>
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="text-gray-400 text-6xl">📊</div>
          <h2 className="text-xl font-semibold text-px-fg">No pricing data</h2>
          <p className="text-px-muted">No pricing information available for this service.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <ScrollReveal>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="border-px-cyan text-px-cyan hover:bg-px-cyan hover:text-white h-8 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Back
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight leading-tight font-playfair">
                <span className="text-px-fg truncate">{service?.name}</span>
              </h1>
              <p className="text-xs sm:text-sm lg:text-base text-px-muted max-w-2xl mt-1 sm:mt-2">
                <code className="text-xs bg-zinc-100 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">{slug}</code> • Manage pricing tiers and rules
              </p>
            </div>
          </div>
          <Button
            onClick={load}
            variant="outline"
            className="border-px-cyan text-px-cyan hover:bg-px-cyan hover:text-white h-8 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm"
          >
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Refresh
          </Button>
        </div>
      </ScrollReveal>

      {/* Stats Cards */}
      <ScrollReveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <AdminCard title="Price Rows" className="bg-gradient-to-br from-px-cyan/5 to-px-cyan/10 border-px-cyan/20 p-3 sm:p-4">
            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
              <div className="p-1.5 sm:p-2 lg:p-3 bg-px-cyan/10 rounded-lg">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-px-cyan" />
              </div>
              <div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-px-cyan">{rows.length}</p>
                <p className="text-xs sm:text-sm text-px-muted">Price Rows</p>
              </div>
            </div>
          </AdminCard>

          <AdminCard title="Total Tiers" className="bg-gradient-to-br from-px-magenta/5 to-px-magenta/10 border-px-magenta/20 p-3 sm:p-4">
            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
              <div className="p-1.5 sm:p-2 lg:p-3 bg-px-magenta/10 rounded-lg">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-px-magenta" />
              </div>
              <div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-px-magenta">{totalTiers}</p>
                <p className="text-xs sm:text-sm text-px-muted">Total Tiers</p>
              </div>
            </div>
          </AdminCard>

          <AdminCard title="Min Price" className="bg-gradient-to-br from-px-yellow/5 to-px-yellow/10 border-px-yellow/20 p-3 sm:p-4">
            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
              <div className="p-1.5 sm:p-2 lg:p-3 bg-px-yellow/10 rounded-lg">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-px-yellow" />
              </div>
              <div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-px-yellow">£{minPrice.toFixed(2)}</p>
                <p className="text-xs sm:text-sm text-px-muted">Min Price</p>
              </div>
            </div>
          </AdminCard>

          <AdminCard title="Max Price" className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20 p-3 sm:p-4">
            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
              <div className="p-1.5 sm:p-2 lg:p-3 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600" />
              </div>
              <div>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">£{maxPrice.toFixed(2)}</p>
                <p className="text-xs sm:text-sm text-px-muted">Max Price</p>
              </div>
            </div>
          </AdminCard>
        </div>
      </ScrollReveal>

      {/* Table Controls */}
      <ScrollReveal>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-4">
          <div className="flex items-center space-x-2 flex-wrap">
            <Badge variant="outline" className="text-px-muted text-xs">
              {sortedRows.length} rows
            </Badge>
            {sortDirection && (
              <Badge variant="outline" className="text-px-cyan border-px-cyan/20 text-xs">
                Sorted by {sortField} ({sortDirection})
              </Badge>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 lg:gap-4">
            <div className="text-xs sm:text-sm text-px-muted hidden lg:block">
              Click column headers to sort • Drag column edges to resize
            </div>
            <div className="flex items-center gap-2 flex-wrap w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowServiceEditor(true)}
                className="border-px-cyan text-px-cyan hover:bg-px-cyan hover:text-white h-7 text-xs flex-1"
            >
                <Edit className="h-3 w-3 mr-1" />
                Edit Service
            </Button>
            <Button
              onClick={addNewType}
                className="bg-gradient-to-r from-px-yellow to-px-magenta hover:from-px-yellow/90 hover:to-px-magenta/90 text-white h-7 text-xs flex-1"
            >
                <Plus className="h-3 w-3 mr-1" />
              Add Type
            </Button>
            <Button
              onClick={addRow}
                className="bg-gradient-to-r from-px-cyan to-px-magenta hover:from-px-cyan/90 hover:to-px-magenta/90 text-white h-7 text-xs flex-1"
            >
                <Plus className="h-3 w-3 mr-1" />
              Add Row
            </Button>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Pricing Table */}
      <div>
        <AdminCard title="Pricing Table" className="p-0">
          {/* Mobile Card View */}
          <div className="lg:hidden space-y-2 p-2">
            {paginatedGroupedRows.length === 0 ? (
              <div className="text-center py-6 text-px-muted">
                <div className="space-y-1">
                  <p className="text-sm font-medium">No pricing rows found</p>
                  <p className="text-xs">Click "Add Row" to create your first pricing tier</p>
                </div>
              </div>
            ) : (
              paginatedGroupedRows.map((group, groupIndex) => (
                <div key={group.key} className="bg-gradient-to-r from-px-cyan/5 to-px-magenta/5 border border-px-cyan/20 rounded-lg p-2">
                  {/* Group Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="min-w-0 flex-1 mr-2">
                      <h3 className="text-xs font-semibold text-px-fg truncate">
                        {Object.entries(group.attrs)
                          .filter(([key, value]) => value && !['Qty', 'PRICE', 'NET PRICE', 'VAT', 'Price +VAT'].includes(key))
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(' - ')}
                      </h3>
                      <Badge variant="outline" className="text-px-cyan border-px-cyan/20 text-xs mt-0.5">
                        {group.rows.length} variant{group.rows.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <Button
                      onClick={() => addRowToGroup(group.attrs)}
                      size="sm"
                      className="bg-gradient-to-r from-px-cyan to-px-magenta hover:from-px-cyan/90 hover:to-px-magenta/90 text-white h-5 w-[30%] text-xs flex-shrink-0"
                      title="Add row to group"
                    >
                      <Plus className="h-2.5 w-2.5 mr-1" />
                      Add
                    </Button>
                  </div>
                  
                  {/* Group Rows */}
                  <div className="space-y-2">
                    {group.rows.map((row, rowIndex) => {
                      const hasTiers = row.tiers && row.tiers.length > 0;
                      
                      if (hasTiers) {
                        const sortedTiers = [...(row.tiers || [])].sort((a, b) => a.qty - b.qty);
                        
                        return sortedTiers.map((tier, tierIndex) => (
                          <div key={`${row.id}-${tier.id || tierIndex}`} className="bg-white border rounded-md p-1.5">
                            <div className="grid grid-cols-4 gap-1 text-xs">
                              <div className="text-center">
                                <div className="text-zinc-400 text-[10px] mb-0.5">Qty</div>
                                <div className="font-medium text-zinc-900 text-sm">{tier.qty.toLocaleString()}</div>
                              </div>
                              <div className="text-center">
                                <div className="text-zinc-400 text-[10px] mb-0.5">Unit</div>
                                <div className="font-medium text-zinc-900 text-sm">£{tier.unit.toFixed(2)}</div>
                              </div>
                              <div className="text-center">
                                <div className="text-zinc-400 text-[10px] mb-0.5">Net</div>
                                <div className="font-medium text-zinc-900 text-sm">£{(tier.qty * tier.unit).toFixed(2)}</div>
                              </div>
                              <div className="text-center">
                                <div className="text-zinc-400 text-[10px] mb-0.5">Total</div>
                                <div className="font-bold text-px-cyan text-sm">£{(tier.qty * tier.unit * 1.2).toFixed(2)}</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-zinc-100">
                              <Badge className="bg-gray-100 text-gray-700 border-gray-200 text-[10px] px-1.5 py-0.5">
                                {row.ruleKind}
                              </Badge>
                              <div className="flex items-center gap-0.5 w-full">
                                {tierIndex === 0 && (
                                  <TierEditor 
                                    row={row} 
                                    onSaved={async (oldTiers, newTiers) => {
                                      load();
                                      await addTierChangeHistory(oldTiers, newTiers, row.id);
                                    }} 
                                  />
                                )}
                                {tierIndex === 0 && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={()=>delRow(row.id)}
                                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white h-5 flex-1"
                                    title="Delete row"
                                  >
                                    <Trash2 className="h-2.5 w-2.5" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ));
                      } else {
                        const attrs = parseAttrs(row.attrs);
                        const qty = parseInt(attrs.Qty || '0');
                        const price = parseFloat(attrs['PRICE'] || '0');
                        const netPrice = parseFloat(attrs['NET PRICE'] || '0');
                        const vat = parseFloat(attrs.VAT || '0');
                        const priceWithVat = parseFloat(attrs['Price +VAT'] || '0');
                        
                        return (
                          <div key={row.id} className="bg-white border rounded-md p-1.5">
                            <div className="grid grid-cols-4 gap-1 text-xs">
                              <div className="text-center">
                                <div className="text-zinc-400 text-[10px] mb-0.5">Qty</div>
                                <div className="font-medium text-zinc-900 text-sm">{qty.toLocaleString()}</div>
                              </div>
                              <div className="text-center">
                                <div className="text-zinc-400 text-[10px] mb-0.5">Unit</div>
                                <div className="font-medium text-zinc-900 text-sm">£{price.toFixed(2)}</div>
                              </div>
                              <div className="text-center">
                                <div className="text-zinc-400 text-[10px] mb-0.5">Net</div>
                                <div className="font-medium text-zinc-900 text-sm">£{netPrice.toFixed(2)}</div>
                              </div>
                              <div className="text-center">
                                <div className="text-zinc-400 text-[10px] mb-0.5">Total</div>
                                <div className="font-bold text-px-cyan text-sm">£{priceWithVat.toFixed(2)}</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-zinc-100">
                              <Badge className="bg-gray-100 text-gray-700 border-gray-200 text-[10px] px-1.5 py-0.5">
                                {row.ruleKind}
                              </Badge>
                              <div className="flex items-center gap-0.5 w-full">
                                <TierEditor 
                                  row={row} 
                                  onSaved={async (oldTiers, newTiers) => {
                                    load();
                                    await addTierChangeHistory(oldTiers, newTiers, row.id);
                                  }} 
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={()=>delRow(row.id)}
                                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white h-5 flex-1"
                                  title="Delete row"
                                >
                                  <Trash2 className="h-2.5 w-2.5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    })}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            {paginatedGroupedRows.length === 0 ? (
              <div className="text-center py-12 text-px-muted">
                <div className="space-y-2">
                  <p className="text-lg font-medium">No pricing groups found</p>
                  <p className="text-sm">Click "Add Row" to create your first pricing tier</p>
                  <p className="text-xs text-px-muted">Debug: groupedRows={groupedRows.length}, paginated={paginatedGroupedRows.length}</p>
                </div>
              </div>
            ) : (
            <table className="w-full" style={{ tableLayout: 'fixed' }}>
              <thead className="bg-gradient-to-r from-zinc-50 to-zinc-100 border-b border-zinc-200">
                <tr>
                  <th 
                    className="px-6 py-4 text-center text-sm font-semibold text-zinc-700 cursor-pointer hover:bg-zinc-200/50 transition-colors relative"
                    onClick={() => handleSort('qty')}
                    style={{ width: columnWidths.qty }}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <span>Qty</span>
                      {getSortIcon('qty')}
                    </div>
                    <div 
                      className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-px-cyan/50"
                      onMouseDown={(e) => handleMouseDown('qty', e)}
                    >
                      <GripVertical className="h-4 w-4 absolute right-0 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-center text-sm font-semibold text-zinc-700 cursor-pointer hover:bg-zinc-200/50 transition-colors relative"
                    onClick={() => handleSort('price')}
                    style={{ width: columnWidths.price }}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <span>PRICE</span>
                      {getSortIcon('price')}
                    </div>
                    <div 
                      className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-px-cyan/50"
                      onMouseDown={(e) => handleMouseDown('price', e)}
                    >
                      <GripVertical className="h-4 w-4 absolute right-0 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-center text-sm font-semibold text-zinc-700 cursor-pointer hover:bg-zinc-200/50 transition-colors relative"
                    onClick={() => handleSort('netPrice')}
                    style={{ width: columnWidths.netPrice }}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <span>NET PRICE</span>
                      {getSortIcon('netPrice')}
                    </div>
                    <div 
                      className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-px-cyan/50"
                      onMouseDown={(e) => handleMouseDown('netPrice', e)}
                    >
                      <GripVertical className="h-4 w-4 absolute right-0 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-center text-sm font-semibold text-zinc-700 cursor-pointer hover:bg-zinc-200/50 transition-colors relative"
                    onClick={() => handleSort('vat')}
                    style={{ width: columnWidths.vat }}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <span>VAT</span>
                      {getSortIcon('vat')}
                    </div>
                    <div 
                      className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-px-cyan/50"
                      onMouseDown={(e) => handleMouseDown('vat', e)}
                    >
                      <GripVertical className="h-4 w-4 absolute right-0 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-center text-sm font-semibold text-zinc-700 cursor-pointer hover:bg-zinc-200/50 transition-colors relative"
                    onClick={() => handleSort('priceWithVat')}
                    style={{ width: columnWidths.priceWithVat }}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <span>Price +VAT</span>
                      {getSortIcon('priceWithVat')}
                    </div>
                    <div 
                      className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-px-cyan/50"
                      onMouseDown={(e) => handleMouseDown('priceWithVat', e)}
                    >
                      <GripVertical className="h-4 w-4 absolute right-0 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-center text-sm font-semibold text-zinc-700 cursor-pointer hover:bg-zinc-200/50 transition-colors relative"
                    onClick={() => handleSort('ruleKind')}
                    style={{ width: columnWidths.ruleKind }}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <span>Rule</span>
                      {getSortIcon('ruleKind')}
                    </div>
                    <div 
                      className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-px-cyan/50"
                      onMouseDown={(e) => handleMouseDown('ruleKind', e)}
                    >
                      <GripVertical className="h-4 w-4 absolute right-0 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-zinc-700">Tiers</th>
                  <th 
                    className="px-6 py-4 text-center text-sm font-semibold text-zinc-700"
                    style={{ width: columnWidths.actions }}
                  >
                    Actions
                  </th>
            </tr>
          </thead>
              <tbody className="divide-y divide-zinc-200">
                {paginatedGroupedRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-px-muted">
                      <div className="space-y-2">
                        <p className="text-lg font-medium">No pricing rows found</p>
                        <p className="text-sm">Click "Add Row" to create your first pricing tier</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedGroupedRows.map((group, groupIndex) => (
                    <React.Fragment key={group.key}>
                      {/* Group Header */}
                      <tr className="bg-gradient-to-r from-px-cyan/5 to-px-magenta/5 border-b-2 border-px-cyan/20">
                        <td colSpan={8} className="px-6 py-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <h3 className="text-lg font-semibold text-px-fg">
                                {service?.name} - {Object.entries(group.attrs)
                                  .filter(([key, value]) => value && !['Qty', 'PRICE', 'NET PRICE', 'VAT', 'Price +VAT'].includes(key))
                                  .map(([key, value]) => `${key}: ${value}`)
                                  .join(' - ')}
                              </h3>
                              <Badge variant="outline" className="text-px-cyan border-px-cyan/20">
                                {group.rows.length} variant{group.rows.length !== 1 ? 's' : ''}
                              </Badge>
                            </div>
                            <Button
                              onClick={() => addRowToGroup(group.attrs)}
                              size="sm"
                              className="bg-gradient-to-r from-px-cyan to-px-magenta hover:from-px-cyan/90 hover:to-px-magenta/90 text-white"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add Row
                            </Button>
                          </div>
                        </td>
                      </tr>
                      
                      {/* Group Rows */}
                      {group.rows.map((row, rowIndex) => {
                        // Use tiers if available, otherwise fall back to attrs
                        const hasTiers = row.tiers && row.tiers.length > 0;
                        
                        if (hasTiers) {
                          // Sort tiers by quantity
                          const sortedTiers = [...(row.tiers || [])].sort((a, b) => a.qty - b.qty);
                          
                          return sortedTiers.map((tier, tierIndex) => (
                            <tr key={`${row.id}-${tier.id || tierIndex}`} className="hover:bg-zinc-50/50 transition-colors">
                              <td className="px-6 py-4 text-center">
                                <span className="font-medium text-zinc-900">{tier.qty.toLocaleString()}</span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="font-medium text-zinc-900">£{tier.unit.toFixed(2)}</span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="font-medium text-zinc-900">£{(tier.qty * tier.unit).toFixed(2)}</span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="font-medium text-zinc-600">£{(tier.qty * tier.unit * 0.2).toFixed(2)}</span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="font-bold text-px-cyan">£{(tier.qty * tier.unit * 1.2).toFixed(2)}</span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                                  {row.ruleKind}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 text-center">
                                {tierIndex === 0 && (
                                  <TierEditor 
                                    row={row} 
                                    onSaved={async (oldTiers, newTiers) => {
                                      load();
                                      await addTierChangeHistory(oldTiers, newTiers, row.id);
                                    }} 
                                  />
                                )}
                              </td>
                              <td className="px-6 py-4 text-center">
                                {tierIndex === 0 && (
                                  <div className="flex items-center justify-center space-x-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={()=>delRow(row.id)}
                                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                                      title="Delete row"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ));
                        } else {
                          // Fallback to attrs data
                          const attrs = parseAttrs(row.attrs);
                          const qty = parseInt(attrs.Qty || '0');
                          const price = parseFloat(attrs['PRICE'] || '0');
                          const netPrice = parseFloat(attrs['NET PRICE'] || '0');
                          const vat = parseFloat(attrs.VAT || '0');
                          const priceWithVat = parseFloat(attrs['Price +VAT'] || '0');
                    
                    return (
                      <tr key={row.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="px-6 py-4 text-center">
                                <span className="font-medium text-zinc-900">{qty.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                                <span className="font-medium text-zinc-900">£{price.toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                                <span className="font-medium text-zinc-900">£{netPrice.toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                                <span className="font-medium text-zinc-600">£{vat.toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                                <span className="font-bold text-px-cyan">£{priceWithVat.toFixed(2)}</span>
                  </td>
                        <td className="px-6 py-4 text-center">
                          <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                            {row.ruleKind}
                          </Badge>
                </td>
                        <td className="px-6 py-4 text-center">
                          <TierEditor 
                            row={row} 
                            onSaved={async (oldTiers, newTiers) => {
                              load();
                              await addTierChangeHistory(oldTiers, newTiers, row.id);
                            }} 
                          />
                </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={()=>delRow(row.id)}
                              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                              title="Delete row"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                </td>
              </tr>
                    );
                        }
                      })}
                    </React.Fragment>
                  ))
                )}
          </tbody>
        </table>
            )}
      </div>
        </AdminCard>
        
        {/* Pagination Controls */}
        {totalItems > itemsPerPage && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-zinc-50 border-t">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-px-muted">Items per page:</span>
              <Select value={itemsPerPage.toString()} onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-px-muted">
                Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} groups
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-px-muted px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                Last
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Change History */}
      <ScrollReveal>
        <AdminCard title="Change History" className="p-3 sm:p-4">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center space-x-2">
              <h3 className="text-base sm:text-lg font-semibold text-px-fg">Change History</h3>
              <Badge variant="outline" className="text-px-muted text-xs">
                {changeHistory.length} entries
              </Badge>
      </div>

            {changeHistory.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-px-muted">
                <p className="text-sm sm:text-base">No changes recorded yet</p>
                <p className="text-xs sm:text-sm">Changes will appear here as you modify pricing</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
                {changeHistory.map((entry) => (
                  <div key={entry.id} className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 py-2 px-2 sm:px-3 bg-zinc-50 rounded-lg">
                    <div className="flex items-center space-x-2 sm:space-x-0">
                      <div className="text-xs sm:text-sm text-zinc-500 font-mono min-w-[60px] sm:min-w-[80px]">
                      {entry.date}
                    </div>
                      <div className="text-xs sm:text-sm text-zinc-500 font-mono min-w-[40px] sm:min-w-[60px]">
                      {entry.time}
                    </div>
                    </div>
                    <div className="text-xs sm:text-sm text-zinc-700 flex-1 min-w-0">
                      {entry.change}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </AdminCard>
      </ScrollReveal>

      {/* Service Editor Modal */}
      {showServiceEditor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <ServiceEditor
              serviceSlug={slug}
              serviceName={service?.name || 'Service'}
              onClose={() => setShowServiceEditor(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function TierEditor({ row, onSaved }:{ row: Row; onSaved: (oldTiers: any[], newTiers: any[])=>void }) {
  const [open, setOpen] = useState(false);
  const [tiers, setTiers] = useState<{qty:number;unit:number}[]>([]);
  const [setup, setSetup] = useState<number | null>(row.setup ?? null);
  const [originalTiers, setOriginalTiers] = useState<{qty:number;unit:number}[]>([]);

  useEffect(()=>{
    const currentTiers = (row.tiers ?? []).map(t=>({ qty: t.qty, unit: t.unit }));
    setTiers(currentTiers);
    setOriginalTiers(currentTiers);
  },[row]);

  function add(){ setTiers(t=> [...t, { qty:100, unit:0 }]) }
  function rm(i:number){ setTiers(t=> t.filter((_,k)=>k!==i)) }

  async function save(){
    const r = await fetch(`/api/admin/prices/rows/${row.id}/tiers`, {
      method:"PUT", headers:{ "content-type":"application/json" },
      body: JSON.stringify({ tiers, setup })
    });
    const d = await r.json(); 
    if (d.ok) { 
      setOpen(false); 
      onSaved(originalTiers, tiers);
    } else { 
      /* noop */ 
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" title="Edit tiers" className="h-5 flex-1">
          <Edit className="h-2.5 w-2.5 mr-1" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm mx-2 sm:mx-4 w-[calc(100vw-1rem)] sm:w-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-sm sm:text-base">Tiers for row #{row.id}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-xs sm:text-sm text-zinc-600 w-16 sm:w-20">Setup</span>
            <Input 
              type="number" 
              step="0.01" 
              value={setup ?? ""} 
              onChange={e=> setSetup(e.target.value==="" ? null : Number(e.target.value))} 
              className="h-8 text-xs sm:h-9 sm:text-sm"
              placeholder="0.00"
            />
          </div>
          
          <div className="space-y-2">
            <div className="text-xs sm:text-sm font-medium text-zinc-700">Pricing Tiers</div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
                {tiers.map((t,i)=>(
                <div key={i} className="flex items-center gap-2 p-2 bg-zinc-50 rounded border">
                  <div className="flex-1">
                    <label className="text-xs text-zinc-500 block mb-1">Quantity</label>
                    <Input 
                      type="number" 
                      value={t.qty} 
                      onChange={e=> setTiers(arr=> arr.map((x,k)=> k===i ? {...x, qty:Number(e.target.value)} : x))} 
                      className="h-7 text-xs"
                      placeholder="100"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-zinc-500 block mb-1">Unit Price</label>
                    <Input 
                      type="number" 
                      step="0.01" 
                      value={t.unit} 
                      onChange={e=> setTiers(arr=> arr.map((x,k)=> k===i ? {...x, unit:Number(e.target.value)} : x))} 
                      className="h-7 text-xs"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      variant="outline" 
                      onClick={()=>rm(i)}
                      className="h-7 w-7 p-0 text-red-500 hover:bg-red-50 hover:border-red-300"
                      title="Remove tier"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={add}
              className="h-8 text-xs sm:h-9 sm:text-sm flex-1"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add tier
            </Button>
            <Button 
              onClick={save}
              className="h-8 text-xs sm:h-9 sm:text-sm flex-1"
            >
              <Save className="h-3 w-3 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

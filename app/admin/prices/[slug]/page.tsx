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
  RefreshCw
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AdminCard from "@/components/admin/AdminCard";
import ScrollReveal from "@/components/ux/ScrollReveal";

type Row = { id:number; attrs:Record<string,string>; ruleKind:"tiers"|"perUnit"|"fixed"; unit?:number|null; setup?:number|null; fixed?:number|null; tiers?:{id:number;qty:number;unit:number}[] };

type SortField = 'qty' | 'price' | 'netPrice' | 'vat' | 'priceWithVat' | 'ruleKind';
type SortDirection = 'asc' | 'desc' | null;

export default function Page() {
  const { slug } = useParams() as { slug: string };
  const router = useRouter();
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
  
  // Change history state
  const [changeHistory, setChangeHistory] = useState<Array<{
    id: string;
    date: string;
    time: string;
    change: string;
    changeType: string;
    rowId?: number;
  }>>([]);

  async function load() {
    try {
      setLoading(true);
    const r = await fetch(`/api/admin/prices/services/${slug}/rows`, { cache:"no-store" });
      const d = await r.json(); 
      if (!d?.ok) return;
      setService(d.service); 
      setRows(d.rows);
      
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
      const response = await fetch(`/api/admin/prices/services/${slug}/history`);
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
    const r = await fetch(`/api/admin/prices/services/${slug}/rows`, { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify({ attrs:{}, ruleKind:"tiers", unit:0 }) });
    const d = await r.json(); 
    if (d.ok) {
      load();
      await addChangeHistory("Added new pricing row", 'row_create', d.rowId);
    } else {
      toast.error("Error");
    }
  }

  async function addRowToGroup(groupAttrs: any) {
    const r = await fetch(`/api/admin/prices/services/${slug}/rows`, { 
      method:"POST", 
      headers:{ "content-type":"application/json" }, 
      body: JSON.stringify({ 
        attrs: groupAttrs, 
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
    
    const r = await fetch(`/api/admin/prices/services/${slug}/rows`, { 
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
      
      const response = await fetch(`/api/admin/prices/services/${slug}/history/add`, {
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

  // Group rows by attributes (Color, Sides, etc.)
  function getGroupedRows() {
    const groups = new Map<string, Row[]>();
    
    rows.forEach(row => {
      const key = JSON.stringify({
        Sides: row.attrs?.Sides || '',
        Color: row.attrs?.Color || ''
      });
      
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(row);
    });
    
    return Array.from(groups.entries()).map(([key, groupRows]) => {
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <ScrollReveal>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="border-px-cyan text-px-cyan hover:bg-px-cyan hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight font-playfair">
                <span className="text-px-fg">{service?.name}</span>
              </h1>
              <p className="text-lg text-px-muted max-w-2xl mt-2">
                <code className="text-sm bg-zinc-100 px-2 py-1 rounded">{slug}</code> • Manage pricing tiers and rules
              </p>
            </div>
          </div>
          <Button
            onClick={load}
            variant="outline"
            className="border-px-cyan text-px-cyan hover:bg-px-cyan hover:text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </ScrollReveal>

      {/* Stats Cards */}
      <ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <AdminCard title="Price Rows" className="bg-gradient-to-br from-px-cyan/5 to-px-cyan/10 border-px-cyan/20">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-px-cyan/10 rounded-lg">
                <Package className="h-6 w-6 text-px-cyan" />
              </div>
              <div>
                <p className="text-2xl font-bold text-px-cyan">{rows.length}</p>
                <p className="text-sm text-px-muted">Price Rows</p>
              </div>
            </div>
          </AdminCard>

          <AdminCard title="Total Tiers" className="bg-gradient-to-br from-px-magenta/5 to-px-magenta/10 border-px-magenta/20">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-px-magenta/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-px-magenta" />
              </div>
              <div>
                <p className="text-2xl font-bold text-px-magenta">{totalTiers}</p>
                <p className="text-sm text-px-muted">Total Tiers</p>
              </div>
            </div>
          </AdminCard>

          <AdminCard title="Min Price" className="bg-gradient-to-br from-px-yellow/5 to-px-yellow/10 border-px-yellow/20">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-px-yellow/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-px-yellow" />
              </div>
              <div>
                <p className="text-2xl font-bold text-px-yellow">£{minPrice.toFixed(2)}</p>
                <p className="text-sm text-px-muted">Min Price</p>
              </div>
            </div>
          </AdminCard>

          <AdminCard title="Max Price" className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">£{maxPrice.toFixed(2)}</p>
                <p className="text-sm text-px-muted">Max Price</p>
              </div>
            </div>
          </AdminCard>
        </div>
      </ScrollReveal>

      {/* Table Controls */}
      <ScrollReveal>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-px-muted">
              {sortedRows.length} rows
            </Badge>
            {sortDirection && (
              <Badge variant="outline" className="text-px-cyan border-px-cyan/20">
                Sorted by {sortField} ({sortDirection})
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-px-muted">
              Click column headers to sort • Drag column edges to resize
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetColumnSettings}
              className="border-px-magenta text-px-magenta hover:bg-px-magenta hover:text-white"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset Layout
            </Button>
            <Button
              onClick={addNewType}
              className="bg-gradient-to-r from-px-yellow to-px-magenta hover:from-px-yellow/90 hover:to-px-magenta/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Type
            </Button>
            <Button
              onClick={addRow}
              className="bg-gradient-to-r from-px-cyan to-px-magenta hover:from-px-cyan/90 hover:to-px-magenta/90 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Row
            </Button>
          </div>
        </div>
      </ScrollReveal>

      {/* Pricing Table */}
      <ScrollReveal>
        <AdminCard title="Pricing Table" className="p-0">
          <div className="overflow-x-auto">
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
                {groupedRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-px-muted">
                      <div className="space-y-2">
                        <p className="text-lg font-medium">No pricing rows found</p>
                        <p className="text-sm">Click "Add Row" to create your first pricing tier</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  groupedRows.map((group, groupIndex) => (
                    <React.Fragment key={group.key}>
                      {/* Group Header */}
                      <tr className="bg-gradient-to-r from-px-cyan/5 to-px-magenta/5 border-b-2 border-px-cyan/20">
                        <td colSpan={8} className="px-6 py-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <h3 className="text-lg font-semibold text-px-fg">
                                {service?.name} - {group.attrs.Sides}
                                {group.attrs.Color && ` (${group.attrs.Color})`}
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
                                <Badge className="bg-gradient-to-r from-px-cyan/10 to-px-magenta/10 text-px-cyan border-px-cyan/20">
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
                          const qty = parseInt(row.attrs?.Qty || '0');
                          const price = parseFloat(row.attrs?.['PRICE'] || '0');
                          const netPrice = parseFloat(row.attrs?.['NET PRICE'] || '0');
                          const vat = parseFloat(row.attrs?.VAT || '0');
                          const priceWithVat = parseFloat(row.attrs?.['Price +VAT'] || '0');
                    
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
                          <Badge className="bg-gradient-to-r from-px-cyan/10 to-px-magenta/10 text-px-cyan border-px-cyan/20">
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
      </div>
        </AdminCard>
      </ScrollReveal>

      {/* Change History */}
      <ScrollReveal>
        <AdminCard title="Change History">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-px-fg">Change History</h3>
              <Badge variant="outline" className="text-px-muted">
                {changeHistory.length} entries
              </Badge>
      </div>

            {changeHistory.length === 0 ? (
              <div className="text-center py-8 text-px-muted">
                <p>No changes recorded yet</p>
                <p className="text-sm">Changes will appear here as you modify pricing</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {changeHistory.map((entry) => (
                  <div key={entry.id} className="flex items-center space-x-3 py-2 px-3 bg-zinc-50 rounded-lg">
                    <div className="text-sm text-zinc-500 font-mono min-w-[80px]">
                      {entry.date}
                    </div>
                    <div className="text-sm text-zinc-500 font-mono min-w-[60px]">
                      {entry.time}
                    </div>
                    <div className="text-sm text-zinc-700 flex-1">
                      {entry.change}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </AdminCard>
      </ScrollReveal>
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
        <Button variant="outline" size="sm" title="Edit tiers">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Tiers for row #{row.id}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-600 w-24">Setup</span>
            <Input type="number" step="0.01" value={setup ?? ""} onChange={e=> setSetup(e.target.value==="" ? null : Number(e.target.value))} />
          </div>
          <div className="rounded border">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50"><tr><th className="p-2 text-left">Qty ≥</th><th className="p-2 text-left">Unit £</th><th></th></tr></thead>
              <tbody>
                {tiers.map((t,i)=>(
                  <tr key={i} className="border-t">
                    <td className="p-2"><Input type="number" value={t.qty} onChange={e=> setTiers(arr=> arr.map((x,k)=> k===i ? {...x, qty:Number(e.target.value)} : x))} /></td>
                    <td className="p-2"><Input type="number" step="0.01" value={t.unit} onChange={e=> setTiers(arr=> arr.map((x,k)=> k===i ? {...x, unit:Number(e.target.value)} : x))} /></td>
                    <td className="p-2 text-right"><Button variant="outline" onClick={()=>rm(i)}>Remove</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={add}>Add tier</Button>
            <Button onClick={save}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

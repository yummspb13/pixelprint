"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Edit, Save, Trash2, ArrowUpDown, ArrowUp, ArrowDown, RefreshCw, Search, Filter, CheckSquare, Square, MoreHorizontal, GripVertical, Package, BarChart3, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface PriceTier {
  id: number;
  qty: number;
  unit: number;
  netPrice: number;
  vat: number;
  totalPrice: number;
}

interface Service {
  id: number;
  name: string;
  slug: string;
  category: string;
  rows: Array<{
    id: number;
    attrs: Record<string, string>;
    ruleKind: string;
    tiers: PriceTier[];
  }>;
}

interface PriceRow {
  id: string;
  serviceId: number;
  serviceName: string;
  category: string;
  qty: number;
  unit: number;
  netPrice: number;
  vat: number;
  totalPrice: number;
  rowId: number;
  tierId: number;
}

type SortField = 'serviceName' | 'category' | 'qty' | 'unit' | 'netPrice' | 'vat' | 'totalPrice';
type SortDirection = 'asc' | 'desc' | null;

const VAT_RATE = 0.2; // 20%

export default function PricesTable() {
  const [services, setServices] = useState<Service[]>([]);
  const [priceRows, setPriceRows] = useState<PriceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTier, setEditingTier] = useState<{ serviceId: number; rowId: number; tierId: number } | null>(null);
  const [editForm, setEditForm] = useState({ qty: 0, unit: 0 });
  const [sortField, setSortField] = useState<SortField>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin-prices-table-sort-field');
      if (saved && ['serviceName', 'category', 'qty', 'unit', 'netPrice', 'vat', 'totalPrice'].includes(saved)) {
        return saved as SortField;
      }
    }
    return 'serviceName';
  });
  const [sortDirection, setSortDirection] = useState<SortDirection>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin-prices-table-sort-direction');
      if (saved && ['asc', 'desc', null].includes(saved)) {
        return saved as SortDirection;
      }
    }
    return 'asc';
  });
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isSelectAll, setIsSelectAll] = useState(false);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [bulkEditForm, setBulkEditForm] = useState({ qty: 0, unit: 0 });
  
  // Column width states with localStorage persistence
  const [columnWidths, setColumnWidths] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('admin-prices-table-column-widths');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.warn('Failed to parse saved column widths:', e);
        }
      }
    }
    return {
      checkbox: 50,
      service: 200,
      category: 150,
      qty: 100,
      unit: 120,
      net: 120,
      vat: 120,
      total: 120,
      actions: 120
    };
  });
  const [isResizing, setIsResizing] = useState<string | null>(null);

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    try {
      const response = await fetch("/api/admin/prices/services/");
      const data = await response.json();
      
      // Загружаем детали для каждого сервиса
      const servicesWithDetails = await Promise.all(
        data.map(async (service: any) => {
          const rowsResponse = await fetch(`/api/admin/prices/services/${service.slug}/rows/`);
          const rowsData = await rowsResponse.json();
          return {
            ...service,
            rows: rowsData.ok ? rowsData.rows : []
          };
        })
      );
      
      setServices(servicesWithDetails);
      
      // Преобразуем в плоский массив для сортировки
      const flatRows: PriceRow[] = [];
      servicesWithDetails.forEach(service => {
        service.rows.forEach((row: any) => {
          row.tiers.forEach((tier: any) => {
            const { netPrice, vat, totalPrice } = calculatePrices(tier.qty, tier.unit);
            flatRows.push({
              id: `${service.id}-${row.id}-${tier.id}`,
              serviceId: service.id,
              serviceName: service.name,
              category: service.category,
              qty: tier.qty,
              unit: tier.unit,
              netPrice,
              vat,
              totalPrice,
              rowId: row.id,
              tierId: tier.id
            });
          });
        });
      });
      
      setPriceRows(flatRows);
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Error loading data');
    } finally {
      setLoading(false);
    }
  }

  function calculatePrices(qty: number, unit: number) {
    const netPrice = qty * unit;
    const vat = netPrice * VAT_RATE;
    const totalPrice = netPrice + vat;
    return { netPrice, vat, totalPrice };
  }

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
      localStorage.setItem('admin-prices-table-sort-field', field);
      localStorage.setItem('admin-prices-table-sort-direction', newDirection || '');
    }
  }

  function getFilteredAndSortedRows() {
    let filtered = priceRows;
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(row => 
        row.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(row => row.category === selectedCategory);
    }
    
    // Sort
    if (sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return filtered;
  }

  function getSortedRows() {
    return getFilteredAndSortedRows();
  }

  function getSortIcon(field: SortField) {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    if (sortDirection === 'asc') return <ArrowUp className="h-4 w-4" />;
    if (sortDirection === 'desc') return <ArrowDown className="h-4 w-4" />;
    return <ArrowUpDown className="h-4 w-4" />;
  }

  // Bulk selection functions
  function handleSelectAll() {
    if (isSelectAll) {
      setSelectedRows(new Set());
      setIsSelectAll(false);
    } else {
      const allIds = new Set(getSortedRows().map(row => row.id));
      setSelectedRows(allIds);
      setIsSelectAll(true);
    }
  }

  function handleSelectRow(rowId: string) {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(rowId)) {
      newSelected.delete(rowId);
    } else {
      newSelected.add(rowId);
    }
    setSelectedRows(newSelected);
    setIsSelectAll(newSelected.size === getSortedRows().length);
  }

  function getUniqueCategories() {
    return Array.from(new Set(services.map(service => service.category))).sort();
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
        localStorage.setItem('admin-prices-table-column-widths', JSON.stringify(newWidths));
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

  // Bulk edit functions
  function startBulkEdit() {
    if (selectedRows.size === 0) {
      toast.error('Please select rows to edit');
      return;
    }
    setBulkEditMode(true);
    setBulkEditForm({ qty: 0, unit: 0 });
  }

  async function saveBulkEdit() {
    if (selectedRows.size === 0) return;
    
    try {
      const selectedRowsData = priceRows.filter(row => selectedRows.has(row.id));
      const rowIds = Array.from(new Set(selectedRowsData.map(row => row.rowId)));
      
      for (const rowId of rowIds) {
        await fetch(`/api/admin/prices/rows/${rowId}/tiers/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tiers: [{ qty: bulkEditForm.qty, unit: bulkEditForm.unit }],
            setup: 0
          })
        });
      }
      
      toast.success(`Updated ${selectedRows.size} price tiers`);
      setBulkEditMode(false);
      setSelectedRows(new Set());
      setIsSelectAll(false);
      loadServices();
    } catch (error) {
      console.error('Error bulk editing:', error);
      toast.error('Error updating prices');
    }
  }

  async function deleteSelected() {
    if (selectedRows.size === 0) {
      toast.error('Please select rows to delete');
      return;
    }
    
    if (!confirm(`Delete ${selectedRows.size} selected price tiers?`)) return;
    
    try {
      const selectedRowsData = priceRows.filter(row => selectedRows.has(row.id));
      const rowIds = Array.from(new Set(selectedRowsData.map(row => row.rowId)));
      
      for (const rowId of rowIds) {
        await fetch(`/api/admin/prices/rows/${rowId}`, {
          method: 'DELETE'
        });
      }
      
      toast.success(`Deleted ${selectedRows.size} price tiers`);
      setSelectedRows(new Set());
      setIsSelectAll(false);
      loadServices();
    } catch (error) {
      console.error('Error deleting rows:', error);
      toast.error('Error deleting prices');
    }
  }

  function startEdit(serviceId: number, rowId: number, tierId: number, qty: number, unit: number) {
    setEditingTier({ serviceId, rowId, tierId });
    setEditForm({ qty, unit });
  }

  async function saveTier() {
    if (!editingTier) return;
    
    try {
      const { netPrice, vat, totalPrice } = calculatePrices(editForm.qty, editForm.unit);
      
      // Обновляем тир через API
      const response = await fetch(`/api/admin/prices/rows/${editingTier.rowId}/tiers/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tiers: [{ qty: editForm.qty, unit: editForm.unit }],
          setup: 0
        })
      });
      
      if (response.ok) {
        toast.success('Price updated');
        setEditingTier(null);
        loadServices();
      } else {
        toast.error('Error updating price');
      }
    } catch (error) {
      console.error('Error saving tier:', error);
      toast.error('Error saving');
    }
  }

  async function deleteTier(serviceId: number, rowId: number, tierId: number) {
    if (!confirm('Delete this price?')) return;
    
    try {
      // Удаляем весь ряд цен
      const response = await fetch(`/api/admin/prices/rows/${rowId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast.success('Price deleted');
        loadServices();
      } else {
        toast.error('Error deleting price');
      }
    } catch (error) {
      console.error('Error deleting tier:', error);
      toast.error('Error deleting');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-px-cyan mx-auto"></div>
          <p className="text-px-muted">Loading prices...</p>
        </div>
      </div>
    );
  }

  const sortedRows = getSortedRows();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-px-cyan via-px-magenta to-px-yellow bg-clip-text text-transparent font-playfair">
            All Prices
          </h2>
          <p className="text-px-muted mt-1">Manage and edit all pricing tiers</p>
        </div>
        <Button onClick={loadServices} variant="outline" className="border-px-cyan text-px-cyan hover:bg-px-cyan hover:text-white">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-zinc-300 focus:border-px-cyan focus:ring-px-cyan"
            />
          </div>
          
          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="pl-10 border-zinc-300 focus:border-px-cyan focus:ring-px-cyan">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {getUniqueCategories().map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Bulk Actions */}
          <div className="flex items-center space-x-2">
            {selectedRows.size > 0 && (
              <>
                <Button
                  onClick={startBulkEdit}
                  variant="outline"
                  size="sm"
                  className="border-px-magenta text-px-magenta hover:bg-px-magenta hover:text-white"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit ({selectedRows.size})
                </Button>
                <Button
                  onClick={deleteSelected}
                  variant="outline"
                  size="sm"
                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete ({selectedRows.size})
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-px-cyan/5 to-px-cyan/10 rounded-xl p-6 border border-px-cyan/20 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-px-cyan/10 rounded-lg">
              <Package className="h-6 w-6 text-px-cyan" />
            </div>
            <div>
              <div className="text-2xl font-bold text-px-cyan">{priceRows.length}</div>
              <div className="text-sm text-px-muted">Total Price Tiers</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-px-magenta/5 to-px-magenta/10 rounded-xl p-6 border border-px-magenta/20 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-px-magenta/10 rounded-lg">
              <BarChart3 className="h-6 w-6 text-px-magenta" />
            </div>
            <div>
              <div className="text-2xl font-bold text-px-magenta">{services.length}</div>
              <div className="text-sm text-px-muted">Services</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-px-yellow/5 to-px-yellow/10 rounded-xl p-6 border border-px-yellow/20 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-px-yellow/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-px-yellow" />
            </div>
            <div>
              <div className="text-2xl font-bold text-px-yellow">
                £{Math.max(...priceRows.map(r => r.totalPrice), 0).toFixed(2)}
              </div>
              <div className="text-sm text-px-muted">Highest Price</div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full" style={{ tableLayout: 'fixed' }}>
            <thead className="bg-gradient-to-r from-zinc-50 to-zinc-100 border-b border-zinc-200">
              <tr>
                <th 
                  className="px-1 py-4 text-center text-sm font-semibold text-zinc-700 relative"
                  style={{ width: columnWidths.checkbox }}
                >
                  <Checkbox
                    checked={isSelectAll}
                    onCheckedChange={handleSelectAll}
                    className="border-zinc-300"
                  />
                  <div 
                    className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-px-cyan/50"
                    onMouseDown={(e) => handleMouseDown('checkbox', e)}
                  >
                    <GripVertical className="h-4 w-4 absolute right-0 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-sm font-semibold text-zinc-700 cursor-pointer hover:bg-zinc-200/50 transition-colors relative"
                  onClick={() => handleSort('serviceName')}
                  style={{ width: columnWidths.service }}
                >
                  <div className="flex items-center space-x-2">
                    <span>Service</span>
                    {getSortIcon('serviceName')}
                  </div>
                  <div 
                    className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-px-cyan/50"
                    onMouseDown={(e) => handleMouseDown('service', e)}
                  >
                    <GripVertical className="h-4 w-4 absolute right-0 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-sm font-semibold text-zinc-700 cursor-pointer hover:bg-zinc-200/50 transition-colors relative"
                  onClick={() => handleSort('category')}
                  style={{ width: columnWidths.category }}
                >
                  <div className="flex items-center space-x-2">
                    <span>Category</span>
                    {getSortIcon('category')}
                  </div>
                  <div 
                    className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-px-cyan/50"
                    onMouseDown={(e) => handleMouseDown('category', e)}
                  >
                    <GripVertical className="h-4 w-4 absolute right-0 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-center text-sm font-semibold text-zinc-700 cursor-pointer hover:bg-zinc-200/50 transition-colors relative"
                  onClick={() => handleSort('qty')}
                  style={{ width: columnWidths.qty }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>Quantity</span>
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
                  onClick={() => handleSort('unit')}
                  style={{ width: columnWidths.unit }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>Unit Price</span>
                    {getSortIcon('unit')}
                  </div>
                  <div 
                    className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-px-cyan/50"
                    onMouseDown={(e) => handleMouseDown('unit', e)}
                  >
                    <GripVertical className="h-4 w-4 absolute right-0 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-center text-sm font-semibold text-zinc-700 cursor-pointer hover:bg-zinc-200/50 transition-colors relative"
                  onClick={() => handleSort('netPrice')}
                  style={{ width: columnWidths.net }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>Net Amount</span>
                    {getSortIcon('netPrice')}
                  </div>
                  <div 
                    className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-px-cyan/50"
                    onMouseDown={(e) => handleMouseDown('net', e)}
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
                    <span>VAT (20%)</span>
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
                  onClick={() => handleSort('totalPrice')}
                  style={{ width: columnWidths.total }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <span>Total</span>
                    {getSortIcon('totalPrice')}
                  </div>
                  <div 
                    className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-px-cyan/50"
                    onMouseDown={(e) => handleMouseDown('total', e)}
                  >
                    <GripVertical className="h-4 w-4 absolute right-0 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-center text-sm font-semibold text-zinc-700"
                  style={{ width: columnWidths.actions }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {sortedRows.map((row) => (
                <tr key={row.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-1 py-4 text-center">
                    <Checkbox
                      checked={selectedRows.has(row.id)}
                      onCheckedChange={() => handleSelectRow(row.id)}
                      className="border-zinc-300"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-zinc-900 truncate">{row.serviceName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge className="bg-gradient-to-r from-px-cyan/10 to-px-magenta/10 text-px-cyan border-px-cyan/20">
                      {row.category}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-medium text-zinc-900">{row.qty.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-medium text-zinc-900">£{row.unit.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-medium text-zinc-900">£{row.netPrice.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-medium text-zinc-600">£{row.vat.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-px-cyan">£{row.totalPrice.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(row.serviceId, row.rowId, row.tierId, row.qty, row.unit)}
                        className="text-px-cyan hover:text-px-cyan hover:bg-px-cyan/10"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTier(row.serviceId, row.rowId, row.tierId)}
                        className="text-red-600 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingTier} onOpenChange={() => setEditingTier(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Edit Price</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Quantity</label>
                <Input
                  type="number"
                  value={editForm.qty}
                  onChange={(e) => setEditForm({ ...editForm, qty: Number(e.target.value) })}
                  className="border-zinc-300 focus:border-px-cyan focus:ring-px-cyan"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Unit Price</label>
                <Input
                  type="number"
                  step="0.01"
                  value={editForm.unit}
                  onChange={(e) => setEditForm({ ...editForm, unit: Number(e.target.value) })}
                  className="border-zinc-300 focus:border-px-cyan focus:ring-px-cyan"
                />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-zinc-50 to-zinc-100 p-4 rounded-lg border border-zinc-200">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-600">Net Amount:</span>
                  <span className="font-medium">£{calculatePrices(editForm.qty, editForm.unit).netPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600">VAT (20%):</span>
                  <span className="font-medium">£{calculatePrices(editForm.qty, editForm.unit).vat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-px-cyan border-t border-zinc-300 pt-2">
                  <span>Total:</span>
                  <span>£{calculatePrices(editForm.qty, editForm.unit).totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setEditingTier(null)} className="border-zinc-300">
                Cancel
              </Button>
              <Button onClick={saveTier} className="bg-px-cyan hover:bg-px-cyan/90 text-white">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Edit Dialog */}
      <Dialog open={bulkEditMode} onOpenChange={setBulkEditMode}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Bulk Edit ({selectedRows.size} selected)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-px-magenta/10 to-px-magenta/5 p-4 rounded-lg border border-px-magenta/20">
              <p className="text-sm text-px-magenta">
                This will update all selected price tiers with the same quantity and unit price.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Quantity</label>
                <Input
                  type="number"
                  value={bulkEditForm.qty}
                  onChange={(e) => setBulkEditForm({ ...bulkEditForm, qty: Number(e.target.value) })}
                  className="border-zinc-300 focus:border-px-magenta focus:ring-px-magenta"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Unit Price</label>
                <Input
                  type="number"
                  step="0.01"
                  value={bulkEditForm.unit}
                  onChange={(e) => setBulkEditForm({ ...bulkEditForm, unit: Number(e.target.value) })}
                  className="border-zinc-300 focus:border-px-magenta focus:ring-px-magenta"
                />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-zinc-50 to-zinc-100 p-4 rounded-lg border border-zinc-200">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-600">Net Amount:</span>
                  <span className="font-medium">£{calculatePrices(bulkEditForm.qty, bulkEditForm.unit).netPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600">VAT (20%):</span>
                  <span className="font-medium">£{calculatePrices(bulkEditForm.qty, bulkEditForm.unit).vat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-px-magenta border-t border-zinc-300 pt-2">
                  <span>Total:</span>
                  <span>£{calculatePrices(bulkEditForm.qty, bulkEditForm.unit).totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setBulkEditMode(false)} className="border-zinc-300">
                Cancel
              </Button>
              <Button onClick={saveBulkEdit} className="bg-px-magenta hover:bg-px-magenta/90 text-white">
                <Save className="h-4 w-4 mr-2" />
                Update All
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

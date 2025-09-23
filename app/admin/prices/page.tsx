"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Edit, 
  Save, 
  Trash2, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  RefreshCw, 
  Search, 
  Filter, 
  Plus,
  Package,
  BarChart3,
  TrendingUp,
  DollarSign
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import AdminCard from "@/components/admin/AdminCard";
import ScrollReveal from "@/components/ux/ScrollReveal";

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
  ruleKind?: string;
}

type SortField = 'serviceName' | 'category' | 'qty' | 'unit' | 'netPrice' | 'vat' | 'totalPrice';
type SortDirection = 'asc' | 'desc' | null;

const VAT_RATE = 0.2; // 20%

export default function PricesServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [priceRows, setPriceRows] = useState<PriceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTier, setEditingTier] = useState<{ serviceId: number; rowId: number; tierId: number } | null>(null);
  const [editForm, setEditForm] = useState({ qty: 0, unit: 0 });
  const [sortField, setSortField] = useState<SortField>('serviceName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isSelectAll, setIsSelectAll] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/prices/services/");
      const data = await response.json();
      
      console.log('Services API response:', data);
      
      // Загружаем детали для каждого сервиса
      const servicesWithDetails = await Promise.all(
        data.map(async (service: any) => {
          try {
            const rowsResponse = await fetch(`/api/admin/prices/services/by-slug/${service.slug}/rows/`);
            const rowsData = await rowsResponse.json();
            console.log(`Rows for ${service.slug}:`, rowsData);
            return {
              ...service,
              rows: rowsData.ok ? rowsData.rows : []
            };
          } catch (error) {
            console.error(`Error loading rows for ${service.slug}:`, error);
            return {
              ...service,
              rows: []
            };
          }
        })
      );
      
      console.log('Services with details:', servicesWithDetails);
      setServices(servicesWithDetails);
      
      // Преобразуем в плоский массив для сортировки
      const flatRows: PriceRow[] = [];
      servicesWithDetails.forEach(service => {
        service.rows.forEach((row: any) => {
          if (row.ruleKind === 'tiers' && row.tiers && row.tiers.length > 0) {
            // Для tiers - создаем строку для каждого тира
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
                tierId: tier.id,
                ruleKind: 'tiers'
              });
            });
          } else if (row.ruleKind === 'perUnit' && row.unit !== null) {
            // Для perUnit - создаем одну строку с количеством 1
            const { netPrice, vat, totalPrice } = calculatePrices(1, row.unit);
            flatRows.push({
              id: `${service.id}-${row.id}-perunit`,
              serviceId: service.id,
              serviceName: service.name,
              category: service.category,
              qty: 1,
              unit: row.unit,
              netPrice,
              vat,
              totalPrice,
              rowId: row.id,
              tierId: 0,
              ruleKind: 'perUnit'
            });
          } else if (row.ruleKind === 'fixed' && row.fixed !== null) {
            // Для fixed - создаем одну строку с фиксированной ценой
            const { netPrice, vat, totalPrice } = calculatePrices(1, row.fixed);
            flatRows.push({
              id: `${service.id}-${row.id}-fixed`,
              serviceId: service.id,
              serviceName: service.name,
              category: service.category,
              qty: 1,
              unit: row.fixed,
              netPrice,
              vat,
              totalPrice,
              rowId: row.id,
              tierId: 0,
              ruleKind: 'fixed'
            });
          }
        });
      });
      
      console.log('Flat rows:', flatRows);
      console.log('Total rows created:', flatRows.length);
      
      if (flatRows.length === 0) {
        console.log('No rows created. Checking services data...');
        servicesWithDetails.forEach((service, index) => {
          console.log(`Service ${index}:`, service.name, 'has', service.rows.length, 'rows');
          service.rows.forEach((row: any, rowIndex: number) => {
            console.log(`  Row ${rowIndex}:`, {
              ruleKind: row.ruleKind,
              unit: row.unit,
              fixed: row.fixed,
              tiersCount: row.tiers?.length || 0
            });
          });
        });
      }
      
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
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
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
  
  console.log('Rendering with:', {
    priceRows: priceRows.length,
    sortedRows: sortedRows.length,
    services: services.length,
    searchTerm,
    selectedCategory
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <ScrollReveal>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight font-playfair">
              <span className="text-px-fg">Prices — </span>
              <span className="bg-gradient-to-r from-px-cyan via-px-magenta to-px-yellow bg-clip-text text-transparent animate-gradient">
                Services
              </span>
            </h1>
            <p className="text-lg text-px-muted max-w-2xl mt-2">
              Manage and edit all pricing tiers for your services
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              onClick={loadServices} 
              variant="outline" 
              className="border-px-cyan text-px-cyan hover:bg-px-cyan hover:text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button className="bg-gradient-to-r from-px-cyan to-px-magenta hover:from-px-cyan/90 hover:to-px-magenta/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </div>
        </div>
      </ScrollReveal>

      {/* Stats Cards */}
      <ScrollReveal>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <AdminCard title="Total Price Tiers" className="bg-gradient-to-br from-px-cyan/5 to-px-cyan/10 border-px-cyan/20">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-px-cyan/10 rounded-lg">
                <Package className="h-6 w-6 text-px-cyan" />
              </div>
              <div>
                <p className="text-2xl font-bold text-px-cyan">{priceRows.length}</p>
                <p className="text-sm text-px-muted">Total Price Tiers</p>
              </div>
            </div>
          </AdminCard>

          <AdminCard title="Active Services" className="bg-gradient-to-br from-px-magenta/5 to-px-magenta/10 border-px-magenta/20">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-px-magenta/10 rounded-lg">
                <BarChart3 className="h-6 w-6 text-px-magenta" />
              </div>
              <div>
                <p className="text-2xl font-bold text-px-magenta">{services.length}</p>
                <p className="text-sm text-px-muted">Services</p>
              </div>
            </div>
          </AdminCard>

          <AdminCard title="Highest Price" className="bg-gradient-to-br from-px-yellow/5 to-px-yellow/10 border-px-yellow/20">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-px-yellow/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-px-yellow" />
              </div>
              <div>
                <p className="text-2xl font-bold text-px-yellow">
                  £{Math.max(...priceRows.map(r => r.totalPrice), 0).toFixed(2)}
                </p>
                <p className="text-sm text-px-muted">Highest Price</p>
              </div>
            </div>
          </AdminCard>

          <AdminCard title="Total Value" className="bg-gradient-to-br from-green-500/5 to-green-500/10 border-green-500/20">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  £{priceRows.reduce((sum, r) => sum + r.totalPrice, 0).toFixed(2)}
                </p>
                <p className="text-sm text-px-muted">Total Value</p>
              </div>
            </div>
          </AdminCard>
        </div>
      </ScrollReveal>

      {/* Search and Filters */}
      <ScrollReveal>
        <AdminCard title="Search and Filters">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-px-muted" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-zinc-300 focus:border-px-cyan focus:ring-px-cyan"
              />
            </div>
            
            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-px-muted" />
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
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete ({selectedRows.size})
                </Button>
              )}
            </div>

            {/* View Options */}
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-px-muted">
                {sortedRows.length} of {priceRows.length} rows
              </Badge>
            </div>
          </div>
        </AdminCard>
      </ScrollReveal>

      {/* Table */}
      <ScrollReveal>
        <AdminCard title="Price Table" className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-zinc-50 to-zinc-100 border-b border-zinc-200">
                <tr>
                  <th className="px-1 py-4 text-center text-sm font-semibold text-zinc-700 w-12">
                    <Checkbox
                      checked={isSelectAll}
                      onCheckedChange={handleSelectAll}
                      className="border-zinc-300"
                    />
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-sm font-semibold text-zinc-700 cursor-pointer hover:bg-zinc-200/50 transition-colors"
                    onClick={() => handleSort('serviceName')}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Service</span>
                      {getSortIcon('serviceName')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left text-sm font-semibold text-zinc-700 cursor-pointer hover:bg-zinc-200/50 transition-colors"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Category</span>
                      {getSortIcon('category')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-center text-sm font-semibold text-zinc-700 cursor-pointer hover:bg-zinc-200/50 transition-colors"
                    onClick={() => handleSort('qty')}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <span>Quantity</span>
                      {getSortIcon('qty')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-center text-sm font-semibold text-zinc-700 cursor-pointer hover:bg-zinc-200/50 transition-colors"
                    onClick={() => handleSort('unit')}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <span>Unit Price</span>
                      {getSortIcon('unit')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-center text-sm font-semibold text-zinc-700 cursor-pointer hover:bg-zinc-200/50 transition-colors"
                    onClick={() => handleSort('netPrice')}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <span>Net Amount</span>
                      {getSortIcon('netPrice')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-center text-sm font-semibold text-zinc-700 cursor-pointer hover:bg-zinc-200/50 transition-colors"
                    onClick={() => handleSort('vat')}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <span>VAT (20%)</span>
                      {getSortIcon('vat')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-center text-sm font-semibold text-zinc-700 cursor-pointer hover:bg-zinc-200/50 transition-colors"
                    onClick={() => handleSort('totalPrice')}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <span>Total</span>
                      {getSortIcon('totalPrice')}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-zinc-700 w-24">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {sortedRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-px-muted">
                      <div className="space-y-2">
                        <p className="text-lg font-medium">No price data found</p>
                        <p className="text-sm">Debug: {priceRows.length} total rows, {sortedRows.length} filtered rows</p>
                        <p className="text-sm">Search: "{searchTerm}", Category: "{selectedCategory}"</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  sortedRows.map((row) => (
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
                        {row.ruleKind && (
                          <div className="text-xs text-px-muted mt-1">
                            <Badge variant="outline" className="text-xs">
                              {row.ruleKind}
                            </Badge>
                          </div>
                        )}
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </AdminCard>
      </ScrollReveal>

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
    </div>
  );
}
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Plus, 
  Upload, 
  Edit, 
  Eye, 
  Package, 
  BarChart3, 
  TrendingUp, 
  FileText,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  GripVertical,
  RotateCcw,
  Trash2,
  CheckSquare,
  Square,
  Save,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AdminCard from "@/components/admin/AdminCard";
import ScrollReveal from "@/components/ux/ScrollReveal";

type SortField = 'name' | 'category' | 'slug' | 'rows';
type SortDirection = 'asc' | 'desc' | null;

export default function AdminPrices() {
  const pathname = usePathname();
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ slug:"", name:"", category:"" });
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Selection and editing states
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: "", category: "", slug: "" });
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Column width states with localStorage persistence
  const [columnWidths, setColumnWidths] = useState({
    service: 250,
    category: 150,
    slug: 200,
    rows: 120,
    actions: 150
  });
  const [isResizing, setIsResizing] = useState<string | null>(null);

  async function load() {
    try {
      console.log('Loading services...', { pathname, loading });
      setLoading(true);
      console.log('Fetching from API...');
      const r = await fetch("/api/admin/prices/services/", { cache:"no-store" });
      console.log('API response received:', r.status, r.ok);
      const data = await r.json();
      console.log('Services loaded:', data);
      console.log('Setting items...');
      setItems(data);
      console.log('Items set:', data.length, 'items');
      
      // Verify items were set
      setTimeout(() => {
        console.log('Items after setItems:', items.length);
      }, 100);
      console.log('Setting loading to false...');
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Error loading services');
    } finally {
      console.log('Finally block - setting loading to false');
      setLoading(false);
    }
  }
  
  // Load data on mount
  useEffect(() => {
    console.log('useEffect triggered on mount');
    load();
  }, []);

  // Load settings from localStorage after component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Load column widths
      const savedWidths = localStorage.getItem('admin-pricing-column-widths');
      if (savedWidths) {
        try {
          const parsed = JSON.parse(savedWidths);
          setColumnWidths(parsed);
        } catch (e) {
          console.warn('Failed to parse saved column widths:', e);
        }
      }
      
      // Load sort settings
      const savedSortField = localStorage.getItem('admin-pricing-sort-field');
      if (savedSortField && ['name', 'category', 'slug', 'rows'].includes(savedSortField)) {
        setSortField(savedSortField as SortField);
      }
      
      const savedSortDirection = localStorage.getItem('admin-pricing-sort-direction');
      if (savedSortDirection && ['asc', 'desc', null].includes(savedSortDirection)) {
        setSortDirection(savedSortDirection as SortDirection);
      }
    }
  }, []);

  async function createSvc(e: React.FormEvent) {
    e.preventDefault();
    const r = await fetch("/api/admin/prices/services/",{ method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify(form) });
    const d = await r.json(); if (!d.ok) return toast.error(d.error || "Error");
    setForm({ slug:"", name:"", category:"" }); load();
  }

  async function importCSV(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const r = await fetch("/api/admin/prices/import-csv", { method:"POST", body: fd });
    const d = await r.json(); d.ok ? (toast.success(`Imported ${d.imported}`), load()) : toast.error(d.error||"Import failed");
  }

  // Selection functions
  function toggleSelectAll() {
    if (selectedItems.size === getSortedItems().length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(getSortedItems().map(item => item.id)));
    }
  }

  function toggleSelectItem(id: number) {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  }

  // Edit functions
  function startEdit(item: any) {
    setEditingItem(item.id);
    setEditForm({ name: item.name, category: item.category, slug: item.slug });
  }

  function cancelEdit() {
    setEditingItem(null);
    setEditForm({ name: "", category: "", slug: "" });
  }

  async function saveEdit() {
    if (!editingItem) return;
    
    try {
      console.log('🔍 SAVE EDIT: Updating service', editingItem, 'with data:', editForm);
      
      const response = await fetch(`/api/admin/prices/services/${editingItem}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      
      console.log('🔍 SAVE EDIT: Response status:', response.status);
      console.log('🔍 SAVE EDIT: Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ SAVE EDIT: Response not ok:', response.status, errorText);
        toast.error(`Server error: ${response.status}`);
        return;
      }
      
      const data = await response.json();
      console.log('🔍 SAVE EDIT: Response data:', data);
      
      if (data.ok) {
        toast.success('Service updated successfully');
        setEditingItem(null);
        setEditForm({ name: "", category: "", slug: "" });
        load();
      } else {
        toast.error(data.error || 'Failed to update service');
      }
    } catch (error) {
      console.error('💥 SAVE EDIT ERROR:', error);
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        console.error('💥 JSON Parse Error - likely HTML response');
        toast.error('Server returned invalid response - please check console');
      } else {
        toast.error('Failed to update service: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    }
  }

  // Delete functions
  async function deleteSelected() {
    if (selectedItems.size === 0) {
      toast.error('No items selected');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedItems.size} service${selectedItems.size > 1 ? 's' : ''}? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const ids = Array.from(selectedItems).join(',');
      const response = await fetch(`/api/admin/prices/services/?ids=${ids}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.ok) {
        toast.success(data.message);
        setSelectedItems(new Set());
        load();
      } else {
        toast.error(data.error || 'Failed to delete services');
      }
    } catch (error) {
      console.error('Error deleting services:', error);
      toast.error('Failed to delete services');
    } finally {
      setIsDeleting(false);
    }
  }

  async function deleteSingle(id: number, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/prices/services/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.ok) {
        toast.success(data.message);
        load();
      } else {
        toast.error(data.error || 'Failed to delete service');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
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
      localStorage.setItem('admin-pricing-sort-field', field);
      localStorage.setItem('admin-pricing-sort-direction', newDirection || '');
    }
  }

  function getSortIcon(field: SortField) {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    if (sortDirection === 'asc') return <ArrowUp className="h-4 w-4" />;
    if (sortDirection === 'desc') return <ArrowDown className="h-4 w-4" />;
    return <ArrowUpDown className="h-4 w-4" />;
  }

  function getSortedItems() {
    if (!sortDirection) return items;
    
    return [...items].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'rows') {
        aValue = a._count?.rows || 0;
        bValue = b._count?.rows || 0;
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
    setColumnWidths(prev => {
      const newWidths = {
        ...prev,
        [isResizing]: Math.max(50, prev[isResizing as keyof typeof prev] + deltaX)
      };
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('admin-pricing-column-widths', JSON.stringify(newWidths));
      }
      
      return newWidths;
    });
  }

  function handleMouseUp() {
    setIsResizing(null);
  }

  // Reset column settings
  function resetColumnSettings() {
    const defaultWidths = {
      service: 250,
      category: 150,
      slug: 200,
      rows: 120,
      actions: 150
    };
    
    setColumnWidths(defaultWidths);
    setSortField('name');
    setSortDirection('asc');
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin-pricing-column-widths');
      localStorage.removeItem('admin-pricing-sort-field');
      localStorage.removeItem('admin-pricing-sort-direction');
    }
    
    toast.success('Column settings reset to default');
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

  console.log('Rendering with items:', { 
    itemsLength: items.length, 
    loading, 
    pathname,
    sortedItemsLength: getSortedItems().length,
    items: items.slice(0, 2), // Show first 2 items for debugging
    itemsType: typeof items,
    itemsIsArray: Array.isArray(items)
  });

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-px-cyan mx-auto"></div>
          <p className="text-px-muted">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <ScrollReveal>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight font-playfair">
              <span className="text-px-fg">Prices — </span>
              <span className="bg-gradient-to-r from-px-cyan via-px-magenta to-px-yellow bg-clip-text text-transparent animate-gradient">
                Services
              </span>
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-px-muted max-w-2xl mt-2">
              Manage services and their pricing tiers
            </p>
          </div>
          <Button 
            onClick={() => {
              console.log('Manual refresh clicked');
              setLoading(true);
              load();
            }} 
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white border border-zinc-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-px-cyan/10 rounded-lg">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 text-px-cyan" />
              </div>
              <div>
                <p className="text-lg sm:text-xl font-bold text-px-cyan">{items.length}</p>
                <p className="text-xs text-zinc-500">Total Services</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-px-magenta/10 rounded-lg">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-px-magenta" />
              </div>
              <div>
                <p className="text-lg sm:text-xl font-bold text-px-magenta">
                  {items.reduce((sum, item) => sum + (item._count?.rows || 0), 0)}
                </p>
                <p className="text-xs text-zinc-500">Total Price Rows</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-green-500/10 rounded-lg">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              </div>
              <div>
                <p className="text-lg sm:text-xl font-bold text-green-600">
                  {items.filter(item => (item._count?.rows || 0) > 0).length}
                </p>
                <p className="text-xs text-zinc-500">Services with Prices</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-px-yellow/10 rounded-lg">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-px-yellow" />
              </div>
              <div>
                <p className="text-sm sm:text-lg font-bold text-px-yellow truncate">Business Cards</p>
                <p className="text-xs text-zinc-500">Top Service</p>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      <div className="space-y-4">
          {/* Create Service Form */}
          <div className="bg-white border rounded-lg p-3 sm:p-4">
            <h3 className="text-sm font-semibold text-px-fg mb-3">Create New Service</h3>
            <form onSubmit={createSvc} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="text-xs font-medium text-px-fg">Slug</label>
                <Input 
                  placeholder="business-cards" 
                  value={form.slug} 
                  onChange={e=>setForm({...form, slug:e.target.value})}
                  className="border-zinc-300 focus:border-px-cyan focus:ring-px-cyan h-8 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-px-fg">Name</label>
                <Input 
                  placeholder="Business Cards" 
                  value={form.name} 
                  onChange={e=>setForm({...form, name:e.target.value})}
                  className="border-zinc-300 focus:border-px-cyan focus:ring-px-cyan h-8 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-px-fg">Category</label>
                <Input 
                  placeholder="Printing" 
                  value={form.category} 
                  onChange={e=>setForm({...form, category:e.target.value})}
                  className="border-zinc-300 focus:border-px-cyan focus:ring-px-cyan h-8 text-sm"
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="bg-gradient-to-r from-px-cyan to-px-magenta hover:from-px-cyan/90 hover:to-px-magenta/90 text-white w-full h-8 text-sm">
                  <Plus className="h-3 w-3 mr-1" />
                  Create
                </Button>
              </div>
            </form>
          </div>

          {/* Import CSV Form */}
          <div className="bg-white border rounded-lg p-3 sm:p-4">
            <h3 className="text-sm font-semibold text-px-fg mb-3">Import Services from CSV</h3>
            <form onSubmit={importCSV} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1">
                <Input 
                  name="file" 
                  type="file" 
                  accept=".csv" 
                  className="border-zinc-300 focus:border-px-magenta focus:ring-px-magenta h-8 text-sm"
                />
              </div>
              <Button type="submit" variant="outline" className="border-px-magenta text-px-magenta hover:bg-px-magenta hover:text-white h-8 text-sm">
                <Upload className="h-3 w-3 mr-1" />
                Import CSV
              </Button>
            </form>
          </div>

          {/* Services Table */}
          <div className="bg-white border rounded-lg p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="outline" className="text-px-muted text-xs">
                  {getSortedItems().length} services
                </Badge>
                {selectedItems.size > 0 && (
                  <Badge variant="outline" className="text-px-magenta border-px-magenta/20 text-xs">
                    {selectedItems.size} selected
                  </Badge>
                )}
                {sortDirection && (
                  <Badge variant="outline" className="text-px-cyan border-px-cyan/20 text-xs">
                    Sorted by {sortField} ({sortDirection})
                  </Badge>
                )}
              </div>
              {selectedItems.size > 0 && (
                <div className="flex items-center">
                  <Button
                    onClick={deleteSelected}
                    disabled={isDeleting}
                    variant="outline"
                    size="sm"
                    className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white text-xs h-7 px-2"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    {isDeleting ? 'Deleting...' : `Delete ${selectedItems.size}`}
                  </Button>
                </div>
              )}
            </div>
            {/* Mobile Card View */}
            <div className="lg:hidden space-y-2">
              {getSortedItems().map(s => (
                <div key={s.slug} className={`bg-white border rounded-lg p-3 ${selectedItems.has(s.id) ? 'ring-2 ring-px-cyan' : ''}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <button
                        onClick={() => toggleSelectItem(s.id)}
                        className="flex items-center justify-center w-4 h-4 flex-shrink-0"
                      >
                        {selectedItems.has(s.id) ? (
                          <CheckSquare className="h-4 w-4 text-px-cyan" />
                        ) : (
                          <Square className="h-4 w-4 text-zinc-400" />
                        )}
                      </button>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-zinc-900 text-sm truncate">{s.name}</h3>
                        <p className="text-xs text-zinc-500">{s.category}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-px-muted text-xs flex-shrink-0 ml-2">
                      {s._count?.rows || 0} rows
                    </Badge>
                  </div>
                  
                  <div className="mb-2">
                    {editingItem === s.id ? (
                      <div className="space-y-1.5">
                        <Input
                          value={editForm.name}
                          onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                          placeholder="Service name"
                          className="h-7 text-xs"
                        />
                        <div className="grid grid-cols-2 gap-1.5">
                          <Input
                            value={editForm.category}
                            onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                            placeholder="Category"
                            className="h-7 text-xs"
                          />
                          <Input
                            value={editForm.slug}
                            onChange={(e) => setEditForm({...editForm, slug: e.target.value})}
                            placeholder="slug"
                            className="h-7 text-xs"
                          />
                        </div>
                      </div>
                    ) : (
                      <code className="text-xs text-zinc-500 bg-zinc-100 px-2 py-1 rounded">
                        {s.slug}
                      </code>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <div className="flex items-center gap-1.5">
                      {editingItem === s.id ? (
                        <>
                          <Button
                            onClick={saveEdit}
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white h-7 w-24 text-xs"
                          >
                            <Save className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                          <Button
                            onClick={cancelEdit}
                            size="sm"
                            variant="outline"
                            className="h-7 w-24 text-xs"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            onClick={() => startEdit(s)}
                            variant="outline"
                            size="sm"
                            className="border-px-cyan text-px-cyan hover:bg-px-cyan hover:text-white h-7 w-24 text-xs"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" asChild className="border-px-cyan text-px-cyan hover:bg-px-cyan hover:text-white h-7 w-24 text-xs">
                            <Link href={`/admin/prices/${s.slug}`}>
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Link>
                          </Button>
                          <Button
                            onClick={() => deleteSingle(s.id, s.name)}
                            variant="outline"
                            size="sm"
                            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white h-7 w-24 text-xs"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto -mx-3 sm:mx-0">
              <div className="min-w-full">
                <table className="w-full border-collapse min-w-[800px]">
                  <thead className="bg-gradient-to-r from-zinc-50 to-zinc-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-700 border-b w-12">
                        <button
                          onClick={toggleSelectAll}
                          className="flex items-center justify-center w-4 h-4"
                        >
                          {selectedItems.size === getSortedItems().length && getSortedItems().length > 0 ? (
                            <CheckSquare className="h-4 w-4 text-px-cyan" />
                          ) : (
                            <Square className="h-4 w-4 text-zinc-400" />
                          )}
                        </button>
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-700 border-b">Service</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-700 border-b">Category</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-700 border-b">Slug</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-zinc-700 border-b">Rows</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-zinc-700 border-b">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-px-muted">
                          <div className="space-y-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-px-cyan mx-auto"></div>
                            <p className="text-lg font-medium">Loading services...</p>
                          </div>
                        </td>
                      </tr>
                    ) : items.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-px-muted">
                          <div className="space-y-2">
                            <p className="text-lg font-medium">No services found</p>
                            <p className="text-sm">Debug: {items.length} services loaded</p>
                            <p className="text-sm">Loading: {loading ? 'Yes' : 'No'}</p>
                            <p className="text-sm">Pathname: {pathname}</p>
                            <Button 
                              onClick={() => {
                                console.log('Manual refresh from empty state');
                                setLoading(true);
                                setItems([]);
                                load();
                              }}
                              size="sm"
                              className="mt-2"
                            >
                              Try Again
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <>
                        {getSortedItems().map(s=>(
                      <tr key={s.slug} className={`hover:bg-zinc-50/50 transition-colors ${selectedItems.has(s.id) ? 'bg-px-cyan/5' : ''}`}>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleSelectItem(s.id)}
                            className="flex items-center justify-center w-4 h-4"
                          >
                            {selectedItems.has(s.id) ? (
                              <CheckSquare className="h-4 w-4 text-px-cyan" />
                            ) : (
                              <Square className="h-4 w-4 text-zinc-400" />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          {editingItem === s.id ? (
                            <Input
                              value={editForm.name}
                              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                              className="h-8 text-sm"
                            />
                          ) : (
                            <div className="font-medium text-zinc-900">{s.name}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editingItem === s.id ? (
                            <Input
                              value={editForm.category}
                              onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                              className="h-8 text-sm"
                            />
                          ) : (
                            <Badge variant="outline" className="text-zinc-600 border-zinc-200 bg-zinc-50 hover:bg-zinc-100">
                              {s.category}
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editingItem === s.id ? (
                            <Input
                              value={editForm.slug}
                              onChange={(e) => setEditForm({...editForm, slug: e.target.value})}
                              className="h-8 text-sm"
                            />
                          ) : (
                            <code className="text-sm text-zinc-500 bg-zinc-100 px-2 py-1 rounded">
                              {s.slug}
                            </code>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge variant="outline" className="text-px-muted">
                            {s._count?.rows || 0} rows
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1">
                            {editingItem === s.id ? (
                              <>
                                <Button
                                  onClick={saveEdit}
                                  size="sm"
                                  className="bg-green-500 hover:bg-green-600 text-white h-7 w-24 text-xs"
                                  title="Save"
                                >
                                  <Save className="h-3 w-3 mr-1" />
                                  Save
                                </Button>
                                <Button
                                  onClick={cancelEdit}
                                  size="sm"
                                  variant="outline"
                                  className="h-7 w-24 text-xs"
                                  title="Cancel"
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Cancel
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  onClick={() => startEdit(s)}
                                  variant="outline"
                                  size="sm"
                                  className="border-px-cyan text-px-cyan hover:bg-px-cyan hover:text-white h-7 w-24 text-xs"
                                  title="Edit"
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                                <Button variant="outline" size="sm" asChild className="border-px-cyan text-px-cyan hover:bg-px-cyan hover:text-white h-7 w-24 text-xs" title="View">
                                  <Link href={`/admin/prices/${s.slug}`}>
                                    <Eye className="h-3 w-3 mr-1" />
                                    View
                                  </Link>
                                </Button>
                                <Button
                                  onClick={() => deleteSingle(s.id, s.name)}
                                  variant="outline"
                                  size="sm"
                                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white h-7 w-24 text-xs"
                                  title="Delete"
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                      ))}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
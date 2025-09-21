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
  RotateCcw
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
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight font-playfair">
              <span className="text-px-fg">Prices — </span>
              <span className="bg-gradient-to-r from-px-cyan via-px-magenta to-px-yellow bg-clip-text text-transparent animate-gradient">
                Services
              </span>
            </h1>
            <p className="text-lg text-px-muted max-w-2xl mt-2">
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-zinc-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-px-cyan/10 rounded-lg">
                <Package className="h-5 w-5 text-px-cyan" />
              </div>
              <div>
                <p className="text-xl font-bold text-px-cyan">{items.length}</p>
                <p className="text-xs text-zinc-500">Total Services</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-px-magenta/10 rounded-lg">
                <BarChart3 className="h-5 w-5 text-px-magenta" />
              </div>
              <div>
                <p className="text-xl font-bold text-px-magenta">
                  {items.reduce((sum, item) => sum + (item._count?.rows || 0), 0)}
                </p>
                <p className="text-xs text-zinc-500">Total Price Rows</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-green-600">
                  {items.filter(item => (item._count?.rows || 0) > 0).length}
                </p>
                <p className="text-xs text-zinc-500">Services with Prices</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-px-yellow/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-px-yellow" />
              </div>
              <div>
                <p className="text-lg font-bold text-px-yellow truncate">Business Cards</p>
                <p className="text-xs text-zinc-500">Top Service</p>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      <div className="space-y-4">
          {/* Create Service Form */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-px-fg mb-3">Create New Service</h3>
            <form onSubmit={createSvc} className="grid grid-cols-1 gap-3 sm:grid-cols-4">
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
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-px-fg mb-3">Import Services from CSV</h3>
            <form onSubmit={importCSV} className="flex items-center gap-3">
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-px-muted">
                  {getSortedItems().length} services
                </Badge>
                {sortDirection && (
                  <Badge variant="outline" className="text-px-cyan border-px-cyan/20">
                    Sorted by {sortField} ({sortDirection})
                  </Badge>
                )}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                  <thead className="bg-gradient-to-r from-zinc-50 to-zinc-100">
                    <tr>
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
                        <td colSpan={4} className="px-6 py-12 text-center text-px-muted">
                          <div className="space-y-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-px-cyan mx-auto"></div>
                            <p className="text-lg font-medium">Loading services...</p>
                          </div>
                        </td>
                      </tr>
                    ) : items.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-px-muted">
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
                      <tr key={s.slug} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-zinc-900">{s.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="text-zinc-600 border-zinc-200 bg-zinc-50 hover:bg-zinc-100">
                            {s.category}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <code className="text-sm text-zinc-500 bg-zinc-100 px-2 py-1 rounded">
                            {s.slug}
                          </code>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge variant="outline" className="text-px-muted">
                            {s._count?.rows || 0} rows
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center">
                            <Button variant="outline" size="sm" asChild className="border-px-cyan text-px-cyan hover:bg-px-cyan hover:text-white">
                              <Link href={`/admin/prices/${s.slug}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                Details
                              </Link>
                            </Button>
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
  );
}
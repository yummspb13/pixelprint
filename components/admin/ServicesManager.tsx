'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Edit, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Calculator,
  Star,
  Image as ImageIcon,
  Save,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface Service {
  id: number;
  name: string;
  description?: string;
  image?: string;
  category: string;
  order: number;
  calculatorAvailable: boolean;
  clickCount: number;
  slug: string;
  isActive: boolean;
}

interface ServicesData {
  [category: string]: Service[];
}

export default function ServicesManager() {
  const [services, setServices] = useState<ServicesData>({});
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    category: '',
    order: 0,
    calculatorAvailable: false,
    slug: '',
    isActive: true
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services?includeInactive=true');
      const data = await response.json();
      setServices(data.services);
    } catch (error) {
      console.error('Error fetching services:', error);
      toast.error('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      image: '',
      category: '',
      order: 0,
      calculatorAvailable: false,
      slug: '',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      image: service.image || '',
      category: service.category,
      order: service.order,
      calculatorAvailable: service.calculatorAvailable,
      slug: service.slug,
      isActive: service.isActive
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingService) {
        // Update existing service
        const response = await fetch(`/api/services/${editingService.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        if (!response.ok) throw new Error('Failed to update service');
        toast.success('Service updated successfully');
      } else {
        // Create new service
        const response = await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        if (!response.ok) throw new Error('Failed to create service');
        toast.success('Service created successfully');
      }
      
      setIsModalOpen(false);
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('Failed to save service');
    }
  };

  const handleDelete = async (serviceId: number) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    
    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete service');
      toast.success('Service deleted successfully');
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    }
  };

  const handleOrderChange = async (serviceId: number, direction: 'up' | 'down') => {
    try {
      const service = Object.values(services).flat().find(s => s.id === serviceId);
      if (!service) return;

      const categoryServices = services[service.category];
      const currentIndex = categoryServices.findIndex(s => s.id === serviceId);
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      if (newIndex < 0 || newIndex >= categoryServices.length) return;

      // Swap orders
      const tempOrder = categoryServices[currentIndex].order;
      categoryServices[currentIndex].order = categoryServices[newIndex].order;
      categoryServices[newIndex].order = tempOrder;

      // Update both services
      await Promise.all([
        fetch(`/api/services/${serviceId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: categoryServices[currentIndex].order })
        }),
        fetch(`/api/services/${categoryServices[newIndex].id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: categoryServices[newIndex].order })
        })
      ]);

      fetchServices();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Services Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-px-cyan mx-auto mb-4"></div>
            <p className="text-px-muted">Loading services...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const categories = Object.keys(services || {});

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-px-fg font-playfair">Services Management</h2>
          <p className="text-px-muted">Manage your printing services and their availability</p>
        </div>
        <Button onClick={handleCreate} className="bg-px-cyan hover:bg-px-cyan/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      <div className="space-y-6">
        {categories.map((category) => (
          <Card key={category}>
            <CardHeader className="bg-gradient-to-r from-px-cyan/10 to-px-magenta/10">
              <CardTitle className="text-lg font-playfair">{category}</CardTitle>
              <p className="text-sm text-px-muted">{services[category]?.length || 0} services</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {services[category]
                  ?.sort((a, b) => a.order - b.order)
                  .map((service, index) => (
                  <div key={service.id} className="p-4 hover:bg-zinc-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex flex-col space-y-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOrderChange(service.id, 'up')}
                            disabled={index === 0}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOrderChange(service.id, 'down')}
                            disabled={index === (services[category]?.length || 0) - 1}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="w-12 h-12 bg-zinc-100 rounded-lg flex items-center justify-center">
                          {service.image ? (
                            <img 
                              src={service.image} 
                              alt={service.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-zinc-400" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-px-fg">{service.name}</h3>
                            {service.clickCount > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                {service.clickCount} clicks
                              </Badge>
                            )}
                            {!service.isActive && (
                              <Badge variant="outline" className="text-xs">
                                Inactive
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-px-muted mb-2">
                            {service.description || 'No description provided'}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-px-muted">
                            <span>Order: {service.order}</span>
                            <span>Slug: {service.slug}</span>
                            {service.calculatorAvailable && (
                              <div className="flex items-center text-px-cyan">
                                <Calculator className="h-3 w-3 mr-1" />
                                Calculator
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={service.calculatorAvailable}
                          onCheckedChange={async (checked) => {
                            try {
                              await fetch(`/api/services/${service.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ calculatorAvailable: checked })
                              });
                              fetchServices();
                            } catch (error) {
                              toast.error('Failed to update calculator availability');
                            }
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(service)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(service.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingService ? 'Edit Service' : 'Create Service'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="order">Order</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="calculatorAvailable"
                    checked={formData.calculatorAvailable}
                    onCheckedChange={(checked) => setFormData({ ...formData, calculatorAvailable: checked })}
                  />
                  <Label htmlFor="calculatorAvailable">Calculator Available</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} className="bg-px-cyan hover:bg-px-cyan/90">
                  <Save className="h-4 w-4 mr-2" />
                  {editingService ? 'Update' : 'Create'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

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
  X,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import ImageOptimizationInfo from './ImageOptimizationInfo';

interface Service {
  id: number;
  name: string;
  description?: string;
  image?: string;
  category: string;
  order: number;
  categoryOrder: number;
  calculatorAvailable: boolean;
  clickCount: number;
  slug: string;
  isActive: boolean;
}

interface ServicesData {
  [category: string]: Service[];
}

export default function HomepageConfigurator() {
  const [services, setServices] = useState<ServicesData>({});
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    category: '',
    categoryOrder: 0,
    calculatorAvailable: false,
    slug: '',
    isActive: true
  });
  const [isUploading, setIsUploading] = useState(false);
  const [optimizationInfo, setOptimizationInfo] = useState<any>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch(`${window.location.origin}/api/services?includeInactive=true`, {
        method: 'GET',
        cache: 'no-cache',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
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
    const firstCategory = Object.keys(services)[0];
    const categoryOrder = firstCategory ? services[firstCategory][0]?.categoryOrder || 1 : 1;
    
    setFormData({
      name: '',
      description: '',
      image: '',
      category: firstCategory || '',
      categoryOrder: categoryOrder,
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
      categoryOrder: service.categoryOrder,
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
        const response = await fetch(`/api/services/${editingService.id}/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        if (!response.ok) throw new Error('Failed to update service');
        toast.success('Service updated successfully');
      } else {
        // Create new service
        const response = await fetch('/api/services/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        if (!response.ok) throw new Error('Failed to create service');
        toast.success('Service created successfully');
      }
      
      setIsModalOpen(false);
      setOptimizationInfo(null);
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

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();
      setFormData(prev => ({ ...prev, image: result.imageUrl }));
      setOptimizationInfo(result);
      
      // Show optimization info
      if (result.compressionRatio > 0) {
        toast.success(`Image uploaded and optimized! ${result.compressionRatio}% size reduction`);
      } else {
        toast.success('Image uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
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

      // Prepare bulk updates
      const updates = [
        {
          id: serviceId,
          order: categoryServices[newIndex].order
        },
        {
          id: categoryServices[newIndex].id,
          order: categoryServices[currentIndex].order
        }
      ];

      // Simple direct update
      const useTempSwap = false;

      const response = await fetch('/api/services/bulk-update-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates, useTempSwap })
      });

      if (!response.ok) {
        throw new Error('Failed to update service order');
      }

      // Simple refresh
      fetchServices();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    }
  };

  const handleCategoryOrderChange = async (category: string, direction: 'up' | 'down') => {
    try {
      const categoryServices = services[category];
      if (!categoryServices || categoryServices.length === 0) return;

      const currentCategoryOrder = categoryServices[0].categoryOrder;
      const allCategories = Object.keys(services).sort((a, b) => {
        const aOrder = services[a][0]?.categoryOrder || 0;
        const bOrder = services[b][0]?.categoryOrder || 0;
        return aOrder - bOrder;
      });

      const currentIndex = allCategories.indexOf(category);
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      if (newIndex < 0 || newIndex >= allCategories.length) return;

      const targetCategory = allCategories[newIndex];
      const targetCategoryOrder = services[targetCategory][0]?.categoryOrder || 0;

      // Prepare bulk updates - only update 2 services at a time to avoid conflicts
      const updates = [
        // Update first service from current category
        {
          id: categoryServices[0].id,
          categoryOrder: targetCategoryOrder
        },
        // Update first service from target category
        {
          id: services[targetCategory][0].id,
          categoryOrder: currentCategoryOrder
        }
      ];

      // Simple direct update
      const useTempSwap = false;

      const response = await fetch('/api/services/bulk-update-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates, useTempSwap })
      });

      if (!response.ok) {
        throw new Error('Failed to update category order');
      }

      toast.success('Category order updated!');
      
      // Simple refresh
      fetchServices();
    } catch (error) {
      console.error('Error updating category order:', error);
      toast.error('Failed to update category order');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Homepage Configuration</CardTitle>
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


  // Sort categories by categoryOrder
  const categories = Object.keys(services || {}).sort((a, b) => {
    const aOrder = services[a][0]?.categoryOrder || 0;
    const bOrder = services[b][0]?.categoryOrder || 0;
    return aOrder - bOrder;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-px-fg font-playfair">Services Management</h1>
          <p className="text-px-muted">Manage your printing services and configure homepage sections</p>
        </div>
        <Button onClick={handleCreate} className="bg-px-cyan hover:bg-px-cyan/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      <div className="space-y-6">
        {/* Categories List */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-px-fg">Sections</h3>
          {categories.map((category, categoryIndex) => (
            <Card key={category}>
              <CardHeader className="bg-gradient-to-r from-px-cyan/10 to-px-magenta/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col space-y-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCategoryOrderChange(category, 'up')}
                        disabled={categoryIndex === 0}
                        className="h-8 w-8 p-0"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCategoryOrderChange(category, 'down')}
                        disabled={categoryIndex === categories.length - 1}
                        className="h-8 w-8 p-0"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <div>
                      <CardTitle className="text-lg font-playfair">{category}</CardTitle>
                      <p className="text-sm text-px-muted">{services[category]?.length || 0} services</p>
                    </div>
                  </div>
                </div>
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
                              <h4 className="font-semibold text-px-fg">{service.name}</h4>
                              {service.clickCount > 0 && (
                                <Badge variant="secondary" className="text-xs">
                                  <Star className="h-3 w-3 mr-1" />
                                  {service.clickCount}
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
                            asChild
                          >
                            <Link href={`/services/${service.slug}`} target="_blank">
                              <ExternalLink className="h-4 w-4" />
                            </Link>
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
                    placeholder="business-cards"
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
                  placeholder="Brief description of the service..."
                />
              </div>
              
              <div>
                <Label htmlFor="image">Service Image</Label>
                <div className="space-y-4">
                  {/* Image Preview */}
                  {formData.image && (
                    <div className="relative">
                      <img 
                        src={formData.image} 
                        alt="Service preview" 
                        className="w-32 h-32 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => setFormData({ ...formData, image: '' })}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  
                  {/* Upload Button */}
                  <div>
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('image-upload')?.click()}
                      disabled={isUploading}
                      className="w-full"
                    >
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-px-cyan mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <ImageIcon className="h-4 w-4 mr-2" />
                          {formData.image ? 'Change Image' : 'Upload Image'}
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {/* Manual URL Input */}
                  <div>
                    <Label htmlFor="image-url" className="text-sm text-px-muted">
                      Or enter image URL manually:
                    </Label>
                    <Input
                      id="image-url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="mt-1"
                    />
                  </div>
                  
                  {/* Optimization Info */}
                  {optimizationInfo && (
                    <ImageOptimizationInfo
                      originalSize={optimizationInfo.originalSize}
                      optimizedSize={optimizationInfo.optimizedSize}
                      compressionRatio={optimizationInfo.compressionRatio}
                      format={optimizationInfo.format}
                      dimensions={optimizationInfo.dimensions}
                    />
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Business Stationery"
                />
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
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Preview Link</h4>
                <p className="text-sm text-blue-700">
                  {formData.slug ? (
                    <>Calculator: <code className="bg-blue-100 px-2 py-1 rounded">http://localhost:3010/services/{formData.slug}/</code></>
                  ) : (
                    'Enter a slug to see the preview link'
                  )}
                </p>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => {
                  setIsModalOpen(false);
                  setOptimizationInfo(null);
                }}>
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

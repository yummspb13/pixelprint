'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface MenuTile {
  id: number;
  label: string;
  href: string;
  image?: string;
  order: number;
  isActive: boolean;
}

export default function MenuManager() {
  const [tiles, setTiles] = useState<MenuTile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTile, setEditingTile] = useState<MenuTile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    label: '',
    href: '',
    image: '',
    order: 0,
    isActive: true
  });

  useEffect(() => {
    fetchTiles();
  }, []);

  const fetchTiles = async () => {
    try {
      const response = await fetch('/api/admin/menu');
      const data = await response.json();
      setTiles(data.tiles || []);
    } catch (error) {
      console.error('Error fetching menu tiles:', error);
      toast.error('Failed to fetch menu tiles');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTile(null);
    setFormData({
      label: '',
      href: '',
      image: '',
      order: tiles.length,
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleEdit = (tile: MenuTile) => {
    setEditingTile(tile);
    setFormData({
      label: tile.label || '',
      href: tile.href || '',
      image: tile.image || '',
      order: tile.order || 0,
      isActive: tile.isActive ?? true
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingTile) {
        // Update existing tile
        const response = await fetch(`/api/admin/menu/${editingTile.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          throw new Error('Failed to update tile');
        }

        toast.success('Menu tile updated successfully!');
      } else {
        // Create new tile
        const response = await fetch('/api/admin/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          throw new Error('Failed to create tile');
        }

        toast.success('Menu tile created successfully!');
      }

      setIsModalOpen(false);
      fetchTiles();
    } catch (error) {
      console.error('Error saving tile:', error);
      toast.error('Failed to save menu tile');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this menu tile?')) return;

    try {
      const response = await fetch(`/api/admin/menu/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete tile');
      }

      toast.success('Menu tile deleted successfully!');
      fetchTiles();
    } catch (error) {
      console.error('Error deleting tile:', error);
      toast.error('Failed to delete menu tile');
    }
  };

  const handleOrderChange = async (id: number, direction: 'up' | 'down') => {
    try {
      const tile = tiles.find(t => t.id === id);
      if (!tile) return;

      const currentIndex = tiles.findIndex(t => t.id === id);
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      if (newIndex < 0 || newIndex >= tiles.length) return;

      // Swap orders
      const tempOrder = tiles[currentIndex].order;
      tiles[currentIndex].order = tiles[newIndex].order;
      tiles[newIndex].order = tempOrder;

      // Update both tiles
      await Promise.all([
        fetch(`/api/admin/menu/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: tiles[currentIndex].order })
        }),
        fetch(`/api/admin/menu/${tiles[newIndex].id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: tiles[newIndex].order })
        })
      ]);

      fetchTiles();
      toast.success('Order updated!');
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
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

      const data = await response.json();
      setFormData(prev => ({ ...prev, image: data.imageUrl }));
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-px-cyan"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-px-fg">Menu Management</h2>
          <p className="text-px-muted">Manage the Services dropdown menu tiles</p>
        </div>
        <Button onClick={handleCreate} className="bg-gradient-to-r from-px-cyan to-px-magenta">
          <Plus className="h-4 w-4 mr-2" />
          Add Tile
        </Button>
      </div>

      <div className="grid gap-4">
        {(tiles || []).map((tile, index) => (
          <Card key={tile.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col space-y-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOrderChange(tile.id, 'up')}
                      disabled={index === 0}
                      className="h-8 w-8 p-0"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOrderChange(tile.id, 'down')}
                      disabled={index === tiles.length - 1}
                      className="h-8 w-8 p-0"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="w-16 h-16 bg-zinc-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {tile.image ? (
                      <Image
                        src={tile.image}
                        alt={tile.label}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-zinc-300 rounded"></div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-px-fg">{tile.label}</h3>
                    <p className="text-sm text-px-muted">{tile.href}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-px-muted">Order: {tile.order}</span>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={tile.isActive}
                          onCheckedChange={async (checked) => {
                            try {
                              await fetch(`/api/admin/menu/${tile.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ isActive: checked })
                              });
                              fetchTiles();
                            } catch (error) {
                              console.error('Error updating tile status:', error);
                            }
                          }}
                        />
                        <span className="text-xs text-px-muted">
                          {tile.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(tile)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(tile.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTile ? 'Edit Menu Tile' : 'Create Menu Tile'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={formData.label || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                placeholder="e.g., Business Cards"
              />
            </div>

            <div>
              <Label htmlFor="href">Link</Label>
              <Input
                id="href"
                value={formData.href || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, href: e.target.value }))}
                placeholder="e.g., /services/business-cards"
              />
            </div>

            <div>
              <Label htmlFor="image">Image</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="image"
                  value={formData.image || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="Image URL or upload file"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  className="hidden"
                  id="image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-px-cyan"></div>
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {formData.image && (
                <div className="mt-2 relative w-20 h-20">
                  <Image
                    src={formData.image}
                    alt="Preview"
                    fill
                    className="object-cover rounded"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                    className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="order">Order</Label>
              <Input
                id="order"
                type="number"
                value={formData.order || 0}
                onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-gradient-to-r from-px-cyan to-px-magenta">
                {editingTile ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  EyeOff,
  Image as ImageIcon,
  Link as LinkIcon,
  Upload,
  X,
  Eye as PreviewIcon
} from 'lucide-react';
import { toast } from 'sonner';
import WaveLoader from '@/components/ui/WaveLoader';

interface WhyArticle {
  id: number;
  title: string;
  text: string;
  image?: string;
  href?: string;
  span?: string;
  order: number;
  isActive: boolean;
  content?: string;
  images?: string;
  createdAt: string;
  updatedAt: string;
}

export default function WhyArticlesManager() {
  const [articles, setArticles] = useState<WhyArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<WhyArticle | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewArticle, setPreviewArticle] = useState<WhyArticle | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    text: '',
    image: '',
    href: '',
    span: '',
    content: '',
    images: ''
  });

  // Fetch articles
  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/why-articles/');
      const data = await response.json();
      setArticles(data.articles || []);
    } catch (error) {
      console.error('Error fetching articles:', error);
      toast.error('Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // Handle form submission
  const handleSave = async () => {
    try {
      if (editingArticle) {
        // Update existing article
        const response = await fetch(`/api/admin/why-articles/${editingArticle.id}/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          throw new Error('Failed to update article');
        }

        toast.success('Article updated successfully!');
      } else {
        // Create new article
        const response = await fetch('/api/admin/why-articles/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          throw new Error('Failed to create article');
        }

        toast.success('Article created successfully!');
      }

      setIsModalOpen(false);
      setEditingArticle(null);
      setFormData({
        title: '',
        text: '',
        image: '',
        href: '',
        span: '',
        content: '',
        images: ''
      });
      fetchArticles();
    } catch (error) {
      console.error('Error saving article:', error);
      toast.error('Failed to save article');
    }
  };

  // Handle edit
  const handleEdit = (article: WhyArticle) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      text: article.text,
      image: article.image || '',
      href: article.href || '',
      span: article.span || '',
      content: article.content || '',
      images: article.images || ''
    });
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      const response = await fetch(`/api/admin/why-articles/${id}/`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete article');
      }

      toast.success('Article deleted successfully!');
      fetchArticles();
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error('Failed to delete article');
    }
  };

  // Handle reorder
  const handleReorder = async (id: number, direction: 'up' | 'down') => {
    const currentIndex = articles.findIndex(a => a.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= articles.length) return;

    const newArticles = [...articles];
    [newArticles[currentIndex], newArticles[newIndex]] = [newArticles[newIndex], newArticles[currentIndex]];

    // Update order in database
    const articleIds = newArticles.map(a => a.id);
    try {
      const response = await fetch('/api/admin/why-articles/reorder/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleIds })
      });

      if (!response.ok) {
        throw new Error('Failed to reorder articles');
      }

      setArticles(newArticles);
      toast.success('Articles reordered successfully!');
    } catch (error) {
      console.error('Error reordering articles:', error);
      toast.error('Failed to reorder articles');
    }
  };

  // Handle toggle active
  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/why-articles/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });

      if (!response.ok) {
        throw new Error('Failed to update article');
      }

      setArticles(articles.map(a => a.id === id ? { ...a, isActive } : a));
      toast.success(`Article ${isActive ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error('Error updating article:', error);
      toast.error('Failed to update article');
    }
  };

  // Handle preview
  const handlePreview = (article: WhyArticle) => {
    setPreviewArticle(article);
    setIsPreviewOpen(true);
  };

  // Handle image upload
  const handleImageUpload = async (file: File, type: 'cover' | 'content') => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/why-article-image/', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      
      if (type === 'cover') {
        setFormData(prev => ({ ...prev, image: data.imageUrl }));
      } else {
        // Add to content images
        const currentImages = (formData as any).images ? JSON.parse((formData as any).images) : [];
        const newImages = [...currentImages, data.imageUrl];
        setFormData(prev => ({ ...prev, images: JSON.stringify(newImages) }));
      }

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
        <WaveLoader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-px-fg font-playfair">Why Articles Manager</h2>
          <p className="text-px-muted">Manage "Why Choose Pixel Print" articles</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-px-cyan to-px-magenta hover:from-px-cyan/90 hover:to-px-magenta/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Article
        </Button>
      </div>

      {/* Articles List */}
      <div className="grid gap-4">
        {articles.map((article, index) => (
          <Card key={article.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline" className="text-xs">
                      #{article.order}
                    </Badge>
                    <h3 className="text-lg font-semibold text-px-fg">
                      {article.title}
                    </h3>
                    {article.span && (
                      <Badge variant="secondary" className="text-xs">
                        {article.span.toUpperCase()}
                      </Badge>
                    )}
                    <Badge variant={article.isActive ? "default" : "secondary"}>
                      {article.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  <p className="text-px-muted text-sm mb-3 line-clamp-2">
                    {article.text}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-px-muted">
                    {article.image && (
                      <div className="flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        Has Image
                      </div>
                    )}
                    {article.href && (
                      <div className="flex items-center gap-1">
                        <LinkIcon className="w-3 h-3" />
                        Has Link
                      </div>
                    )}
                    {article.content && (
                      <div className="flex items-center gap-1">
                        <span>📄</span>
                        Has Content
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReorder(article.id, 'up')}
                    disabled={index === 0}
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReorder(article.id, 'down')}
                    disabled={index === articles.length - 1}
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(article.id, !article.isActive)}
                  >
                    {article.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreview(article)}
                    title="Preview article"
                  >
                    <PreviewIcon className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(article)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(article.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>
                {editingArticle ? 'Edit Article' : 'Add New Article'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-px-fg">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Article title"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-px-fg">Short Text *</label>
                <Textarea
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder="Short description for the card"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-px-fg">Cover Image</label>
                <div className="space-y-2">
                  <Input
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://example.com/image.jpg or upload below"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, 'cover');
                      }}
                      className="hidden"
                      id="cover-upload"
                    />
                    <label
                      htmlFor="cover-upload"
                      className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                    >
                      <Upload className="w-4 h-4" />
                      {isUploading ? 'Uploading...' : 'Upload Cover Image'}
                    </label>
                    {formData.image && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData({ ...formData, image: '' })}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {formData.image && (
                    <div className="mt-2">
                      <img
                        src={formData.image}
                        alt="Cover preview"
                        className="w-32 h-20 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-px-fg">Link URL</label>
                <Input
                  value={formData.href}
                  onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                  placeholder="/services/example"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-px-fg">Grid Span</label>
                <select
                  value={formData.span}
                  onChange={(e) => setFormData({ ...formData, span: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Normal</option>
                  <option value="lg">Large (2 columns)</option>
                  <option value="xl">Extra Large (3 columns)</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-px-fg">Full Content (Markdown)</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Full article content in Markdown format"
                  rows={6}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-px-fg">Additional Images</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, 'content');
                      }}
                      className="hidden"
                      id="content-upload"
                    />
                    <label
                      htmlFor="content-upload"
                      className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                    >
                      <Upload className="w-4 h-4" />
                      {isUploading ? 'Uploading...' : 'Add Content Image'}
                    </label>
                  </div>
                  
                  <Textarea
                    value={formData.images}
                    onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                    placeholder='["image1.jpg", "image2.jpg"] or use upload button above'
                    rows={3}
                    className="font-mono text-sm"
                  />
                  
                  {formData.images && (() => {
                    try {
                      const images = JSON.parse(formData.images);
                      return (
                        <div className="grid grid-cols-2 gap-2">
                          {images.map((img: string, index: number) => (
                            <div key={index} className="relative">
                              <img
                                src={img}
                                alt={`Content ${index + 1}`}
                                className="w-full h-20 object-cover rounded border"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="absolute top-1 right-1 p-1 h-6 w-6"
                                onClick={() => {
                                  const newImages = images.filter((_: any, i: number) => i !== index);
                                  setFormData({ ...formData, images: JSON.stringify(newImages) });
                                }}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      );
                    } catch {
                      return null;
                    }
                  })()}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={handleSave} className="flex-1">
                  {editingArticle ? 'Update Article' : 'Create Article'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingArticle(null);
                    setFormData({
                      title: '',
                      text: '',
                      image: '',
                      href: '',
                      span: '',
                      content: '',
                      images: ''
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Preview Modal */}
      {isPreviewOpen && previewArticle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Article Preview</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreviewOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Cover Image */}
              {previewArticle.image && (
                <div>
                  <img
                    src={previewArticle.image}
                    alt={previewArticle.title}
                    className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-lg"
                  />
                </div>
              )}

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold text-px-fg font-playfair">
                {previewArticle.title}
              </h1>

              {/* Short Description */}
              <p className="text-xl text-px-muted leading-relaxed">
                {previewArticle.text}
              </p>

              {/* Full Content */}
              {previewArticle.content && (
                <div className="prose prose-lg max-w-none">
                  <div 
                    className="text-px-fg leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: previewArticle.content
                        .replace(/\n/g, '<br>')
                        .replace(/# (.*?)(<br>|$)/g, '<h2 class="text-2xl font-bold text-px-fg font-playfair mt-8 mb-4">$1</h2>')
                        .replace(/## (.*?)(<br>|$)/g, '<h3 class="text-xl font-semibold text-px-fg mt-6 mb-3">$1</h3>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-px-fg">$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
                        .replace(/- (.*?)(<br>|$)/g, '<li class="ml-4">$1</li>')
                    }}
                  />
                </div>
              )}

              {/* Call to Action */}
              {previewArticle.href && (
                <div className="p-6 bg-gradient-to-r from-px-cyan/10 to-px-magenta/10 rounded-2xl text-center">
                  <h3 className="text-2xl font-bold text-px-fg font-playfair mb-4">
                    Ready to get started?
                  </h3>
                  <p className="text-px-muted mb-4">
                    Learn more about our services and how we can help you.
                  </p>
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-px-cyan to-px-magenta hover:from-px-cyan/90 hover:to-px-magenta/90"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.open(previewArticle.href, '_blank');
                      }
                    }}
                  >
                    Explore Services
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
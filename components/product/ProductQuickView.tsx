'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Product } from '@/lib/mock-products';
import Image from 'next/image';
import { ShoppingCart, Heart, Share2, Star } from 'lucide-react';

interface ProductQuickViewProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductQuickView({ product, isOpen, onClose }: ProductQuickViewProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">Product Quick View</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-cover"
              />
            </div>
            
            {/* Thumbnail Gallery (placeholder) */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="relative aspect-[3/4] overflow-hidden rounded-lg border-2 border-gray-200">
                  <Image
                    src={`https://picsum.photos/100/150?random=${product.id}-${i}`}
                    alt={`${product.title} view ${i}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              {/* Badges */}
              <div className="flex gap-2">
                {product.isNew && (
                  <Badge className="bg-px-cyan text-white border-0">
                    New
                  </Badge>
                )}
                {product.isSale && (
                  <Badge className="bg-px-magenta text-white border-0">
                    Sale
                  </Badge>
                )}
              </div>

              {/* Title and Author */}
              <div>
                <h1 className="font-serif text-2xl font-bold text-px-fg mb-2">
                  {product.title}
                </h1>
                <p className="text-lg text-px-muted">by {product.author}</p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex text-px-yellow">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <span className="text-sm text-px-muted">(4.9/5 based on 127 reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3">
                {product.isSale && product.salePrice ? (
                  <>
                    <span className="text-3xl font-bold text-px-magenta">
                      {formatPrice(product.salePrice)}
                    </span>
                    <span className="text-lg text-px-muted line-through">
                      {formatPrice(product.price)}
                    </span>
                    <Badge variant="secondary" className="bg-px-magenta/10 text-px-magenta">
                      Save {formatPrice(product.price - product.salePrice!)}
                    </Badge>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-px-fg">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-gray-100 text-px-muted"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div className="space-y-3">
              <h3 className="font-semibold text-px-fg">Description</h3>
              <p className="text-px-muted leading-relaxed">
                This stunning book cover design perfectly captures the essence of your story. 
                Created with attention to detail and modern design principles, it will make 
                your book stand out on any shelf or digital platform.
              </p>
            </div>

            <Separator />

            {/* Features */}
            <div className="space-y-3">
              <h3 className="font-semibold text-px-fg">What&apos;s Included</h3>
              <ul className="space-y-2 text-sm text-px-muted">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-px-cyan"></div>
                  High-resolution cover design (300 DPI)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-px-cyan"></div>
                  Multiple file formats (PDF, PNG, JPG)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-px-cyan"></div>
                  Back cover and spine design
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-px-cyan"></div>
                  Unlimited revisions
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-px-cyan"></div>
                  24-48 hour delivery
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex gap-3">
                <Button className="flex-1 bg-px-cyan hover:bg-px-cyan/90 text-white">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
                <Button variant="outline" size="icon" className="border-px-cyan text-px-cyan hover:bg-px-cyan hover:text-white">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="border-px-cyan text-px-cyan hover:bg-px-cyan hover:text-white">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
              
              <Button variant="outline" className="w-full border-px-cyan text-px-cyan hover:bg-px-cyan hover:text-white">
                View Full Details
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

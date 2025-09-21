'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductQuickView } from './ProductQuickView';
import { Product } from '@/lib/mock-products';
import { Eye, ShoppingCart, Heart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <>
      <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* Image Container */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
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

          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            <Button
              size="icon"
              variant="secondary"
              onClick={() => setIsQuickViewOpen(true)}
              className="bg-white/90 hover:bg-white text-px-fg"
              aria-label="Quick view"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="bg-white/90 hover:bg-white text-px-fg"
              aria-label="Add to favorites"
            >
              <Heart className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="bg-white/90 hover:bg-white text-px-fg"
              aria-label="Add to cart"
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div className="space-y-1">
            <h3 className="font-semibold text-px-fg line-clamp-1 group-hover:text-px-cyan transition-colors">
              {product.title}
            </h3>
            <p className="text-sm text-px-muted">by {product.author}</p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs bg-gray-100 text-px-muted"
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {product.isSale && product.salePrice ? (
                <>
                  <span className="font-bold text-px-magenta">
                    {formatPrice(product.salePrice)}
                  </span>
                  <span className="text-sm text-px-muted line-through">
                    {formatPrice(product.price)}
                  </span>
                </>
              ) : (
                <span className="font-bold text-px-fg">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              asChild
              className="flex-1 bg-px-cyan hover:bg-px-cyan/90 text-white"
            >
              <Link href={`/product/${product.id}`}>
                View Details
              </Link>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsQuickViewOpen(true)}
              className="border-px-cyan text-px-cyan hover:bg-px-cyan hover:text-white"
              aria-label="Quick view"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Quick View Dialog */}
      <ProductQuickView
        product={product}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </>
  );
}

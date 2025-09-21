'use client';

import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WaveLoader from '@/components/ui/WaveLoader';

interface Article {
  id: number;
  title: string;
  text: string;
  image: string;
  content: string;
  images: string;
}

interface ArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: Article | null;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export function ArticleModal({ 
  isOpen, 
  onClose, 
  article, 
  onNext, 
  onPrev, 
  hasNext = false, 
  hasPrev = false 
}: ArticleModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !article) return null;

  const additionalImages = (() => {
    try {
      if (!article.images) return [];
      const parsed = JSON.parse(article.images);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('Error parsing images:', error);
      return [];
    }
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] mx-4 bg-white rounded-lg shadow-2xl overflow-hidden">
        {/* Header - Navigation only */}
        <div className="flex items-center justify-end p-4 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            {/* Navigation */}
            {(hasPrev || hasNext) && (
              <div className="flex items-center gap-1 mr-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onPrev}
                  disabled={!hasPrev}
                  className="text-gray-600 hover:bg-gray-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onNext}
                  disabled={!hasNext}
                  className="text-gray-600 hover:bg-gray-200"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-600 hover:bg-gray-200"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Cover Image */}
          {article.image && (
            <div className="relative h-64 md:h-80 overflow-hidden">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Article Content */}
          <div className="p-6">
            {/* Article Title */}
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight font-playfair mb-4">
                {(() => {
                  const title = article.title;
                  const words = title.split(' ');
                  if (words.length > 1) {
                    const lastWord = words.pop();
                    const firstWords = words.join(' ');
                    return (
                      <>
                        <span className="text-px-fg">{firstWords} </span>
                        <span className="bg-gradient-to-r from-px-cyan via-px-magenta to-px-yellow bg-clip-text text-transparent animate-gradient">
                          {lastWord}
                        </span>
                      </>
                    );
                  }
                  return <span className="bg-gradient-to-r from-px-cyan via-px-magenta to-px-yellow bg-clip-text text-transparent animate-gradient">{title}</span>;
                })()}
              </h1>
              {article.text && (
                <p className="text-xl text-gray-600 font-medium leading-relaxed">
                  {article.text}
                </p>
              )}
            </div>

            {/* Main Content */}
            {article.content && (
              <div className="prose prose-lg max-w-none">
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: article.content.replace(/\n/g, '<br>') 
                  }}
                />
              </div>
            )}

            {/* Additional Images */}
            {Array.isArray(additionalImages) && additionalImages.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Additional Images</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {additionalImages.map((imageUrl: string, index: number) => (
                    <div key={index} className="relative h-48 overflow-hidden rounded-lg">
                      <img
                        src={imageUrl}
                        alt={`${article.title} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Article Footer */}
            <div className="mt-12 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-px-cyan to-px-magenta flex items-center justify-center">
                    <span className="text-white font-bold text-sm">PP</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Pixel Print</p>
                    <p className="text-sm text-gray-500">Professional Printing Services</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">London's Premier</p>
                  <p className="text-sm text-gray-500">Typography & Printing</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

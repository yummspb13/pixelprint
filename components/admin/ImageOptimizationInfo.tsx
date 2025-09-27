'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { FileImage, Download, Zap } from 'lucide-react';

interface ImageOptimizationInfoProps {
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  format: string;
  dimensions: { width: number; height: number };
}

export default function ImageOptimizationInfo({
  originalSize,
  optimizedSize,
  compressionRatio,
  format,
  dimensions
}: ImageOptimizationInfoProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="mt-4">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-green-600" />
          <span className="font-medium text-sm">Image Optimization</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-500 mb-1">Original Size</div>
            <div className="font-mono">{formatFileSize(originalSize)}</div>
          </div>
          
          <div>
            <div className="text-gray-500 mb-1">Optimized Size</div>
            <div className="font-mono text-green-600">{formatFileSize(optimizedSize)}</div>
          </div>
          
          <div>
            <div className="text-gray-500 mb-1">Compression</div>
            <Badge variant={compressionRatio > 50 ? "default" : compressionRatio > 20 ? "secondary" : "outline"}>
              {compressionRatio}% smaller
            </Badge>
          </div>
          
          <div>
            <div className="text-gray-500 mb-1">Format</div>
            <Badge variant="outline" className="uppercase">
              {format}
            </Badge>
          </div>
          
          <div className="col-span-2">
            <div className="text-gray-500 mb-1">Dimensions</div>
            <div className="font-mono">{dimensions.width} × {dimensions.height}px</div>
          </div>
        </div>
        
        {compressionRatio > 0 && (
          <div className="mt-3 p-2 bg-green-50 rounded-md">
            <div className="flex items-center gap-2 text-green-700 text-xs">
              <FileImage className="h-3 w-3" />
              <span>Image optimized successfully! Saved {formatFileSize(originalSize - optimizedSize)} of space.</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


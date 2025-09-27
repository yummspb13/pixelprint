import sharp from 'sharp';

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png' | 'gif';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

export interface OptimizationResult {
  buffer: Buffer;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  format: string;
  dimensions: { width: number; height: number };
}

/**
 * Optimize image using Sharp
 */
export async function optimizeImage(
  inputBuffer: Buffer,
  options: ImageOptimizationOptions = {}
): Promise<OptimizationResult> {
  const {
    width = 800,
    height = 600,
    quality = 85,
    format = 'webp',
    fit = 'inside'
  } = options;

  // Get original image metadata
  const metadata = await sharp(inputBuffer).metadata();
  const originalSize = inputBuffer.length;

  // Optimize image
  let sharpInstance = sharp(inputBuffer)
    .resize(width, height, {
      fit,
      withoutEnlargement: true
    });

  // Apply format-specific options
  switch (format) {
    case 'webp':
      sharpInstance = sharpInstance.webp({ quality, effort: 6 });
      break;
    case 'jpeg':
      sharpInstance = sharpInstance.jpeg({ quality, progressive: true });
      break;
    case 'png':
      sharpInstance = sharpInstance.png({ quality, compressionLevel: 9 });
      break;
    case 'gif':
      // For GIF, we'll convert to PNG first then to GIF if needed
      // Sharp doesn't support GIF output directly, so we'll use PNG
      sharpInstance = sharpInstance.png({ quality, compressionLevel: 9 });
      break;
  }

  const optimizedBuffer = await sharpInstance.toBuffer();
  const optimizedSize = optimizedBuffer.length;
  const compressionRatio = Math.round((1 - optimizedSize / originalSize) * 100);

  return {
    buffer: optimizedBuffer,
    originalSize,
    optimizedSize,
    compressionRatio,
    format,
    dimensions: {
      width: metadata.width || width,
      height: metadata.height || height
    }
  };
}

/**
 * Generate responsive image sizes
 */
export async function generateResponsiveImages(
  inputBuffer: Buffer,
  baseName: string
): Promise<{
  original: string;
  sizes: { [key: string]: string };
  metadata: { [key: string]: any };
}> {
  const sizes = [
    { name: 'thumbnail', width: 150, height: 150 },
    { name: 'small', width: 400, height: 300 },
    { name: 'medium', width: 800, height: 600 },
    { name: 'large', width: 1200, height: 900 }
  ];

  const results: { [key: string]: string } = {};
  const metadata: { [key: string]: any } = {};

  for (const size of sizes) {
    const result = await optimizeImage(inputBuffer, {
      width: size.width,
      height: size.height,
      quality: 85,
      format: 'webp'
    });

    results[size.name] = `${baseName}-${size.name}.webp`;
    metadata[size.name] = {
      size: result.optimizedSize,
      dimensions: result.dimensions,
      compressionRatio: result.compressionRatio
    };
  }

  return {
    original: baseName,
    sizes: results,
    metadata
  };
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { valid: false, error: 'File must be an image' };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }

  // Check supported formats
  const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff'];
  if (!supportedTypes.includes(file.type)) {
    return { valid: false, error: 'Unsupported image format. Supported: JPEG, PNG, WebP, GIF, BMP, TIFF' };
  }

  return { valid: true };
}

import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { optimizeImage, validateImageFile } from '@/lib/image-optimization';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate image file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate optimized filename with timestamp
    const timestamp = Date.now();
    const fileName = `service-${timestamp}.webp`;
    const path = join(process.cwd(), 'public', 'uploads', 'services', fileName);

    // Ensure directory exists
    const fs = require('fs');
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'services');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Save multiple formats for maximum compatibility
    const baseName = fileName.replace('.webp', '');
    
    // WebP version (best compression)
    const webpResult = await optimizeImage(buffer, {
      width: 800,
      height: 600,
      quality: 85,
      format: 'webp',
      fit: 'inside'
    });
    await writeFile(path, webpResult.buffer);

    // JPG version (universal compatibility)
    const jpgPath = path.replace('.webp', '.jpg');
    const jpgResult = await optimizeImage(buffer, {
      width: 800,
      height: 600,
      quality: 85,
      format: 'jpeg',
      fit: 'inside'
    });
    await writeFile(jpgPath, jpgResult.buffer);

    // PNG version (lossless for graphics)
    const pngPath = path.replace('.webp', '.png');
    const pngResult = await optimizeImage(buffer, {
      width: 800,
      height: 600,
      quality: 90,
      format: 'png',
      fit: 'inside'
    });
    await writeFile(pngPath, pngResult.buffer);

    // GIF version (for animations, if applicable)
    const gifPath = path.replace('.webp', '.gif');
    const gifResult = await optimizeImage(buffer, {
      width: 800,
      height: 600,
      quality: 80,
      format: 'gif',
      fit: 'inside'
    });
    await writeFile(gifPath, gifResult.buffer);

    const imageUrl = `/uploads/services/${fileName}`;

    return NextResponse.json({ 
      success: true, 
      imageUrl,
      fileName,
      formats: {
        webp: imageUrl,
        jpg: imageUrl.replace('.webp', '.jpg'),
        png: imageUrl.replace('.webp', '.png'),
        gif: imageUrl.replace('.webp', '.gif')
      },
      originalSize: webpResult.originalSize,
      optimizedSize: webpResult.optimizedSize,
      compressionRatio: webpResult.compressionRatio,
      format: webpResult.format,
      dimensions: webpResult.dimensions
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

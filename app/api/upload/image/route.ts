import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { optimizeImage, validateImageFile } from '@/lib/image-optimization';
import { put } from '@vercel/blob';

// Check if we're in a serverless environment (Vercel)
const isServerless = process.env.VERCEL === '1' || process.env.VERCEL_ENV;

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Image upload request received');
    console.log('🌍 Environment:', { isServerless, vercel: process.env.VERCEL, vercelEnv: process.env.VERCEL_ENV });
    
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      console.error('❌ No file in request');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    console.log('📁 File info:', { name: file.name, type: file.type, size: file.size });

    // Validate image file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      console.error('❌ Validation failed:', validation.error);
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate optimized filename with timestamp
    const timestamp = Date.now();
    const fileName = `service-${timestamp}`;

    // Optimize image to WebP (best compression)
    console.log('🔄 Processing WebP format...');
    const webpResult = await optimizeImage(buffer, {
      width: 800,
      height: 600,
      quality: 85,
      format: 'webp',
      fit: 'inside'
    });
    console.log('✅ WebP optimized:', { size: webpResult.optimizedSize, compression: `${webpResult.compressionRatio}%` });

    // Upload to Vercel Blob Storage if in serverless environment, otherwise save locally
    let imageUrl: string;
    
    if (isServerless) {
      console.log('☁️ Uploading to Vercel Blob Storage...');
      try {
        const blob = await put(`services/${fileName}.webp`, webpResult.buffer, {
          access: 'public',
          contentType: 'image/webp',
        });
        imageUrl = blob.url;
        console.log('✅ Uploaded to Blob Storage:', imageUrl);
      } catch (blobError: any) {
        console.error('❌ Failed to upload to Blob Storage:', blobError);
        return NextResponse.json({ 
          error: 'Failed to upload to cloud storage',
          message: blobError.message || 'Unknown error',
          serverless: true
        }, { status: 500 });
      }
    } else {
      // Local development - save to file system
      console.log('💾 Saving to local file system...');
      const path = join(process.cwd(), 'public', 'uploads', 'services', `${fileName}.webp`);
      
      try {
        const fs = require('fs');
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'services');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        await writeFile(path, webpResult.buffer);
        imageUrl = `/uploads/services/${fileName}.webp`;
        console.log('✅ Saved locally:', imageUrl);
        
        // Also save JPG and PNG versions locally for compatibility
        try {
          const jpgResult = await optimizeImage(buffer, {
            width: 800,
            height: 600,
            quality: 85,
            format: 'jpeg',
            fit: 'inside'
          });
          await writeFile(path.replace('.webp', '.jpg'), jpgResult.buffer);
          
          const pngResult = await optimizeImage(buffer, {
            width: 800,
            height: 600,
            quality: 90,
            format: 'png',
            fit: 'inside'
          });
          await writeFile(path.replace('.webp', '.png'), pngResult.buffer);
        } catch (formatError: any) {
          console.warn('⚠️ Failed to save additional formats:', formatError.message);
        }
      } catch (fsError: any) {
        console.error('❌ Failed to save locally:', fsError);
        return NextResponse.json({ 
          error: 'Failed to save image',
          message: fsError.message || 'Unknown error'
        }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      success: true, 
      imageUrl,
      fileName: `${fileName}.webp`,
      originalSize: webpResult.originalSize,
      optimizedSize: webpResult.optimizedSize,
      compressionRatio: webpResult.compressionRatio,
      format: webpResult.format,
      dimensions: webpResult.dimensions,
      uploadedTo: isServerless ? 'vercel-blob' : 'local'
    });
  } catch (error: any) {
    console.error('❌ Error uploading image:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        error: 'Failed to upload image',
        message: error.message || 'Unknown error',
        serverless: isServerless
      },
      { status: 500 }
    );
  }
}

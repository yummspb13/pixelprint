import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { optimizeImage, validateImageFile } from '@/lib/image-optimization';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary - parse CLOUDINARY_URL if available
function configureCloudinary() {
  // If CLOUDINARY_URL is set, Cloudinary will auto-configure from it
  if (process.env.CLOUDINARY_URL) {
    // Cloudinary automatically uses CLOUDINARY_URL if it exists
    // But we can also explicitly configure if needed
    try {
      // Parse cloudinary://api_key:api_secret@cloud_name
      const urlMatch = process.env.CLOUDINARY_URL.match(/cloudinary:\/\/([^:]+):([^@]+)@([^\/]+)/);
      if (urlMatch) {
        const [, apiKey, apiSecret, cloudName] = urlMatch;
        cloudinary.config({
          cloud_name: cloudName,
          api_key: apiKey,
          api_secret: apiSecret,
        });
        console.log('✅ Cloudinary configured from CLOUDINARY_URL');
      } else {
        // Fallback: Cloudinary will use CLOUDINARY_URL directly
        console.log('✅ Cloudinary will use CLOUDINARY_URL directly');
      }
    } catch (e: any) {
      // Fallback: Cloudinary will use CLOUDINARY_URL directly
      console.log('✅ Cloudinary will use CLOUDINARY_URL directly (parsing failed:', e.message, ')');
    }
  } else if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log('✅ Cloudinary configured from individual variables');
  }
}

// Initialize configuration
configureCloudinary();

// Check if we're in a serverless environment (Vercel)
const isServerless = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
const useCloudinary = !!process.env.CLOUDINARY_URL || !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // Re-configure Cloudinary in case env vars changed (for serverless)
    configureCloudinary();
    
    console.log('📤 Image upload request received');
    console.log('🌍 Environment:', { 
      isServerless, 
      useCloudinary,
      hasCloudinaryUrl: !!process.env.CLOUDINARY_URL,
      hasCloudinaryCredentials: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY),
      vercel: process.env.VERCEL, 
      vercelEnv: process.env.VERCEL_ENV 
    });
    
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

    // Upload to Cloudinary if configured, otherwise use local storage
    let imageUrl: string;
    
    if (useCloudinary && isServerless) {
      console.log('☁️ Uploading to Cloudinary...');
      console.log('☁️ Cloudinary config check:', {
        hasUrl: !!process.env.CLOUDINARY_URL,
        hasCredentials: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY)
      });
      
      try {
        // Convert buffer to base64 data URL for Cloudinary
        const base64Image = webpResult.buffer.toString('base64');
        const dataUri = `data:image/webp;base64,${base64Image}`;
        
        console.log('☁️ Uploading buffer size:', webpResult.buffer.length, 'bytes');
        
        const uploadResult = await cloudinary.uploader.upload(dataUri, {
          folder: 'services',
          public_id: fileName,
          overwrite: false,
          resource_type: 'image',
          transformation: [
            { width: 800, height: 600, crop: 'limit', quality: 'auto:good', format: 'webp' }
          ]
        });
        
        imageUrl = uploadResult.secure_url || uploadResult.url;
        console.log('✅ Uploaded to Cloudinary:', imageUrl);
        console.log('✅ Cloudinary upload result:', {
          public_id: uploadResult.public_id,
          format: uploadResult.format,
          width: uploadResult.width,
          height: uploadResult.height
        });
      } catch (cloudinaryError: any) {
        console.error('❌ Failed to upload to Cloudinary:', cloudinaryError);
        console.error('❌ Cloudinary error details:', {
          message: cloudinaryError.message,
          http_code: cloudinaryError.http_code,
          name: cloudinaryError.name,
          stack: cloudinaryError.stack?.substring(0, 500)
        });
        
        return NextResponse.json({ 
          error: 'Failed to upload to cloud storage',
          message: cloudinaryError.message || 'Unknown error',
          http_code: cloudinaryError.http_code,
          serverless: true,
          cloudinaryError: cloudinaryError.toString().substring(0, 500)
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
      uploadedTo: useCloudinary && isServerless ? 'cloudinary' : 'local'
    });
  } catch (error: any) {
    console.error('❌ Error uploading image:', error);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack?.substring(0, 500),
      serverless: isServerless,
      useCloudinary,
      hasCloudinaryUrl: !!process.env.CLOUDINARY_URL
    });
    return NextResponse.json(
      { 
        error: 'Failed to upload image',
        message: error.message || 'Unknown error',
        serverless: isServerless,
        useCloudinary,
        hasCloudinaryUrl: !!process.env.CLOUDINARY_URL
      },
      { status: 500 }
    );
  }
}

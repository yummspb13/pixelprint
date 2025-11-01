import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
if (process.env.CLOUDINARY_URL || (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Check if we're in a serverless environment (Vercel)
const isServerless = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
const useCloudinary = !!process.env.CLOUDINARY_URL || !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY);

export async function POST(request: NextRequest) {
  try {
    console.log('📤 File upload request received');
    console.log('🌍 Environment:', { isServerless, useCloudinary });
    
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log('📁 File info:', { name: file.name, type: file.type, size: file.size });

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}_${randomString}.${fileExtension}`;

    let filePath: string;
    let savedFileName: string;

    if (useCloudinary && isServerless) {
      // Upload to Cloudinary in production
      console.log('☁️ Uploading to Cloudinary...');
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = buffer.toString('base64');
        const dataUri = `data:${file.type};base64,${base64}`;
        
        const uploadResult = await cloudinary.uploader.upload(dataUri, {
          folder: 'orders',
          public_id: `${timestamp}_${randomString}`,
          overwrite: false,
          resource_type: 'auto', // Auto-detect: image, video, raw, etc.
        });
        
        filePath = uploadResult.secure_url || uploadResult.url;
        savedFileName = uploadResult.public_id || fileName;
        console.log('✅ Uploaded to Cloudinary:', filePath);
      } catch (cloudinaryError: any) {
        console.error('❌ Failed to upload to Cloudinary:', cloudinaryError);
        return NextResponse.json(
          { 
            error: "Failed to upload file to cloud storage",
            message: cloudinaryError.message || 'Unknown error'
          },
          { status: 500 }
        );
      }
    } else {
      // Local development - save to file system
      console.log('💾 Saving to local file system...');
      try {
        const uploadsDir = join(process.cwd(), "uploads");
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true });
        }

        const filePathLocal = join(uploadsDir, fileName);

        // Convert file to buffer and save
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePathLocal, buffer);

        filePath = `uploads/${fileName}`;
        savedFileName = fileName;
        console.log('✅ Saved locally:', filePath);
      } catch (fsError: any) {
        console.error('❌ Failed to save locally:', fsError);
        return NextResponse.json(
          { 
            error: "Failed to upload file",
            message: fsError.message || 'Unknown error'
          },
          { status: 500 }
        );
      }
    }

    // Return file info
    return NextResponse.json({
      success: true,
      fileName: file.name,
      savedFileName: savedFileName,
      fileSize: file.size,
      filePath: filePath,
      uploadedTo: useCloudinary && isServerless ? 'cloudinary' : 'local'
    });

  } catch (error: any) {
    console.error('❌ Error uploading file:', error);
    return NextResponse.json(
      { 
        error: "Failed to upload file",
        message: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

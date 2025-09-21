import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate simple filename with timestamp
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const fileName = `service-${timestamp}.${fileExtension}`;
    const path = join(process.cwd(), 'public', 'uploads', 'services', fileName);

    // Ensure directory exists
    const fs = require('fs');
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'services');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    await writeFile(path, buffer);

    const imageUrl = `/uploads/services/${fileName}`;

    return NextResponse.json({ 
      success: true, 
      imageUrl,
      fileName 
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

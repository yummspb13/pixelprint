import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  console.log('🔍 API SETTINGS GET: Starting...');
  try {
    const settings = await prisma.settings.findMany({
      orderBy: {
        category: 'asc'
      }
    });

    console.log('🔍 API SETTINGS GET: Found settings:', settings.length);

    // Convert to key-value object
    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.key] = {
        value: setting.value,
        description: setting.description || undefined,
        category: setting.category
      };
      return acc;
    }, {} as Record<string, { value: string; description?: string; category: string }>);

    console.log('✅ API SETTINGS GET: Success, returning settings');

    return NextResponse.json({
      ok: true,
      settings: settingsObject
    });

  } catch (error) {
    console.error('💥 API SETTINGS GET ERROR:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { ok: false, error: 'Invalid settings data' },
        { status: 400 }
      );
    }

    // Update or create each setting
    const updatePromises = Object.entries(settings).map(async ([key, data]: [string, any]) => {
      return prisma.settings.upsert({
        where: { key },
        update: {
          value: data.value || '',
          description: data.description || null,
          category: data.category || 'general'
        },
        create: {
          key,
          value: data.value || '',
          description: data.description || null,
          category: data.category || 'general'
        }
      });
    });

    await Promise.all(updatePromises);

    return NextResponse.json({
      ok: true,
      message: 'Settings saved successfully'
    });

  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to save settings' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

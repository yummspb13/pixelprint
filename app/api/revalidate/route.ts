import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');
    
    if (!tag) {
      return NextResponse.json({ error: 'Tag is required' }, { status: 400 });
    }
    
    revalidateTag(tag);
    
    return NextResponse.json({ 
      success: true, 
      message: `Cache revalidated for tag: ${tag}` 
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { error: 'Failed to revalidate cache' },
      { status: 500 }
    );
  }
}


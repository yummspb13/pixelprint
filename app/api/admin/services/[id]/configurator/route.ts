import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH /api/admin/services/[id]/configurator - Toggle configurator for service
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { enabled } = await request.json();
    const serviceId = parseInt(id);

    if (isNaN(serviceId)) {
      return NextResponse.json({ error: "Invalid service ID" }, { status: 400 });
    }

    const service = await prisma.service.update({
      where: { id: serviceId },
      data: { configuratorEnabled: enabled }
    });

    return NextResponse.json({ 
      success: true, 
      service: {
        id: service.id,
        name: service.name,
        configuratorEnabled: service.configuratorEnabled
      }
    });
  } catch (error) {
    console.error('Error updating configurator:', error);
    return NextResponse.json(
      { error: 'Failed to update configurator' },
      { status: 500 }
    );
  }
}
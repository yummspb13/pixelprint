import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = 'nodejs';

// GET /api/admin/prices/services/[id] - Get single service
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const service = await prisma.service.findUnique({
      where: { id: parseInt(id) },
      include: { _count: { select: { rows: true } } }
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json({ service });
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json({ error: 'Failed to fetch service' }, { status: 500 });
  }
}

// PUT /api/admin/prices/services/[id] - Update service
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { name, category, slug } = await request.json();

    if (!name || !category || !slug) {
      return NextResponse.json({ error: 'Name, category, and slug are required' }, { status: 400 });
    }

    // Check if slug is already taken by another service
    const existingService = await prisma.service.findFirst({
      where: { 
        slug: slug,
        id: { not: parseInt(id) }
      }
    });

    if (existingService) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
    }

    const service = await prisma.service.update({
      where: { id: parseInt(id) },
      data: { name, category, slug },
      include: { _count: { select: { rows: true } } }
    });

    return NextResponse.json({ ok: true, service });
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
  }
}

// DELETE /api/admin/prices/services/[id] - Delete single service
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    const service = await prisma.service.findUnique({
      where: { id: parseInt(id) },
      include: { _count: { select: { rows: true } } }
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Delete the service (this will cascade delete related rows and tiers)
    await prisma.service.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ 
      ok: true, 
      message: `Service "${service.name}" deleted successfully` 
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    console.log('Fetching history for slug:', slug);
    
    const service = await prisma.service.findUnique({
      where: { slug },
      select: { id: true }
    });

    console.log('Service found:', service);

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const history = await prisma.changeHistory.findMany({
      where: { serviceId: service.id },
      orderBy: { createdAt: 'desc' },
      take: 50 // последние 50 записей
    });

    console.log('History entries found:', history.length);

    // Форматируем дату и время для лондонского времени
    const formattedHistory = history.map(entry => {
      const londonTime = new Date(entry.createdAt.toLocaleString("en-US", {timeZone: "Europe/London"}));
      
      const date = londonTime.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      const time = londonTime.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      return {
        id: entry.id,
        date,
        time,
        change: entry.description,
        changeType: entry.changeType,
        rowId: entry.rowId
      };
    });

    return NextResponse.json({ history: formattedHistory });
  } catch (error) {
    console.error('Error fetching change history:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

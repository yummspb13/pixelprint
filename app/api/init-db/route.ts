import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

export async function POST() {
  try {
    console.log('🔄 INIT-DB: Starting database initialization...');
    
    // Проверяем подключение к базе данных
    await prisma.$connect();
    console.log('✅ INIT-DB: Database connected successfully');
    
    // Проверяем, есть ли данные
    const serviceCount = await prisma.service.count();
    console.log(`📊 INIT-DB: Services in database: ${serviceCount}`);
    
    if (serviceCount === 0) {
      console.log('⚠️ INIT-DB: Database is empty, adding sample data...');
      
      // Добавляем тестовые данные
      await prisma.service.createMany({
        data: [
          {
            slug: 'business-cards',
            name: 'Business Cards',
            description: 'High-quality business card printing',
            image: '/uploads/services/business-cards.jpg',
            category: 'stationery',
            order: 1,
            categoryOrder: 1,
            isActive: true,
            configuratorEnabled: true,
            calculatorAvailable: true,
            clickCount: 0
          },
          {
            slug: 'flyers',
            name: 'Flyers',
            description: 'Professional flyer printing',
            image: '/uploads/services/flyers.jpg',
            category: 'marketing',
            order: 2,
            categoryOrder: 1,
            isActive: true,
            configuratorEnabled: true,
            calculatorAvailable: true,
            clickCount: 0
          }
        ]
      });
      
      console.log('✅ INIT-DB: Sample services added');
    }
    
    // Проверяем menu tiles
    const menuCount = await prisma.menuTile.count();
    console.log(`📊 INIT-DB: Menu tiles in database: ${menuCount}`);
    
    if (menuCount === 0) {
      console.log('⚠️ INIT-DB: No menu tiles, adding sample data...');
      
      await prisma.menuTile.createMany({
        data: [
          {
            label: 'Business Cards',
            href: '/services/business-card-printing',
            image: '/uploads/services/business-cards.jpg',
            order: 1,
            isActive: true
          },
          {
            label: 'Flyers',
            href: '/services/flyers',
            image: '/uploads/services/flyers.jpg',
            order: 2,
            isActive: true
          }
        ]
      });
      
      console.log('✅ INIT-DB: Menu tiles added');
    }
    
    // Проверяем why articles
    const articleCount = await prisma.whyArticle.count();
    console.log(`📊 INIT-DB: Why articles in database: ${articleCount}`);
    
    if (articleCount === 0) {
      console.log('⚠️ INIT-DB: No why articles, adding sample data...');
      
      await prisma.whyArticle.createMany({
        data: [
          {
            title: 'Why Choose Us?',
            text: 'We provide high-quality printing services with fast turnaround times.',
            image: '/uploads/why/quality.jpg',
            href: '/about',
            span: 'xl',
            order: 1,
            isActive: true
          },
          {
            title: 'Fast Delivery',
            text: 'Get your prints delivered quickly with our express service.',
            image: '/uploads/why/speed.jpg',
            href: '/delivery',
            span: '',
            order: 2,
            isActive: true
          }
        ]
      });
      
      console.log('✅ INIT-DB: Why articles added');
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      counts: {
        services: await prisma.service.count(),
        menuTiles: await prisma.menuTile.count(),
        articles: await prisma.whyArticle.count()
      }
    });
    
  } catch (error: any) {
    console.error('❌ INIT-DB: Database initialization failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

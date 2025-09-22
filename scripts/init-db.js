// scripts/init-db.js
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
  console.log('🔄 Initializing database...');
  
  const prisma = new PrismaClient();
  
  try {
    // Проверяем, существует ли база данных
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Проверяем, есть ли данные
    const serviceCount = await prisma.service.count();
    console.log(`📊 Services in database: ${serviceCount}`);
    
    if (serviceCount === 0) {
      console.log('⚠️ Database is empty, adding sample data...');
      
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
      
      console.log('✅ Sample data added');
    }
    
    // Проверяем menu tiles
    const menuCount = await prisma.menuTile.count();
    console.log(`📊 Menu tiles in database: ${menuCount}`);
    
    if (menuCount === 0) {
      console.log('⚠️ No menu tiles, adding sample data...');
      
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
      
      console.log('✅ Menu tiles added');
    }
    
    // Проверяем why articles
    const articleCount = await prisma.whyArticle.count();
    console.log(`📊 Why articles in database: ${articleCount}`);
    
    if (articleCount === 0) {
      console.log('⚠️ No why articles, adding sample data...');
      
      await prisma.whyArticle.createMany({
        data: [
          {
            title: 'Why Choose Us?',
            text: 'We provide high-quality printing services with fast turnaround times.',
            image: '/uploads/why/quality.jpg',
            href: '/about',
            span: 'Quality',
            order: 1,
            isActive: true
          },
          {
            title: 'Fast Delivery',
            text: 'Get your prints delivered quickly with our express service.',
            image: '/uploads/why/speed.jpg',
            href: '/delivery',
            span: 'Speed',
            order: 2,
            isActive: true
          }
        ]
      });
      
      console.log('✅ Why articles added');
    }
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase };

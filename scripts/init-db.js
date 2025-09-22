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

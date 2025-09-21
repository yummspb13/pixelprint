import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testSeed() {
  try {
    console.log('Testing service creation...');

    const service = await prisma.service.create({
      data: {
        name: 'Test Service',
        slug: 'test-service',
        description: 'Test description',
        category: 'Test Category',
        order: 1,
        categoryOrder: 1,
        isActive: true,
        configuratorEnabled: false,
        calculatorAvailable: true,
        clickCount: 0
      }
    });

    console.log('Service created:', service);
  } catch (error) {
    console.error('Error creating service:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSeed();

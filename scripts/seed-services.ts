import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const servicesData = [
  // Business Stationery
  {
    name: 'Letterheads',
    description: 'Professional business letterheads with company branding.',
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
    category: 'Business Stationery',
    order: 1,
    calculatorAvailable: true,
    slug: 'letterheads',
    isActive: true
  },
  {
    name: 'Business Cards',
    description: 'High-quality business cards with premium paper stock.',
    image: 'https://images.unsplash.com/photo-1541462608143-67571c6738dd?w=400&h=300&fit=crop',
    category: 'Business Stationery',
    order: 2,
    calculatorAvailable: true,
    slug: 'business-cards',
    isActive: true
  },
  {
    name: 'Envelopes',
    description: 'Custom printed envelopes matching your brand identity.',
    image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=300&fit=crop',
    category: 'Business Stationery',
    order: 3,
    calculatorAvailable: true,
    slug: 'envelopes',
    isActive: true
  },
  {
    name: 'Compliment Slips',
    description: 'Elegant compliment slips for professional communications.',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
    category: 'Business Stationery',
    order: 4,
    calculatorAvailable: true,
    slug: 'compliment-slips',
    isActive: true
  },
  {
    name: 'Reports',
    description: 'Professional reports with clean formatting and quality printing.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    category: 'Business Stationery',
    order: 5,
    calculatorAvailable: false,
    slug: 'reports',
    isActive: true
  },
  {
    name: 'Presentations',
    description: 'Stunning presentation materials with professional design.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    category: 'Business Stationery',
    order: 6,
    calculatorAvailable: false,
    slug: 'presentations',
    isActive: true
  },

  // Events Printing
  {
    name: 'Invitations',
    description: 'Beautiful invitations for weddings, parties, and special events.',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop',
    category: 'Events Printing',
    order: 1,
    calculatorAvailable: true,
    slug: 'invitations',
    isActive: true
  },
  {
    name: 'Programs',
    description: 'Elegant event programs with custom design and quality printing.',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop',
    category: 'Events Printing',
    order: 2,
    calculatorAvailable: true,
    slug: 'programs',
    isActive: true
  },
  {
    name: 'Place Cards',
    description: 'Personalized place cards for seating arrangements and events.',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop',
    category: 'Events Printing',
    order: 3,
    calculatorAvailable: true,
    slug: 'place-cards',
    isActive: true
  },
  {
    name: 'Thank You Cards',
    description: 'Custom thank you cards for expressing gratitude professionally.',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop',
    category: 'Events Printing',
    order: 4,
    calculatorAvailable: true,
    slug: 'thank-you-cards',
    isActive: true
  },
  {
    name: 'Wedding Stationery',
    description: 'Complete wedding stationery suite for your special day.',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop',
    category: 'Events Printing',
    order: 5,
    calculatorAvailable: false,
    slug: 'wedding-stationery',
    isActive: true
  },
  {
    name: 'Birthday Invites',
    description: 'Fun and creative birthday party invitations for all ages.',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop',
    category: 'Events Printing',
    order: 6,
    calculatorAvailable: false,
    slug: 'birthday-invites',
    isActive: true
  },

  // Marketing Materials
  {
    name: 'Flyers',
    description: 'Eye-catching flyers to promote your business and events effectively.',
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
    category: 'Marketing Materials',
    order: 1,
    calculatorAvailable: true,
    slug: 'flyers',
    isActive: true
  },
  {
    name: 'Posters',
    description: 'Large format posters for advertising and promotional campaigns.',
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
    category: 'Marketing Materials',
    order: 2,
    calculatorAvailable: true,
    slug: 'posters',
    isActive: true
  },
  {
    name: 'Banners',
    description: 'Custom banners for trade shows, events, and outdoor advertising.',
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
    category: 'Marketing Materials',
    order: 3,
    calculatorAvailable: true,
    slug: 'banners',
    isActive: true
  },
  {
    name: 'Brochures',
    description: 'Professional brochures showcasing your products and services.',
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
    category: 'Marketing Materials',
    order: 4,
    calculatorAvailable: true,
    slug: 'brochures',
    isActive: true
  },
  {
    name: 'Leaflets',
    description: 'Informative leaflets for marketing and promotional campaigns.',
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
    category: 'Marketing Materials',
    order: 5,
    calculatorAvailable: false,
    slug: 'leaflets',
    isActive: true
  },
  {
    name: 'A-Frames',
    description: 'Portable A-frame signs for outdoor advertising and events.',
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop',
    category: 'Marketing Materials',
    order: 6,
    calculatorAvailable: false,
    slug: 'a-frames',
    isActive: true
  }
];

async function main() {
  console.log('Seeding services...');

  // Clear existing services
  await prisma.service.deleteMany({});

  // Create services
  for (const serviceData of servicesData) {
    await prisma.service.create({
      data: serviceData
    });
  }

  console.log('Services seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

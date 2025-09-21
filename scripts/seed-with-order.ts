import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const servicesData = [
  // 1. Business Stationery (categoryOrder = 1)
  { name: 'Letterheads', slug: 'letterheads', category: 'Business Stationery', order: 1, categoryOrder: 1, description: 'Professional business letterheads with company branding.' },
  { name: 'Certificates', slug: 'certificates', category: 'Business Stationery', order: 2, categoryOrder: 1, description: 'Official certificates and awards with premium printing.' },
  { name: 'Compliment Slips', slug: 'compliment-slips', category: 'Business Stationery', order: 3, categoryOrder: 1, description: 'Elegant compliment slips for professional communications.' },
  { name: 'Business Cards', slug: 'business-cards', category: 'Business Stationery', order: 4, categoryOrder: 1, description: 'High-quality business cards with premium paper stock.' },
  { name: 'Appointment Cards', slug: 'appointment-cards', category: 'Business Stationery', order: 5, categoryOrder: 1, description: 'Professional appointment cards for scheduling.' },
  { name: 'Loyalty Cards', slug: 'loyalty-cards', category: 'Business Stationery', order: 6, categoryOrder: 1, description: 'Custom loyalty cards for customer retention programs.' },
  { name: 'NCR Pads of 50 A4 Triple', slug: 'ncr-pads', category: 'Business Stationery', order: 7, categoryOrder: 1, description: 'Carbonless copy pads for forms and invoices.' },
  { name: 'Overprint Envelopes BW', slug: 'overprint-envelopes', category: 'Business Stationery', order: 8, categoryOrder: 1, description: 'Black and white overprinted envelopes.' },
  { name: 'Membership Cards', slug: 'membership-cards', category: 'Business Stationery', order: 9, categoryOrder: 1, description: 'Durable membership cards for organizations.' },

  // 2. Advertising (categoryOrder = 2)
  { name: 'Flyers', slug: 'flyers', category: 'Advertising', order: 1, categoryOrder: 2, description: 'Eye-catching flyers to promote your business and events effectively.' },
  { name: 'Leaflets Printing', slug: 'leaflets', category: 'Advertising', order: 2, categoryOrder: 2, description: 'Informative leaflets for marketing and promotional campaigns.' },
  { name: 'Posters', slug: 'posters', category: 'Advertising', order: 3, categoryOrder: 2, description: 'Large format posters for advertising and promotional campaigns.' },

  // 3. Large Format Printing (categoryOrder = 3)
  { name: 'Drawing Printing', slug: 'drawing-printing', category: 'Large Format Printing', order: 1, categoryOrder: 3, description: 'High-quality technical drawings and blueprints.' },
  { name: 'Poster Printing', slug: 'poster-printing-large', category: 'Large Format Printing', order: 2, categoryOrder: 3, description: 'Large format poster printing up to A0 size.' },

  // 4. Menu Printing (categoryOrder = 4)
  { name: 'Waterproof Menu', slug: 'waterproof-menu', category: 'Menu Printing', order: 1, categoryOrder: 4, description: 'Durable waterproof menus for restaurants.' },
  { name: 'Flat Restaurant Menu', slug: 'flat-restaurant-menu', category: 'Menu Printing', order: 2, categoryOrder: 4, description: 'Single-page restaurant menus with elegant design.' },
  { name: 'Folded Restaurant Menu', slug: 'folded-restaurant-menu', category: 'Menu Printing', order: 3, categoryOrder: 4, description: 'Multi-page folded restaurant menus.' },
  { name: 'Placemat Menu', slug: 'placemat-menu', category: 'Menu Printing', order: 4, categoryOrder: 4, description: 'Functional placemat menus for dining tables.' },
  { name: 'Takeaway Menu', slug: 'takeaway-menu', category: 'Menu Printing', order: 5, categoryOrder: 4, description: 'Compact takeaway menus for delivery orders.' },

  // 5. Photocopying (categoryOrder = 5)
  { name: 'BW Photocopying', slug: 'photocopying-bw', category: 'Photocopying', order: 1, categoryOrder: 5, description: 'High-quality black and white photocopying services.' },
  { name: 'Colour Photocopying', slug: 'photocopying-colour', category: 'Photocopying', order: 2, categoryOrder: 5, description: 'Professional color photocopying with accurate color reproduction.' },

  // 6. Booklet Printing (categoryOrder = 6)
  { name: 'A6-A4 Booklets', slug: 'booklet-printing', category: 'Booklet Printing', order: 1, categoryOrder: 6, description: 'Professional booklets from A6 to A4 size.' },

  // 7. Events Printing (categoryOrder = 7)
  { name: 'Wedding Stationery', slug: 'wedding-stationery', category: 'Events Printing', order: 1, categoryOrder: 7, description: 'Complete wedding stationery suite for your special day.' },
  { name: 'Order of Service', slug: 'order-of-service', category: 'Events Printing', order: 2, categoryOrder: 7, description: 'Elegant order of service booklets for ceremonies.' },
  { name: 'Event Posters', slug: 'event-posters', category: 'Events Printing', order: 3, categoryOrder: 7, description: 'Eye-catching posters for events and celebrations.' },
  { name: 'Invitations', slug: 'invitations', category: 'Events Printing', order: 4, categoryOrder: 7, description: 'Beautiful invitations for weddings, parties, and special events.' },
  { name: 'Place Cards', slug: 'place-cards', category: 'Events Printing', order: 5, categoryOrder: 7, description: 'Personalized place cards for seating arrangements and events.' },
  { name: 'Thank You Cards', slug: 'thank-you-cards', category: 'Events Printing', order: 6, categoryOrder: 7, description: 'Custom thank you cards for expressing gratitude professionally.' },

  // 8. Seasonal Printing (categoryOrder = 8)
  { name: 'Greetings Cards Printing', slug: 'greetings-cards', category: 'Seasonal Printing', order: 1, categoryOrder: 8, description: 'Beautiful greeting cards for all occasions.' },
  { name: 'Postcards', slug: 'postcards', category: 'Seasonal Printing', order: 2, categoryOrder: 8, description: 'Custom postcards for travel and marketing.' },
  { name: 'Wrapping Paper', slug: 'wrapping-paper', category: 'Seasonal Printing', order: 3, categoryOrder: 8, description: 'Custom wrapping paper for gifts and packaging.' },
  { name: 'Calendar', slug: 'calendar', category: 'Seasonal Printing', order: 4, categoryOrder: 8, description: 'Custom calendars for businesses and personal use.' },

  // 9. Laminating (categoryOrder = 9)
  { name: 'A5-A1 Laminating', slug: 'lamination', category: 'Laminating', order: 1, categoryOrder: 9, description: 'Professional laminating services from A5 to A1 size.' },

  // 10. Print Finishing Services (categoryOrder = 10)
  { name: 'Binding', slug: 'binding', category: 'Print Finishing Services', order: 1, categoryOrder: 10, description: 'Professional binding services for documents and booklets.' },
  { name: 'Hole Punching', slug: 'hole-punching', category: 'Print Finishing Services', order: 2, categoryOrder: 10, description: 'Precise hole punching for filing and organization.' },
  { name: 'Perforating', slug: 'perforating', category: 'Print Finishing Services', order: 3, categoryOrder: 10, description: 'Clean perforation lines for easy tearing.' },
  { name: 'Rounding Corners', slug: 'rounding-corners', category: 'Print Finishing Services', order: 4, categoryOrder: 10, description: 'Smooth rounded corners for professional finish.' },
  { name: 'Glueing', slug: 'glueing', category: 'Print Finishing Services', order: 5, categoryOrder: 10, description: 'Precise gluing services for various materials.' },
  { name: 'Folding', slug: 'folding', category: 'Print Finishing Services', order: 6, categoryOrder: 10, description: 'Professional folding services for brochures and leaflets.' },
  { name: 'Stapling', slug: 'stapling', category: 'Print Finishing Services', order: 7, categoryOrder: 10, description: 'Secure stapling services for documents and booklets.' }
];

async function seedServices() {
  try {
    console.log('Starting services seeding...');

    // Create services
    for (const service of servicesData) {
      await prisma.service.create({
        data: {
          ...service,
          isActive: true,
          configuratorEnabled: false,
          calculatorAvailable: true,
          clickCount: 0
        }
      });
    }

    console.log(`Created ${servicesData.length} services across ${new Set(servicesData.map(s => s.category)).size} categories`);

    // Show summary by category
    const categories = [...new Set(servicesData.map(s => s.category))];
    for (const category of categories) {
      const count = servicesData.filter(s => s.category === category).length;
      const categoryOrder = servicesData.find(s => s.category === category)?.categoryOrder;
      console.log(`${categoryOrder}. ${category}: ${count} services`);
    }

  } catch (error) {
    console.error('Error seeding services:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedServices();

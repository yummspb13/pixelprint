import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const services = [
  // Business Stationery
  { slug: 'letterheads', name: 'Letterheads', description: 'Professional business letterheads with company branding.', category: 'Business Stationery', order: 1, categoryOrder: 1, calculatorAvailable: true },
  { slug: 'business-cards', name: 'Business Cards', description: 'High-quality business cards with premium paper stock.', category: 'Business Stationery', order: 2, categoryOrder: 1, calculatorAvailable: true },
  { slug: 'compliment-slips', name: 'Compliment Slips', description: 'Elegant compliment slips for professional communications.', category: 'Business Stationery', order: 3, categoryOrder: 1, calculatorAvailable: true },
  { slug: 'envelopes', name: 'Envelopes', description: 'Custom printed envelopes matching your brand identity.', category: 'Business Stationery', order: 4, categoryOrder: 1, calculatorAvailable: true },
  { slug: 'certificates', name: 'Certificates', description: 'Official certificates and awards with premium printing.', category: 'Business Stationery', order: 5, categoryOrder: 1, calculatorAvailable: true },
  { slug: 'appointment-cards', name: 'Appointment Cards', description: 'Professional appointment cards for scheduling.', category: 'Business Stationery', order: 6, categoryOrder: 1, calculatorAvailable: true },
  { slug: 'loyalty-cards', name: 'Loyalty Cards', description: 'Custom loyalty cards for customer retention programs.', category: 'Business Stationery', order: 7, categoryOrder: 1, calculatorAvailable: true },
  { slug: 'ncr-pads', name: 'NCR Pads of 50 A4 Triple', description: 'Carbonless copy pads for forms and invoices.', category: 'Business Stationery', order: 8, categoryOrder: 1, calculatorAvailable: true },
  { slug: 'overprint-envelopes', name: 'Overprint Envelopes BW', description: 'Black and white overprinted envelopes.', category: 'Business Stationery', order: 9, categoryOrder: 1, calculatorAvailable: true },
  { slug: 'membership-cards', name: 'Membership Cards', description: 'Durable membership cards for organizations.', category: 'Business Stationery', order: 10, categoryOrder: 1, calculatorAvailable: true },

  // Advertising
  { slug: 'flyers', name: 'Flyers', description: 'Eye-catching flyers to promote your business and events effectively.', category: 'Advertising', order: 1, categoryOrder: 2, calculatorAvailable: true },
  { slug: 'leaflets', name: 'Leaflets Printing', description: 'Informative leaflets for marketing and promotional campaigns.', category: 'Advertising', order: 2, categoryOrder: 2, calculatorAvailable: true },
  { slug: 'posters', name: 'Posters', description: 'Large format posters for advertising and promotional campaigns.', category: 'Advertising', order: 3, categoryOrder: 2, calculatorAvailable: true },

  // Large Format Printing
  { slug: 'drawing-printing', name: 'Drawing Printing', description: 'High-quality technical drawings and blueprints.', category: 'Large Format Printing', order: 1, categoryOrder: 3, calculatorAvailable: true },
  { slug: 'poster-printing', name: 'Poster Printing', description: 'Large format poster printing up to A0 size.', category: 'Large Format Printing', order: 2, categoryOrder: 3, calculatorAvailable: true },

  // Menu Printing
  { slug: 'waterproof-menu', name: 'Waterproof Menu', description: 'Durable waterproof menus for restaurants.', category: 'Menu Printing', order: 1, categoryOrder: 4, calculatorAvailable: true },
  { slug: 'flat-restaurant-menu', name: 'Flat Restaurant Menu', description: 'Single-page restaurant menus with elegant design.', category: 'Menu Printing', order: 2, categoryOrder: 4, calculatorAvailable: true },
  { slug: 'folded-restaurant-menu', name: 'Folded Restaurant Menu', description: 'Multi-page folded restaurant menus.', category: 'Menu Printing', order: 3, categoryOrder: 4, calculatorAvailable: true },
  { slug: 'placemat-menu', name: 'Placemat Menu', description: 'Functional placemat menus for dining tables.', category: 'Menu Printing', order: 4, categoryOrder: 4, calculatorAvailable: true },
  { slug: 'takeaway-menu', name: 'Takeaway Menu', description: 'Compact takeaway menus for delivery orders.', category: 'Menu Printing', order: 5, categoryOrder: 4, calculatorAvailable: true },

  // Photocopying
  { slug: 'photocopying-bw', name: 'BW Photocopying', description: 'High-quality black and white photocopying services.', category: 'Photocopying', order: 1, categoryOrder: 5, calculatorAvailable: true },
  { slug: 'photocopying-colour', name: 'Colour Photocopying', description: 'Professional color photocopying with accurate color reproduction.', category: 'Photocopying', order: 2, categoryOrder: 5, calculatorAvailable: true },

  // Booklet Printing
  { slug: 'booklet-printing', name: 'A6-A4 Booklets', description: 'Professional booklets from A6 to A4 size.', category: 'Booklet Printing', order: 1, categoryOrder: 6, calculatorAvailable: true },

  // Events Printing
  { slug: 'wedding-stationery', name: 'Wedding Stationery', description: 'Complete wedding stationery suite for your special day.', category: 'Events Printing', order: 1, categoryOrder: 7, calculatorAvailable: true },
  { slug: 'order-of-service', name: 'Order of Service', description: 'Elegant order of service booklets for ceremonies.', category: 'Events Printing', order: 2, categoryOrder: 7, calculatorAvailable: true },
  { slug: 'event-posters', name: 'Event Posters', description: 'Eye-catching posters for events and celebrations.', category: 'Events Printing', order: 3, categoryOrder: 7, calculatorAvailable: true },
  { slug: 'invitations', name: 'Invitations', description: 'Beautiful invitations for weddings, parties, and special events.', category: 'Events Printing', order: 4, categoryOrder: 7, calculatorAvailable: true },
  { slug: 'place-cards', name: 'Place Cards', description: 'Personalized place cards for seating arrangements and events.', category: 'Events Printing', order: 5, categoryOrder: 7, calculatorAvailable: true },
  { slug: 'thank-you-cards', name: 'Thank You Cards', description: 'Custom thank you cards for expressing gratitude professionally.', category: 'Events Printing', order: 6, categoryOrder: 7, calculatorAvailable: true },

  // Seasonal Printing
  { slug: 'greetings-cards', name: 'Greetings Cards Printing', description: 'Beautiful greeting cards for all occasions.', category: 'Seasonal Printing', order: 1, categoryOrder: 8, calculatorAvailable: true },
  { slug: 'postcards', name: 'Postcards', description: 'Custom postcards for travel and marketing.', category: 'Seasonal Printing', order: 2, categoryOrder: 8, calculatorAvailable: true },
  { slug: 'wrapping-paper', name: 'Wrapping Paper', description: 'Custom wrapping paper for gifts and packaging.', category: 'Seasonal Printing', order: 3, categoryOrder: 8, calculatorAvailable: true },
  { slug: 'calendar', name: 'Calendar', description: 'Custom calendars for businesses and personal use.', category: 'Seasonal Printing', order: 4, categoryOrder: 8, calculatorAvailable: true },

  // Laminating
  { slug: 'lamination', name: 'A5-A1 Laminating', description: 'Professional laminating services from A5 to A1 size.', category: 'Laminating', order: 1, categoryOrder: 9, calculatorAvailable: true },

  // Print Finishing Services
  { slug: 'binding', name: 'Binding', description: 'Professional binding services for documents and booklets.', category: 'Print Finishing Services', order: 1, categoryOrder: 10, calculatorAvailable: true },
  { slug: 'hole-punching', name: 'Hole Punching', description: 'Precise hole punching for filing and organization.', category: 'Print Finishing Services', order: 2, categoryOrder: 10, calculatorAvailable: true },
  { slug: 'perforating', name: 'Perforating', description: 'Clean perforation lines for easy tearing.', category: 'Print Finishing Services', order: 3, categoryOrder: 10, calculatorAvailable: true },
  { slug: 'rounding-corners', name: 'Rounding Corners', description: 'Smooth rounded corners for professional finish.', category: 'Print Finishing Services', order: 4, categoryOrder: 10, calculatorAvailable: true },
  { slug: 'glueing', name: 'Glueing', description: 'Precise gluing services for various materials.', category: 'Print Finishing Services', order: 5, categoryOrder: 10, calculatorAvailable: true },
  { slug: 'folding', name: 'Folding', description: 'Professional folding services for brochures and leaflets.', category: 'Print Finishing Services', order: 6, categoryOrder: 10, calculatorAvailable: true },
  { slug: 'stapling', name: 'Stapling', description: 'Secure stapling services for documents and booklets.', category: 'Print Finishing Services', order: 7, categoryOrder: 10, calculatorAvailable: true }
];

async function restoreServices() {
  try {
    console.log('Clearing existing services...');
    await prisma.service.deleteMany();
    
    console.log('Restoring services...');
    for (const service of services) {
      await prisma.service.create({
        data: {
          ...service,
          isActive: true,
          configuratorEnabled: false,
          clickCount: 0
        }
      });
    }
    
    console.log(`Successfully restored ${services.length} services!`);
  } catch (error) {
    console.error('Error restoring services:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreServices();

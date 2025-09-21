import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const articles = [
  {
    title: "Same-day Turnaround",
    text: "Order by 1 PM — pick up today (on selected services).",
    image: "/why/sameday.jpg",
    href: "/services/advertising",
    span: "lg",
    order: 1,
    content: `# Same-day Turnaround

We understand that sometimes you need your printing done urgently. That's why we offer same-day turnaround on selected services when you order by 1 PM.

## How it works:
- Order by 1 PM on weekdays
- Pick up the same day after 5 PM
- Available for most standard services
- Additional rush charges may apply

## Services available for same-day:
- Business cards
- Flyers and leaflets
- Small format posters
- Basic stationery

Contact us to confirm availability for your specific requirements.`,
    images: JSON.stringify(["/why/sameday-detail1.jpg", "/why/sameday-detail2.jpg"])
  },
  {
    title: "Preflight & Proof",
    text: "Automatic file checks + human review before print.",
    image: "/why/preflight.jpg",
    href: "/upload",
    order: 2,
    content: `# Preflight & Proof

Our comprehensive preflight process ensures your files are print-ready before they reach our presses.

## What we check:
- File format compatibility
- Color profiles and resolution
- Bleed and trim marks
- Font embedding
- Image quality and resolution

## Human review process:
- Experienced designers review every file
- Suggestions for improvements
- Color matching verification
- Layout optimization recommendations

This process saves you time and money by catching issues before printing.`,
    images: JSON.stringify(["/why/preflight-process1.jpg", "/why/preflight-process2.jpg"])
  },
  {
    title: "Large-Format Excellence",
    text: "Posters, banners, drawings — pin-sharp up to A0 and beyond.",
    image: "/why/largeformat.jpg",
    href: "/services/large-format",
    order: 3,
    content: `# Large-Format Excellence

From small posters to massive banners, we deliver exceptional quality at any size.

## Our capabilities:
- Up to A0 size and beyond
- High-resolution printing
- Various paper and vinyl options
- Lamination and finishing services
- Mounting and installation

## Applications:
- Trade show displays
- Retail signage
- Event banners
- Architectural drawings
- Art reproductions

Every large-format print is carefully inspected for quality and accuracy.`,
    images: JSON.stringify(["/why/largeformat-examples1.jpg", "/why/largeformat-examples2.jpg"])
  },
  {
    title: "Secure Checkout",
    text: "PCI-compliant payments, invoices for companies.",
    image: "/why/secure.jpg",
    order: 4,
    content: `# Secure Checkout

Your payment security is our priority. We use industry-standard encryption and compliance.

## Security features:
- PCI DSS compliant payment processing
- SSL encryption for all transactions
- Secure data storage
- Regular security audits

## Payment options:
- Credit and debit cards
- Bank transfers
- Company invoicing
- PayPal integration

## For businesses:
- Net payment terms available
- Detailed invoices
- Purchase order support
- Account management

Your financial information is always protected.`,
    images: JSON.stringify(["/why/secure-payment1.jpg", "/why/secure-payment2.jpg"])
  },
  {
    title: "Easy Pickup & Courier",
    text: "Collect in London EC1A or book a same-day courier.",
    image: "/why/courier.jpg",
    href: "/contact",
    order: 5,
    content: `# Easy Pickup & Courier

Convenient collection and delivery options to suit your needs.

## Pickup location:
- Central London EC1A
- Easy access by public transport
- Free parking available
- Extended opening hours

## Courier services:
- Same-day delivery in London
- Next-day delivery nationwide
- International shipping
- Tracking and insurance included

## Collection process:
- Email notification when ready
- Bring valid ID
- Check your order before leaving
- Free packaging for transport

We make it easy to get your prints when you need them.`,
    images: JSON.stringify(["/why/courier-location1.jpg", "/why/courier-delivery1.jpg"])
  },
  {
    title: "Award-Winning Quality",
    text: "Premium stocks, calibrated CMYK workflow, ISO profiles.",
    image: "/why/quality.jpg",
    order: 6,
    content: `# Award-Winning Quality

We're proud of our industry recognition and commitment to excellence.

## Quality standards:
- ISO 12647-2 certified workflow
- Calibrated CMYK color management
- Premium paper stocks
- Regular quality audits

## Awards and recognition:
- Print Industry Excellence Award 2023
- Best Small Print Business 2022
- Customer Service Excellence 2021
- Environmental Responsibility Award 2020

## Our process:
- Color-matched proofs
- Multiple quality checks
- Professional finishing
- Satisfaction guarantee

Quality isn't just our promise—it's our passion.`,
    images: JSON.stringify(["/why/quality-awards1.jpg", "/why/quality-process1.jpg"])
  },
  {
    title: "Design Assistance",
    text: "From business cards to menus — quick edits & layout help.",
    image: "/why/design.jpg",
    href: "/services",
    order: 7,
    content: `# Design Assistance

Our design team is here to help bring your vision to life.

## Services we offer:
- Quick file corrections
- Layout optimization
- Brand consistency checks
- Print-ready file preparation

## Design expertise:
- Adobe Creative Suite specialists
- Print design best practices
- Color theory and application
- Typography and layout

## Turnaround times:
- Simple edits: 2-4 hours
- Layout changes: 1-2 days
- Complete redesigns: 3-5 days
- Rush jobs available

## What we can help with:
- Business cards and stationery
- Flyers and brochures
- Menus and signage
- Event materials

Let us help make your project shine.`,
    images: JSON.stringify(["/why/design-examples1.jpg", "/why/design-process1.jpg"])
  },
  {
    title: "Sustainable Materials",
    text: "FSC papers, eco inks, recyclable packaging.",
    image: "/why/eco.jpg",
    order: 8,
    content: `# Sustainable Materials

We're committed to environmental responsibility in everything we do.

## Eco-friendly materials:
- FSC certified papers
- Recycled paper options
- Vegetable-based inks
- Biodegradable packaging

## Environmental initiatives:
- Carbon-neutral printing
- Waste reduction programs
- Energy-efficient equipment
- Recycling partnerships

## Certifications:
- FSC Chain of Custody
- ISO 14001 Environmental Management
- Carbon Trust Standard
- Green Business Certification

## Our commitment:
- 100% renewable energy
- Zero waste to landfill
- Sustainable supply chain
- Regular environmental audits

Print responsibly with Pixel Print.`,
    images: JSON.stringify(["/why/eco-materials1.jpg", "/why/eco-certifications1.jpg"])
  }
];

async function main() {
  try {
    console.log('Seeding Why Articles...');
    
    // Clear existing articles
    await prisma.whyArticle.deleteMany();
    
    // Create new articles
    for (const article of articles) {
      await prisma.whyArticle.create({
        data: article
      });
    }
    
    console.log('✅ Why Articles seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding Why Articles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();

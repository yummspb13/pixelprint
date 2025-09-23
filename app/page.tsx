import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import HeroPrintPro from '@/components/sections/HeroPrintPro';
import ServicesGridSSR from '@/components/sections/ServicesGridSSR';
import WhyPixelGrid from '@/components/sections/WhyPixelGrid';
import ContactSection from '@/components/sections/ContactSection';
import ScrollReveal from '@/components/ux/ScrollReveal';
import CommandPalette from '@/components/ux/CommandPalette';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic'

// Добавляем метаданные для SEO и производительности
export const metadata = {
  title: 'Pixel Print - Premium Digital & Large-Format Printing in London',
  description: 'Professional printing services in London. Business stationery, flyers, posters, booklets, menus. Expert preflight, same-day options, secure checkout.',
  keywords: 'printing, digital printing, large format, London, business cards, flyers, posters',
  openGraph: {
    title: 'Pixel Print - Premium Digital & Large-Format Printing',
    description: 'Professional printing services in London with same-day delivery options.',
    type: 'website',
    locale: 'en_GB',
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: 'width=device-width, initial-scale=1',
};

export default async function Page() {
  logger.info("=== HOME PAGE RENDERED ===");
  logger.info("Environment:", {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL
  });

  // Загружаем услуги для HeroPrintPro
  let services: any[] = [];
  try {
    services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: [
        { categoryOrder: 'asc' },
        { order: 'asc' },
        { clickCount: 'desc' }
      ]
    });
  } catch (error) {
    console.error('Error loading services for HeroPrintPro:', error);
  }
  
  return (
    <div className="min-h-screen bg-px-bg">
      <Header />
      <main>
        <HeroPrintPro variant="photo" services={services} />
        <ScrollReveal>
          <ServicesGridSSR />
        </ScrollReveal>
        <WhyPixelGrid className="my-16" id="articles" />
        <ScrollReveal>
          <ContactSection />
        </ScrollReveal>
      </main>
      <Footer />
      <CommandPalette />
    </div>
  );
}
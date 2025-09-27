import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import HeroPrintPro from '@/components/sections/HeroPrintPro';
import ServicesGridSSR from '@/components/sections/ServicesGridSSR';
import WhyPixelGrid from '@/components/sections/WhyPixelGrid';
import ContactSection from '@/components/sections/ContactSection';
import ScrollReveal from '@/components/ux/ScrollReveal';
import CommandPalette from '@/components/ux/CommandPalette';
import NoCSSLogger from '@/components/ux/NoCSSLogger';
import StructuredData from '@/components/seo/StructuredData';
import { logger } from '@/lib/logger';
import { cssLogger } from '@/lib/css-logger';
import { getCachedServices, getCachedMenuTiles, getCachedWhyArticles } from '@/lib/cache';

export const dynamic = 'force-dynamic'

// Добавляем метаданные для SEO и производительности
export const metadata = {
  title: 'Pixel Print - Premium Digital & Large-Format Printing in London',
  description: 'Professional printing services in London. Business stationery, flyers, posters, booklets, menus. Expert preflight, same-day options, secure checkout.',
  keywords: 'printing, digital printing, large format, London, business cards, flyers, posters, booklets, menus, same-day printing',
  authors: [{ name: 'Pixel Print London' }],
  creator: 'Pixel Print London',
  publisher: 'Pixel Print London',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('http://localhost:3010'),
  alternates: {
    canonical: '/',
    languages: {
      'en-GB': '/',
    },
  },
  openGraph: {
    title: 'Pixel Print - Premium Digital & Large-Format Printing',
    description: 'Professional printing services in London with same-day delivery options.',
    type: 'website',
    locale: 'en_GB',
    url: 'http://localhost:3010',
    siteName: 'Pixel Print',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Pixel Print - Professional Printing Services in London',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pixel Print - Premium Digital & Large-Format Printing',
    description: 'Professional printing services in London with same-day delivery options.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default async function Page() {
  logger.info("=== HOME PAGE RENDERED ===");
  logger.info("Environment:", {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL
  });

  // Запускаем CSS Logger только на главной странице
  if (process.env.NODE_ENV === 'development') {
    cssLogger.start();
    logger.info("CSS Logger initialized for home page");
  }

  // Загружаем данные с кэшированием
  let services: any[] = [];
  let menuTiles: any[] = [];
  let whyArticles: any[] = [];
  
  try {
    // Параллельная загрузка всех данных
    const [servicesData, menuTilesData, whyArticlesData] = await Promise.all([
      getCachedServices(),
      getCachedMenuTiles(),
      getCachedWhyArticles()
    ]);
    
    services = servicesData;
    menuTiles = menuTilesData;
    whyArticles = whyArticlesData;
    
    logger.info("Data loaded successfully:", {
      services: services.length,
      menuTiles: menuTiles.length,
      whyArticles: whyArticles.length
    });
  } catch (error) {
    logger.error("Error loading data:", error);
  }
  
  return (
    <div className="min-h-screen bg-white">
      {/* Структурированные данные для SEO */}
      <StructuredData />
      
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
      <NoCSSLogger />
    </div>
  );
}
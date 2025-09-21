import Header from '@/components/site/Header';
import Footer from '@/components/site/Footer';
import HeroPrintPro from '@/components/sections/HeroPrintPro';
import ServicesGridSSR from '@/components/sections/ServicesGridSSR';
import WhyPixelGrid from '@/components/sections/WhyPixelGrid';
import ContactSection from '@/components/sections/ContactSection';
import ScrollReveal from '@/components/ux/ScrollReveal';
import CommandPalette from '@/components/ux/CommandPalette';

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

export default function Page() {
  return (
    <div className="min-h-screen bg-px-bg">
      <Header />
      <main>
        <HeroPrintPro variant="photo" />
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
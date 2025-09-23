"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import RevealTitle from "@/components/ux/RevealTitle";
import { Search, Phone, ArrowRight, X } from "lucide-react";
import { useLanguage } from '@/contexts/LanguageContext';
import { getTextSize } from '@/lib/languageStyles';
import { useRouter } from 'next/navigation';

type Service = { service: string; slug: string; category: string };

// Client-only parallax component
function ParallaxVisuals({ variant }: { variant: "photo" | "collage" | "video" }) {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -24]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 18]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -12]);

  if (variant === "video") {
    return <HeroVideo />;
  } else if (variant === "photo") {
    return <HeroPhoto y1={y1} />;
  } else {
    return <HeroCollage y1={y1} y2={y2} y3={y3} />;
  }
}

export default function HeroPrintPro({
  variant = "collage", // "photo" | "collage" | "video"
  services: initialServices = []
}: { 
  variant?: "photo" | "collage" | "video";
  services?: any[];
}) {
  const [mounted, setMounted] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const { t, language } = useLanguage();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (initialServices && initialServices.length > 0) {
      // Используем переданные услуги
      const filteredServices = initialServices
        .filter((service: any) => service.isActive)
        .map((service: any) => ({
          service: service.name,
          slug: service.slug,
          category: service.category
        }));
      setServices(filteredServices);
    } else {
      // Fallback к API загрузке
    fetch("/api/pricing/services", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && Array.isArray(d.services)) {
          const filteredServices = d.services
              .filter((service: any) => service.isActive)
            .map((service: any) => ({
              service: service.name,
              slug: service.slug,
              category: service.category
            }));
          setServices(filteredServices);
        } else {
          setServices([]);
        }
      })
      .catch(() => setServices([]));
    }
  }, [initialServices]);

  // параллакс для правого визуала (только на клиенте)

  return (
    <section className="relative bg-white overflow-hidden">
      <div className="mx-auto max-w-7xl relative px-4 sm:px-6">
        {/* Background Image - ограничен шириной контента */}
        <div className="absolute inset-0 z-0 rounded-3xl overflow-hidden mx-4 sm:mx-0">
        <Image
          src="/hero/hero-main.jpg"
          alt="Pixel Print production background"
          fill
          priority
          className="object-cover"
          sizes="(max-width: 1280px) 100vw, 1280px"
          quality={85}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" />
      </div>
      
        <div className="relative z-10 grid grid-cols-1 items-center gap-6 py-8 sm:py-14 md:grid-cols-2 md:gap-10 md:py-18 px-4 sm:px-0">
        {/* LEFT */}
        <div>
          {/* Gradient Title */}
          <div className="mb-6">
            <h1 className={`${getTextSize(language, 'heroTitle')} font-bold tracking-tight leading-tight font-playfair`}>
              <span className="text-px-fg">{t('hero.title')?.split(' & ')[0] || 'Premium Digital'} &</span>
              <br />
              <span className="bg-gradient-to-r from-px-cyan via-px-magenta to-px-yellow bg-clip-text text-transparent animate-gradient">
                {t('hero.title')?.split(' & ')[1]?.split(' in ')[0] || 'Large-Format Printing'}
              </span>
              <br />
              <span className="text-px-fg">{t('hero.subtitle') || 'in London'}</span>
            </h1>
          </div>
          
          <p className={`mt-4 max-w-xl text-zinc-600 ${getTextSize(language, 'description')}`}>
            {t('hero.description') || 'Business stationery, flyers, posters, booklets, menus. Expert preflight, same-day options, secure checkout.'}
          </p>

          {/* Desktop buttons - hidden on mobile */}
          <div className="hidden sm:flex flex-row flex-wrap items-center gap-3 mt-6">
            <div className="group relative">
              <Link
                href="#quick-quote"
                className={`inline-flex items-center justify-center rounded-lg bg-[linear-gradient(90deg,#00AEEF,#EC008C)] px-4 py-3 text-white shadow-sm transition hover:brightness-[1.05] w-auto ${getTextSize(language, 'button')} font-medium`}
              >
                {t('hero.calculateOrder')} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              {/* Tooltip - Desktop */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 max-w-xs">
                <div className="text-center whitespace-normal">
                  {t('hero.chooseService')}
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
            <Link
              href="/upload"
              className={`inline-flex items-center justify-center rounded-lg border px-4 py-3 text-zinc-900 hover:bg-zinc-50 w-auto ${getTextSize(language, 'button')} font-medium`}
            >
              {t('hero.uploadArtwork')}
            </Link>
            <a
              href="tel:+442071234567"
              className="inline-flex items-center justify-center gap-2 text-sm text-base text-zinc-700 hover:text-black w-auto py-3"
            >
              <Phone className="h-4 w-4" /> {t('hero.callNow')}
            </a>
          </div>

          {/* Hero Search Bar */}
          <div className="mt-5">
            <HeroSearchBar />
          </div>

          {/* Quick Quote: choose service + qty */}
          <div id="quick-quote">
            <QuickQuote services={services} />
          </div>
          {/* Benefits mini-strip */}
          <div className="mt-6 grid grid-cols-2 gap-3 text-[13px] text-zinc-700 sm:grid-cols-4">
            <div>• Preflight check</div>
            <div>• Same-day turnaround</div>
            <div>• Easy pickup & courier</div>
            <div>• Secure checkout</div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="relative">
          {!mounted ? (
            <div className="h-[320px] w-full md:h-[420px] bg-white/60 rounded-3xl animate-pulse backdrop-blur-sm" />
          ) : (
            <div className="relative h-[320px] w-full md:h-[420px] overflow-hidden rounded-3xl shadow-2xl">
              {/* Background with gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-px-cyan/20 via-px-magenta/10 to-px-yellow/20" />
              
              {/* Content overlay */}
              <div className="relative z-10 flex h-full flex-col items-center justify-center p-8 text-center">
                <div className="mb-4 h-16 w-16 rounded-full bg-gradient-to-r from-px-cyan to-px-magenta p-0.5">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
                    <span className="text-2xl font-bold text-px-fg">P</span>
                  </div>
                </div>
                <h3 className="mb-2 text-2xl font-bold text-px-fg font-playfair">Pixel Print</h3>
                <p className="text-sm text-px-muted">Professional Printing Services</p>
                
                {/* Decorative elements */}
                <div className="mt-6 flex space-x-2">
                  <div className="h-2 w-2 rounded-full bg-px-cyan" />
                  <div className="h-2 w-2 rounded-full bg-px-magenta" />
                  <div className="h-2 w-2 rounded-full bg-px-yellow" />
                </div>
              </div>
              
              {/* Subtle pattern overlay */}
              <div className="absolute inset-0 opacity-5">
                <div className="h-full w-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,174,239,0.1),transparent_50%)]" />
              </div>
            </div>
          )}
        </div>
      </div>
      </div>    </section>
  );
}

/* ---------- QuickQuote ---------- */
function QuickQuote({ services }: { services: Service[] }) {
  const [slug, setSlug] = useState<string>("");
  const [qty, setQty] = useState<number>(500);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { t } = useLanguage();
  
  useEffect(() => {
    if (!slug && services.length) setSlug(services[0].slug);
  }, [services, slug]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.service-selector')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  if (services.length === 0) {
    return (
      <div className="mt-4 space-y-3 sm:space-y-0 sm:grid sm:grid-cols-[1fr,120px,120px] sm:gap-2 rounded-xl border bg-white/70 p-3 shadow-sm backdrop-blur">
        <div className="w-full rounded-lg border px-3 py-3 text-sm text-gray-400 bg-gray-50">
          Select Service
        </div>
        <input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(parseInt(e.target.value || "0", 10))}
          className="w-full sm:w-auto rounded-lg border px-3 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300"
          placeholder="Quantity"
        />
        <button
          disabled
          className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-gray-300 px-3 py-3 text-sm text-gray-500 cursor-not-allowed font-medium"
        >
          {t('hero.quickQuote')}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3 sm:space-y-0 sm:grid sm:grid-cols-[1fr,120px,120px] sm:gap-2 rounded-xl border bg-white/70 p-3 shadow-sm backdrop-blur">
      {/* Custom Service Selector */}
      <div className="relative service-selector">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm text-left focus:outline-none focus:ring-2 focus:ring-px-cyan focus:border-px-cyan hover:border-gray-400 transition-colors flex items-center justify-between"
        >
          <span className="text-gray-700">
            {services.find(s => s.slug === slug)?.service || 'Select Service'}
          </span>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {services.map((service) => (
              <button
                key={service.slug}
                onClick={() => {
                  setSlug(service.slug);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-3 text-sm text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                  slug === service.slug ? 'bg-px-cyan/10 text-px-cyan font-medium' : 'text-gray-700'
                }`}
              >
                <span>{service.service}</span>
                {slug === service.slug && (
                  <svg className="w-4 h-4 text-px-cyan" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      <input
        type="number"
        min={1}
        value={qty}
        onChange={(e) => setQty(parseInt(e.target.value || "0", 10))}
        className="w-full sm:w-auto rounded-lg border px-3 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300"
        placeholder="Quantity"
      />
      <Link
        href={slug ? `/services/${slug}?qty=${qty}` : "#"}
        className="inline-flex items-center justify-center rounded-lg bg-black px-3 py-3 text-sm text-white hover:bg-zinc-900 transition-colors w-full sm:w-auto font-medium"
      >
        Quick quote
      </Link>
    </div>
  );
}

/* ---------- Visuals ---------- */
function HeroPhoto({ y1 }: { y1: any }) {
  return (
    <motion.div style={{ y: y1 }} className="relative h-[320px] w-full md:h-[420px]">
      {/* Простое видео без сложной логики */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/hero/hero-main.jpg"
        className="rounded-3xl object-cover shadow-xl w-full h-full pointer-events-none"
        onError={(e) => {
          console.error('Video failed to load:', e);
        }}
      >
        <source src="/hero/hero-video.mp4" type="video/mp4" />
        {/* Fallback для браузеров, которые не поддерживают video */}
        <Image
          src="/hero/hero-main.jpg"
          alt="Pixel Print production"
          fill
          priority
          sizes="(min-width:1024px) 560px, 90vw"
          className="rounded-3xl object-cover shadow-xl pointer-events-none"
        />
      </video>
      
      {/* мягкая вуаль поверх видео, чтобы текст слева держал баланс */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-t from-black/10 to-transparent" />
    </motion.div>
  );
}

function HeroCollage({ y1, y2, y3 }: { y1: any; y2: any; y3: any }) {
  // три «карточки»: визитки / постер / меню (реальные фото из /public/hero/*)
  return (
    <div className="relative h-[360px] w-full md:h-[460px]">
      <motion.div style={{ y: y1 }} className="absolute left-6 top-2 h-[260px] w-[180px] md:h-[320px] md:w-[220px]">
        <Image 
          src="/hero/business-cards.jpg" 
          alt="Business cards" 
          fill 
          sizes="220px" 
          className="rounded-2xl object-cover shadow-xl" 
          loading="lazy"
          quality={80}
        />
      </motion.div>
      <motion.div style={{ y: y2 }} className="absolute right-4 top-10 h-[220px] w-[160px] md:h-[260px] md:w-[190px]">
        <Image 
          src="/hero/poster-roll.jpg" 
          alt="Poster printing" 
          fill 
          sizes="190px" 
          className="rounded-2xl object-cover shadow-xl" 
          loading="lazy"
          quality={80}
        />
      </motion.div>
      <motion.div style={{ y: y3 }} className="absolute bottom-0 left-1/2 h-[180px] w-[140px] -translate-x-1/2 md:h-[220px] md:w-[160px]">
        <Image 
          src="/hero/menu.jpg" 
          alt="Menu printing" 
          fill 
          sizes="160px" 
          className="rounded-2xl object-cover shadow-xl" 
          loading="lazy"
          quality={80}
        />
      </motion.div>
    </div>
  );
}

function HeroVideo() {
  // webm/mp4 клип цеха/плоттера, авто-mute, без звука
  return (
    <div className="relative h-[320px] w-full overflow-hidden rounded-3xl shadow-xl md:h-[420px]">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
        poster="/hero/hero-main.jpg"
      >
        <source src="/hero/printshop.mp4" type="video/mp4" />
        <source src="/hero/printshop.webm" type="video/webm" />
      </video>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
    </div>
  );
}

/* ---------- HeroSearchBar ---------- */
function HeroSearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();
  const { t } = useLanguage();

  // Debounced search function
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (query.length >= 2) {
        await performSearch(query);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      // Логируем поисковый запрос
      await fetch('/api/search/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery.trim() }),
        cache: 'no-store'
      });

      // Выполняем поиск
      const searchUrl = `/api/search?q=${encodeURIComponent(searchQuery.trim())}&t=${Date.now()}`;
      const response = await fetch(searchUrl, { cache: 'no-store' });
      const data = await response.json();
      
      if (data.ok) {
        setResults(data.results);
        setIsOpen(data.results.length > 0);
        setSelectedIndex(-1);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    } catch (error) {
      console.error('🔍 HeroSearchBar: Search error:', error);
      setResults([]);
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (results.length > 0 && selectedIndex >= 0) {
      // Если есть выбранный результат, переходим к нему
      handleResultClick(results[selectedIndex]);
    } else if (results.length > 0) {
      // Если есть результаты, но ничего не выбрано, переходим к первому
      handleResultClick(results[0]);
    } else {
      // Если результатов нет, выполняем поиск
      await performSearch(query);
    }
  };

  const handleResultClick = (result: any) => {
    router.push(`/services/${result.slug}`);
    setIsOpen(false);
    setQuery("");
    setResults([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setQuery('');
      setIsOpen(false);
      setResults([]);
    } else if (results.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prevIndex) => (prevIndex + 1) % results.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prevIndex) => (prevIndex - 1 + results.length) % results.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex !== -1) {
          handleResultClick(results[selectedIndex]);
        }
      }
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.hero-search-container')) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="hero-search-container relative">
      <form onSubmit={handleSearch} className="flex items-center gap-2 rounded-xl border bg-white/80 p-2 shadow-sm backdrop-blur">
        <Search className="ml-1 h-4 w-4 text-zinc-500" />
        <input
          id="hero-search-input"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search services or calculators…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
          disabled={isLoading}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              setResults([]);
            }}
            className="p-1 text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {isLoading && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-px-cyan"></div>
        )}
      </form>

      {/* Search Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-auto">
          {results.map((result, index) => (
            <button
              key={result.id}
              onClick={() => handleResultClick(result)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                index === selectedIndex ? 'bg-px-cyan/10 text-px-cyan' : 'text-gray-700'
              }`}
            >
              <div>
                <div className="font-medium">{result.name}</div>
                <div className="text-sm text-gray-500">{result.category}</div>
              </div>
              {index === selectedIndex && (
                <div className="w-2 h-2 bg-px-cyan rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

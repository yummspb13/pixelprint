"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import RevealTitle from "@/components/ux/RevealTitle";
import { Search, Phone, ArrowRight } from "lucide-react";
import { useLanguage } from '@/contexts/LanguageContext';
import { getTextSize } from '@/lib/languageStyles';

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
}: { variant?: "photo" | "collage" | "video" }) {
  const [mounted, setMounted] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const { t, language } = useLanguage();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetch("/api/pricing/services", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.ok && Array.isArray(d.services)) {
          // Фильтруем только услуги с ценами (calculatorAvailable) и активные
          const filteredServices = d.services
            .filter((service: any) => service.isActive && service.calculatorAvailable)
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
  }, []);

  // параллакс для правого визуала (только на клиенте)

  return (
    <section className="relative bg-white overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero/hero-main.jpg"
          alt="Pixel Print production background"
          fill
          priority
          className="object-cover"
          sizes="100vw"
          quality={85}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" />
      </div>
      
      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-6 px-4 py-8 sm:px-6 sm:py-14 md:grid-cols-2 md:gap-10 md:py-18">
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

          <div className="mt-6 flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3">
            <div className="group relative">
              <Link
                href="#quick-quote"
                className={`inline-flex items-center justify-center rounded-lg bg-[linear-gradient(90deg,#00AEEF,#EC008C)] px-4 py-3 text-white shadow-sm transition hover:brightness-[1.05] w-full sm:w-auto ${getTextSize(language, 'button')} font-medium`}
              >
                {t('hero.calculateOrder')} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              {/* Tooltip - Desktop */}
              <div className="hidden sm:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 max-w-xs">
                <div className="text-center whitespace-normal">
                  {t('hero.chooseService')}
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
              {/* Tooltip - Mobile */}
              <div className="block sm:hidden absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 max-w-xs">
                <div className="text-center whitespace-normal">
                  {t('hero.chooseService')}
                </div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
              </div>
            </div>
            <Link
              href="/upload"
              className={`inline-flex items-center justify-center rounded-lg border px-4 py-3 text-zinc-900 hover:bg-zinc-50 w-full sm:w-auto ${getTextSize(language, 'button')} font-medium`}
            >
              {t('hero.uploadArtwork')}
            </Link>
            <a
              href="tel:+442071234567"
              className="inline-flex items-center justify-center gap-2 text-sm sm:text-base text-zinc-700 hover:text-black w-full sm:w-auto py-3"
            >
              <Phone className="h-4 w-4" /> {t('hero.callNow')}
            </a>
          </div>

          {/* Quick search / Command palette hint */}
          <div className="mt-5 flex items-center gap-2 rounded-xl border bg-white/80 p-2 shadow-sm backdrop-blur">
            <Search className="ml-1 h-4 w-4 text-zinc-500" />
            <input
              placeholder="Search services or calculators…  (Press ⌘K)"
              className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
              onFocus={() => {
                // открываем палитру по фокусу (эмулируем ⌘K)
                document.dispatchEvent(
                  new KeyboardEvent("keydown", { key: "k", metaKey: true })
                );
              }}
            />
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
    </section>
  );
}

/* ---------- QuickQuote ---------- */
function QuickQuote({ services }: { services: Service[] }) {
  const [slug, setSlug] = useState<string>("");
  const [qty, setQty] = useState<number>(500);
  const { t } = useLanguage();
  
  useEffect(() => {
    if (!slug && services.length) setSlug(services[0].slug);
  }, [services, slug]);

  if (services.length === 0) {
    return (
      <div className="mt-4 space-y-3 sm:space-y-0 sm:grid sm:grid-cols-[1fr,120px,120px] sm:gap-2 rounded-xl border bg-white/70 p-3 shadow-sm backdrop-blur">
        <div className="w-full rounded-lg border px-3 py-3 text-sm text-gray-400 bg-gray-50">
          Loading services...
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
      <select
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        className="w-full rounded-lg border px-3 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-300"
      >
        {services.map((s) => (
          <option key={s.slug} value={s.slug}>
            {s.service}
          </option>
        ))}
      </select>
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

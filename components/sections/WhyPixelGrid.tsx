"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import RevealTitle from "@/components/ux/RevealTitle";
import WaveLoader from "@/components/ui/WaveLoader";
import { ArticleModal } from "@/components/ui/ArticleModal";
import { useLanguage } from "@/contexts/LanguageContext";

type Tile = {
  id: number;
  title: string;
  text: string;
  image?: string;
  href?: string;
  span?: "lg" | "xl";
  order: number;
  isActive: boolean;
  content?: string;
  images?: string;
};

export default function WhyPixelGrid({ className = "", id }: { className?: string; id?: string }) {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Tile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchTiles = async () => {
      try {
        const response = await fetch('/api/why-articles/');
        const data = await response.json();
        setTiles(data.articles || []);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTiles();
  }, []);

  // Handle article parameter from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const articleParam = urlParams.get('article');
    
    if (articleParam && tiles.length > 0) {
      // Wait a bit for tiles to be loaded and rendered
      setTimeout(() => {
        const articleElement = Array.from(document.querySelectorAll('[data-article-title]')).find(el => {
          const title = el.getAttribute('data-article-title')?.toLowerCase() || '';
          const searchTerm = articleParam.toLowerCase();
          
          // More flexible matching - check if any significant words match
          const titleWords = title.split(/\s+/).filter(word => word.length > 2);
          const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 2);
          
          return searchWords.some(searchWord => 
            titleWords.some(titleWord => 
              titleWord.includes(searchWord) || searchWord.includes(titleWord)
            )
          );
        });
        
        if (articleElement) {
          (articleElement as HTMLElement).click();
          // Clean up URL parameter
          const url = new URL(window.location.href);
          url.searchParams.delete('article');
          window.history.replaceState({}, '', url.toString());
        }
      }, 1500);
    }
  }, [tiles]);

  const handleArticleClick = (article: Tile) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
  };

  const handleNext = () => {
    if (!selectedArticle) return;
    const currentIndex = tiles.findIndex(t => t.id === selectedArticle.id);
    if (currentIndex < tiles.length - 1) {
      setSelectedArticle(tiles[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    if (!selectedArticle) return;
    const currentIndex = tiles.findIndex(t => t.id === selectedArticle.id);
    if (currentIndex > 0) {
      setSelectedArticle(tiles[currentIndex - 1]);
    }
  };

  if (loading) {
    return (
      <section className={`relative mx-auto max-w-7xl px-6 ${className}`}>
        <div className="mb-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight font-playfair">
            <span className="text-px-fg">{t('why.title')?.split('?')[0] || 'Why Choose'} </span>
            <span className="bg-gradient-to-r from-px-cyan via-px-magenta to-px-yellow bg-clip-text text-transparent animate-gradient">
              {t('why.title')?.split('?')[1] || 'Pixel Print?'}
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-600 md:text-base">
            {t('why.subtitle')}
          </p>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <WaveLoader />
        </div>
      </section>
    );
  }


  if (tiles.length === 0) {
    return (
      <section className={`relative mx-auto max-w-7xl px-6 ${className}`}>
        <div className="mb-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight font-playfair">
            <span className="text-px-fg">{t('why.title')?.split('?')[0] || 'Why Choose'} </span>
            <span className="bg-gradient-to-r from-px-cyan via-px-magenta to-px-yellow bg-clip-text text-transparent animate-gradient">
              {t('why.title')?.split('?')[1] || 'Pixel Print?'}
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-600 md:text-base">
            {t('why.subtitle')}
          </p>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">{t('common.noArticlesFound')}</p>
        </div>
      </section>
    );
  }

  return (
    <section id={id} className={`relative mx-auto max-w-7xl px-6 ${className}`}>
      <div className="mb-12 text-center">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight font-playfair">
          <span className="text-px-fg">{t('why.title')?.split('?')[0] || 'Why Choose'} </span>
          <span className="bg-gradient-to-r from-px-cyan via-px-magenta to-px-yellow bg-clip-text text-transparent animate-gradient">
            {t('why.title')?.split('?')[1] || 'Pixel Print?'}
          </span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-600 md:text-base">
          {t('why.subtitle')}
        </p>
      </div>


      {/* Grid — Apple-like clean mosaic */}
      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
      >
        {tiles.map((tile, i) => (
          <motion.div
            key={tile.id}
            variants={{
              hidden: { opacity: 0, y: 18 },
              show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
            }}
            className={[
              "group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white",
              "shadow-sm transition will-change-transform hover:-translate-y-0.5 hover:shadow-lg",
              // «дорогая» градиентная рамка на ховер
              "before:pointer-events-none before:absolute before:inset-0 before:rounded-3xl",
              "before:p-px before:opacity-0 before:transition",
              "before:[background:linear-gradient(135deg,rgba(0,174,239,.45),rgba(236,0,140,.45),rgba(255,242,0,.35))]",
              "before:[-webkit-mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)]",
              "before:[-webkit-mask-composite:xor] before:[mask-composite:exclude]",
              "hover:before:opacity-100",
              tile.span === "xl" ? "lg:col-span-2" :
              tile.span === "lg" ? "lg:col-span-1" : "lg:col-span-1",
            ].join(" ")}
          >
            <TileContent {...tile} onClick={() => handleArticleClick(tile)} />
          </motion.div>
        ))}
      </motion.div>

      {/* Article Modal */}
      <ArticleModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        article={selectedArticle as any}
        onNext={handleNext}
        onPrev={handlePrev}
        hasNext={selectedArticle ? tiles.findIndex(t => t.id === selectedArticle.id) < tiles.length - 1 : false}
        hasPrev={selectedArticle ? tiles.findIndex(t => t.id === selectedArticle.id) > 0 : false}
      />
    </section>
  );
}

function TileContent({ id, title, text, image, href, onClick }: Tile & { onClick: () => void }) {
  // Check if this should be an external link (only http/https or specific calculator pages)
  // For now, let's make all articles open in popups by default
  const isExternalLink = false; // Temporarily disable external links to test popups
  const { t } = useLanguage();
  
  const handleClick = (e: React.MouseEvent) => {
    if (isExternalLink) {
      // For external links, let the browser handle navigation
      return;
    }
    e.preventDefault();
    onClick();
  };

  const content = (
    <div 
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-black cursor-pointer"
      onClick={handleClick}
      data-article-title={title}
    >
      <div className="relative h-48 w-full md:h-56 lg:h-64">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            priority={false}
          />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#f5f5f5,white)]" />
        )}

        {/* тонкая затемняющая вуаль на ховер */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition group-hover:opacity-100" />
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold tracking-tight text-zinc-900 font-playfair">
          {title}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-zinc-600">
          {text}
        </p>
        <div className="mt-3 inline-flex items-center text-sm font-medium text-zinc-900">
          {isExternalLink ? t('common.visitPage') : t('common.learnMore')} <span className="ml-1 translate-x-0 transition group-hover:translate-x-0.5">→</span>
        </div>
      </div>
    </div>
  );

  // Wrap in Link for external links, otherwise return content directly
  if (isExternalLink) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    );
  }

  return content;
}
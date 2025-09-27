'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import WaveLoader from '@/components/ui/WaveLoader';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTextSize } from '@/lib/languageStyles';

interface Service {
  id: number;
  name: string;
  description?: string;
  image?: string;
  category: string;
  order: number;
  calculatorAvailable: boolean;
  clickCount: number;
  slug: string;
  isActive: boolean;
}

interface ServicesData {
  [category: string]: Service[];
}


type TiltCardProps = {
  service: Service;
  index: number;
  onServiceClick: (serviceId: number) => void;
};

function TiltCard({ service, index, onServiceClick }: TiltCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleClick = () => {
    onServiceClick(service.id);
  };

  return (
    <Link href={`/services/${service.slug}`} onClick={handleClick}>
      <div ref={cardRef} className="relative isolate overflow-hidden rounded-2xl bg-white shadow-lg p-6 md:p-8 cursor-pointer hover:shadow-xl transition-shadow duration-300">
        {/* текст слева, оставляем место под фото справа */}
        <div className="pr-28 md:pr-48">
          <div className="flex items-center gap-2 mb-2">
            <h3 className={`${getTextSize(language, 'serviceTitle')} font-playfair font-semibold text-px-fg`}>
              {service.name}
            </h3>
            {service.calculatorAvailable && (
              <div className="w-7 h-7 bg-px-cyan/10 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-px-cyan" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M21.5 12.95v-1.9c0-4.03 0-6.046-1.391-7.298S16.479 2.5 12 2.5c-4.478 0-6.718 0-8.109 1.252S2.5 7.02 2.5 11.05v1.9c0 4.03 0 6.046 1.391 7.298S7.521 21.5 12 21.5c4.478 0 6.718 0 8.109-1.252S21.5 16.98 21.5 12.95M18 8h-4m2-2v4m2 7.5h-4m4-3h-4m-4 3l-1.75-1.75m0 0L6.5 14m1.75 1.75L10 14m-1.75 1.75L6.5 17.5M10 8H6"/>
                </svg>
              </div>
            )}
            {index < 2 && (
              <div className="flex items-center gap-1 text-yellow-600 px-2 py-1 rounded-full text-xs font-medium ml-1.5 relative z-20 bg-white/90 backdrop-blur-sm shadow-lg">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 32 32">
                  <path d="m18.7 4.627l2.247 4.31a2.27 2.27 0 0 0 1.686 1.189l4.746.65c2.538.35 3.522 3.479 1.645 5.219l-3.25 2.999a2.225 2.225 0 0 0-.683 2.04l.793 4.398c.441 2.45-2.108 4.36-4.345 3.24l-4.536-2.25a2.282 2.282 0 0 0-2.006 0l-4.536 2.25c-2.238 1.11-4.786-.79-4.345-3.24l.793-4.399c.14-.75-.12-1.52-.682-2.04l-3.251-2.998c-1.877-1.73-.893-4.87 1.645-5.22l4.746-.65a2.23 2.23 0 0 0 1.686-1.189l2.248-4.309c1.144-2.17 4.264-2.17 5.398 0Z"/>
                </svg>
                <span>{t('services.popular')}</span>
              </div>
            )}
          </div>
          <p className={`${getTextSize(language, 'small')} text-gray-500 leading-relaxed max-w-[200px] md:max-w-[280px]`}>
            {service.description || 'Professional printing service for your business needs.'}
          </p>
        </div>

        {/* контейнер фото — ВНУТРИ карточки; всё, что выйдет, обрежется border-radius'ом */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[50%] md:w-[45%]">
          <div 
            className={`absolute right-0 top-1/2 -translate-y-1/2 will-change-transform transition-all duration-700 ease-out ${
              isVisible
                ? 'translate-x-0 opacity-100'
                : 'translate-x-full opacity-0'
            }`}
          >
            <Image
              src={service.image || '/placeholder-service.jpg'}
              alt={service.name}
              width={280}
              height={160}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                const currentSrc = target.src;
                
                // Try different formats in order of preference
                if (currentSrc.includes('.webp')) {
                  target.src = currentSrc.replace('.webp', '.jpg');
                } else if (currentSrc.includes('.jpg')) {
                  target.src = currentSrc.replace('.jpg', '.png');
                } else if (currentSrc.includes('.png')) {
                  target.src = currentSrc.replace('.png', '.gif');
                } else {
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjE2MCIgdmlld0JveD0iMCAwIDI4MCAxNjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyODAiIGhlaWdodD0iMTYwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjE0MCIgeT0iODAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+Cjwvc3ZnPg==';
                }
              }}
              className="block w-[200px] h-[120px] md:w-[280px] md:h-[160px] object-cover rounded-md shadow-xl"
              loading="lazy"
              quality={85}
              sizes="(max-width: 768px) 200px, 280px"
              unoptimized={service.image?.includes('.webp') || service.image?.includes('.gif')}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

interface GridServiceCardProps {
  category: string;
  services: Service[];
  onServiceClick: (serviceId: number) => void;
}

function GridServiceCard({ category, services, onServiceClick }: GridServiceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t, language } = useLanguage();
  
  // Sort services by popularity (clickCount) and take top 4 for main display
  const sortedServices = [...services].sort((a, b) => b.clickCount - a.clickCount);
  const mainServices = sortedServices.slice(0, 4);
  const additionalServices = sortedServices.slice(4);

  return (
    <div className="w-full mb-8">
      {/* Заголовок блока */}
      <div className="text-center mb-6 animate-fade-in">
        <h3 className={`${getTextSize(language, 'categoryTitle')} font-playfair font-bold text-px-fg mb-2`}>{category}</h3>
        <p className={`${getTextSize(language, 'description')} text-px-muted`}>{t('services.subtitle')}</p>
      </div>

      {/* Первый ряд - 4 основных услуги */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {mainServices.map((service, index) => (
          <div
            key={service.id}
            className="animate-fade-in"
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: 'both'
            }}
          >
            <TiltCard
              service={service}
              index={index}
              onServiceClick={onServiceClick}
            />
          </div>
        ))}
      </div>

      {/* Кнопка раскрытия */}
      {additionalServices.length > 0 && (
        <div className="text-center mb-6">
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="outline"
            className="bg-px-cyan/10 border-px-cyan text-px-cyan hover:bg-px-cyan hover:text-white transition-all duration-300 font-medium"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                {t('common.showLess')}
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                +{additionalServices.length} {t('common.moreServices')}
              </>
            )}
          </Button>
        </div>
      )}

      {/* Второй ряд - раскрытые услуги */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {additionalServices.map((service, index) => (
            <div
              key={service.id}
              className="animate-fade-in"
              style={{
                animationDelay: `${index * 150}ms`,
                animationFillMode: 'both'
              }}
            >
              <TiltCard
                service={service}
                index={index + 4} // Continue indexing from 4
                onServiceClick={onServiceClick}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


interface ServicesGridNewProps {
  initialData?: ServicesData;
}

export default function ServicesGridNew({ initialData }: ServicesGridNewProps) {
  const [services, setServices] = useState<ServicesData>(initialData || {});
  const [loading, setLoading] = useState(!initialData);
  const [showAll, setShowAll] = useState(false);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [totalCategories, setTotalCategories] = useState(initialData ? Object.keys(initialData).length : 0);
  const { t, language } = useLanguage();

  // Move useMemo hooks here to avoid conditional hook calls
  const allCategories = useMemo(() => Object.keys(services || {}), [services]);
  const displayedCategories = useMemo(() => 
    showAll ? allCategories : allCategories.slice(0, 3), 
    [showAll, allCategories]
  );

  const fetchServices = useCallback(async (loadAll = false) => {
    try {
      if (loadAll) {
        setIsLoadingAll(true);
      } else {
        setLoading(true);
      }
      
      const limit = loadAll ? 100 : 3; // Загружаем все или только 3
      const response = await fetch(`/api/services/?limit=${limit}`, {
        cache: 'force-cache', // Используем кэш браузера
        next: { revalidate: 300 } // Перевалидируем каждые 5 минут
      });
      const data = await response.json();
      
      setServices(data.services);
      
      // Сохраняем общее количество категорий из пагинации
      if (data.pagination && data.pagination.totalCategories) {
        setTotalCategories(data.pagination.totalCategories);
      }
      
      if (loadAll) {
        setShowAll(true);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
      setIsLoadingAll(false);
    }
  }, []);

  useEffect(() => {
    // Загружаем данные только если их нет
    if (!initialData) {
      fetchServices();
    }
  }, [fetchServices, initialData]);

  const handleServiceClick = async (serviceId: number) => {
    try {
      await fetch(`/api/services/${serviceId}/click`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  const handleShowAll = () => {
    fetchServices(true);
  };

  // Показываем скелетон вместо полной загрузки
  if (loading) {
    return (
      <section className="py-20 bg-px-bg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className={`${getTextSize(language, 'sectionTitle')} font-bold tracking-tight leading-tight font-playfair`}>
              <span className="text-px-fg">{t('services.title')?.split(' ')[0] || 'Our'} </span>
              <span className="bg-gradient-to-r from-px-cyan via-px-magenta to-px-yellow bg-clip-text text-transparent animate-gradient">
                {t('services.title')?.split(' ')[1] || 'Services'}
              </span>
            </h2>
            <p className={`${getTextSize(language, 'description')} text-px-muted max-w-2xl mx-auto`}>
              {t('services.subtitle')}
            </p>
          </div>
          
          {/* Скелетон для 3 категорий */}
          <div className="space-y-16">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded-lg mb-8 mx-auto max-w-md"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="bg-white rounded-2xl shadow-lg h-48 border-2 border-gray-200"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-px-bg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center space-y-4 mb-16">
          <h2 className={`${getTextSize(language, 'sectionTitle')} font-bold tracking-tight leading-tight font-playfair`}>
            <span className="text-px-fg">{t('services.title')?.split(' ')[0] || 'Our'} </span>
            <span className="bg-gradient-to-r from-px-cyan via-px-magenta to-px-yellow bg-clip-text text-transparent animate-gradient">
              {t('services.title')?.split(' ')[1] || 'Services'}
            </span>
          </h2>
          <p className={`${getTextSize(language, 'description')} text-px-muted max-w-2xl mx-auto`}>
            {t('services.subtitle')}
          </p>
        </div>

        <div className="space-y-16">
          {displayedCategories.map((category) => (
            <GridServiceCard
              key={category}
              category={category}
              services={services[category] || []}
              onServiceClick={handleServiceClick}
            />
          ))}
        </div>

        {/* Show All Button */}
        {!showAll && totalCategories > 3 && (
          <div className="mt-16 flex justify-center">
            <Button
              onClick={handleShowAll}
              disabled={isLoadingAll}
              className="flex items-center space-x-2 bg-gradient-to-r from-px-cyan to-px-magenta hover:from-px-cyan/90 hover:to-px-magenta/90 px-8 py-3 text-lg"
            >
              {isLoadingAll ? (
                <>
                  <WaveLoader />
                  <span>{t('common.loading')}</span>
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  <span>{t('common.showAllServices')}</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

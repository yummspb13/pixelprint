"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Plus, Minus } from 'lucide-react';

// Мокапы для разных услуг
const mockups = {
  'Business Stationery': [
    { id: 1, name: 'Letterheads', image: 'https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=Letterheads', angle: -5 },
    { id: 2, name: 'Business Cards', image: 'https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=Business+Cards', angle: 3 },
    { id: 3, name: 'Envelopes', image: 'https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=Envelopes', angle: -2 }
  ],
  'Events Printing': [
    { id: 1, name: 'Invitations', image: 'https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=Invitations', angle: 4 },
    { id: 2, name: 'Programs', image: 'https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=Programs', angle: -3 },
    { id: 3, name: 'Place Cards', image: 'https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=Place+Cards', angle: 2 }
  ],
  'Marketing Materials': [
    { id: 1, name: 'Flyers', image: 'https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=Flyers', angle: -4 },
    { id: 2, name: 'Posters', image: 'https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=Posters', angle: 5 },
    { id: 3, name: 'Banners', image: 'https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=Banners', angle: -1 }
  ],
  'Restaurant & Menu': [
    { id: 1, name: 'Menus', image: 'https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=Menus', angle: 3 },
    { id: 2, name: 'Placemats', image: 'https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=Placemats', angle: -2 },
    { id: 3, name: 'Table Tents', image: 'https://via.placeholder.com/300x200/f3f4f6/9ca3af?text=Table+Tents', angle: 4 }
  ]
};

const services = [
  {
    id: 'business-stationery',
    title: 'Business Stationery',
    description: 'Professional stationery for your business',
    color: 'from-px-cyan to-px-magenta',
    size: 'large',
    items: ['Letterheads', 'Business Cards', 'Envelopes', 'Compliment Slips', 'NCR Pads', 'Letterheads Premium', 'Business Cards Deluxe', 'Envelopes Custom', 'Compliment Slips Gold', 'NCR Pads Executive'],
    images: [
      { name: 'Letterheads', image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop&crop=center', color: 'border-cyan-500' },
      { name: 'Business Cards', image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=300&fit=crop&crop=center', color: 'border-magenta-500' },
      { name: 'Envelopes', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop&crop=center', color: 'border-yellow-500' },
      { name: 'Compliment Slips', image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop&crop=center', color: 'border-cyan-500' }
    ]
  },
  {
    id: 'events-printing',
    title: 'Events Printing',
    description: 'Perfect for special occasions',
    color: 'from-px-magenta to-px-yellow',
    size: 'medium',
    items: ['Invitations', 'Programs', 'Place Cards', 'Thank You Cards', 'Wedding Stationery', 'Birthday Invites', 'Anniversary Cards', 'Graduation Programs', 'Memorial Cards', 'Celebration Banners'],
    images: [
      { name: 'Invitations', image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop&crop=center', color: 'border-magenta-500' },
      { name: 'Programs', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop&crop=center', color: 'border-yellow-500' },
      { name: 'Place Cards', image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=300&fit=crop&crop=center', color: 'border-cyan-500' },
      { name: 'Thank You Cards', image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop&crop=center', color: 'border-magenta-500' }
    ]
  },
  {
    id: 'marketing-materials',
    title: 'Marketing Materials',
    description: 'Promote your business effectively',
    color: 'from-px-yellow to-px-cyan',
    size: 'small',
    items: ['Flyers', 'Posters', 'Banners', 'Brochures', 'Leaflets', 'A-Frames', 'Window Graphics', 'Vehicle Wraps', 'Trade Show Displays', 'Promotional Items'],
    images: [
      { name: 'Flyers', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center', color: 'border-yellow-500' },
      { name: 'Posters', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center', color: 'border-cyan-500' },
      { name: 'Banners', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center', color: 'border-magenta-500' },
      { name: 'Brochures', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop&crop=center', color: 'border-yellow-500' }
    ]
  },
  {
    id: 'restaurant-menu',
    title: 'Restaurant & Menu',
    description: 'Beautiful menus and restaurant materials',
    color: 'from-px-cyan to-px-yellow',
    size: 'medium',
    items: ['Menus', 'Placemats', 'Table Tents', 'Wine Lists', 'Specials Boards', 'Takeaway Menus', 'Drink Menus', 'Dessert Menus', 'Kids Menus', 'Catering Menus'],
    images: [
      { name: 'Menus', image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop&crop=center', color: 'border-cyan-500' },
      { name: 'Placemats', image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop&crop=center', color: 'border-yellow-500' },
      { name: 'Table Tents', image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop&crop=center', color: 'border-magenta-500' },
      { name: 'Wine Lists', image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop&crop=center', color: 'border-cyan-500' }
    ]
  },
  {
    id: 'document-printing',
    title: 'Document Printing',
    description: 'High-quality document printing',
    color: 'from-px-magenta to-px-cyan',
    size: 'small',
    items: ['Reports', 'Presentations', 'Manuals', 'Booklets', 'Catalogs', 'Annual Reports', 'Training Materials', 'Technical Docs', 'Legal Documents', 'Financial Reports'],
    images: [
      { name: 'Reports', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=center', color: 'border-magenta-500' },
      { name: 'Presentations', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=center', color: 'border-cyan-500' },
      { name: 'Manuals', image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop&crop=center', color: 'border-yellow-500' },
      { name: 'Booklets', image: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=300&fit=crop&crop=center', color: 'border-magenta-500' }
    ]
  },
  {
    id: 'packaging-labels',
    title: 'Packaging & Labels',
    description: 'Custom packaging solutions',
    color: 'from-px-yellow to-px-magenta',
    size: 'large',
    items: ['Product Labels', 'Packaging Boxes', 'Stickers', 'Tags', 'Wraps', 'Custom Boxes', 'Shipping Labels', 'Product Tags', 'Security Labels', 'Promotional Stickers'],
    images: [
      { name: 'Product Labels', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center', color: 'border-yellow-500' },
      { name: 'Packaging Boxes', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center', color: 'border-magenta-500' },
      { name: 'Stickers', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center', color: 'border-cyan-500' },
      { name: 'Tags', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&crop=center', color: 'border-yellow-500' }
    ]
  }
];

interface ServiceCardProps {
  service: typeof services[0];
  isExpanded: boolean;
  onToggle: () => void;
  showMockups: boolean;
  variant: number;
}

interface GridServiceCardProps {
  service: typeof services[0];
  isExpanded: boolean;
  onToggle: () => void;
  showMockups: boolean;
}

type TiltCardProps = {
  title: string;
  imageSrc: string;
  angle?: number; // по умолчанию "10 часов" ≈ -12deg
  index?: number; // индекс для определения популярности
};

function TiltCard({ title, imageSrc, angle = 0, index = 0 }: TiltCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={cardRef} className="relative isolate overflow-hidden rounded-2xl bg-white shadow-lg p-6 md:p-8">
      {/* текст слева, оставляем место под фото справа */}
      <div className="pr-28 md:pr-48">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-xl md:text-2xl font-playfair font-semibold text-px-fg">{title}</h3>
          <div className="w-7 h-7 bg-px-cyan/10 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-px-cyan" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M21.5 12.95v-1.9c0-4.03 0-6.046-1.391-7.298S16.479 2.5 12 2.5c-4.478 0-6.718 0-8.109 1.252S2.5 7.02 2.5 11.05v1.9c0 4.03 0 6.046 1.391 7.298S7.521 21.5 12 21.5c4.478 0 6.718 0 8.109-1.252S21.5 16.98 21.5 12.95M18 8h-4m2-2v4m2 7.5h-4m4-3h-4m-4 3l-1.75-1.75m0 0L6.5 14m1.75 1.75L10 14m-1.75 1.75L6.5 17.5M10 8H6"/>
            </svg>
          </div>
          {index < 2 && (
            <div className="flex items-center gap-1 text-yellow-600 px-2 py-1 rounded-full text-xs font-medium ml-1.5 relative z-20 bg-white/90 backdrop-blur-sm shadow-lg">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 32 32">
                <path d="m18.7 4.627l2.247 4.31a2.27 2.27 0 0 0 1.686 1.189l4.746.65c2.538.35 3.522 3.479 1.645 5.219l-3.25 2.999a2.225 2.225 0 0 0-.683 2.04l.793 4.398c.441 2.45-2.108 4.36-4.345 3.24l-4.536-2.25a2.282 2.282 0 0 0-2.006 0l-4.536 2.25c-2.238 1.11-4.786-.79-4.345-3.24l.793-4.399c.14-.75-.12-1.52-.682-2.04l-3.251-2.998c-1.877-1.73-.893-4.87 1.645-5.22l4.746-.65a2.23 2.23 0 0 0 1.686-1.189l2.248-4.309c1.144-2.17 4.264-2.17 5.398 0Z"/>
              </svg>
              <span>Popular</span>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-500 leading-relaxed max-w-[200px]">
          {title === 'Letterheads' && 'Professional business letterheads with company branding.'}
          {title === 'Business Cards' && 'High-quality business cards with premium paper stock.'}
          {title === 'Envelopes' && 'Custom printed envelopes matching your brand identity.'}
          {title === 'Compliment Slips' && 'Elegant compliment slips for professional communications.'}
          {title === 'Reports' && 'Professional reports with clean formatting and quality printing.'}
          {title === 'Presentations' && 'Stunning presentation materials with professional design.'}
          {title === 'Manuals' && 'Comprehensive user manuals with clear layouts and binding.'}
          {title === 'Booklets' && 'Informative booklets designed to engage readers effectively.'}
          {title === 'Invitations' && 'Beautiful invitations for weddings, parties, and special events.'}
          {title === 'Programs' && 'Elegant event programs with custom design and quality printing.'}
          {title === 'Place Cards' && 'Personalized place cards for seating arrangements and events.'}
          {title === 'Thank You Cards' && 'Custom thank you cards for expressing gratitude professionally.'}
          {title === 'Flyers' && 'Eye-catching flyers to promote your business and events effectively.'}
          {title === 'Posters' && 'Large format posters for advertising and promotional campaigns.'}
          {title === 'Banners' && 'Custom banners for trade shows, events, and outdoor advertising.'}
          {title === 'Brochures' && 'Professional brochures showcasing your products and services.'}
          {title === 'Menus' && 'Restaurant menus with elegant design and durable materials.'}
          {title === 'Placemats' && 'Custom placemats to enhance your restaurant dining experience.'}
          {title === 'Table Tents' && 'Table tent displays for promotions and special offers.'}
          {title === 'Wine Lists' && 'Sophisticated wine lists with premium design and materials.'}
          {title === 'Product Labels' && 'Custom product labels for branding and identification.'}
          {title === 'Packaging Boxes' && 'Branded packaging boxes for product presentation.'}
          {title === 'Stickers' && 'Custom stickers for promotions and product identification.'}
          {title === 'Tags' && 'Product tags and labels for retail and inventory management.'}
          {title === 'NCR Pads' && 'Carbonless forms for receipts, invoices, and duplicate records.'}
          {title === 'Letterheads Premium' && 'Luxury letterheads with premium paper and gold foil.'}
          {title === 'Business Cards Deluxe' && 'Premium business cards with special finishes and effects.'}
          {title === 'Envelopes Custom' && 'Custom printed envelopes with unique designs and colors.'}
          {title === 'Compliment Slips Gold' && 'Elegant compliment slips with gold accents and premium paper.'}
          {title === 'NCR Pads Executive' && 'Executive-grade carbonless forms for professional use.'}
          {title === 'Wedding Stationery' && 'Complete wedding stationery suite for your special day.'}
          {title === 'Birthday Invites' && 'Fun and creative birthday party invitations for all ages.'}
          {title === 'Anniversary Cards' && 'Elegant anniversary cards to celebrate special milestones.'}
          {title === 'Graduation Programs' && 'Professional graduation ceremony programs and booklets.'}
          {title === 'Memorial Cards' && 'Respectful memorial cards for honoring loved ones.'}
          {title === 'Celebration Banners' && 'Custom banners for parties, events, and celebrations.'}
          {title === 'Leaflets' && 'Informative leaflets for marketing and promotional campaigns.'}
          {title === 'A-Frames' && 'Portable A-frame signs for outdoor advertising and events.'}
          {title === 'Window Graphics' && 'Custom window graphics and decals for storefronts.'}
          {title === 'Vehicle Wraps' && 'Full vehicle wraps for mobile advertising and branding.'}
          {title === 'Trade Show Displays' && 'Professional trade show displays and exhibition materials.'}
          {title === 'Promotional Items' && 'Custom promotional items and branded merchandise.'}
          {title === 'Specials Boards' && 'Restaurant specials boards for daily menu highlights.'}
          {title === 'Takeaway Menus' && 'Durable takeaway menus for delivery and pickup orders.'}
          {title === 'Drink Menus' && 'Specialized drink menus for bars and beverage service.'}
          {title === 'Dessert Menus' && 'Elegant dessert menus to showcase sweet offerings.'}
          {title === 'Kids Menus' && 'Fun and colorful kids menus for family dining.'}
          {title === 'Catering Menus' && 'Professional catering menus for events and parties.'}
          {title === 'Catalogs' && 'Comprehensive product catalogs with detailed information.'}
          {title === 'Annual Reports' && 'Professional annual reports for corporate communications.'}
          {title === 'Training Materials' && 'Educational training materials and instructional guides.'}
          {title === 'Technical Docs' && 'Technical documentation and specification sheets.'}
          {title === 'Legal Documents' && 'Professional legal documents and contract materials.'}
          {title === 'Financial Reports' && 'Financial reports and accounting documentation.'}
          {title === 'Wraps' && 'Custom wrapping paper and packaging materials.'}
          {title === 'Custom Boxes' && 'Bespoke packaging boxes tailored to your products.'}
          {title === 'Shipping Labels' && 'Professional shipping labels and address tags.'}
          {title === 'Product Tags' && 'Custom product tags for retail and inventory.'}
          {title === 'Security Labels' && 'Security and tamper-evident labels for protection.'}
          {title === 'Promotional Stickers' && 'Custom promotional stickers for marketing campaigns.'}
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
          <img
            src={imageSrc}
            alt=""
            className="block w-[200px] h-[120px] md:w-[280px] md:h-[160px] object-cover rounded-md shadow-xl"
          />
        </div>
        
      </div>
    </div>
  );
}

function ServiceCard({ service, isExpanded, onToggle, showMockups, variant }: ServiceCardProps) {
  const [visibleMockups, setVisibleMockups] = useState<number[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showMockups && mockups[service.title as keyof typeof mockups]) {
      const mockupData = mockups[service.title as keyof typeof mockups];
      mockupData.forEach((_, index) => {
        setTimeout(() => {
          setVisibleMockups(prev => [...prev, index]);
        }, index * 200);
      });
    }
  }, [showMockups, service.title]);

  const getSizeClasses = () => {
    switch (service.size) {
      case 'large': return 'col-span-2 row-span-2';
      case 'medium': return 'col-span-1 row-span-2';
      case 'small': return 'col-span-1 row-span-1';
      default: return 'col-span-1 row-span-1';
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 1: return 'rounded-2xl shadow-lg';
      case 2: return 'rounded-none shadow-md';
      case 3: return 'rounded-3xl shadow-xl';
      case 4: return 'rounded-lg shadow-lg';
      case 5: return 'rounded-xl shadow-lg';
      case 6: return 'rounded-lg shadow-md bg-white border-4';
      default: return 'rounded-2xl shadow-lg';
    }
  };

  const getBorderColor = () => {
    if (variant !== 6) return '';
    switch (service.color) {
      case 'from-px-cyan to-px-magenta': return 'border-cyan-500';
      case 'from-px-magenta to-px-yellow': return 'border-pink-500';
      case 'from-px-yellow to-px-cyan': return 'border-yellow-500';
      case 'from-px-cyan to-px-yellow': return 'border-cyan-500';
      case 'from-px-magenta to-px-cyan': return 'border-pink-500';
      case 'from-px-yellow to-px-magenta': return 'border-yellow-500';
      default: return 'border-cyan-500';
    }
  };

  return (
    <Card 
      ref={cardRef}
      className={`relative overflow-hidden transition-all duration-500 ${getSizeClasses()} ${getVariantStyles()} ${getBorderColor()} group hover:scale-105 hover:shadow-2xl`}
    >
      {/* Градиентный фон или белый фон */}
      {variant === 6 ? (
        <div className="absolute inset-0 bg-white" />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-90`} />
      )}
      
      {/* Контент */}
      <CardContent className={`relative z-10 p-6 h-full flex flex-col ${
        variant === 6 ? 'text-px-fg' : ''
      }`}>
        <div className="flex-1">
          <h3 className={`text-2xl font-bold mb-2 ${
            variant === 6 ? 'text-px-fg' : 'text-white'
          }`}>{service.title}</h3>
          <p className={`mb-4 ${
            variant === 6 ? 'text-px-muted' : 'text-white/90'
          }`}>{service.description}</p>
          
          {/* Основные услуги */}
          <div className="space-y-2 mb-4">
            {service.items.slice(0, 4).map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  variant === 6 ? 'bg-px-cyan' : 'bg-white'
                }`} />
                <span className={`text-sm ${
                  variant === 6 ? 'text-px-muted' : 'text-white/90'
                }`}>{item}</span>
              </div>
            ))}
          </div>

          {/* Кнопка раскрытия */}
          {service.items.length > 4 && (
            <Button
              onClick={onToggle}
              variant="outline"
              size="sm"
              className={`font-medium transition-all duration-300 ${
                variant === 6 
                  ? 'bg-px-cyan/10 border-px-cyan text-px-cyan hover:bg-px-cyan hover:text-white' 
                  : 'bg-white/20 border-white/30 text-white hover:bg-white/30 hover:border-px-yellow'
              }`}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" />
                  +{service.items.length - 4} more services
                </>
              )}
            </Button>
          )}
        </div>

        {/* Дополнительные услуги при раскрытии */}
        {isExpanded && (
          <div className="mt-4 space-y-2 animate-fade-in">
            {service.items.slice(4).map((item, index) => (
              <div key={index} className="flex items-center space-x-2 opacity-0 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <div className={`w-2 h-2 rounded-full ${
                  variant === 6 ? 'bg-px-magenta' : 'bg-white/70'
                }`} />
                <span className={`text-sm ${
                  variant === 6 ? 'text-px-muted' : 'text-white/80'
                }`}>{item}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Мокапы справа */}
      {showMockups && mockups[service.title as keyof typeof mockups] && (
        <div className="absolute right-0 top-0 h-full w-1/2 pointer-events-none">
          {mockups[service.title as keyof typeof mockups].map((mockup, index) => (
            <div
              key={mockup.id}
              className={`absolute transition-all duration-700 ${
                visibleMockups.includes(index) ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
              }`}
              style={{
                top: `${20 + index * 25}%`,
                right: `${10 + index * 5}%`,
                transform: `rotate(${mockup.angle}deg) ${visibleMockups.includes(index) ? 'translateX(0)' : 'translateX(100%)'}`,
                zIndex: 10 - index
              }}
            >
              <div className={`w-32 h-20 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center ${
                variant === 6 
                  ? 'bg-gradient-to-br from-px-cyan/10 to-px-magenta/10 border-2 border-px-yellow' 
                  : 'bg-gradient-to-br from-px-cyan/20 to-px-magenta/20 border border-px-yellow/30'
              }`}>
                <span className="text-px-fg text-xs font-semibold text-center px-2">
                  {mockup.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function GridServiceCard({ service, isExpanded, onToggle, showMockups }: GridServiceCardProps) {
  return (
    <div className="w-full mb-8">
      {/* Заголовок блока */}
      <div className="text-center mb-6 animate-fade-in">
        <h3 className="text-3xl font-playfair font-bold text-px-fg mb-2">{service.title}</h3>
        <p className="text-lg text-px-muted">{service.description}</p>
      </div>

          {/* Первый ряд - 4 основных услуги */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {service.images.map((item, index) => (
              <div
                key={index}
                className="animate-fade-in"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'both'
                }}
              >
                <TiltCard
                  title={item.name}
                  imageSrc={item.image}
                  angle={0}
                  index={index}
                />
              </div>
            ))}
      </div>

      {/* Кнопка раскрытия */}
      {service.items.length > 4 && (
        <div className="text-center mb-6">
          <Button
            onClick={onToggle}
            variant="outline"
            className="bg-px-cyan/10 border-px-cyan text-px-cyan hover:bg-px-cyan hover:text-white transition-all duration-300 font-medium"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                +{service.items.length - 4} more services
              </>
            )}
          </Button>
        </div>
      )}

      {/* Второй ряд - раскрытые услуги */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {service.items.slice(4).map((item, index) => (
            <div 
              key={index}
              className="animate-fade-in"
              style={{ 
                animationDelay: `${index * 150}ms`,
                animationFillMode: 'both'
              }}
            >
              <TiltCard
                title={item}
                imageSrc="https://via.placeholder.com/320x240/f3f4f6/9ca3af?text=No+Image"
                angle={0}
                index={index + 4} // Продолжаем индексацию с 4
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TestServicesPage() {
  const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set());
  const [showMockups, setShowMockups] = useState(false);
  const [activeVariant, setActiveVariant] = useState(1);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      // Показываем мокапы когда пользователь прокрутил достаточно
      if (window.scrollY > 300) {
        setShowMockups(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleService = (serviceId: string) => {
    setExpandedServices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(serviceId)) {
        newSet.delete(serviceId);
      } else {
        newSet.add(serviceId);
      }
      return newSet;
    });
  };

  const variants = [
    { id: 1, name: 'Rounded Corners', description: 'Скругленные углы' },
    { id: 2, name: 'Sharp Edges', description: 'Острые углы' },
    { id: 3, name: 'Extra Rounded', description: 'Очень скругленные' },
    { id: 4, name: 'Medium Rounded', description: 'Средние скругления' },
    { id: 5, name: 'Modern Rounded', description: 'Современные скругления' },
    { id: 6, name: 'White Blocks', description: 'Белые блоки с рамками' },
    { id: 7, name: 'Grid Layout', description: 'Сетка с фото как на скриншотах' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-px-bg via-zinc-50 to-px-bg">
      {/* Заголовок */}
      <div className="text-center py-16">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-px-cyan via-px-magenta to-px-yellow bg-clip-text text-transparent mb-4">
          Our Services
        </h1>
        <p className="text-xl text-px-muted mb-8">
          Интерактивная мозаика с раскрывающимися услугами и динамическими мокапами
        </p>
        
        {/* Выбор варианта */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {variants.map(variant => (
            <Button
              key={variant.id}
              onClick={() => setActiveVariant(variant.id)}
              variant={activeVariant === variant.id ? 'default' : 'outline'}
              className={`mx-1 ${
                activeVariant === variant.id 
                  ? 'bg-gradient-to-r from-px-cyan to-px-magenta text-white border-0' 
                  : 'border-px-cyan text-px-cyan hover:bg-px-cyan hover:text-white'
              }`}
            >
              {variant.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Основной блок услуг */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-px-fg mb-4">Our Services</h2>
          <p className="text-lg text-px-muted">
            Прокрутите вниз чтобы увидеть мокапы, нажмите на "+X more services" чтобы раскрыть
          </p>
        </div>

        {/* Мозаика услуг или Grid Layout */}
        {activeVariant === 7 ? (
          <div className="space-y-12 mb-20 bg-gradient-to-br from-px-bg via-zinc-50 to-px-bg p-8 rounded-2xl">
            {services.map(service => (
              <GridServiceCard
                key={service.id}
                service={service}
                isExpanded={expandedServices.has(service.id)}
                onToggle={() => toggleService(service.id)}
                showMockups={showMockups}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 grid-rows-4 gap-4 h-[800px] mb-20">
            {services.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                isExpanded={expandedServices.has(service.id)}
                onToggle={() => toggleService(service.id)}
                showMockups={showMockups}
                variant={activeVariant}
              />
            ))}
          </div>
        )}

        {/* Статистика */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="bg-gradient-to-br from-px-cyan/10 to-px-cyan/5 p-4 rounded-lg">
                <div className="text-3xl font-bold text-px-cyan">{services.length}</div>
                <div className="text-sm text-px-muted">Всего категорий</div>
              </div>
              <div className="bg-gradient-to-br from-px-magenta/10 to-px-magenta/5 p-4 rounded-lg">
                <div className="text-3xl font-bold text-px-magenta">{expandedServices.size}</div>
                <div className="text-sm text-px-muted">Раскрытых</div>
              </div>
              <div className="bg-gradient-to-br from-px-yellow/10 to-px-yellow/5 p-4 rounded-lg">
                <div className="text-3xl font-bold text-px-yellow">{showMockups ? 'Да' : 'Нет'}</div>
                <div className="text-sm text-px-muted">Мокапы видны</div>
              </div>
              <div className="bg-gradient-to-br from-px-cyan/10 to-px-magenta/5 p-4 rounded-lg">
                <div className="text-3xl font-bold bg-gradient-to-r from-px-cyan to-px-magenta bg-clip-text text-transparent">Вариант {activeVariant}</div>
                <div className="text-sm text-px-muted">Активный стиль</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Инструкции */}
        <Card className="bg-gradient-to-br from-px-cyan/5 to-px-magenta/5 border-px-cyan/20">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold bg-gradient-to-r from-px-cyan to-px-magenta bg-clip-text text-transparent mb-4">Как тестировать:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/50 p-4 rounded-lg">
                <h4 className="font-semibold text-px-fg mb-2 flex items-center">
                  <span className="w-6 h-6 bg-px-cyan text-white rounded-full flex items-center justify-center text-sm font-bold mr-2">1</span>
                  Прокрутка
                </h4>
                <p className="text-px-muted text-sm">Прокрутите вниз чтобы увидеть как мокапы выезжают справа</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg">
                <h4 className="font-semibold text-px-fg mb-2 flex items-center">
                  <span className="w-6 h-6 bg-px-magenta text-white rounded-full flex items-center justify-center text-sm font-bold mr-2">2</span>
                  Раскрытие услуг
                </h4>
                <p className="text-px-muted text-sm">Нажмите "+X more services" чтобы увидеть как блоки раздвигаются</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg">
                <h4 className="font-semibold text-px-fg mb-2 flex items-center">
                  <span className="w-6 h-6 bg-px-yellow text-px-fg rounded-full flex items-center justify-center text-sm font-bold mr-2">3</span>
                  Стили
                </h4>
                <p className="text-px-muted text-sm">Переключайте варианты чтобы увидеть разные стили углов</p>
              </div>
              <div className="bg-white/50 p-4 rounded-lg">
                <h4 className="font-semibold text-px-fg mb-2 flex items-center">
                  <span className="w-6 h-6 bg-gradient-to-r from-px-cyan to-px-magenta text-white rounded-full flex items-center justify-center text-sm font-bold mr-2">4</span>
                  Анимации
                </h4>
                <p className="text-px-muted text-sm">Все элементы анимированы и плавно переходят</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

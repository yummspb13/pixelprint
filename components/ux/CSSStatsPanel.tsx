'use client';

import { useEffect, useState } from 'react';
import { logger } from '@/lib/logger';

interface CSSStats {
  totalElements: number;
  totalClasses: number;
  tailwindClasses: number;
  customClasses: number;
  cssVariables: number;
  animations: number;
  mediaQueries: number;
  stylesheets: number;
  inlineStyles: number;
}

export default function CSSStatsPanel() {
  const [stats, setStats] = useState<CSSStats>({
    totalElements: 0,
    totalClasses: 0,
    tailwindClasses: 0,
    customClasses: 0,
    cssVariables: 0,
    animations: 0,
    mediaQueries: 0,
    stylesheets: 0,
    inlineStyles: 0
  });

  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const calculateStats = () => {
      try {
        // Общее количество элементов
        const totalElements = document.querySelectorAll('*').length;
        
        // Классы
        const allClasses = Array.from(document.querySelectorAll('[class]'))
          .flatMap(el => Array.from(el.classList));
        
        const tailwindClasses = allClasses.filter(cls => 
          /^(w-|h-|p-|m-|text-|bg-|border-|rounded-|flex|grid|hidden|block|inline)/.test(cls) ||
          /^(sm:|md:|lg:|xl:|2xl:)/.test(cls) ||
          /^(hover:|focus:|active:|disabled:)/.test(cls) ||
          /^(animate-|transition-|duration-|ease-)/.test(cls)
        );
        
        const customClasses = allClasses.filter(cls => 
          !/^(w-|h-|p-|m-|text-|bg-|border-|rounded-|flex|grid|hidden|block|inline)/.test(cls) &&
          !/^(sm:|md:|lg:|xl:|2xl:)/.test(cls) &&
          !/^(hover:|focus:|active:|disabled:)/.test(cls) &&
          !/^(animate-|transition-|duration-|ease-)/.test(cls) &&
          !/^(radix-|shadcn-|cmdk-|react-)/.test(cls)
        );
        
        // CSS переменные
        const root = document.documentElement;
        const computedStyle = getComputedStyle(root);
        const cssVariables = Array.from(computedStyle)
          .filter(prop => prop.startsWith('--')).length;
        
        // Анимации
        const animations = Array.from(document.querySelectorAll('*'))
          .filter(element => {
            const computedStyle = getComputedStyle(element);
            return computedStyle.animationName !== 'none';
          }).length;
        
        // Media queries
        let mediaQueries = 0;
        try {
          Array.from(document.styleSheets).forEach(styleSheet => {
            try {
              if (styleSheet.cssRules) {
                Array.from(styleSheet.cssRules).forEach(rule => {
                  if (rule.type === CSSRule.MEDIA_RULE) {
                    mediaQueries++;
                  }
                });
              }
            } catch (e) {
              // Игнорируем CORS ошибки
            }
          });
        } catch (e) {
          // Игнорируем ошибки
        }
        
        // Stylesheets
        const stylesheets = document.styleSheets.length;
        
        // Inline styles
        const inlineStyles = document.querySelectorAll('[style]').length;
        
        const newStats: CSSStats = {
          totalElements,
          totalClasses: allClasses.length,
          tailwindClasses: tailwindClasses.length,
          customClasses: customClasses.length,
          cssVariables,
          animations,
          mediaQueries,
          stylesheets,
          inlineStyles
        };
        
        setStats(newStats);
        
        // Логируем статистику
        logger.debug('CSS Stats Updated:', newStats);
        
      } catch (error) {
        logger.warn('Error calculating CSS stats:', error);
      }
    };

    // Вычисляем статистику сразу
    calculateStats();
    
    // Обновляем каждые 2 секунды
    const interval = setInterval(calculateStats, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // В production режиме не рендерим ничего
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-gray-900/90 text-white p-3 rounded-lg text-xs z-50 max-w-sm">
      <div 
        className="flex items-center justify-between cursor-pointer mb-2"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="font-bold">📊 CSS Stats</div>
        <div className="text-gray-400">
          {isExpanded ? '▼' : '▶'}
        </div>
      </div>
      
      {isExpanded && (
        <div className="space-y-1 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>Elements: {stats.totalElements}</div>
            <div>Classes: {stats.totalClasses}</div>
            <div>Tailwind: {stats.tailwindClasses}</div>
            <div>Custom: {stats.customClasses}</div>
            <div>Variables: {stats.cssVariables}</div>
            <div>Animations: {stats.animations}</div>
            <div>Media Queries: {stats.mediaQueries}</div>
            <div>Stylesheets: {stats.stylesheets}</div>
            <div>Inline: {stats.inlineStyles}</div>
          </div>
          
          <div className="mt-2 pt-2 border-t border-gray-700">
            <div className="text-gray-400 text-xs">
              Tailwind Usage: {((stats.tailwindClasses / stats.totalClasses) * 100).toFixed(1)}%
            </div>
            <div className="text-gray-400 text-xs">
              Custom Usage: {((stats.customClasses / stats.totalClasses) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

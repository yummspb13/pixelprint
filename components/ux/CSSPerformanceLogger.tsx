'use client';

import { useEffect, useState } from 'react';
import { logger } from '@/lib/logger';

interface CSSPerformanceMetrics {
  loadTime: number;
  parseTime: number;
  totalRules: number;
  criticalPath: number;
  unusedRules: number;
  fontLoadTime: number;
  imageLoadTime: number;
  renderTime: number;
}

export default function CSSPerformanceLogger() {
  const [metrics, setMetrics] = useState<CSSPerformanceMetrics>({
    loadTime: 0,
    parseTime: 0,
    totalRules: 0,
    criticalPath: 0,
    unusedRules: 0,
    fontLoadTime: 0,
    imageLoadTime: 0,
    renderTime: 0
  });

  useEffect(() => {
    const startTime = performance.now();
    
    // Логируем начало анализа производительности CSS
    logger.info("=== CSS PERFORMANCE ANALYSIS STARTED ===");

    // Анализируем загрузку шрифтов
    const analyzeFontLoading = async (): Promise<number> => {
      const fontStartTime = performance.now();
      
      try {
        // Проверяем загрузку Google Fonts
        const googleFonts = document.querySelector('link[href*="fonts.googleapis.com"]');
        if (googleFonts) {
          await new Promise((resolve) => {
            googleFonts.addEventListener('load', resolve);
            googleFonts.addEventListener('error', resolve);
            // Таймаут на случай, если событие не сработает
            setTimeout(resolve, 3000);
          });
        }
        
        // Проверяем загрузку локальных шрифтов
        const localFonts = document.querySelectorAll('link[href*="fonts"]');
        if (localFonts.length > 0) {
          await Promise.all(Array.from(localFonts).map(font => 
            new Promise((resolve) => {
              font.addEventListener('load', resolve);
              font.addEventListener('error', resolve);
              setTimeout(resolve, 2000);
            })
          ));
        }
        
        return performance.now() - fontStartTime;
      } catch (error) {
        logger.warn("Error analyzing font loading:", error);
        return 0;
      }
    };

    // Анализируем загрузку изображений
    const analyzeImageLoading = async (): Promise<number> => {
      const imageStartTime = performance.now();
      
      try {
        const images = document.querySelectorAll('img');
        if (images.length > 0) {
          await Promise.all(Array.from(images).map(img => 
            new Promise((resolve) => {
              if (img.complete) {
                resolve(true);
              } else {
                img.addEventListener('load', () => resolve(true));
                img.addEventListener('error', () => resolve(true));
                setTimeout(() => resolve(true), 5000);
              }
            })
          ));
        }
        
        return performance.now() - imageStartTime;
      } catch (error) {
        logger.warn("Error analyzing image loading:", error);
        return 0;
      }
    };

    // Анализируем CSS правила
    const analyzeCSSRules = (): { totalRules: number; unusedRules: number } => {
      let totalRules = 0;
      let unusedRules = 0;
      
      try {
        Array.from(document.styleSheets).forEach(styleSheet => {
          try {
            if (styleSheet.cssRules) {
              totalRules += styleSheet.cssRules.length;
              
              // Простая проверка на неиспользуемые правила
              // (это упрощенная версия, в реальности нужен более сложный анализ)
              Array.from(styleSheet.cssRules).forEach(rule => {
                if (rule.type === CSSRule.STYLE_RULE) {
                  const styleRule = rule as CSSStyleRule;
                  const selector = styleRule.selectorText;
                  
                  // Проверяем, есть ли элементы с таким селектором
                  try {
                    const elements = document.querySelectorAll(selector);
                    if (elements.length === 0) {
                      unusedRules++;
                    }
                  } catch (e) {
                    // Игнорируем сложные селекторы
                  }
                }
              });
            }
          } catch (e) {
            // Игнорируем CORS ошибки
          }
        });
      } catch (error) {
        logger.warn("Error analyzing CSS rules:", error);
      }
      
      return { totalRules, unusedRules };
    };

    // Анализируем критический путь рендеринга
    const analyzeCriticalPath = (): number => {
      const criticalPathStart = performance.now();
      
      // Проверяем основные CSS файлы
      const criticalCSS = [
        'globals.css',
        'tailwind.css',
        'components.css'
      ];
      
      let criticalPathTime = 0;
      
      criticalCSS.forEach(cssFile => {
        const link = document.querySelector(`link[href*="${cssFile}"]`);
        if (link) {
          const loadStart = performance.now();
          // Простая проверка - если элемент загружен
          if (link.getAttribute('rel') === 'stylesheet') {
            criticalPathTime += performance.now() - loadStart;
          }
        }
      });
      
      return criticalPathTime;
    };

    // Запускаем анализ
    const runPerformanceAnalysis = async () => {
      try {
        const fontLoadTime = await analyzeFontLoading();
        const imageLoadTime = await analyzeImageLoading();
        const { totalRules, unusedRules } = analyzeCSSRules();
        const criticalPath = analyzeCriticalPath();
        const renderTime = performance.now() - startTime;
        
        const performanceMetrics: CSSPerformanceMetrics = {
          loadTime: performance.now() - startTime,
          parseTime: performance.now() - startTime,
          totalRules,
          criticalPath,
          unusedRules,
          fontLoadTime,
          imageLoadTime,
          renderTime
        };
        
        setMetrics(performanceMetrics);
        
        // Логируем результаты
        logger.info("CSS Performance Metrics:", performanceMetrics);
        
        // Дополнительные метрики
        logger.info("CSS Performance Details:", {
          stylesheets: document.styleSheets.length,
          totalElements: document.querySelectorAll('*').length,
          totalClasses: document.querySelectorAll('[class]').length,
          totalIds: document.querySelectorAll('[id]').length,
          inlineStyles: document.querySelectorAll('[style]').length
        });
        
        // Анализ Tailwind CSS
        const tailwindClasses = Array.from(document.querySelectorAll('[class]'))
          .flatMap(el => Array.from(el.classList))
          .filter(cls => 
            /^(w-|h-|p-|m-|text-|bg-|border-|rounded-|flex|grid|hidden|block|inline)/.test(cls) ||
            /^(sm:|md:|lg:|xl:|2xl:)/.test(cls) ||
            /^(hover:|focus:|active:|disabled:)/.test(cls)
          );
        
        logger.info("Tailwind CSS Analysis:", {
          totalTailwindClasses: tailwindClasses.length,
          uniqueTailwindClasses: [...new Set(tailwindClasses)].length,
          mostUsedClasses: tailwindClasses
            .reduce((acc, cls) => {
              acc[cls] = (acc[cls] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
        });
        
      } catch (error) {
        logger.error("Error during CSS performance analysis:", error);
      }
    };

    // Запускаем анализ с задержкой для полной загрузки
    const timeoutId = setTimeout(runPerformanceAnalysis, 500);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // В development режиме показываем метрики в консоли
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && metrics.loadTime > 0) {
      console.group('⚡ CSS Performance Metrics');
      console.log('Load Time:', `${metrics.loadTime.toFixed(2)}ms`);
      console.log('Font Load Time:', `${metrics.fontLoadTime.toFixed(2)}ms`);
      console.log('Image Load Time:', `${metrics.imageLoadTime.toFixed(2)}ms`);
      console.log('Total CSS Rules:', metrics.totalRules);
      console.log('Unused Rules:', metrics.unusedRules);
      console.log('Critical Path:', `${metrics.criticalPath.toFixed(2)}ms`);
      console.log('Render Time:', `${metrics.renderTime.toFixed(2)}ms`);
      console.groupEnd();
    }
  }, [metrics]);

  // В production режиме не рендерим ничего видимого
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-blue-900/80 text-white p-3 rounded-lg text-xs max-w-xs z-50">
      <div className="font-bold mb-2">⚡ CSS Performance</div>
      <div className="space-y-1">
        <div>Load: {metrics.loadTime.toFixed(0)}ms</div>
        <div>Fonts: {metrics.fontLoadTime.toFixed(0)}ms</div>
        <div>Images: {metrics.imageLoadTime.toFixed(0)}ms</div>
        <div>Rules: {metrics.totalRules}</div>
        <div>Unused: {metrics.unusedRules}</div>
        <div>Critical: {metrics.criticalPath.toFixed(0)}ms</div>
      </div>
    </div>
  );
}

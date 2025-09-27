import { useEffect, useCallback, useRef } from 'react';
import { logger } from '@/lib/logger';

interface CSSLoggingOptions {
  logVariables?: boolean;
  logClasses?: boolean;
  logAnimations?: boolean;
  logMediaQueries?: boolean;
  logPerformance?: boolean;
  logTailwind?: boolean;
  interval?: number;
}

export function useCSSLogger(options: CSSLoggingOptions = {}) {
  const {
    logVariables = true,
    logClasses = true,
    logAnimations = true,
    logMediaQueries: shouldLogMediaQueries = true,
    logPerformance = true,
    logTailwind = true,
    interval = 1000
  } = options;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isEnabled = process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true';

  const logCSSVariables = useCallback(() => {
    if (!logVariables || !isEnabled) return;

    try {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      const variables = Array.from(computedStyle)
        .filter(prop => prop.startsWith('--'))
        .map(varName => ({
          name: varName,
          value: computedStyle.getPropertyValue(varName).trim()
        }));

      logger.debug('CSS Variables:', {
        count: variables.length,
        variables: variables.slice(0, 10) // Показываем первые 10
      });
    } catch (error) {
      logger.warn('Error logging CSS variables:', error);
    }
  }, [logVariables, isEnabled]);

  const logCSSClasses = useCallback(() => {
    if (!logClasses || !isEnabled) return;

    try {
      const allElements = document.querySelectorAll('*');
      const classMap = new Map<string, number>();
      
      allElements.forEach(element => {
        if (element.className && typeof element.className === 'string') {
          element.className.split(' ').forEach(className => {
            if (className.trim()) {
              classMap.set(className, (classMap.get(className) || 0) + 1);
            }
          });
        }
      });

      const sortedClasses = Array.from(classMap.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20); // Топ 20 классов

      logger.debug('CSS Classes Usage:', {
        totalUniqueClasses: classMap.size,
        topClasses: sortedClasses
      });
    } catch (error) {
      logger.warn('Error logging CSS classes:', error);
    }
  }, [logClasses, isEnabled]);

  const logCSSAnimations = useCallback(() => {
    if (!logAnimations || !isEnabled) return;

    try {
      const animatedElements = Array.from(document.querySelectorAll('*'))
        .filter(element => {
          const computedStyle = getComputedStyle(element);
          return computedStyle.animationName !== 'none';
        })
        .map(element => ({
          tag: element.tagName.toLowerCase(),
          animation: getComputedStyle(element).animationName,
          duration: getComputedStyle(element).animationDuration
        }));

      logger.debug('CSS Animations:', {
        count: animatedElements.length,
        animations: animatedElements
      });
    } catch (error) {
      logger.warn('Error logging CSS animations:', error);
    }
  }, [logAnimations, isEnabled]);

  const logMediaQueries = useCallback(() => {
    if (!shouldLogMediaQueries || !isEnabled) return;

    try {
      const mediaQueries: Array<{ query: string; matches: boolean }> = [];
      
      Array.from(document.styleSheets).forEach(styleSheet => {
        try {
          if (styleSheet.cssRules) {
            Array.from(styleSheet.cssRules).forEach(rule => {
              if (rule.type === CSSRule.MEDIA_RULE) {
                const mediaRule = rule as CSSMediaRule;
                mediaQueries.push({
                  query: mediaRule.media.mediaText,
                  matches: window.matchMedia(mediaRule.media.mediaText).matches
                });
              }
            });
          }
        } catch (e) {
          // Игнорируем CORS ошибки
        }
      });

      logger.debug('Media Queries:', {
        count: mediaQueries.length,
        queries: mediaQueries
      });
    } catch (error) {
      logger.warn('Error logging media queries:', error);
    }
  }, [shouldLogMediaQueries, isEnabled]);

  const logCSSPerformance = useCallback(() => {
    if (!logPerformance || !isEnabled) return;

    try {
      const performanceMetrics = {
        stylesheets: document.styleSheets.length,
        totalElements: document.querySelectorAll('*').length,
        elementsWithClasses: document.querySelectorAll('[class]').length,
        elementsWithIds: document.querySelectorAll('[id]').length,
        elementsWithInlineStyles: document.querySelectorAll('[style]').length,
        totalClasses: Array.from(document.querySelectorAll('[class]'))
          .reduce((acc, el) => acc + el.classList.length, 0)
      };

      logger.debug('CSS Performance Metrics:', performanceMetrics);
    } catch (error) {
      logger.warn('Error logging CSS performance:', error);
    }
  }, [logPerformance, isEnabled]);

  const logTailwindAnalysis = useCallback(() => {
    if (!logTailwind || !isEnabled) return;

    try {
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

      logger.debug('Tailwind CSS Analysis:', {
        totalClasses: allClasses.length,
        tailwindClasses: tailwindClasses.length,
        customClasses: customClasses.length,
        uniqueTailwindClasses: [...new Set(tailwindClasses)].length,
        uniqueCustomClasses: [...new Set(customClasses)].length
      });
    } catch (error) {
      logger.warn('Error logging Tailwind analysis:', error);
    }
  }, [logTailwind, isEnabled]);

  const runAllLogging = useCallback(() => {
    logCSSVariables();
    logCSSClasses();
    logCSSAnimations();
    logMediaQueries();
    logCSSPerformance();
    logTailwindAnalysis();
  }, [
    logCSSVariables,
    logCSSClasses,
    logCSSAnimations,
    logMediaQueries,
    logCSSPerformance,
    logTailwindAnalysis
  ]);

  useEffect(() => {
    if (!isEnabled) return;

    // Запускаем логирование сразу
    runAllLogging();

    // Настраиваем периодическое логирование
    if (interval > 0) {
      intervalRef.current = setInterval(runAllLogging, interval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isEnabled, interval, runAllLogging]);

  return {
    logCSSVariables,
    logCSSClasses,
    logCSSAnimations,
    logMediaQueries,
    logCSSPerformance,
    logTailwindAnalysis,
    runAllLogging
  };
}

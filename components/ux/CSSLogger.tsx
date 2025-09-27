'use client';

import { useEffect, useState } from 'react';
import { logger } from '@/lib/logger';
import { useCSSLogger } from '@/hooks/useCSSLogger';

interface CSSStyleInfo {
  selector: string;
  properties: string[];
  specificity: number;
  source: string;
  isCustomProperty: boolean;
}

interface CSSVariableInfo {
  name: string;
  value: string;
  element: string;
}

export default function CSSLogger() {
  const [cssInfo, setCssInfo] = useState<{
    styles: CSSStyleInfo[];
    variables: CSSVariableInfo[];
    performance: {
      loadTime: number;
      parseTime: number;
      totalRules: number;
    };
  }>({
    styles: [],
    variables: [],
    performance: {
      loadTime: 0,
      parseTime: 0,
      totalRules: 0
    }
  });

  // Используем хук для логирования
  const { runAllLogging } = useCSSLogger({
    logVariables: true,
    logClasses: true,
    logAnimations: true,
    logMediaQueries: true,
    logPerformance: true,
    logTailwind: true,
    interval: 5000 // Логируем каждые 5 секунд
  });

  useEffect(() => {
    const startTime = performance.now();
    
    // Логируем начало анализа CSS
    logger.info("=== CSS LOGGING STARTED ===");
    
    // Собираем информацию о CSS переменных
    const collectCSSVariables = (): CSSVariableInfo[] => {
      const variables: CSSVariableInfo[] = [];
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      
      // Получаем все CSS переменные из :root
      const cssVariables = Array.from(computedStyle).filter(prop => 
        prop.startsWith('--')
      );
      
      cssVariables.forEach(varName => {
        const value = computedStyle.getPropertyValue(varName);
        variables.push({
          name: varName,
          value: value.trim(),
          element: ':root'
        });
      });
      
      return variables;
    };

    // Собираем информацию о применённых стилях
    const collectAppliedStyles = (): CSSStyleInfo[] => {
      const styles: CSSStyleInfo[] = [];
      const allElements = document.querySelectorAll('*');
      
      allElements.forEach((element, index) => {
        if (index > 100) return; // Ограничиваем для производительности
        
        const computedStyle = getComputedStyle(element);
        const elementTag = element.tagName.toLowerCase();
        const elementClasses = element.className && typeof element.className === 'string' ? `.${element.className.split(' ').join('.')}` : '';
        const elementId = element.id ? `#${element.id}` : '';
        
        const selector = `${elementTag}${elementId}${elementClasses}`;
        
        // Собираем важные CSS свойства
        const importantProperties = [
          'color', 'background-color', 'font-size', 'font-family', 'font-weight',
          'margin', 'padding', 'border', 'border-radius', 'width', 'height',
          'display', 'position', 'top', 'left', 'right', 'bottom',
          'z-index', 'opacity', 'transform', 'transition', 'animation'
        ];
        
        const properties = importantProperties
          .map(prop => {
            const value = computedStyle.getPropertyValue(prop);
            return value ? `${prop}: ${value}` : null;
          })
          .filter(Boolean) as string[];
        
        if (properties.length > 0) {
          styles.push({
            selector,
            properties,
            specificity: calculateSpecificity(selector),
            source: 'computed',
            isCustomProperty: false
          });
        }
      });
      
      return styles;
    };

    // Вычисляем специфичность селектора
    const calculateSpecificity = (selector: string): number => {
      const idMatches = (selector.match(/#/g) || []).length;
      const classMatches = (selector.match(/\./g) || []).length;
      const elementMatches = selector.match(/[a-zA-Z]/g)?.length || 0;
      
      return idMatches * 100 + classMatches * 10 + elementMatches;
    };

    // Анализируем производительность CSS
    const analyzeCSSPerformance = () => {
      const loadTime = performance.now() - startTime;
      
      // Подсчитываем общее количество CSS правил
      const totalRules = document.styleSheets.length;
      
      return {
        loadTime,
        parseTime: performance.now() - startTime,
        totalRules
      };
    };

    // Запускаем анализ после загрузки DOM
    const runAnalysis = () => {
      try {
        const variables = collectCSSVariables();
        const styles = collectAppliedStyles();
        const performance = analyzeCSSPerformance();
        
        setCssInfo({
          styles: styles.slice(0, 50), // Ограничиваем вывод
          variables,
          performance
        });
        
        // Логируем результаты
        logger.info("CSS Variables found:", {
          count: variables.length,
          variables: variables.map(v => ({ name: v.name, value: v.value }))
        });
        
        logger.info("Applied styles analyzed:", {
          count: styles.length,
          performance: performance
        });
        
        logger.info("CSS Performance metrics:", performance);
        
        // Логируем Tailwind классы
        const tailwindClasses = styles
          .filter(style => style.selector.includes('class'))
          .map(style => style.selector)
          .slice(0, 20);
        
        if (tailwindClasses.length > 0) {
          logger.info("Tailwind classes detected:", tailwindClasses);
        }
        
      } catch (error) {
        logger.error("Error during CSS analysis:", error);
      }
    };

    // Запускаем анализ с небольшой задержкой для полной загрузки стилей
    const timeoutId = setTimeout(runAnalysis, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // В development режиме показываем информацию в консоли
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && cssInfo.styles.length > 0) {
      console.group('🎨 CSS Logger - Detailed Analysis');
      console.log('CSS Variables:', cssInfo.variables);
      console.log('Applied Styles:', cssInfo.styles);
      console.log('Performance:', cssInfo.performance);
      console.groupEnd();
    }
  }, [cssInfo]);

  // В production режиме не рендерим ничего видимого
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <div className="font-bold mb-2">🎨 CSS Logger</div>
      <div className="space-y-1">
        <div>Variables: {cssInfo.variables.length}</div>
        <div>Styles: {cssInfo.styles.length}</div>
        <div>Load time: {cssInfo.performance.loadTime.toFixed(2)}ms</div>
        <div>Rules: {cssInfo.performance.totalRules}</div>
      </div>
    </div>
  );
}

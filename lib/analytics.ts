import { NextWebVitalsMetric } from 'next/app';

// Интерфейс для метрик производительности
interface PerformanceMetrics {
  name: string;
  value: number;
  delta: number;
  id: string;
  navigationType: string;
  timestamp: number;
}

// Функция для отслеживания Web Vitals
export function reportWebVitals(metric: NextWebVitalsMetric) {
  // Логируем метрики в консоль для разработки
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vital:', metric);
  }

  // Отправляем метрики в аналитику (Google Analytics, Vercel Analytics, etc.)
  if (typeof window !== 'undefined') {
    // Google Analytics 4
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        non_interaction: true,
      });
    }

    // Vercel Analytics
    if (typeof window.va !== 'undefined') {
      window.va('track', metric.name, {
        value: metric.value,
        delta: (metric as any).delta,
        id: metric.id,
        navigationType: (metric as any).navigationType,
      });
    }

    // Custom analytics endpoint
    if (process.env.NEXT_PUBLIC_ANALYTICS_URL) {
      fetch(process.env.NEXT_PUBLIC_ANALYTICS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metric: metric.name,
          value: metric.value,
          delta: (metric as any).delta,
          id: metric.id,
          navigationType: (metric as any).navigationType,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      }).catch(console.error);
    }
  }
}

// Функция для отслеживания ошибок
export function trackError(error: Error, context: string, additionalData?: Record<string, any>) {
  const errorData = {
    message: error.message,
    stack: error.stack,
    context,
    url: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
    timestamp: Date.now(),
    ...additionalData,
  };

  // Логируем ошибку в консоль для разработки
  if (process.env.NODE_ENV === 'development') {
    console.error(`Error in ${context}:`, errorData);
  }

  // Отправляем ошибку в аналитику
  if (typeof window !== 'undefined') {
    // Google Analytics 4
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        custom_map: {
          context: context,
          stack: error.stack,
        },
      });
    }

    // Custom error tracking endpoint
    if (process.env.NEXT_PUBLIC_ERROR_TRACKING_URL) {
      fetch(process.env.NEXT_PUBLIC_ERROR_TRACKING_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorData),
      }).catch(console.error);
    }
  }
}

// Функция для отслеживания пользовательских событий
export function trackEvent(eventName: string, parameters?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  const eventData = {
    event: eventName,
    parameters: {
      url: window.location.href,
      timestamp: Date.now(),
      ...parameters,
    },
  };

  // Google Analytics 4
  if (typeof (window as any).gtag !== 'undefined') {
    (window as any).gtag('event', eventName, parameters);
  }

  // Vercel Analytics
  if (typeof window.va !== 'undefined') {
    window.va('track', eventName, parameters);
  }

  // Custom analytics
  if (process.env.NEXT_PUBLIC_ANALYTICS_URL) {
    fetch(process.env.NEXT_PUBLIC_ANALYTICS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    }).catch(console.error);
  }
}

// Функция для измерения времени загрузки страницы
export function measurePageLoad() {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    const metrics = {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      totalLoadTime: navigation.loadEventEnd - navigation.fetchStart,
      firstPaint: 0,
      firstContentfulPaint: 0,
    };

    // Получаем First Paint и First Contentful Paint
    const paintEntries = performance.getEntriesByType('paint');
    paintEntries.forEach((entry) => {
      if (entry.name === 'first-paint') {
        metrics.firstPaint = entry.startTime;
      } else if (entry.name === 'first-contentful-paint') {
        metrics.firstContentfulPaint = entry.startTime;
      }
    });

    // Отправляем метрики
    trackEvent('page_load_metrics', metrics);
  });
}

// Расширяем глобальный объект Window для TypeScript
declare global {
  interface Window {
    va: (action: string, eventName: string, parameters?: any) => void;
  }
}

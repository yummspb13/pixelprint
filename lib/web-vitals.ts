// Правильная реализация Web Vitals для Next.js 15
import { NextWebVitalsMetric } from 'next/app';

// Функция для отслеживания Web Vitals
export function reportWebVitals(metric: NextWebVitalsMetric) {
  // Логируем метрики в консоль для разработки
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vital:', metric);
  }

  // Отправляем метрики в аналитику
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

// Расширяем глобальный объект Window для TypeScript
declare global {
  interface Window {
    va: (action: string, eventName: string, parameters?: any) => void;
  }
}

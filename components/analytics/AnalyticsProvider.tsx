'use client';

import { useEffect } from 'react';
import { reportWebVitals, measurePageLoad, trackEvent } from '@/lib/analytics';

export default function AnalyticsProvider() {
  useEffect(() => {
    // Измеряем время загрузки страницы
    measurePageLoad();

    // Отслеживаем клики по кнопкам
    const handleButtonClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const button = target.closest('button, a[role="button"]');
      
      if (button) {
        const buttonText = button.textContent?.trim() || 'Unknown Button';
        const buttonClass = button.className || '';
        
        trackEvent('button_click', {
          buttonText,
          buttonClass,
          page: window.location.pathname,
        });
      }
    };

    // Отслеживаем клики по ссылкам
    const handleLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href]');
      
      if (link) {
        const href = (link as HTMLAnchorElement).href;
        const linkText = link.textContent?.trim() || 'Unknown Link';
        
        trackEvent('link_click', {
          href,
          linkText,
          page: window.location.pathname,
        });
      }
    };

    // Отслеживаем отправку форм
    const handleFormSubmit = (event: SubmitEvent) => {
      const form = event.target as HTMLFormElement;
      const formId = form.id || form.className || 'Unknown Form';
      
      trackEvent('form_submit', {
        formId,
        page: window.location.pathname,
      });
    };

    // Добавляем обработчики событий
    document.addEventListener('click', handleButtonClick);
    document.addEventListener('click', handleLinkClick);
    document.addEventListener('submit', handleFormSubmit);

    // Отслеживаем видимость страницы
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        trackEvent('page_visible', {
          page: window.location.pathname,
        });
      } else {
        trackEvent('page_hidden', {
          page: window.location.pathname,
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Отслеживаем время на странице
    const startTime = Date.now();
    
    const handleBeforeUnload = () => {
      const timeOnPage = Date.now() - startTime;
      trackEvent('page_time', {
        timeOnPage,
        page: window.location.pathname,
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      document.removeEventListener('click', handleButtonClick);
      document.removeEventListener('click', handleLinkClick);
      document.removeEventListener('submit', handleFormSubmit);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return null;
}

// Компонент для отслеживания Web Vitals
export function WebVitalsTracker() {
  useEffect(() => {
    // Простое отслеживание производительности без Web Vitals
    if (typeof window !== 'undefined') {
      // Отслеживаем время загрузки страницы
      const startTime = performance.now();
      
      const handleLoad = () => {
        const loadTime = performance.now() - startTime;
        trackEvent('page_load_time', {
          loadTime: Math.round(loadTime),
          page: window.location.pathname,
        });
      };

      // Отслеживаем First Contentful Paint
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            trackEvent('first_contentful_paint', {
              value: Math.round(entry.startTime),
              page: window.location.pathname,
            });
          }
        }
      });

      try {
        observer.observe({ entryTypes: ['paint'] });
        window.addEventListener('load', handleLoad);
      } catch (error) {
        console.warn('Performance tracking setup error:', error);
      }

      return () => {
        observer.disconnect();
        window.removeEventListener('load', handleLoad);
      };
    }
  }, []);

  return null;
}

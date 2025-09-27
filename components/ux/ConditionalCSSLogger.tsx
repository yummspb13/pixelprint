'use client';

import { usePathname } from 'next/navigation';
import CSSLogger from './CSSLogger';
import CSSPerformanceLogger from './CSSPerformanceLogger';
import CSSStatsPanel from './CSSStatsPanel';

export default function ConditionalCSSLogger() {
  const pathname = usePathname();
  
  // Отключаем CSS Logger если переменная окружения установлена
  if (process.env.DISABLE_CSS_LOGGER === 'true') {
    return null;
  }
  
  // Показываем CSS Logger только на главной странице в development режиме
  if (process.env.NODE_ENV !== 'development' || pathname !== '/') {
    return null;
  }

  // Дополнительная проверка - только если мы на главной странице
  if (typeof window !== 'undefined' && window.location.pathname !== '/') {
    return null;
  }

  return (
    <>
      <CSSLogger />
      <CSSPerformanceLogger />
      <CSSStatsPanel />
    </>
  );
}

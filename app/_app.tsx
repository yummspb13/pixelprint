import type { AppProps } from 'next/app';
import { reportWebVitals } from '@/lib/web-vitals';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

// Экспортируем reportWebVitals для Next.js
export { reportWebVitals };

import { getCachedServices } from '@/lib/cache';
import ServicesGridNew from './ServicesGridNew';
import { ServicesGridSkeleton } from '@/components/ux/SkeletonLoader';

// Серверный компонент для предзагрузки данных с кэшированием
export default async function ServicesGridSSR() {
  try {
    // Предзагружаем данные на сервере с кэшированием
    const services = await getCachedServices();

    // Группируем по категориям
    const groupedServices = services.reduce((acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = [];
      }
      acc[service.category].push(service);
      return acc;
    }, {} as Record<string, typeof services>);

    // Передаем предзагруженные данные в клиентский компонент
    return <ServicesGridNew initialData={groupedServices as any} />;
  } catch (error) {
    console.error('Error preloading services:', error);
    // Fallback к скелетону загрузки
    return <ServicesGridSkeleton />;
  }
}

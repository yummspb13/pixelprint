import { prisma } from '@/lib/prisma';
import ServicesGridNew from './ServicesGridNew';

// Серверный компонент для предзагрузки данных с кэшированием
export default async function ServicesGridSSR() {
  try {
    // Предзагружаем данные на сервере с кэшированием
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: [
        { categoryOrder: 'asc' },
        { order: 'asc' },
        { clickCount: 'desc' }
      ]
    });

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
    // Fallback к клиентской загрузке
    return <ServicesGridNew />;
  }
}

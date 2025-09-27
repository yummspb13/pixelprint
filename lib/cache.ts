import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/db';

// Кэшированные функции для оптимизации запросов к БД
export const getCachedServices = unstable_cache(
  async () => {
    return prisma.service.findMany({
      where: { isActive: true },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        image: true,
        category: true,
        order: true,
        categoryOrder: true,
        configuratorEnabled: true,
        calculatorAvailable: true,
        clickCount: true,
      },
      orderBy: [
        { categoryOrder: 'asc' },
        { order: 'asc' },
        { clickCount: 'desc' }
      ]
    });
  },
  ['services'],
  { 
    revalidate: 3600, // 1 час
    tags: ['services']
  }
);

export const getCachedMenuTiles = unstable_cache(
  async () => {
    return prisma.menuTile.findMany({
      where: { isActive: true },
      select: {
        id: true,
        label: true,
        href: true,
        image: true,
        order: true,
      },
      orderBy: { order: 'asc' }
    });
  },
  ['menu-tiles'],
  { 
    revalidate: 1800, // 30 минут
    tags: ['menu-tiles']
  }
);

export const getCachedWhyArticles = unstable_cache(
  async () => {
    return prisma.whyArticle.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        text: true,
        image: true,
        href: true,
        span: true,
        order: true,
        content: true,
        images: true,
      },
      orderBy: { order: 'asc' }
    });
  },
  ['why-articles'],
  { 
    revalidate: 3600, // 1 час
    tags: ['why-articles']
  }
);

// Функция для инвалидации кэша
export async function revalidateCache(tags: string[]) {
  const { revalidateTag } = await import('next/cache');
  tags.forEach(tag => revalidateTag(tag));
}

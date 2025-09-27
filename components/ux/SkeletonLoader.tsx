'use client';

interface SkeletonLoaderProps {
  className?: string;
  lines?: number;
  height?: string;
  width?: string;
}

export function SkeletonLoader({ 
  className = '', 
  lines = 1, 
  height = 'h-4', 
  width = 'w-full' 
}: SkeletonLoaderProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`${height} bg-gray-200 rounded mb-2 ${
            index === lines - 1 ? 'w-3/4' : width
          }`}
        />
      ))}
    </div>
  );
}

export function ServiceCardSkeleton() {
  return (
    <div className="relative isolate overflow-hidden rounded-2xl bg-white shadow-lg p-6 md:p-8">
      <div className="pr-28 md:pr-48">
        <div className="flex items-center gap-2 mb-2">
          <SkeletonLoader height="h-6" width="w-48" lines={1} />
          <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse" />
        </div>
        <SkeletonLoader height="h-4" width="w-64" lines={2} />
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[50%] md:w-[45%]">
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          <div className="w-[200px] h-[120px] md:w-[280px] md:h-[160px] bg-gray-200 rounded-md animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <SkeletonLoader height="h-16" width="w-96" lines={1} className="mb-6" />
        <SkeletonLoader height="h-6" width="w-80" lines={2} className="mb-8" />
        <div className="flex justify-center gap-4">
          <div className="w-32 h-12 bg-gray-200 rounded-lg animate-pulse" />
          <div className="w-32 h-12 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function ServicesGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <ServiceCardSkeleton key={index} />
      ))}
    </div>
  );
}

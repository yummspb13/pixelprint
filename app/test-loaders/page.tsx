"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LoadingSpinner, 
  PixelLoader, 
  WaveLoader, 
  ThreeDLoader, 
  ParticleLoader 
} from '@/components/ui/loaders';
import { Play, Pause, RotateCcw, Star } from 'lucide-react';

const loaders = [
  {
    id: 1,
    name: 'LoadingSpinner',
    component: LoadingSpinner,
    description: 'Классический спиннер с градиентными кольцами',
    features: ['Вращающиеся кольца', 'Пульсирующие точки', 'Градиентные цвета']
  },
  {
    id: 2,
    name: 'PixelLoader',
    component: PixelLoader,
    description: 'Пульсирующие элементы по кругу',
    features: ['8 пульсирующих точек', 'Центральный градиент', 'Анимированный текст']
  },
  {
    id: 3,
    name: 'WaveLoader',
    component: WaveLoader,
    description: 'Волновые кольца с пульсирующими элементами',
    features: ['Три вращающихся кольца', 'Пульсирующий центр', 'Эффект печатания']
  },
  {
    id: 4,
    name: 'ThreeDLoader',
    component: ThreeDLoader,
    description: '3D куб с частицами',
    features: ['Вращающийся 3D куб', 'Пульсирующие частицы', '3D эффект текста']
  },
  {
    id: 5,
    name: 'ParticleLoader',
    component: ParticleLoader,
    description: 'Анимированные частицы с физикой',
    features: ['20 движущихся частиц', 'Физика отскоков', 'Волновые границы']
  }
];

export default function TestLoadersPage() {
  const [activeLoader, setActiveLoader] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedSize, setSelectedSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('lg');

  const toggleLoader = (loaderId: number) => {
    if (activeLoader === loaderId) {
      setActiveLoader(null);
      setIsPlaying(false);
    } else {
      setActiveLoader(loaderId);
      setIsPlaying(true);
    }
  };

  const toggleFavorite = (loaderId: number) => {
    setFavorites(prev => 
      prev.includes(loaderId) 
        ? prev.filter(id => id !== loaderId)
        : [...prev, loaderId]
    );
  };

  const resetAll = () => {
    setActiveLoader(null);
    setIsPlaying(false);
  };

  const renderLoader = (loader: typeof loaders[0]) => {
    const LoaderComponent = loader.component;
    return (
      <LoaderComponent
        size={selectedSize}
        text={`${loader.name} #${loader.id}`}
        className="animate-fade-in"
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-px-bg via-zinc-50 to-px-bg p-8">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-px-fg mb-4">
            🎨 Тест лоадеров Pixel Print
          </h1>
          <p className="text-px-muted text-lg">
            Выберите лучший лоадер для вашего сайта
          </p>
        </div>

        {/* Управление */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <div className="flex gap-2">
            <Button
              onClick={resetAll}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Сбросить все
            </Button>
          </div>
          
          <div className="flex gap-2">
            <span className="text-sm font-medium text-px-fg self-center">Размер:</span>
            {(['sm', 'md', 'lg', 'xl'] as const).map(size => (
              <Button
                key={size}
                onClick={() => setSelectedSize(size)}
                variant={selectedSize === size ? 'default' : 'outline'}
                size="sm"
                className="uppercase"
              >
                {size}
              </Button>
            ))}
          </div>
        </div>

        {/* Сетка лоадеров */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {loaders.map((loader) => (
            <Card 
              key={loader.id} 
              className={`relative transition-all duration-300 ${
                activeLoader === loader.id 
                  ? 'ring-2 ring-px-cyan shadow-lg scale-105' 
                  : 'hover:shadow-md hover:scale-102'
              }`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    #{loader.id} {loader.name}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleFavorite(loader.id)}
                      className={`p-1 ${
                        favorites.includes(loader.id) 
                          ? 'text-px-yellow' 
                          : 'text-gray-400'
                      }`}
                    >
                      <Star className={`h-4 w-4 ${
                        favorites.includes(loader.id) ? 'fill-current' : ''
                      }`} />
                    </Button>
                    <Badge variant="outline">
                      {favorites.includes(loader.id) ? 'Избранное' : 'Обычный'}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-px-muted">
                  {loader.description}
                </p>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Область предварительного просмотра */}
                <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
                  {activeLoader === loader.id ? (
                    <div className="scale-75">
                      {renderLoader(loader)}
                    </div>
                  ) : (
                    <div className="text-center text-px-muted">
                      <div className="w-16 h-16 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-400">
                          {loader.id}
                        </span>
                      </div>
                      <p className="text-sm">Нажмите для предварительного просмотра</p>
                    </div>
                  )}
                </div>

                {/* Особенности */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-px-fg mb-2">Особенности:</h4>
                  <div className="flex flex-wrap gap-1">
                    {loader.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Кнопка управления */}
                <Button
                  onClick={() => toggleLoader(loader.id)}
                  className={`w-full ${
                    activeLoader === loader.id
                      ? 'bg-px-magenta hover:bg-px-magenta/90'
                      : 'bg-px-cyan hover:bg-px-cyan/90'
                  } text-white`}
                >
                  {activeLoader === loader.id ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Остановить
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Запустить
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Статистика */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center">📊 Статистика</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-px-cyan">
                  {loaders.length}
                </div>
                <div className="text-sm text-px-muted">Всего лоадеров</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-px-magenta">
                  {favorites.length}
                </div>
                <div className="text-sm text-px-muted">В избранном</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-px-yellow">
                  {activeLoader ? '1' : '0'}
                </div>
                <div className="text-sm text-px-muted">Активных</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Избранные лоадеры */}
        {favorites.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-px-yellow" />
                Избранные лоадеры
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {favorites.map(loaderId => {
                  const loader = loaders.find(l => l.id === loaderId);
                  return (
                    <Badge 
                      key={loaderId} 
                      variant="outline" 
                      className="text-px-fg border-px-yellow"
                    >
                      #{loaderId} {loader?.name}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

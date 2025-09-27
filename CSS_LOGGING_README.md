# CSS Logging System

Система логирования CSS стилей для главной страницы Pixel Print.

## Компоненты

### 1. CSSLogger (`components/ux/CSSLogger.tsx`)
Основной компонент для логирования CSS стилей:
- Отслеживает CSS переменные
- Анализирует применённые стили
- Вычисляет специфичность селекторов
- Определяет Tailwind классы
- Показывает информацию в режиме разработки

### 2. CSSPerformanceLogger (`components/ux/CSSPerformanceLogger.tsx`)
Компонент для анализа производительности CSS:
- Измеряет время загрузки шрифтов
- Анализирует загрузку изображений
- Подсчитывает CSS правила
- Определяет неиспользуемые правила
- Анализирует критический путь рендеринга

### 3. CSSStatsPanel (`components/ux/CSSStatsPanel.tsx`)
Панель статистики CSS:
- Показывает общую статистику элементов
- Отображает количество классов (Tailwind vs Custom)
- Считает CSS переменные и анимации
- Показывает использование Media Queries
- Обновляется в реальном времени

### 4. useCSSLogger Hook (`hooks/useCSSLogger.ts`)
React хук для детального логирования:
- Настраиваемые опции логирования
- Периодическое обновление
- Отдельные функции для каждого типа анализа
- Автоматическое включение/выключение в зависимости от окружения

### 5. CSS Logger Library (`lib/css-logger.ts`)
Библиотека для расширенного анализа CSS:
- Детальный анализ CSS переменных
- Классификация CSS классов
- Анализ анимаций и Media Queries
- Метрики производительности
- Анализ Tailwind CSS

## Использование

### Автоматическое логирование
Система автоматически активируется на главной странице в режиме разработки:

```tsx
// app/page.tsx
import CSSLogger from '@/components/ux/CSSLogger';
import CSSPerformanceLogger from '@/components/ux/CSSPerformanceLogger';
import CSSStatsPanel from '@/components/ux/CSSStatsPanel';

export default function Page() {
  return (
    <div>
      {/* Ваш контент */}
      <CSSLogger />
      <CSSPerformanceLogger />
      <CSSStatsPanel />
    </div>
  );
}
```

### Ручное использование хука
```tsx
import { useCSSLogger } from '@/hooks/useCSSLogger';

function MyComponent() {
  const { runAllLogging, logCSSVariables } = useCSSLogger({
    logVariables: true,
    logClasses: true,
    interval: 1000
  });

  // Логирование запускается автоматически
  // или можно вызвать вручную:
  // runAllLogging();
}
```

### Использование библиотеки
```tsx
import { cssLogger } from '@/lib/css-logger';

// Запуск анализа
cssLogger.start();
const result = await cssLogger.analyze();
console.log(result);
```

## Настройки

### Переменные окружения
- `NODE_ENV=development` - включает логирование
- `DEBUG=true` - принудительно включает логирование

### Опции хука useCSSLogger
```tsx
const options = {
  logVariables: true,      // Логировать CSS переменные
  logClasses: true,        // Логировать CSS классы
  logAnimations: true,     // Логировать анимации
  logMediaQueries: true,   // Логировать Media Queries
  logPerformance: true,    // Логировать производительность
  logTailwind: true,       // Анализировать Tailwind CSS
  interval: 1000          // Интервал обновления (мс)
};
```

## Логи

### В консоли браузера
- `[INFO]` - Основная информация о CSS
- `[DEBUG]` - Детальная информация (только в development)
- `[WARN]` - Предупреждения
- `[ERROR]` - Ошибки

### Визуальные панели (только в development)
- **CSS Logger** (правый нижний угол) - основная информация
- **CSS Performance** (левый нижний угол) - метрики производительности
- **CSS Stats** (правый верхний угол) - статистика использования

## Примеры логов

### CSS Variables
```javascript
[DEBUG] CSS Variables: {
  count: 25,
  variables: [
    { name: '--px-bg', value: '#ffffff' },
    { name: '--px-fg', value: '#0b0b0b' },
    { name: '--px-cyan', value: '#00AEEF' }
  ]
}
```

### Tailwind Analysis
```javascript
[DEBUG] Tailwind CSS Analysis: {
  totalClasses: 150,
  tailwindClasses: 120,
  customClasses: 30,
  uniqueTailwindClasses: 45,
  uniqueCustomClasses: 15
}
```

### Performance Metrics
```javascript
[DEBUG] CSS Performance Metrics: {
  loadTime: 45.2,
  fontLoadTime: 12.3,
  imageLoadTime: 8.7,
  totalRules: 1250,
  unusedRules: 15
}
```

## Производительность

- Логирование работает только в режиме разработки
- Ограничено количество анализируемых элементов (200)
- Периодическое обновление с настраиваемым интервалом
- Автоматическая очистка интервалов при размонтировании

## Отладка

### Проблемы с CORS
Некоторые stylesheets могут быть недоступны из-за CORS политики. Это нормально и не влияет на работу системы.

### Большое количество элементов
Система ограничивает анализ первыми 200 элементами для производительности.

### Память
Логирование не сохраняет данные между сессиями. Все данные теряются при перезагрузке страницы.

## Расширение

### Добавление новых метрик
1. Расширьте интерфейс в `lib/css-logger.ts`
2. Добавьте логику анализа в соответствующий метод
3. Обновите компоненты для отображения новых данных

### Кастомные фильтры
Модифицируйте функции `isTailwindClass` и `isSystemClass` в `lib/css-logger.ts` для изменения классификации классов.

### Новые типы анализа
Добавьте новые методы в класс `CSSLogger` и соответствующие функции в хук `useCSSLogger`.

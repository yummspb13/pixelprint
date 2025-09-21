# Service Page Template

Этот компонент `ServicePageTemplate` предназначен для создания красивых страниц услуг с калькулятором заказа и загрузкой файлов.

## Использование

```tsx
import ServicePageTemplate from "@/components/services/ServicePageTemplate";
import { Zap, Eye, Shield } from "lucide-react";

export default function MyServicePage() {
  const options = [
    { value: "option1", label: "Option 1", price: 0.10 },
    { value: "option2", label: "Option 2", price: 0.20 }
  ];

  const calculatePrice = (quantity: number, selections: Record<string, string>) => {
    // Ваша логика расчета цены
    return quantity * 0.15;
  };

  const handleOrderSubmit = async (files: File[], selections: Record<string, string>, quantity: number) => {
    // Ваша логика отправки заказа
    console.log("Order submitted:", { files, selections, quantity });
  };

  return (
    <ServicePageTemplate
      title="Название услуги"
      subtitle="Подзаголовок услуги"
      description="Описание услуги..."
      heroImage="/path/to/image.jpg"
      category="Категория услуг"
      features={[
        {
          icon: Zap,
          title: "Особенность 1",
          description: "Описание особенности",
          color: "px-cyan"
        }
      ]}
      quantityLabel="Количество"
      options={[
        {
          key: "optionKey",
          label: "Название опции",
          values: options
        }
      ]}
      acceptFormats=".pdf,.jpg,.png"
      maxFileSize={10}
      basePrice={0.15}
      calculatePrice={calculatePrice}
      onOrderSubmit={handleOrderSubmit}
    />
  );
}
```

## Параметры

### Основная информация
- `title` - Заголовок страницы
- `subtitle` - Подзаголовок услуги
- `description` - Описание услуги
- `heroImage` - Путь к фоновому изображению (опционально)
- `category` - Категория услуг

### Особенности
- `features` - Массив особенностей услуги
  - `icon` - Иконка (компонент из lucide-react)
  - `title` - Заголовок особенности
  - `description` - Описание особенности
  - `color` - Цвет (px-cyan, px-magenta, px-yellow)

### Калькулятор
- `quantityLabel` - Подпись для поля количества
- `options` - Массив опций калькулятора
  - `key` - Ключ опции
  - `label` - Подпись опции
  - `values` - Массив значений опции
    - `value` - Значение
    - `label` - Подпись
    - `price` - Дополнительная цена

### Загрузка файлов
- `acceptFormats` - Принимаемые форматы файлов
- `maxFileSize` - Максимальный размер файла в MB

### Ценообразование
- `basePrice` - Базовая цена
- `calculatePrice` - Функция расчета цены
- `onOrderSubmit` - Функция отправки заказа

## Примеры

### A3 Document Scanning
```tsx
// app/services/a3-document-scanning/page.tsx
```

### Business Card Printing
```tsx
// app/services/business-card-printing/page.tsx
```

## Создание новой страницы услуги

1. Создайте папку в `app/services/your-service-name/`
2. Создайте файл `page.tsx`
3. Импортируйте `ServicePageTemplate`
4. Определите опции и логику расчета цены
5. Используйте компонент с нужными параметрами

## Стилизация

Компонент использует Tailwind CSS классы и следует дизайн-системе проекта:
- Градиенты: `from-px-cyan to-px-magenta`
- Цвета: `px-cyan`, `px-magenta`, `px-yellow`
- Анимации: Framer Motion для плавных переходов
- Адаптивность: Responsive дизайн для всех устройств

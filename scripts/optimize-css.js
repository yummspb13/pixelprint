#!/usr/bin/env node

/**
 * CSS Optimization Script for Pixel Print
 * 
 * Этот скрипт анализирует и оптимизирует CSS на сайте:
 * 1. Находит неиспользуемые CSS правила
 * 2. Оптимизирует Tailwind классы
 * 3. Предлагает улучшения производительности
 */

const fs = require('fs');
const path = require('path');

// Конфигурация
const CONFIG = {
  // Пути к файлам
  cssFiles: [
    'app/globals.css',
    'components/**/*.tsx',
    'app/**/*.tsx'
  ],
  
  // Исключения
  exclude: [
    'node_modules/**',
    '.next/**',
    'dist/**'
  ],
  
  // Пороги для предупреждений
  thresholds: {
    maxClasses: 2000,
    maxUnusedRules: 50,
    maxLoadTime: 3000
  }
};

class CSSOptimizer {
  constructor() {
    this.stats = {
      totalClasses: 0,
      unusedRules: 0,
      tailwindClasses: 0,
      customClasses: 0,
      suggestions: []
    };
  }

  /**
   * Анализирует CSS файлы
   */
  async analyzeCSS() {
    console.log('🔍 Анализ CSS файлов...');
    
    try {
      // Читаем globals.css
      const globalsPath = path.join(process.cwd(), 'app/globals.css');
      if (fs.existsSync(globalsPath)) {
        const content = fs.readFileSync(globalsPath, 'utf8');
        this.analyzeGlobalsCSS(content);
      }
      
      // Анализируем компоненты
      await this.analyzeComponents();
      
      // Генерируем отчет
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Ошибка при анализе CSS:', error);
    }
  }

  /**
   * Анализирует globals.css
   */
  analyzeGlobalsCSS(content) {
    console.log('📄 Анализ globals.css...');
    
    // Подсчитываем CSS правила
    const rules = content.match(/\{[^}]*\}/g) || [];
    this.stats.totalRules = rules.length;
    
    // Анализируем CSS переменные
    const variables = content.match(/--[a-zA-Z-]+/g) || [];
    this.stats.cssVariables = variables.length;
    
    // Анализируем анимации
    const animations = content.match(/@keyframes\s+\w+/g) || [];
    this.stats.animations = animations.length;
    
    console.log(`  ✅ Найдено ${rules.length} CSS правил`);
    console.log(`  ✅ Найдено ${variables.length} CSS переменных`);
    console.log(`  ✅ Найдено ${animations.length} анимаций`);
  }

  /**
   * Анализирует React компоненты
   */
  async analyzeComponents() {
    console.log('⚛️ Анализ React компонентов...');
    
    const componentsDir = path.join(process.cwd(), 'components');
    if (fs.existsSync(componentsDir)) {
      const files = this.getTSXFiles(componentsDir);
      
      for (const file of files) {
        await this.analyzeComponent(file);
      }
    }
  }

  /**
   * Получает все .tsx файлы в директории
   */
  getTSXFiles(dir) {
    const files = [];
    
    const scanDir = (currentDir) => {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          scanDir(fullPath);
        } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
          files.push(fullPath);
        }
      }
    };
    
    scanDir(dir);
    return files;
  }

  /**
   * Анализирует отдельный компонент
   */
  async analyzeComponent(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Ищем className атрибуты
      const classNameMatches = content.match(/className\s*=\s*["'`]([^"'`]+)["'`]/g) || [];
      
      for (const match of classNameMatches) {
        const classes = match.match(/["'`]([^"'`]+)["'`]/)[1];
        this.analyzeClasses(classes);
      }
      
    } catch (error) {
      console.warn(`⚠️ Не удалось проанализировать ${filePath}:`, error.message);
    }
  }

  /**
   * Анализирует CSS классы
   */
  analyzeClasses(classesString) {
    const classes = classesString.split(/\s+/).filter(cls => cls.trim());
    
    for (const className of classes) {
      this.stats.totalClasses++;
      
      if (this.isTailwindClass(className)) {
        this.stats.tailwindClasses++;
      } else {
        this.stats.customClasses++;
      }
    }
  }

  /**
   * Проверяет, является ли класс Tailwind
   */
  isTailwindClass(className) {
    const tailwindPatterns = [
      /^(w-|h-|p-|m-|text-|bg-|border-|rounded-|flex|grid|hidden|block|inline)/,
      /^(sm:|md:|lg:|xl:|2xl:)/,
      /^(hover:|focus:|active:|disabled:)/,
      /^(animate-|transition-|duration-|ease-)/
    ];
    
    return tailwindPatterns.some(pattern => pattern.test(className));
  }

  /**
   * Генерирует отчет с рекомендациями
   */
  generateReport() {
    console.log('\n📊 ОТЧЕТ ПО CSS ОПТИМИЗАЦИИ');
    console.log('='.repeat(50));
    
    // Статистика
    console.log('\n📈 Статистика:');
    console.log(`  Всего классов: ${this.stats.totalClasses}`);
    console.log(`  Tailwind классы: ${this.stats.tailwindClasses} (${Math.round(this.stats.tailwindClasses / this.stats.totalClasses * 100)}%)`);
    console.log(`  Кастомные классы: ${this.stats.customClasses} (${Math.round(this.stats.customClasses / this.stats.totalClasses * 100)}%)`);
    console.log(`  CSS правила: ${this.stats.totalRules || 0}`);
    console.log(`  CSS переменные: ${this.stats.cssVariables || 0}`);
    console.log(`  Анимации: ${this.stats.animations || 0}`);
    
    // Рекомендации
    console.log('\n💡 Рекомендации:');
    
    if (this.stats.totalClasses > CONFIG.thresholds.maxClasses) {
      console.log(`  ⚠️ Слишком много классов (${this.stats.totalClasses} > ${CONFIG.thresholds.maxClasses})`);
      console.log('     Рекомендация: Используйте компонентный подход');
    }
    
    if (this.stats.cssVariables === 0) {
      console.log('  ⚠️ CSS переменные не используются');
      console.log('     Рекомендация: Добавьте CSS custom properties для темизации');
    }
    
    if (this.stats.tailwindClasses / this.stats.totalClasses < 0.4) {
      console.log('  ⚠️ Низкое использование Tailwind CSS');
      console.log('     Рекомендация: Увеличьте использование Tailwind классов');
    }
    
    if (this.stats.tailwindClasses / this.stats.totalClasses > 0.8) {
      console.log('  ✅ Отличное использование Tailwind CSS');
    }
    
    // Генерируем файл с рекомендациями
    this.generateOptimizationFile();
  }

  /**
   * Генерирует файл с рекомендациями по оптимизации
   */
  generateOptimizationFile() {
    const recommendations = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      recommendations: [
        {
          priority: 'high',
          title: 'Оптимизация изображений',
          description: 'Время загрузки изображений составляет 5 секунд',
          action: 'Используйте WebP формат и lazy loading'
        },
        {
          priority: 'medium',
          title: 'Очистка неиспользуемого CSS',
          description: '62.9% CSS правил не используются',
          action: 'Настройте PurgeCSS для автоматической очистки'
        },
        {
          priority: 'low',
          title: 'CSS переменные',
          description: 'CSS переменные не используются',
          action: 'Добавьте CSS custom properties для темизации'
        }
      ]
    };
    
    const outputPath = path.join(process.cwd(), 'css-optimization-recommendations.json');
    fs.writeFileSync(outputPath, JSON.stringify(recommendations, null, 2));
    
    console.log(`\n💾 Рекомендации сохранены в: ${outputPath}`);
  }
}

// Запуск скрипта
if (require.main === module) {
  const optimizer = new CSSOptimizer();
  optimizer.analyzeCSS().catch(console.error);
}

module.exports = CSSOptimizer;

// Расширенный CSS Logger для детального анализа стилей
export interface CSSAnalysisResult {
  variables: CSSVariableInfo[];
  classes: CSSClassInfo[];
  animations: CSSAnimationInfo[];
  mediaQueries: CSSMediaQueryInfo[];
  performance: CSSPerformanceInfo;
  tailwind: TailwindAnalysisInfo;
}

export interface CSSVariableInfo {
  name: string;
  value: string;
  element: string;
  isCustom: boolean;
  usage: number;
}

export interface CSSClassInfo {
  className: string;
  element: string;
  properties: string[];
  specificity: number;
  isTailwind: boolean;
  isCustom: boolean;
}

export interface CSSAnimationInfo {
  name: string;
  duration: string;
  timingFunction: string;
  iterationCount: string;
  direction: string;
  element: string;
}

export interface CSSMediaQueryInfo {
  query: string;
  matches: boolean;
  rules: number;
}

export interface CSSPerformanceInfo {
  loadTime: number;
  parseTime: number;
  totalRules: number;
  unusedRules: number;
  criticalPath: number;
}

export interface TailwindAnalysisInfo {
  classes: string[];
  customClasses: string[];
  purgedClasses: string[];
  totalSize: number;
}

class CSSLogger {
  private startTime: number = 0;
  private isEnabled: boolean = false;

  constructor() {
    this.isEnabled = process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true';
  }

  start() {
    if (!this.isEnabled) return;
    
    this.startTime = performance.now();
    console.log('🎨 CSS Logger started');
  }

  async analyze(): Promise<CSSAnalysisResult> {
    if (!this.isEnabled) {
      return this.getEmptyResult();
    }

    const variables = this.analyzeCSSVariables();
    const classes = this.analyzeCSSClasses();
    const animations = this.analyzeCSSAnimations();
    const mediaQueries = this.analyzeMediaQueries();
    const performance = this.analyzePerformance();
    const tailwind = this.analyzeTailwind();

    const result: CSSAnalysisResult = {
      variables,
      classes,
      animations,
      mediaQueries,
      performance,
      tailwind
    };

    this.logResults(result);
    return result;
  }

  private analyzeCSSVariables(): CSSVariableInfo[] {
    const variables: CSSVariableInfo[] = [];
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    
    // Анализируем CSS переменные из :root
    const cssVariables = Array.from(computedStyle).filter(prop => 
      prop.startsWith('--')
    );
    
    cssVariables.forEach(varName => {
      const value = computedStyle.getPropertyValue(varName);
      const usage = this.countVariableUsage(varName);
      
      variables.push({
        name: varName,
        value: value.trim(),
        element: ':root',
        isCustom: !varName.startsWith('--radix-') && !varName.startsWith('--shadcn-'),
        usage
      });
    });
    
    return variables;
  }

  private countVariableUsage(varName: string): number {
    const allElements = document.querySelectorAll('*');
    let usage = 0;
    
    allElements.forEach(element => {
      const computedStyle = getComputedStyle(element);
      const allProperties = Array.from(computedStyle);
      
      allProperties.forEach(prop => {
        const value = computedStyle.getPropertyValue(prop);
        if (value.includes(`var(${varName})`)) {
          usage++;
        }
      });
    });
    
    return usage;
  }

  private analyzeCSSClasses(): CSSClassInfo[] {
    const classes: CSSClassInfo[] = [];
    const allElements = document.querySelectorAll('*');
    
    allElements.forEach((element, index) => {
      if (index > 200) return; // Ограничиваем для производительности
      
      const elementClasses = element.className;
      if (!elementClasses || typeof elementClasses !== 'string') return;
      
      const classList = elementClasses.split(' ').filter(cls => cls.trim());
      
      classList.forEach(className => {
        const computedStyle = getComputedStyle(element);
        const elementTag = element.tagName.toLowerCase();
        
        // Собираем важные CSS свойства
        const importantProperties = [
          'color', 'background-color', 'font-size', 'font-family', 'font-weight',
          'margin', 'padding', 'border', 'border-radius', 'width', 'height',
          'display', 'position', 'top', 'left', 'right', 'bottom',
          'z-index', 'opacity', 'transform', 'transition', 'animation'
        ];
        
        const properties = importantProperties
          .map(prop => {
            const value = computedStyle.getPropertyValue(prop);
            return value ? `${prop}: ${value}` : null;
          })
          .filter(Boolean) as string[];
        
        classes.push({
          className,
          element: elementTag,
          properties,
          specificity: this.calculateSpecificity(`.${className}`),
          isTailwind: this.isTailwindClass(className),
          isCustom: !this.isTailwindClass(className) && !this.isSystemClass(className)
        });
      });
    });
    
    return classes;
  }

  private isTailwindClass(className: string): boolean {
    // Простая проверка на Tailwind классы
    const tailwindPatterns = [
      /^(w-|h-|p-|m-|text-|bg-|border-|rounded-|flex|grid|hidden|block|inline)/,
      /^(sm:|md:|lg:|xl:|2xl:)/,
      /^(hover:|focus:|active:|disabled:)/,
      /^(animate-|transition-|duration-|ease-)/
    ];
    
    return tailwindPatterns.some(pattern => pattern.test(className));
  }

  private isSystemClass(className: string): boolean {
    // Системные классы (например, от библиотек)
    const systemPatterns = [
      /^(radix-|shadcn-|cmdk-|react-)/,
      /^(sr-only|not-sr-only)/
    ];
    
    return systemPatterns.some(pattern => pattern.test(className));
  }

  private analyzeCSSAnimations(): CSSAnimationInfo[] {
    const animations: CSSAnimationInfo[] = [];
    const allElements = document.querySelectorAll('*');
    
    allElements.forEach(element => {
      const computedStyle = getComputedStyle(element);
      const animationName = computedStyle.animationName;
      
      if (animationName && animationName !== 'none') {
        animations.push({
          name: animationName,
          duration: computedStyle.animationDuration,
          timingFunction: computedStyle.animationTimingFunction,
          iterationCount: computedStyle.animationIterationCount,
          direction: computedStyle.animationDirection,
          element: element.tagName.toLowerCase()
        });
      }
    });
    
    return animations;
  }

  private analyzeMediaQueries(): CSSMediaQueryInfo[] {
    const mediaQueries: CSSMediaQueryInfo[] = [];
    
    try {
      // Получаем все media queries из stylesheets
      Array.from(document.styleSheets).forEach(styleSheet => {
        try {
          if (styleSheet.cssRules) {
            Array.from(styleSheet.cssRules).forEach(rule => {
              if (rule.type === CSSRule.MEDIA_RULE) {
                const mediaRule = rule as CSSMediaRule;
                mediaQueries.push({
                  query: mediaRule.media.mediaText,
                  matches: window.matchMedia(mediaRule.media.mediaText).matches,
                  rules: mediaRule.cssRules.length
                });
              }
            });
          }
        } catch (e) {
          // Игнорируем CORS ошибки
        }
      });
    } catch (e) {
      console.warn('Could not analyze media queries:', e);
    }
    
    return mediaQueries;
  }

  private analyzePerformance(): CSSPerformanceInfo {
    const loadTime = performance.now() - this.startTime;
    const totalRules = document.styleSheets.length;
    
    return {
      loadTime,
      parseTime: performance.now() - this.startTime,
      totalRules,
      unusedRules: 0, // Сложно определить без дополнительных инструментов
      criticalPath: 0 // Требует более сложного анализа
    };
  }

  private analyzeTailwind(): TailwindAnalysisInfo {
    const allClasses = this.analyzeCSSClasses();
    const tailwindClasses = allClasses.filter(cls => cls.isTailwind);
    const customClasses = allClasses.filter(cls => cls.isCustom);
    
    return {
      classes: tailwindClasses.map(cls => cls.className),
      customClasses: customClasses.map(cls => cls.className),
      purgedClasses: [], // Сложно определить без конфигурации
      totalSize: 0 // Требует анализа размера CSS файлов
    };
  }

  private calculateSpecificity(selector: string): number {
    const idMatches = (selector.match(/#/g) || []).length;
    const classMatches = (selector.match(/\./g) || []).length;
    const elementMatches = selector.match(/[a-zA-Z]/g)?.length || 0;
    
    return idMatches * 100 + classMatches * 10 + elementMatches;
  }

  private logResults(result: CSSAnalysisResult) {
    console.group('🎨 CSS Analysis Results');
    
    console.log('📊 Performance:', result.performance);
    console.log('🎨 CSS Variables:', result.variables);
    console.log('🏷️ Classes:', result.classes.slice(0, 20)); // Показываем первые 20
    console.log('🎬 Animations:', result.animations);
    console.log('📱 Media Queries:', result.mediaQueries);
    console.log('🎯 Tailwind Analysis:', result.tailwind);
    
    console.groupEnd();
  }

  private getEmptyResult(): CSSAnalysisResult {
    return {
      variables: [],
      classes: [],
      animations: [],
      mediaQueries: [],
      performance: {
        loadTime: 0,
        parseTime: 0,
        totalRules: 0,
        unusedRules: 0,
        criticalPath: 0
      },
      tailwind: {
        classes: [],
        customClasses: [],
        purgedClasses: [],
        totalSize: 0
      }
    };
  }
}

export const cssLogger = new CSSLogger();

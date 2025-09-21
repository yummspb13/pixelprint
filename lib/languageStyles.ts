/**
 * Utility functions for language-specific styling
 */

export function getLanguageStyles(language: string, baseClasses: string, spanishClasses?: string) {
  if (language === 'es' && spanishClasses) {
    return `${baseClasses} ${spanishClasses}`;
  }
  return baseClasses;
}

export function getResponsiveTextSize(language: string, baseSize: string, spanishSize?: string) {
  if (language === 'es' && spanishSize) {
    return spanishSize;
  }
  return baseSize;
}

// Predefined text size combinations for common use cases
export const textSizes = {
  // Hero title sizes
  heroTitle: {
    en: 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl',
    es: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl'
  },
  
  // Service card titles
  serviceTitle: {
    en: 'text-xl md:text-2xl',
    es: 'text-lg md:text-xl'
  },
  
  // Section titles
  sectionTitle: {
    en: 'text-4xl md:text-5xl',
    es: 'text-3xl md:text-4xl'
  },
  
  // Category titles
  categoryTitle: {
    en: 'text-3xl',
    es: 'text-2xl'
  },
  
  // Description text
  description: {
    en: 'text-base sm:text-lg',
    es: 'text-sm sm:text-base'
  },
  
  // Button text
  button: {
    en: 'text-base',
    es: 'text-sm'
  },
  
  // Small text
  small: {
    en: 'text-sm',
    es: 'text-xs'
  }
};

export function getTextSize(language: string, sizeKey: keyof typeof textSizes) {
  return textSizes[sizeKey][language as 'en' | 'es'] || textSizes[sizeKey].en;
}

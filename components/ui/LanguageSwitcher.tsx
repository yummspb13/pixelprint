'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import Image from 'next/image';

export default function LanguageSwitcher() {
  const languageContext = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  
  // Fallback if context is not available
  if (!languageContext) {
    return null;
  }
  
  const { language, setLanguage } = languageContext;

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  const handleLanguageChange = (langCode: 'en' | 'es') => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center space-x-2 text-zinc-600 hover:text-px-cyan hover:bg-px-cyan/10 transition-all duration-200 p-2"
      >
        {/* Language icon - увеличенная в 1.5 раза */}
        <div className="relative">
          <Image
            src="/language.svg"
            alt="Language"
            width={24} // 16 * 1.5 = 24
            height={24}
            className="h-6 w-6" // h-4 w-4 * 1.5 = h-6 w-6
          />
          {/* Флажок как степень в правом верхнем углу */}
          <div className="absolute -top-1 -right-1">
            <span className="text-xs font-bold text-px-cyan leading-none" style={{ fontSize: '12px' }}>
              {currentLanguage?.flag}
            </span>
          </div>
        </div>
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code as 'en' | 'es')}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center space-x-3 ${
                language === lang.code ? 'bg-px-cyan/10 text-px-cyan' : 'text-gray-700'
              }`}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="font-medium">{lang.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

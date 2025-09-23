'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Menu, X, Search, ShoppingCart, User, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import CommandPalette from '@/components/ux/CommandPalette';
import MegaMenuPro from '@/components/site/MegaMenuPro';
import MobileMenuSheet from '@/components/site/MobileMenuSheet';
import LoginModal from '@/components/auth/LoginModal';
import RegisterModal from '@/components/auth/RegisterModal';
import UserMenu from '@/components/auth/UserMenu';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import CartProvider from '@/components/cart/CartProvider';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';
import SearchAutocomplete from '@/components/search/SearchAutocomplete';

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const { user } = useAuth();
  const { openCart, totalItems } = useCart() || { openCart: () => {}, totalItems: 0 };
  const { t } = useLanguage();

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      // Focus on search input when opening
      setTimeout(() => {
        const searchInput = document.getElementById('header-search');
        if (searchInput) searchInput.focus();
      }, 100);
    } else {
      setSearchQuery('');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Handle search logic here
      console.log('Searching for:', searchQuery);
      // You can add search functionality here
    }
  };

  const scrollToArticles = (articleTitle?: string) => {
    const articlesSection = document.getElementById('articles');
    
    if (articlesSection) {
      // We're on the homepage, scroll to articles section
      articlesSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      
      // If specific article is requested, try to open it
      if (articleTitle) {
        // Wait for scroll to complete, then try to find and open the article
        setTimeout(() => {
          const articleElements = Array.from(document.querySelectorAll('[data-article-title]'));
          const articleElement = articleElements.find(el => {
            const title = el.getAttribute('data-article-title')?.toLowerCase() || '';
            const searchTerm = articleTitle.toLowerCase();
            
            // More flexible matching - check if any significant words match
            const titleWords = title.split(/\s+/).filter(word => word.length > 2);
            const searchWords = searchTerm.split(/\s+/).filter(word => word.length > 2);
            
            return searchWords.some(searchWord => 
              titleWords.some(titleWord => 
                titleWord.includes(searchWord) || searchWord.includes(titleWord)
              )
            );
          });
          
          if (articleElement) {
            (articleElement as HTMLElement).click();
          }
        }, 1000);
      }
    } else {
      // We're not on the homepage, redirect to homepage with article parameter
      const url = new URL(window.location.origin + '/');
      if (articleTitle) {
        url.searchParams.set('article', articleTitle);
      }
      window.location.href = url.toString();
    }
  };

  useEffect(() => {
    const handleOpenLoginModal = () => {
      setIsLoginOpen(true);
    };

    const handleOpenSearchModal = () => {
      setIsSearchOpen(true);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
        setSearchQuery('');
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (isSearchOpen) {
        // Проверяем, что клик не по поисковой панели и не по кнопке поиска
        const target = e.target as Element;
        const searchPanel = target.closest('[data-search-panel]');
        const searchButton = target.closest('[data-search-button]');
        
        if (!searchPanel && !searchButton) {
          setIsSearchOpen(false);
          setSearchQuery('');
        }
      }
    };

    document.addEventListener('openLoginModal', handleOpenLoginModal);
    document.addEventListener('openSearchModal', handleOpenSearchModal);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      document.removeEventListener('openLoginModal', handleOpenLoginModal);
      document.removeEventListener('openSearchModal', handleOpenSearchModal);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isSearchOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Лого */}
          <Link href="/" className="flex items-center">
            <img 
              src="/logo.png" 
              alt="Pixel Print" 
              className="h-10 w-auto"
            />
          </Link>

          {/* Navigation Menu */}
          <nav className="hidden lg:flex items-center">
            <button 
              onClick={() => scrollToArticles('about pixel digital')}
              className="text-sm font-medium text-zinc-700 hover:text-px-cyan transition-colors px-4 py-2"
            >
              {t('header.navigation.about')}
            </button>
            <div className="px-4 py-2">
              <MegaMenuPro />
            </div>
            <button 
              onClick={() => scrollToArticles('same-day express')}
              className="text-sm font-medium text-zinc-700 hover:text-px-cyan transition-colors px-4 py-2 -ml-[18px]"
            >
              {t('header.navigation.urgent')}
            </button>
            <button 
              onClick={() => scrollToArticles('frequently asked questions faq')}
              className="text-sm font-medium text-zinc-700 hover:text-px-cyan transition-colors px-4 py-2"
            >
              {t('header.navigation.faq')}
            </button>
            <a href="#footer" className="text-sm font-medium text-zinc-700 hover:text-px-cyan transition-colors px-4 py-2">
              {t('header.navigation.contacts')}
            </a>
          </nav>

          {/* Desktop mega-menu for smaller screens */}
          <div className="lg:hidden">
            <MegaMenuPro />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search Icon */}
            <button 
              data-search-button
              onClick={handleSearchToggle}
              className="hidden md:flex rounded-full p-2 text-zinc-600 hover:text-px-cyan hover:bg-px-cyan/10 transition-all duration-200 group"
              title={t('header.search')}
            >
              <Search className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </button>

            {/* Cart Icon */}
            <button 
              onClick={openCart}
              className="hidden sm:flex rounded-full p-2 text-zinc-600 hover:text-px-magenta hover:bg-px-magenta/10 transition-all duration-200 group relative"
              title={t('header.cart')}
            >
              <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />
              {/* Cart Badge */}
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-px-cyan text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* User Menu or Login Button */}
            {user ? (
              <UserMenu />
            ) : (
              <Button 
                variant="outline" 
                onClick={() => setIsLoginOpen(true)}
                className="hidden sm:flex border-zinc-300 text-zinc-700 hover:bg-zinc-50 rounded-full px-4 py-2"
              >
                <User className="mr-2 h-4 w-4" />
                {t('header.login')}
              </Button>
            )}

            {/* Call Now Button */}
            <Button asChild className="bg-gradient-to-r from-px-cyan to-px-magenta hover:from-px-cyan/90 hover:to-px-magenta/90 text-white rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-px-cyan focus:ring-offset-2">
              <Link href="/contact">
                <Phone className="mr-2 h-4 w-4" />
                {t('hero.callNow')}
              </Link>
            </Button>

            <MobileMenuSheet />
          </div>
        </div>

        {/* Search Bar - Slides in from right */}
        <div 
          data-search-panel
          className={`absolute top-0 right-0 h-14 bg-transparent backdrop-blur-sm border-b shadow-lg transition-all duration-500 ease-in-out z-[90] rounded-l-3xl md:rounded-l-3xl rounded-l-none ${
            isSearchOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          }`} 
          style={{ 
            width: isSearchOpen ? 'min(calc(100% - 200px), calc(100vw - 1rem))' : '0px'
          }}
        >
          <div className="h-full flex items-center px-6">
            <div className="flex items-center gap-4 w-full">
              <div className="flex-1">
                <SearchAutocomplete
                  placeholder={t('header.search')}
                  onClose={() => setIsSearchOpen(false)}
                />
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Modals */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={() => {
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
      />
      
      <RegisterModal 
        isOpen={isRegisterOpen} 
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={() => {
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        }}
      />
      
      <CommandPalette />
      
      {/* Cart Sidebar */}
      <CartProvider />
    </>
  );
}
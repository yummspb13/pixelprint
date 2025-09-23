"use client";

import { useState, useEffect, useRef } from 'react';
import { Search, X, Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SearchResult {
  id: number;
  name: string;
  slug: string;
  category: string;
  description?: string;
  image?: string;
}

interface SearchAutocompleteProps {
  placeholder?: string;
  className?: string;
  onClose?: () => void;
}

export default function SearchAutocomplete({ 
  placeholder = "Search services...", 
  className = "",
  onClose 
}: SearchAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [logTimeout, setLogTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Фокус на инпут при открытии
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Поиск с дебаунсом
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (query.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timeout = setTimeout(() => {
      performSearch(query);
    }, 300); // 300ms дебаунс

    setSearchTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [query]);

  // Логирование с дебаунсом 2 секунды
  useEffect(() => {
    if (logTimeout) {
      clearTimeout(logTimeout);
    }

    if (query.length >= 2) {
      const timeout = setTimeout(() => {
        logSearchQuery(query, results.length);
      }, 2000); // 2 секунды дебаунс для логирования

      setLogTimeout(timeout);
    }

    return () => {
      if (logTimeout) clearTimeout(logTimeout);
    };
  }, [query, results.length]); // Убираем logTimeout из зависимостей

  const performSearch = async (searchQuery: string) => {
    try {
      console.log('🔍 SEARCH: Performing search for:', searchQuery);
      
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (data.ok) {
        setResults(data.results || []);
        console.log('🔍 SEARCH: Found results:', data.results?.length || 0);
      } else {
        console.error('❌ SEARCH: Search failed:', data.error);
        setResults([]);
      }
    } catch (error) {
      console.error('❌ SEARCH: Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const logSearchQuery = async (searchQuery: string, resultsCount: number) => {
    try {
      console.log('📝 SEARCH LOG: Logging search query:', searchQuery);
      
      await fetch('/api/search/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          resultsCount: resultsCount,
          userAgent: navigator.userAgent,
          ip: '' // IP будет получен на сервере
        })
      });
      
      console.log('✅ SEARCH LOG: Search query logged successfully');
    } catch (error) {
      console.error('❌ SEARCH LOG: Failed to log search query:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length >= 2);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleResultClick(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setQuery('');
        break;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    console.log('🔍 SEARCH: User clicked on result:', result.name);
    router.push(`/services/${result.slug}`);
    setIsOpen(false);
    setQuery('');
    if (onClose) onClose();
  };

  const handleClose = () => {
    setIsOpen(false);
    setQuery('');
    if (onClose) onClose();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-px-cyan" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-2 h-10 border-2 border-px-cyan/20 focus:border-px-cyan focus:ring-px-cyan/20 rounded-full bg-white/80 text-base focus:outline-none"
        />
        {query && (
          <button
            onClick={handleClose}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div 
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border border-zinc-200 rounded-xl shadow-lg z-[100] max-h-96 overflow-y-auto"
        >
          {isLoading ? (
            <div className="p-4 text-center text-zinc-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-px-cyan mx-auto mb-2"></div>
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className={`w-full px-4 py-2 text-left hover:bg-zinc-50 transition-colors flex items-center space-x-3 ${
                    index === selectedIndex ? 'bg-px-cyan/10' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-px-fg truncate">
                      {result.name}
                    </div>
                    <div className="text-sm text-zinc-500 truncate">
                      {result.category}
                    </div>
                    {result.description && (
                      <div className="text-xs text-zinc-400 truncate mt-1">
                        {result.description}
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <Clock className="h-4 w-4 text-zinc-400" />
                  </div>
                </button>
              ))}
            </div>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-zinc-500">
              No services found for "{query}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

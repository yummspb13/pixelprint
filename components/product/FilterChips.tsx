'use client';

import { X } from 'lucide-react';

interface FilterChipsProps {
  selected: Set<string>;
  onChange: (selected: Set<string>) => void;
  availableTags: string[];
}

const tagLabels: Record<string, string> = {
  'fiction': 'Fiction',
  'non-fiction': 'Non-Fiction',
  'romance': 'Romance',
  'sci-fi': 'Sci-Fi',
  'new': 'New',
  'sale': 'Sale',
  'hardcover': 'Hardcover',
  'softcover': 'Softcover',
  'ebook': 'E-Book',
  'bestseller': 'Bestseller',
  'classic': 'Classic',
  'thriller': 'Thriller',
  'drama': 'Drama',
  'self-help': 'Self-Help',
  'productivity': 'Productivity',
  'finance': 'Finance',
  'psychology': 'Psychology',
  'history': 'History',
  'anthropology': 'Anthropology',
  'epic': 'Epic',
  'space': 'Space',
  'contemporary': 'Contemporary',
  'period': 'Period',
  'time-travel': 'Time Travel',
};

export function FilterChips({ selected, onChange, availableTags }: FilterChipsProps) {
  const toggleTag = (tag: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(tag)) {
      newSelected.delete(tag);
    } else {
      newSelected.add(tag);
    }
    onChange(newSelected);
  };

  const clearAll = () => {
    onChange(new Set());
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {availableTags.map((tag) => {
          const isSelected = selected.has(tag);
          return (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                isSelected
                  ? 'bg-px-cyan text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-pressed={isSelected}
              aria-label={`Filter by ${tagLabels[tag] || tag}`}
            >
              {tagLabels[tag] || tag}
              {isSelected && (
                <X className="h-3 w-3 ml-1" />
              )}
            </button>
          );
        })}
        
        {selected.size > 0 && (
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Clear all filters"
          >
            Clear all
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
      
      {selected.size > 0 && (
        <div className="text-sm text-gray-600">
          {selected.size} filter{selected.size !== 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
}

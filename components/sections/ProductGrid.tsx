'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calculator } from 'lucide-react';
import { FilterChips } from '@/components/product/FilterChips';
import { SearchInput } from '@/components/product/SearchInput';
import { CATEGORIES } from '@/lib/services';
import { ArrowRight } from 'lucide-react';

// Popular services data
const popularServices = [
  { name: "Business Cards", slug: "business-cards", path: "/services/business-cards", tags: ["stationery", "cards"] },
  { name: "Flyers", slug: "flyers", path: "/services/flyers", tags: ["advertising", "marketing"] },
  { name: "Posters", slug: "posters", path: "/services/posters", tags: ["advertising", "large-format"] },
  { name: "Letterheads", slug: "letterheads", path: "/services/letterheads", tags: ["stationery", "business"] },
  { name: "Photocopying", slug: "photocopying-bw", path: "/services/photocopying-bw", tags: ["copying", "documents"] },
  { name: "Laminating", slug: "laminating-a5-a1", path: "/services/laminating-a5-a1", tags: ["finishing", "protection"] },
  { name: "Binding", slug: "binding", path: "/services/binding", tags: ["finishing", "books"] },
  { name: "Menus", slug: "waterproof-menu", path: "/services/waterproof-menu", tags: ["restaurant", "menus"] },
];

export default function ProductGrid() {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Get all unique tags from services
  const availableTags = useMemo(() => {
    const allTags = popularServices.flatMap(service => service.tags);
    return Array.from(new Set(allTags)).sort();
  }, []);

  // Filter services based on selected tags and search query
  const filteredServices = useMemo(() => {
    return popularServices.filter(service => {
      // Filter by tags (AND logic - all selected tags must be present)
      const byTags = selectedTags.size === 0 || 
        Array.from(selectedTags).every(tag => service.tags.includes(tag));
      
      // Filter by search query
      const query = searchQuery.trim().toLowerCase();
      const byQuery = query === '' || 
        service.name.toLowerCase().includes(query);
      
      return byTags && byQuery;
    });
  }, [selectedTags, searchQuery]);

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div className="space-y-4">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-px-fg">
              Popular Services
            </h2>
            <p className="text-lg text-px-muted max-w-2xl">
              Our most requested printing services. Professional quality, competitive pricing, and fast turnaround times.
            </p>
          </div>
          <Button asChild variant="outline" className="mt-6 md:mt-0">
            <Link href="/services">
              View All Services
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="space-y-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search services..."
              />
            </div>
          </div>
          
          <FilterChips
            selected={selectedTags}
            onChange={setSelectedTags}
            availableTags={availableTags}
          />
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-sm text-px-muted">
            Found {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''}
            {selectedTags.size > 0 && ` matching ${selectedTags.size} filter${selectedTags.size !== 1 ? 's' : ''}`}
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        </div>

        {/* Services Grid */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredServices.map((service) => (
              <Card key={service.slug} className="group hover:shadow-lg transition-all duration-300 border-px-border hover:border-px-cyan/30">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-px-fg group-hover:text-px-cyan transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-sm text-px-muted line-clamp-2">
                      Professional printing service for your business needs.
                    </p>
                    <div className="flex items-center justify-between">
                      <Button asChild variant="outline" size="sm" className="hover:bg-px-cyan hover:text-white">
                        <Link href={`/services/${service.slug}`}>
                          <Calculator className="h-4 w-4 mr-2" />
                          Calculate
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="space-y-4">
              <div className="text-6xl">🔍</div>
              <h3 className="font-serif text-xl font-semibold text-px-fg">
                No services found
              </h3>
              <p className="text-px-muted max-w-md mx-auto">
                Try adjusting your search terms or filters to find what you&apos;re looking for.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTags(new Set());
                }}
                className="mt-4"
              >
                Clear all filters
              </Button>
            </div>
          </div>
        )}

        <div className="text-center mt-12">
          <Button asChild size="lg" className="bg-px-cyan hover:bg-px-cyan/90 text-white">
            <Link href="/services">
              Explore All Services
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

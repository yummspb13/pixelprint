'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator } from 'lucide-react';
import Link from 'next/link';
import { CATEGORIES } from '@/lib/services';

const featuredCategories = [
  { value: 'business-stationery', label: 'Business Stationery', count: 9 },
  { value: 'advertising', label: 'Advertising', count: 3 },
  { value: 'large-format', label: 'Large Format', count: 2 },
  { value: 'menu-printing', label: 'Menus', count: 5 },
];

export default function FeaturedTabs() {
  const [activeTab, setActiveTab] = useState('business-stationery');

  return (
    <section className="py-20 bg-px-bg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center space-y-4 mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-px-fg">
            Featured Categories
          </h2>
          <p className="text-lg text-px-muted max-w-2xl mx-auto">
            Explore our most popular printing services across different categories. 
            Professional quality, competitive pricing, and fast turnaround times.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
            {featuredCategories.map((category) => (
              <TabsTrigger
                key={category.value}
                value={category.value}
                className="data-[state=active]:bg-px-cyan data-[state=active]:text-white"
              >
                {category.label}
                <span className="ml-2 text-xs bg-px-muted/20 px-2 py-1 rounded-full">
                  {category.count}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {featuredCategories.map((category) => {
            const categoryData = CATEGORIES.find(cat => cat.key === category.value);
            return (
              <TabsContent key={category.value} value={category.value} className="mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {categoryData?.items.slice(0, 4).map((service) => (
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
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </section>
  );
}

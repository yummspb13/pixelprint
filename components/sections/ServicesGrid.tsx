'use client';

import { CATEGORIES } from '@/lib/services';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import SmartHover from '@/components/ux/SmartHover';

export default function ServicesGrid() {
  return (
    <section className="py-20 bg-px-bg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight font-playfair">
            <span className="text-px-fg">Our </span>
            <span className="bg-gradient-to-r from-px-cyan via-px-magenta to-px-yellow bg-clip-text text-transparent animate-gradient">
              Services
            </span>
          </h2>
          <p className="text-lg text-px-muted max-w-2xl mx-auto">
            Professional printing solutions for every business need. 
            From business stationery to large format printing.
          </p>
        </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {CATEGORIES.map((category) => {
                const Icon = category.icon;
                return (
                  <SmartHover key={category.key} className="group">
                    <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                      {/* Gradient background on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-px-cyan/5 via-px-magenta/5 to-px-yellow/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      
                      {/* Content */}
                      <div className="relative z-10 h-full flex flex-col">
                        {/* Icon and title */}
                        <div className="mb-4">
                          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-px-cyan to-px-magenta text-white mb-3">
                            <Icon className="h-6 w-6" />
                          </div>
                          <h3 className="font-playfair text-xl font-semibold text-px-fg mb-2">
                            {category.label}
                          </h3>
                          <p className="text-sm text-px-muted">
                            {category.items.length} service{category.items.length !== 1 ? 's' : ''} available
                          </p>
                        </div>
                        
                        {/* Services list */}
                        <div className="space-y-2 mb-6 flex-1">
                          {category.items.slice(0, 3).map((item) => (
                            <div key={item.slug} className="flex items-center justify-between text-sm py-1">
                              <span className="text-px-fg font-medium">{item.name}</span>
                              {item.calc && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-px-cyan/10 text-px-cyan">
                                  <Calculator className="h-3 w-3 mr-1" />
                                  Calc
                                </span>
                              )}
                            </div>
                          ))}
                          {category.items.length > 3 && (
                            <div className="text-xs text-px-muted font-medium pt-2 border-t border-zinc-100">
                              +{category.items.length - 3} more services
                            </div>
                          )}
                        </div>
                        
                        {/* CTA Buttons */}
                        <div className="flex gap-2 mt-auto">
                          <Button asChild className="flex-1 bg-gradient-to-r from-px-cyan to-px-magenta hover:from-px-cyan/90 hover:to-px-magenta/90 text-white transition-all duration-300 group-hover:shadow-lg">
                            <Link href={category.path}>
                              View All
                              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                          </Button>
                          {category.items.some(item => item.calc) && (
                            <Button asChild variant="outline" className="border-px-magenta text-px-magenta hover:bg-px-magenta hover:text-white transition-all duration-300">
                              <Link href="/calculate">
                                <Calculator className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </SmartHover>
                );
              })}
            </div>
      </div>
    </section>
  );
}

"use client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Menu, Search, ShoppingCart, User, Phone } from "lucide-react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/services";
import { useCart } from "@/contexts/CartContext";

export default function MobileMenuSheet() {
  const { openCart, totalItems } = useCart() || { openCart: () => {}, totalItems: 0 };
  
  return (
    <Sheet>
      <SheetTrigger className="md:hidden rounded-full p-2 text-zinc-600 hover:text-px-cyan hover:bg-px-cyan/10 transition-all duration-200">
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-[86vw] sm:w-[420px]">
        <SheetHeader>
          <SheetTitle className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded bg-gradient-to-r from-px-cyan to-px-magenta" />
            <span>Pixel Print</span>
          </SheetTitle>
        </SheetHeader>
        
        {/* Mobile Actions */}
        <div className="mt-6 space-y-3">
          <button 
            onClick={() => {
              // This will be handled by the parent component
              document.dispatchEvent(new CustomEvent('openSearchModal'));
            }}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-zinc-50 transition-colors w-full text-left"
          >
            <div className="p-2 bg-px-cyan/10 rounded-full">
              <Search className="h-5 w-5 text-px-cyan" />
            </div>
            <span className="font-medium">Search</span>
          </button>
          
          <button 
            onClick={openCart}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-zinc-50 transition-colors w-full text-left"
          >
            <div className="p-2 bg-px-magenta/10 rounded-full">
              <ShoppingCart className="h-5 w-5 text-px-magenta" />
            </div>
            <span className="font-medium">Shopping Cart</span>
            {totalItems > 0 && (
              <span className="ml-auto bg-px-cyan text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                {totalItems}
              </span>
            )}
          </button>
          
          <button 
            onClick={() => {
              // This will be handled by the parent component
              document.dispatchEvent(new CustomEvent('openLoginModal'));
            }}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-zinc-50 transition-colors w-full text-left"
          >
            <div className="p-2 bg-px-yellow/10 rounded-full">
              <User className="h-5 w-5 text-px-yellow" />
            </div>
            <span className="font-medium">Login</span>
          </button>
          
          <Link 
            href="/contact" 
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-zinc-50 transition-colors"
          >
            <div className="p-2 bg-px-cyan/10 rounded-full">
              <Phone className="h-5 w-5 text-px-cyan" />
            </div>
            <span className="font-medium">Call Now</span>
          </Link>
        </div>

        <div className="mt-8">
          <h3 className="font-semibold text-px-fg mb-4">Services</h3>
          <Accordion type="single" collapsible>
            {CATEGORIES.map(c => (
              <AccordionItem key={c.key} value={c.key}>
                <AccordionTrigger className="text-left">{c.label}</AccordionTrigger>
                <AccordionContent>
                  <nav className="grid">
                    {c.items.map(it => (
                      <Link key={it.path} href={it.path} className="rounded px-2 py-1.5 text-sm hover:bg-zinc-50">{it.name}</Link>
                    ))}
                  </nav>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </SheetContent>
    </Sheet>
  );
}

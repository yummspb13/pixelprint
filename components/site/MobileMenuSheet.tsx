"use client";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Menu, Search, ShoppingCart, User, Phone, Package, History, LogOut, ChevronDown, X } from "lucide-react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/services";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import SearchAutocomplete from "@/components/search/SearchAutocomplete";

export default function MobileMenuSheet() {
  const { openCart, totalItems } = useCart() || { openCart: () => {}, totalItems: 0 };
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  return (
    <Sheet>
      <SheetTrigger className="md:hidden rounded-full p-2 text-zinc-600 hover:text-px-cyan hover:bg-px-cyan/10 transition-all duration-200">
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-[85vw] max-w-[380px] flex flex-col">
        <SheetHeader className="flex-shrink-0 px-4 pt-6 pb-4">
          <SheetTitle className="flex items-center">
            <img 
              src="/logo.png" 
              alt="Pixel Print" 
              className="h-6 w-auto"
            />
          </SheetTitle>
        </SheetHeader>
        
        {/* Compact Mobile Actions - Top Row */}
        <div className="flex-shrink-0 px-4 mb-6">
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            {/* Search */}
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-px-cyan/10 hover:bg-px-cyan/20 transition-colors"
              title="Search"
            >
              <Search className="h-4 w-4 sm:h-5 sm:w-5 text-px-cyan" />
            </button>
            
            {/* Cart */}
            <button 
              onClick={openCart}
              className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-px-magenta/10 hover:bg-px-magenta/20 transition-colors"
              title="Shopping Cart"
            >
              <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-px-magenta" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-px-cyan text-white text-xs rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-medium">
                  {totalItems}
                </span>
              )}
            </button>
            
            {/* User/Login */}
            {user ? (
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-px-cyan to-px-magenta flex items-center justify-center hover:scale-105 transition-transform"
                title="User Menu"
              >
                <span className="text-white font-bold text-xs sm:text-sm">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </span>
              </button>
            ) : (
              <button 
                onClick={() => {
                  document.dispatchEvent(new CustomEvent('openLoginModal'));
                }}
                className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-px-yellow/10 hover:bg-px-yellow/20 transition-colors"
                title="Login"
              >
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-px-yellow" />
              </button>
            )}
            
            {/* Call Now */}
            <Link 
              href="/contact" 
              className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-px-cyan/10 hover:bg-px-cyan/20 transition-colors"
              title="Call Now"
            >
              <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-px-cyan" />
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="flex-shrink-0 mb-4 mx-4 bg-zinc-50 rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-2">
              <Search className="h-4 w-4 text-px-cyan" />
              <span className="text-sm font-medium text-px-fg">Search Services</span>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="ml-auto p-1 hover:bg-zinc-200 rounded transition-colors"
                title="Close search"
              >
                <X className="h-4 w-4 text-zinc-500" />
              </button>
            </div>
            <SearchAutocomplete
              placeholder="Search services or calculators..."
              onClose={() => setIsSearchOpen(false)}
              className="w-full"
            />
          </div>
        )}

        {/* Mobile User Menu */}
        {user && isUserMenuOpen && (
          <div className="flex-shrink-0 mb-4 mx-4 bg-zinc-50 rounded-lg p-3 sm:p-4">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-px-cyan to-px-magenta flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-px-fg text-sm sm:text-base truncate">{user.name}</p>
                <p className="text-xs sm:text-sm text-px-muted truncate">{user.email}</p>
                {user.role === 'admin' && (
                  <span className="inline-block mt-1 px-2 py-1 text-xs bg-px-cyan text-white rounded-full">
                    Admin
                  </span>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Link
                href="/dashboard/profile"
                className="flex items-center space-x-3 px-3 py-2 text-sm text-zinc-700 hover:bg-white rounded-lg transition-colors"
              >
                <User className="h-4 w-4 text-px-cyan" />
                <span>Profile</span>
              </Link>
              
              <Link
                href="/dashboard/orders"
                className="flex items-center space-x-3 px-3 py-2 text-sm text-zinc-700 hover:bg-white rounded-lg transition-colors"
              >
                <Package className="h-4 w-4 text-px-magenta" />
                <span>Orders</span>
              </Link>
              
              <Link
                href="/dashboard/orders"
                className="flex items-center space-x-3 px-3 py-2 text-sm text-zinc-700 hover:bg-white rounded-lg transition-colors"
              >
                <History className="h-4 w-4 text-px-yellow" />
                <span>Order History</span>
              </Link>
              
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  className="flex items-center space-x-3 px-3 py-2 text-sm text-zinc-700 hover:bg-white rounded-lg transition-colors"
                >
                  <div className="h-4 w-4 bg-gradient-to-r from-px-cyan to-px-magenta rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">A</span>
                  </div>
                  <span>Admin Panel</span>
                </Link>
              )}
              
              <button
                onClick={() => {
                  logout();
                  setIsUserMenuOpen(false);
                }}
                className="flex items-center space-x-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full text-left"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Services Section */}
        <div className="flex-1 overflow-y-auto -mt-1 px-4 pb-6">
          <h3 className="font-semibold text-px-fg mb-3 sm:mb-4 text-sm sm:text-base">Services</h3>
          <Accordion type="single" collapsible>
            {CATEGORIES.map(c => (
              <AccordionItem key={c.key} value={c.key}>
                <AccordionTrigger className="text-left text-sm sm:text-base py-2 sm:py-3">{c.label}</AccordionTrigger>
                <AccordionContent>
                  <nav className="grid">
                    {c.items.map(it => (
                      <Link key={it.path} href={it.path} className="rounded px-3 py-2 text-xs sm:text-sm hover:bg-zinc-50">{it.name}</Link>
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

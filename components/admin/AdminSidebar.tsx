"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  DollarSign, 
  Mail, 
  BarChart3, 
  Settings,
  Users,
  FileText,
  Printer,
  Menu,
  X,
  LogOut,
  BookOpen,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "./AuthProvider";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { name: "Pricing", href: "/admin/pricing", icon: DollarSign },
  { name: "Services", href: "/admin/configurator", icon: Printer },
  { name: "Menu", href: "/admin/menu", icon: Menu },
  { name: "Articles", href: "/admin/articles", icon: BookOpen },
  { name: "Search Analytics", href: "/admin/search", icon: Search },
  { name: "Mail (soon)", href: "/admin/mail", icon: Mail, comingSoon: true },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Invoice Settings", href: "/admin/invoice-settings", icon: FileText },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden fixed top-16 left-4 z-50 bg-white shadow-lg border border-gray-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 w-72 sm:w-80 lg:w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img 
              src="/logo.png" 
              alt="Pixel Print" 
              className="h-8 w-auto"
            />
            <div>
              <p className="text-sm text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const isComingSoon = item.comingSoon;
            
            return (
              <Link
                key={item.name}
                href={isComingSoon ? "#" : item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-gradient-to-r from-px-cyan to-px-magenta text-white"
                    : isComingSoon
                    ? "text-gray-500 opacity-50 cursor-not-allowed"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
                onClick={(e) => {
                  if (isComingSoon) {
                    e.preventDefault();
                    return;
                  }
                  setIsOpen(false);
                }}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
                {isComingSoon && (
                  <span className="ml-auto text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    Soon
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-px-cyan to-px-magenta flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{user?.name || 'Пользователь'}</p>
              <p className="text-xs text-gray-500">{user?.email || 'user@pixelprint.com'}</p>
            </div>
          </div>
          <Button
            onClick={logout}
            variant="outline"
            size="sm"
            className="w-full justify-start text-gray-600 hover:text-gray-900"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Выйти
          </Button>
        </div>
      </div>
    </>
  );
}
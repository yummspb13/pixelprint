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
  BookOpen
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
        className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-lg"
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
        fixed lg:relative inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded bg-gradient-to-r from-px-cyan via-px-magenta to-px-yellow flex items-center justify-center">
              <Printer className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-px-fg">Pixel Print</h1>
              <p className="text-sm text-px-muted">Admin Panel</p>
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
                    ? "text-px-muted opacity-50 cursor-not-allowed"
                    : "text-px-muted hover:bg-gray-100 hover:text-px-fg"
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
              <p className="text-sm font-medium text-px-fg">{user?.name || 'Пользователь'}</p>
              <p className="text-xs text-px-muted">{user?.email || 'user@pixelprint.com'}</p>
            </div>
          </div>
          <Button
            onClick={logout}
            variant="outline"
            size="sm"
            className="w-full justify-start text-px-muted hover:text-px-fg"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Выйти
          </Button>
        </div>
      </div>
    </>
  );
}
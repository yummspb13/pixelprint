"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { User, Package, History, LogOut, ChevronDown } from 'lucide-react';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      {/* User Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 rounded-full p-2 text-zinc-600 hover:text-px-cyan hover:bg-px-cyan/10 transition-all duration-200 group"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-px-cyan to-px-magenta rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">
            {user.name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>
        <span className="hidden lg:inline font-medium text-px-fg">
          Hi, {user.name.split(' ')[0]}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-zinc-200 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-zinc-100">
            <p className="font-medium text-px-fg">{user.name}</p>
            <p className="text-sm text-px-muted">{user.email}</p>
            {user.role === 'admin' && (
              <span className="inline-block mt-1 px-2 py-1 text-xs bg-px-cyan text-white rounded-full">
                Admin
              </span>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              href="/dashboard/profile"
              className="flex items-center space-x-3 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <User className="h-4 w-4 text-px-cyan" />
              <span>Profile</span>
            </Link>

            <Link
              href="/dashboard/orders"
              className="flex items-center space-x-3 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Package className="h-4 w-4 text-px-magenta" />
              <span>Orders</span>
            </Link>

            <Link
              href="/dashboard/orders"
              className="flex items-center space-x-3 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <History className="h-4 w-4 text-px-yellow" />
              <span>Order History</span>
            </Link>

            {user.role === 'admin' && (
              <Link
                href="/admin"
                className="flex items-center space-x-3 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <div className="h-4 w-4 bg-gradient-to-r from-px-cyan to-px-magenta rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">A</span>
                </div>
                <span>Admin Panel</span>
              </Link>
            )}
          </div>

          {/* Logout */}
          <div className="border-t border-zinc-100 pt-2">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

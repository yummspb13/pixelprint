"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount (only on client)
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("🔐 AUTH CONTEXT LOGIN:", { email, password: "***" });
      
      // Check if this is an admin login
      if (email === 'admin@pixelprint.com' || email === 'user@pixelprint.com') {
        console.log("🔐 AUTH CONTEXT: Admin login detected, using admin API");
        
        // Use admin API for admin users
        const response = await fetch('/api/admin/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        console.log("🔐 AUTH CONTEXT: Admin API response status:", response.status);
        const data = await response.json();
        console.log("🔐 AUTH CONTEXT: Admin API response data:", data);

        if (response.ok && data.success) {
          console.log("✅ AUTH CONTEXT: Admin login successful");
          const adminUser: User = {
            id: '1',
            name: data.user.name,
            email: data.user.email,
            role: data.user.role as 'admin' | 'user'
          };
          setUser(adminUser);
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(adminUser));
          }
          return true;
        } else {
          console.log("❌ AUTH CONTEXT: Admin login failed");
          return false;
        }
      } else {
        console.log("🔐 AUTH CONTEXT: Regular user login");
        
        // For regular users, use localStorage (demo mode)
        const newUser: User = {
          id: Date.now().toString(),
          name: email.split('@')[0],
          email: email,
          role: 'user'
        };
        setUser(newUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(newUser));
        }
        return true;
      }
    } catch (error) {
      console.error('💥 AUTH CONTEXT LOGIN ERROR:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: Date.now().toString(),
        name: name,
        email: email,
        role: 'user'
      };
      
      setUser(newUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(newUser));
      }
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async () => {
    console.log("🗑️ AUTH CONTEXT LOGOUT: Starting...");
    
    // If user is admin, use admin API to logout
    if (user?.role === 'admin') {
      try {
        console.log("🗑️ AUTH CONTEXT: Admin logout, calling admin API");
        await fetch('/api/admin/auth', {
          method: 'DELETE',
        });
        console.log("✅ AUTH CONTEXT: Admin logout successful");
      } catch (error) {
        console.error("💥 AUTH CONTEXT LOGOUT ERROR:", error);
      }
    }
    
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

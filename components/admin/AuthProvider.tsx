"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface User {
  email: string;
  role: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    console.log("🔍 AUTH CHECK: Starting...");
    
    // Если мы на странице логина, не проверяем аутентификацию
    if (typeof window !== 'undefined' && window.location.pathname === '/admin/login') {
      console.log("🔍 AUTH CHECK: On login page, skipping auth check");
      setIsLoading(false);
      return;
    }
    
    try {
      // Добавляем timeout и обработку ошибок
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 секунд timeout
      
      const response = await fetch('/api/admin/auth', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        signal: controller.signal,
        redirect: 'manual' // Предотвращаем автоматические редиректы
      });
      
      clearTimeout(timeoutId);
      console.log("🔍 AUTH CHECK: Response status:", response.status);
      
      if (response.status === 200) {
        const data = await response.json();
        console.log("🔍 AUTH CHECK: Response data:", data);
        
        if (data.authenticated) {
          console.log("✅ AUTH CHECK: User authenticated:", data.user);
          setUser(data.user);
        } else {
          console.log("❌ AUTH CHECK: User not authenticated");
          setUser(null);
        }
      } else if (response.status === 0 || response.type === 'opaqueredirect') {
        // Это означает редирект - пользователь не авторизован
        console.log("🔄 AUTH CHECK: Redirect detected, user not authenticated");
        setUser(null);
      } else {
        console.log("❌ AUTH CHECK: Auth check failed with status:", response.status);
        setUser(null);
      }
    } catch (error) {
      console.error("💥 AUTH CHECK ERROR:", error);
      // Если это ошибка сети, не сбрасываем пользователя сразу
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.log("🌐 AUTH CHECK: Network error, keeping current state");
        // Не меняем состояние пользователя при сетевых ошибках
      } else {
        setUser(null);
      }
    } finally {
      console.log("🔍 AUTH CHECK: Setting isLoading to false");
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log("🔐 AUTH PROVIDER LOGIN:", { email, password: "***" });
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Важно для cookies
        body: JSON.stringify({ email, password }),
      });

      console.log("🔐 AUTH PROVIDER: Response status:", response.status);
      const data = await response.json();
      console.log("🔐 AUTH PROVIDER: Response data:", data);

      if (response.ok && data.success) {
        console.log("✅ AUTH PROVIDER: Login successful, setting user:", data.user);
        setUser(data.user);
        return true;
      }
      console.log("❌ AUTH PROVIDER: Login failed");
      return false;
    } catch (error) {
      console.error("💥 AUTH PROVIDER LOGIN ERROR:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/admin/auth', {
        method: 'DELETE',
        credentials: 'include', // Важно для cookies
      });
      setUser(null);
      // Убираем редирект - пусть middleware обработает
    } catch (error) {
      console.error("Logout error:", error);
      // Даже если logout не удался, сбрасываем пользователя локально
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, checkAuth }}>
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

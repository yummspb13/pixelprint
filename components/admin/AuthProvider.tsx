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
    try {
      const response = await fetch('/api/admin/auth');
      console.log("🔍 AUTH CHECK: Response status:", response.status);
      
      const data = await response.json();
      console.log("🔍 AUTH CHECK: Response data:", data);
      
      if (data.authenticated) {
        console.log("✅ AUTH CHECK: User authenticated:", data.user);
        setUser(data.user);
      } else {
        console.log("❌ AUTH CHECK: User not authenticated");
        setUser(null);
      }
    } catch (error) {
      console.error("💥 AUTH CHECK ERROR:", error);
      setUser(null);
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
      });
      setUser(null);
      router.push('/admin/login');
    } catch (error) {
      console.error("Logout error:", error);
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

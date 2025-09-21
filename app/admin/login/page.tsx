"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Lock, User, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log("🔐 LOGIN ATTEMPT:", { email, password: "***" });

    try {
      console.log("📡 Sending request to /api/admin/auth");
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log("📡 Response status:", response.status);
      console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log("📡 Response data:", data);

      if (response.ok && data.success) {
        console.log("✅ LOGIN SUCCESS:", data.user);
        toast.success(`Добро пожаловать, ${data.user.name}!`);
        // Перенаправляем без ключа
        console.log("🔄 Redirecting to /admin/orders/");
        router.push("/admin/orders/");
      } else {
        console.log("❌ LOGIN FAILED:", data.error);
        toast.error(data.error || "Неверные учетные данные");
      }
    } catch (error) {
      console.error("💥 LOGIN ERROR:", error);
      toast.error("Ошибка входа");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-px-bg via-zinc-50 to-px-bg flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-px-cyan to-px-magenta rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-px-fg">
            Админ Панель
          </CardTitle>
          <p className="text-px-muted">
            Войдите в систему управления
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-px-muted" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@pixelprint.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-px-muted" />
                <Input
                  id="password"
                  type="password"
                  placeholder="admin123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-px-cyan to-px-magenta hover:from-px-cyan/90 hover:to-px-magenta/90 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                "Вход..."
              ) : (
                <>
                  Войти в админ панель
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-px-cyan/10 rounded-lg">
            <p className="text-sm text-px-muted text-center">
              <strong>Тестовые данные:</strong><br />
              <strong>Админ:</strong> <code className="bg-white px-2 py-1 rounded">admin@pixelprint.com</code> / <code className="bg-white px-2 py-1 rounded">admin123</code><br />
              <strong>Пользователь:</strong> <code className="bg-white px-2 py-1 rounded">user@pixelprint.com</code> / <code className="bg-white px-2 py-1 rounded">user123</code>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}

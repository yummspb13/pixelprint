"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SessionProvider } from "@/components/providers/SessionProvider";
import BackgroundFX from "@/components/fx/BackgroundFX";
import ScrollProgress from "@/components/ux/ScrollProgress";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <ScrollProgress />
            <BackgroundFX />
            {children}
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </SessionProvider>
  );
}

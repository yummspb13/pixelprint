import type { Metadata } from "next";
import { Manrope, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import ClientProviders from "@/components/ClientProviders";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pixel Print - London Typography",
  description: "Professional printing services in London. Business stationery, large format, digital printing, and finishing services.",
  metadataBase: new URL('http://localhost:3010'),
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: '/favicon-48x48.png',
  },
  alternates: {
    canonical: '/',
    languages: {
      'en-GB': '/',
      'es-ES': '/?lang=es',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'http://localhost:3010',
    siteName: 'Pixel Print',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${inter.variable} ${playfair.variable} font-sans antialiased bg-px-bg text-px-fg`}
      >
        <ClientProviders>
          <div className="relative z-10">{children}</div>
          <Toaster richColors position="top-right" />
        </ClientProviders>
      </body>
    </html>
  );
}

"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTextSize } from '@/lib/languageStyles';

export default function Footer() {
  const { t, language } = useLanguage();
  
  return (
    <footer id="footer" className="bg-px-fg text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded bg-gradient-to-r from-px-cyan to-px-magenta" />
              <span className="font-heading text-xl font-bold">Pixel Print</span>
            </div>
            <p className={`${getTextSize(language, 'small')} text-gray-300`}>
              {t('footer.description')}
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t('footer.services')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/services/a3-document-scanning" className="text-gray-300 hover:text-white transition-colors">
                  A3 Document Scanning
                </Link>
              </li>
              <li>
                <Link href="/services/business-card-printing" className="text-gray-300 hover:text-white transition-colors">
                  Business Card Printing
                </Link>
              </li>
              <li>
                <Link href="/services/business-stationery" className="text-gray-300 hover:text-white transition-colors">
                  Business Stationery
                </Link>
              </li>
              <li>
                <Link href="/services/advertising" className="text-gray-300 hover:text-white transition-colors">
                  Advertising
                </Link>
              </li>
              <li>
                <Link href="/services/large-format" className="text-gray-300 hover:text-white transition-colors">
                  Large Format
                </Link>
              </li>
              <li>
                <Link href="/services/menu-printing" className="text-gray-300 hover:text-white transition-colors">
                  Menu Printing
                </Link>
              </li>
              <li>
                <Link href="/services/events-printing" className="text-gray-300 hover:text-white transition-colors">
                  Events Printing
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.aboutUs')}
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.pricing')}
                </Link>
              </li>
              <li>
                <Link href="/calculate" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.calculateQuote')}
                </Link>
              </li>
              <li>
                <Link href="/upload" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.uploadArtwork')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t('footer.contact')}</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-px-cyan" />
                <span>123 Print Street, London EC1A 4HD</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-px-cyan" />
                <span>+44 20 7123 4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-px-cyan" />
                <span>hello@pixelprint.london</span>
              </div>
            </div>
            <div className="pt-4">
              <Button asChild className="w-full bg-px-cyan hover:bg-px-cyan/90 text-white">
                <Link href="/calculate">
                  {t('footer.getQuote')}
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-gray-700" />
        
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-gray-400">
            {t('footer.copyright')}
          </p>
          <div className="flex space-x-6 text-sm">
            <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
              {t('footer.privacyPolicy')}
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
              {t('footer.termsOfService')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
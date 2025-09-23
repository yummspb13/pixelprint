'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getTextSize } from '@/lib/languageStyles';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const { t, language } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error(t('contact.fillRequiredFields'));
      return;
    }

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(t('contact.thankYouMessage'));
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    }
  };

  return (
    <section className="py-20 bg-px-bg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h2 className={`font-playfair ${getTextSize(language, 'sectionTitle')} font-bold text-px-fg mb-4`}>
                {t('contact.title')}
              </h2>
              <p className={`${getTextSize(language, 'description')} text-px-muted`}>
                {t('contact.subtitle')}
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-px-cyan text-white">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-px-fg">{t('contact.phone')}</h3>
                  <p className="text-px-muted">+44 20 7123 4567</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-px-magenta text-white">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-px-fg">{t('contact.email')}</h3>
                  <p className="text-px-muted">hello@pixelprint.london</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-px-yellow text-white">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-px-fg">{t('contact.address')}</h3>
                  <p className="text-px-muted">123 Print Street, London EC1A 4HD</p>
                </div>
              </div>
            </div>

            <Card className="bg-gradient-to-r from-px-cyan to-px-magenta text-white">
              <CardContent className="p-6">
                <h3 className="font-playfair text-xl font-bold mb-2">
                  {t('hero.quickQuote')}
                </h3>
                <p className="text-cyan-100 mb-4">
                  {t('contact.quickQuoteDescription')}
                </p>
                <Button asChild className="bg-white text-px-cyan hover:bg-white/90">
                  <a href="/calculate">
                    {t('contact.calculateNow')}
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card>
            <CardContent className="p-6">
              <h3 className={`font-playfair ${getTextSize(language, 'categoryTitle')} font-bold text-px-fg mb-6`}>
                {t('contact.sendMessage')}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-px-fg mb-2">
                      {t('contact.name')} *
                    </label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="border-zinc-300 focus:border-px-cyan focus:ring-px-cyan"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-px-fg mb-2">
                      {t('contact.email')} *
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="border-zinc-300 focus:border-px-cyan focus:ring-px-cyan"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-px-fg mb-2">
                    {t('contact.phone')}
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="border-zinc-300 focus:border-px-cyan focus:ring-px-cyan"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-px-fg mb-2">
                    {t('contact.message')} *
                  </label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="border-zinc-300 focus:border-px-cyan focus:ring-px-cyan min-h-[120px]"
                    placeholder={t('contact.messagePlaceholder')}
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-px-cyan hover:bg-px-cyan/90 text-white">
                  <Send className="mr-2 h-4 w-4" />
                  {t('contact.sendMessage')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

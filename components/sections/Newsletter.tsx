'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Mail, Send } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Thank you for subscribing! Check your email for confirmation.');
    setEmail('');
    setIsLoading(false);
  };

  return (
    <section className="py-20 bg-gradient-to-r from-px-cyan to-px-magenta">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 text-white mb-4">
            <Mail className="h-8 w-8" />
          </div>
          
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white">
            Get Print Deals & Updates
          </h2>
          
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Get print deals, templates and deadlines delivered straight to your inbox. 
            Stay updated with our latest offers and printing tips.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:bg-white/20"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-white text-px-cyan hover:bg-white/90 font-medium"
            >
              {isLoading ? (
                'Subscribing...'
              ) : (
                <>
                  Subscribe
                  <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-sm text-white/70">
            No spam, unsubscribe at any time. We respect your privacy.
          </p>
        </div>
      </div>
    </section>
  );
}

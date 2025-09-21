import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Gift } from 'lucide-react';

export default function PromoBanners() {
  return (
    <section className="py-20 bg-px-bg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Banner 1 */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-px-cyan to-px-cyan/80 p-8 text-white">
            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-4">
                <Clock className="h-5 w-5" />
                <span className="text-sm font-medium">Limited Time</span>
              </div>
              <h3 className="font-serif text-2xl md:text-3xl font-bold mb-4">
                50% Off First Design
              </h3>
              <p className="text-cyan-100 mb-6 max-w-md">
                New to our services? Get your first book cover design at half price. 
                Perfect for indie authors and first-time publishers.
              </p>
              <Button asChild variant="secondary" className="bg-white text-px-cyan hover:bg-gray-100">
                <Link href="/calculate">
                  Claim Offer
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
          </div>

          {/* Banner 2 */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-px-magenta to-px-magenta/80 p-8 text-white">
            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-4">
                <Gift className="h-5 w-5" />
                <span className="text-sm font-medium">Special Package</span>
              </div>
              <h3 className="font-serif text-2xl md:text-3xl font-bold mb-4">
                Complete Publishing Kit
              </h3>
              <p className="text-magenta-100 mb-6 max-w-md">
                Get book cover, back cover, spine design, and marketing materials in one package. 
                Everything you need to launch your book successfully.
              </p>
              <Button asChild variant="secondary" className="bg-white text-px-magenta hover:bg-gray-100">
                <Link href="/packages">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
            <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/10 rounded-full translate-y-14 -translate-x-14"></div>
          </div>
        </div>

        {/* Banner 3 - Full Width */}
        <div className="mt-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-px-yellow to-px-yellow/80 p-8 text-px-fg">
          <div className="relative z-10 text-center">
            <h3 className="font-serif text-2xl md:text-3xl font-bold mb-4">
              Ready to Bring Your Story to Life?
            </h3>
            <p className="text-px-fg/80 mb-6 max-w-2xl mx-auto">
              Join hundreds of successful authors who trust us with their book cover designs. 
              Start your journey today with a free consultation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-px-fg text-white hover:bg-px-fg/90">
                <Link href="/calculate">
                  Get Free Quote
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-px-fg text-px-fg hover:bg-px-fg hover:text-white">
                <Link href="/contact">
                  Schedule Consultation
                </Link>
              </Button>
            </div>
          </div>
          <div className="absolute top-0 left-0 w-48 h-48 bg-white/20 rounded-full -translate-y-24 -translate-x-24"></div>
          <div className="absolute bottom-0 right-0 w-36 h-36 bg-white/20 rounded-full translate-y-18 translate-x-18"></div>
        </div>
      </div>
    </section>
  );
}

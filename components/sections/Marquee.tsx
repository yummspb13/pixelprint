'use client';

import { ShieldCheck, Truck, MapPinned, Award, Clock, Star } from 'lucide-react';

const marqueeItems = [
  { icon: ShieldCheck, text: "Secure & Trusted" },
  { icon: Truck, text: "Fast Delivery" },
  { icon: MapPinned, text: "Global Shipping" },
  { icon: Award, text: "Award Winning" },
  { icon: Clock, text: "24h Turnaround" },
  { icon: Star, text: "5-Star Rated" },
  { icon: ShieldCheck, text: "Quality Guaranteed" },
  { icon: Truck, text: "Free Shipping" },
];

export default function Marquee() {
  return (
    <section className="py-8 bg-neutral-50 border-y border-neutral-200">
      <div className="relative overflow-hidden">
        <div className="marquee-track flex">
          {/* First set of items */}
          <div className="flex items-center space-x-8 whitespace-nowrap">
            {marqueeItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={`first-${index}`} className="flex items-center space-x-2 text-neutral-600">
                  <Icon className="h-5 w-5 text-px-cyan" />
                  <span className="font-medium text-sm">{item.text}</span>
                </div>
              );
            })}
          </div>
          
          {/* Second set of items (for seamless loop) */}
          <div className="flex items-center space-x-8 whitespace-nowrap ml-8">
            {marqueeItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={`second-${index}`} className="flex items-center space-x-2 text-neutral-600">
                  <Icon className="h-5 w-5 text-px-cyan" />
                  <span className="font-medium text-sm">{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .marquee-track {
          animation: marquee 36s linear infinite;
        }
        
        .marquee-track:hover {
          animation-play-state: paused;
        }
        
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .marquee-track {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}

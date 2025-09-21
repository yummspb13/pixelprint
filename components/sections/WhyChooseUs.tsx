import { CheckCircle2, Clock, Package, Lock, Award, Users } from 'lucide-react';
import Metric from '@/components/ux/Metric';

const benefits = [
  {
    icon: CheckCircle2,
    title: 'Preflight Check',
    description: 'Our experts review your files before printing to ensure perfect results every time.',
  },
  {
    icon: Clock,
    title: 'Same-Day Turnaround',
    description: 'Need it fast? Many services offer same-day printing and pickup options.',
  },
  {
    icon: Package,
    title: 'Easy Pickup & Courier',
    description: 'Collect your order at our shop or opt for convenient courier delivery.',
  },
  {
    icon: Lock,
    title: 'Secure Checkout',
    description: 'Your transactions are protected with industry-leading encryption and payment security.',
  },
  {
    icon: Award,
    title: 'Award Winning Quality',
    description: 'Recognized for excellence in printing and customer service across London.',
  },
  {
    icon: Users,
    title: 'Expert Team',
    description: 'Professional designers and print specialists with years of experience.',
  },
];

const stats = [
  { number: "500+", label: "Happy Clients" },
  { number: "24h", label: "Average Turnaround" },
  { number: "4.9/5", label: "Customer Rating" },
  { number: "100%", label: "Satisfaction Guarantee" },
];

export default function WhyChooseUs() {
  return (
    <section className="py-20 bg-zinc-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center space-y-4 mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-px-fg">
            Why Choose Pixel Print?
          </h2>
          <p className="text-lg text-px-muted max-w-2xl mx-auto">
            We're committed to providing exceptional service and quality that exceeds your expectations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="text-center space-y-4 p-6 rounded-2xl hover:bg-white transition-colors duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-px-cyan to-px-magenta text-white">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-px-fg">
                  {benefit.title}
                </h3>
                <p className="text-px-muted leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              <Metric to={500} label="Happy Clients" />
              <Metric to={24} label="Average Turnaround (h)" />
              <Metric to={4.9} label="Customer Rating" />
              <Metric to={100} label="Satisfaction Guarantee (%)" />
            </div>
      </div>
    </section>
  );
}

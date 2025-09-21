import { CheckCircle, Clock, Truck, Shield } from 'lucide-react';

const benefits = [
  {
    icon: CheckCircle,
    title: 'Preflight Check',
    description: 'Every file is checked for print readiness before production. We ensure your artwork meets all technical requirements.',
  },
  {
    icon: Clock,
    title: 'Same-day Turnaround',
    description: 'Rush orders available for urgent projects. Get your prints the same day when you need them most.',
  },
  {
    icon: Truck,
    title: 'Easy Pickup & Courier',
    description: 'Convenient pickup locations or courier delivery. We make it easy to get your finished prints.',
  },
  {
    icon: Shield,
    title: 'Secure Checkout',
    description: 'Your payment information is protected with bank-level security. We accept all major credit cards and PayPal.',
  },
];

export default function Benefits() {
  return (
    <section className="py-20 bg-px-bg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center space-y-4 mb-16">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-px-fg">
            Why Choose Pixel Print?
          </h2>
          <p className="text-lg text-px-muted max-w-2xl mx-auto">
            We&apos;re committed to providing exceptional service and quality that exceeds your expectations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="text-center space-y-4 p-6 rounded-2xl hover:bg-gray-50 transition-colors duration-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-px-cyan to-px-magenta text-white">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-px-fg">
                  {benefit.title}
                </h3>
                <p className="text-px-muted leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Additional Benefits */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-px-cyan">500+</div>
            <div className="text-sm text-px-muted">Happy Clients</div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-px-magenta">24h</div>
            <div className="text-sm text-px-muted">Same-day Turnaround</div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-px-yellow">4.9/5</div>
            <div className="text-sm text-px-muted">Customer Rating</div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-3xl font-bold text-px-cyan">100%</div>
            <div className="text-sm text-px-muted">Quality Guarantee</div>
          </div>
        </div>
      </div>
    </section>
  );
}

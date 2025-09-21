"use client";

import GenericCalculator from "@/components/calc/GenericCalculator";
import ScrollReveal from "@/components/ux/ScrollReveal";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CreditCard, 
  Clock, 
  Shield, 
  Star, 
  CheckCircle, 
  Award,
  Users,
  Zap,
  Palette,
  Truck,
  FileText,
  Image as ImageIcon,
  Mail,
  Phone
} from "lucide-react";

interface ProductPageTemplateProps {
  model: any;
  productInfo: {
    title: string;
    subtitle: string;
    description: string;
    badge: string;
    heroImage?: string;
    features: {
      icon: string;
      title: string;
      description: string;
      items: string[];
    }[];
    samples: {
      title: string;
      description: string;
      image: string;
      color: string;
    }[];
    testimonials: {
      name: string;
      role: string;
      content: string;
      rating: number;
    }[];
  };
}

export default function ProductPageTemplate({ model, productInfo }: ProductPageTemplateProps) {
  const getIcon = (iconName: string) => {
    const iconProps = { className: "h-6 w-6 text-white" };
    switch (iconName) {
      case "Award": return <Award {...iconProps} />;
      case "Zap": return <Zap {...iconProps} />;
      case "Palette": return <Palette {...iconProps} />;
      case "Shield": return <Shield {...iconProps} />;
      case "Clock": return <Clock {...iconProps} />;
      case "Star": return <Star {...iconProps} />;
      case "Users": return <Users {...iconProps} />;
      case "Truck": return <Truck {...iconProps} />;
      case "FileText": return <FileText {...iconProps} />;
      case "Image": return <ImageIcon {...iconProps} />;
      case "Mail": return <Mail {...iconProps} />;
      case "Phone": return <Phone {...iconProps} />;
      default: return <Award {...iconProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-px-bg via-zinc-50 to-px-bg">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-px-cyan/10 via-px-magenta/5 to-px-yellow/10"></div>
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal>
              <div className="space-y-8">
                <div className="space-y-4">
                  <Badge className="bg-gradient-to-r from-px-cyan to-px-magenta text-white px-4 py-2">
                    {productInfo.badge}
                  </Badge>
                  <h1 className="text-5xl lg:text-6xl font-bold tracking-tight leading-tight font-playfair">
                    <span className="text-px-fg">{productInfo.title}</span>
                    <br />
                    <span className="bg-gradient-to-r from-px-cyan via-px-magenta to-px-yellow bg-clip-text text-transparent">
                      {productInfo.subtitle}
                    </span>
                  </h1>
                  <p className="text-xl text-px-muted leading-relaxed max-w-2xl">
                    {productInfo.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {productInfo.features.slice(0, 4).map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-px-cyan to-px-magenta rounded-lg flex items-center justify-center">
                        {getIcon(feature.icon)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-px-fg">{feature.title}</h3>
                        <p className="text-sm text-px-muted">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  {productInfo.samples.map((sample, index) => (
                    <div 
                      key={index}
                      className={`bg-white rounded-xl shadow-2xl p-6 transform ${
                        index % 2 === 0 ? 'rotate-3 hover:rotate-0' : '-rotate-2 hover:rotate-0'
                      } transition-transform duration-300`}
                    >
                      <div className={`bg-gradient-to-br ${sample.color} rounded-lg p-4 text-white`}>
                        <div className="space-y-3">
                          <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                          <div>
                            <h3 className="font-bold text-lg">{sample.title}</h3>
                            <p className="text-sm opacity-90">{sample.description}</p>
                          </div>
                          <div className="text-xs space-y-1">
                            <p>info@company.com</p>
                            <p>+44 20 1234 5678</p>
                            <p>www.company.com</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-px-fg mb-4 font-playfair">
                Why Choose Our {productInfo.title}?
              </h2>
              <p className="text-xl text-px-muted max-w-3xl mx-auto">
                We combine premium materials, expert craftsmanship, and cutting-edge printing technology to deliver products that make you stand out.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {productInfo.features.map((feature, index) => (
              <ScrollReveal key={index}>
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="w-16 h-16 bg-gradient-to-r from-px-cyan to-px-magenta rounded-xl flex items-center justify-center mb-4">
                      {getIcon(feature.icon)}
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-px-muted mb-4">
                      {feature.description}
                    </p>
                    <ul className="space-y-2 text-sm text-px-muted">
                      {feature.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section id="calculator" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-px-fg mb-4 font-playfair">
                Get Your Instant Quote
              </h2>
              <p className="text-xl text-px-muted max-w-3xl mx-auto">
                Configure your {productInfo.title.toLowerCase()} and see pricing in real-time. No hidden fees, transparent pricing.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              {model ? (
                <GenericCalculator model={model} />
              ) : (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-px-cyan mx-auto mb-4"></div>
                  <p className="text-px-muted">Loading calculator...</p>
                </div>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-r from-px-cyan/10 via-px-magenta/5 to-px-yellow/10">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-px-fg mb-4 font-playfair">
                What Our Customers Say
              </h2>
              <p className="text-xl text-px-muted">
                Join thousands of satisfied customers who trust us with their printing needs
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {productInfo.testimonials.map((testimonial, index) => (
              <ScrollReveal key={index}>
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-px-muted mb-4">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-px-cyan to-px-magenta rounded-full flex items-center justify-center text-white font-bold mr-3">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-px-fg">{testimonial.name}</p>
                        <p className="text-sm text-px-muted">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <ScrollReveal>
            <div className="bg-gradient-to-r from-px-cyan to-px-magenta rounded-2xl p-12 text-white">
              <h2 className="text-4xl font-bold mb-4 font-playfair">
                Ready to Get Started?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Create professional {productInfo.title.toLowerCase()} that represent your brand perfectly. Start your order today and get them delivered fast.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-white text-px-cyan hover:bg-gray-100"
                  onClick={() => document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Get Instant Quote
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-px-cyan"
                >
                  <Users className="h-5 w-5 mr-2" />
                  View Portfolio
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}

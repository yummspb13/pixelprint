interface StructuredDataProps {
  type?: 'LocalBusiness' | 'Organization' | 'WebSite';
  data?: Record<string, any>;
}

export default function StructuredData({ 
  type = 'LocalBusiness', 
  data = {} 
}: StructuredDataProps) {
  const baseData = {
    '@context': 'https://schema.org',
    '@type': type,
    name: 'Pixel Print',
    description: 'Professional printing services in London. Business stationery, flyers, posters, booklets, menus. Expert preflight, same-day options, secure checkout.',
    url: 'http://localhost:3010',
    logo: 'http://localhost:3010/logo.png',
    image: 'http://localhost:3010/og-image.jpg',
    telephone: '+44 20 7123 4567',
    email: 'hello@pixelprint.london',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '123 Print Street',
      addressLocality: 'London',
      postalCode: 'EC1A 4HD',
      addressCountry: 'GB'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '51.5074',
      longitude: '-0.1278'
    },
    openingHours: [
      'Mo-Fr 09:00-18:00',
      'Sa 10:00-16:00'
    ],
    priceRange: '££',
    paymentAccepted: ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer'],
    currenciesAccepted: 'GBP',
    areaServed: {
      '@type': 'City',
      name: 'London'
    },
    serviceArea: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: '51.5074',
        longitude: '-0.1278'
      },
      geoRadius: '50000'
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Printing Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Business Stationery',
            description: 'Professional business cards, letterheads, and stationery'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Large Format Printing',
            description: 'Posters, banners, and large format printing services'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Digital Printing',
            description: 'High-quality digital printing for all your needs'
          }
        }
      ]
    },
    sameAs: [
      'https://www.facebook.com/pixelprintlondon',
      'https://www.instagram.com/pixelprintlondon',
      'https://www.linkedin.com/company/pixelprintlondon'
    ],
    ...data
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(baseData, null, 2)
      }}
    />
  );
}

// Компонент для хлебных крошек
export function BreadcrumbStructuredData({ items }: { items: Array<{ name: string; url: string }> }) {
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(breadcrumbData, null, 2)
      }}
    />
  );
}

// Компонент для FAQ
export function FAQStructuredData({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(faqData, null, 2)
      }}
    />
  );
}

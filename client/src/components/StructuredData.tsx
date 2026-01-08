import { useMemo } from 'react';

export function OrganizationSchema() {
  const schema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "3B Solution",
    "description": "Premium real estate investment solutions specializing in luxury hospitality and commercial properties",
    "url": "https://www.3bsolution.com",
    "logo": "https://www.3bsolution.com/3b-logo.png",
    "image": "https://www.3bsolution.com/hero-background.jpg",
    "telephone": "+63-xxx-xxxx",
    "email": "info@3bsolution.de",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "7th Floor, Unit 710, High Street South Corporate Plaza Tower 2, 26th Street Corner 11th Avenue",
      "addressLocality": "Bonifacio Global City, Taguig City",
      "addressRegion": "Metro Manila",
      "postalCode": "1630",
      "addressCountry": "PH"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "14.5547",
      "longitude": "121.0502"
    },
    "areaServed": [
      "Southeast Asia",
      "Philippines",
      "Maldives",
      "Europe",
      "United States",
      "Caribbean"
    ],
    "priceRange": "$$$",
    "sameAs": [
      "https://www.linkedin.com/company/3bsolution",
      "https://twitter.com/3bsolution"
    ]
  }), []);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function InvestmentProductSchema() {
  const schema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "InvestmentOrSavingsProduct",
    "name": "Luxury Hospitality Real Estate Investment",
    "description": "Premium 5-star hotel and resort investment opportunities with 15-30% annual returns",
    "provider": {
      "@type": "Organization",
      "name": "3B Solution"
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": "500000",
      "availability": "https://schema.org/InStock",
      "url": "https://www.3bsolution.com/properties"
    },
    "annualPercentageRate": "0.15-0.30"
  }), []);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function FAQSchema({ faqs }: { faqs: Array<{ question: string; answer: string }> }) {
  const schema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }), [faqs]);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function PropertySchema({ property }: { property: any }) {
  const schema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": property.title,
    "description": property.description,
    "url": `https://www.3bsolution.com/properties/${property.slug}`,
    "image": property.imageUrl,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": property.city,
      "addressRegion": property.region,
      "addressCountry": property.country
    },
    "geo": property.latitude && property.longitude ? {
      "@type": "GeoCoordinates",
      "latitude": property.latitude,
      "longitude": property.longitude
    } : undefined,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": property.priceMin,
      "availability": property.status === "available" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    },
    "propertyType": property.propertyType
  }), [property]);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

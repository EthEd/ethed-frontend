import Script from 'next/script';

interface OrganizationJsonLdProps {
  name?: string;
  url?: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
}

/**
 * Organization structured data for SEO
 */
export function OrganizationJsonLd({
  name = 'EthEd',
  url = 'https://ethed.com',
  logo = 'https://ethed.com/logo.png',
  description = 'EthEd makes blockchain and Web3 education fun, verifiable, and rewarding.',
  sameAs = [],
}: OrganizationJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url,
    logo,
    description,
    sameAs,
  };

  return (
    <Script
      id="organization-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface CourseJsonLdProps {
  name: string;
  description: string;
  provider?: string;
  url: string;
  image?: string;
  courseMode?: string;
  educationalLevel?: string;
  duration?: string;
}

/**
 * Course structured data for SEO
 */
export function CourseJsonLd({
  name,
  description,
  provider = 'EthEd',
  url,
  image,
  courseMode = 'Online',
  educationalLevel = 'Beginner',
  duration,
}: CourseJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name,
    description,
    provider: {
      '@type': 'Organization',
      name: provider,
      url: 'https://ethed.com',
    },
    url,
    ...(image && { image }),
    courseMode,
    educationalLevel,
    ...(duration && { duration }),
    isAccessibleForFree: true,
    inLanguage: 'en',
  };

  return (
    <Script
      id={`course-jsonld-${name.toLowerCase().replace(/\s+/g, '-')}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface WebsiteJsonLdProps {
  name?: string;
  url?: string;
  description?: string;
}

/**
 * Website structured data with search action
 */
export function WebsiteJsonLd({
  name = 'EthEd',
  url = 'https://ethed.com',
  description = 'Master blockchain and Web3 with EthEd',
}: WebsiteJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url}/learn?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <Script
      id="website-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface BreadcrumbJsonLdProps {
  items: Array<{ name: string; url: string }>;
}

/**
 * Breadcrumb structured data for navigation
 */
export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <Script
      id="breadcrumb-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface FAQJsonLdProps {
  questions: Array<{ question: string; answer: string }>;
}

/**
 * FAQ structured data
 */
export function FAQJsonLd({ questions }: FAQJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.answer,
      },
    })),
  };

  return (
    <Script
      id="faq-jsonld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

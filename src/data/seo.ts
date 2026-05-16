export const siteConfig = {
  siteUrl: "https://www.gialoop.site",
  siteName: "Gialoop",
  brandName: "Gialoop",
  personName: "Argya Aulia Fauzandika",
  title: "Gialoop | Flutter Developer Portfolio",
  description:
    "Gialoop is the portfolio of Argya Aulia Fauzandika, a Flutter developer in Bandung who builds scalable mobile apps with clean architecture, polished UX, and production-ready delivery.",
  location: "Bandung, Indonesia",
  email: "argyaauliaf@gmail.com",
  sameAs: [
    "https://github.com/gyaaufau",
    "https://www.linkedin.com/in/argyaaf/",
    "https://play.google.com/store/apps/developer?id=Gialoop"
  ]
} as const;

export const homepageFaqs = [
  {
    question: "What does Gialoop build?",
    answer:
      "Gialoop builds Flutter mobile apps, MVPs, internal tools, and maintainable codebases with clean architecture, strong performance, and production-focused delivery."
  },
  {
    question: "Who is behind Gialoop?",
    answer:
      "Gialoop is the personal developer brand of Argya Aulia Fauzandika, a Flutter developer based in Bandung, Indonesia."
  },
  {
    question: "What kind of Flutter work can Argya help with?",
    answer:
      "Argya can help with app architecture, feature delivery, REST API integration, state management, refactoring, debugging, performance optimization, and Play Store release preparation."
  },
  {
    question: "Is this portfolio rendered for search engines?",
    answer:
      "Yes. The website is built with Astro and ships HTML at request time, so the main content is visible to Google and other crawlers without relying on client-side rendering."
  }
] as const;

export const absoluteUrl = (path = "/") => new URL(path, siteConfig.siteUrl).toString();

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.siteName,
  alternateName: siteConfig.brandName,
  url: siteConfig.siteUrl,
  description: siteConfig.description,
  publisher: {
    "@type": "Person",
    name: siteConfig.personName
  },
  inLanguage: "en",
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteConfig.siteUrl}/blog/`,
    "query-input": "required name=search_term_string"
  }
};

export const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: siteConfig.personName,
  url: siteConfig.siteUrl,
  jobTitle: "Flutter Developer",
  worksFor: {
    "@type": "Organization",
    name: siteConfig.brandName
  },
  homeLocation: {
    "@type": "Place",
    name: siteConfig.location
  },
  email: siteConfig.email,
  knowsAbout: [
    "Flutter",
    "Dart",
    "Mobile App Development",
    "Clean Architecture",
    "REST API Integration",
    "Mobile Performance Optimization"
  ],
  sameAs: [...siteConfig.sameAs]
};

export const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: homepageFaqs.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer
    }
  }))
};

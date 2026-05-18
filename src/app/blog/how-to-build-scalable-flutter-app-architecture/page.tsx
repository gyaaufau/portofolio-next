import { absoluteUrl, siteConfig, websiteSchema } from "@/data/seo";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

const publishedTime = "2026-04-29T09:00:00+07:00";
const modifiedTime = "2026-04-29T09:00:00+07:00";
const articleTitle = "How to Build Scalable Flutter App Architecture";
const articleDescription =
  "A practical guide to building scalable Flutter app architecture with feature-first modules, clean boundaries, resilient state management, and release-ready delivery.";
const articleUrl = absoluteUrl("/blog/how-to-build-scalable-flutter-app-architecture");

const articleFaqs = [
  {
    question: "What is the best architecture for a scalable Flutter app?",
    answer:
      "A scalable Flutter app usually benefits from feature-first modules, clear domain and data boundaries, dependency injection, predictable state management, and isolated infrastructure concerns."
  },
  {
    question: "Should every Flutter app use clean architecture?",
    answer:
      "Not every app needs heavy abstraction on day one, but most production apps benefit from lightweight clean boundaries so features stay easier to test, refactor, and scale."
  },
  {
    question: "How do you keep Flutter apps maintainable as the team grows?",
    answer:
      "Keep modules small, standardize folder structure, separate UI from business logic, centralize dependencies, and define clear rules for API, caching, navigation, and state ownership."
  }
];

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: articleTitle,
  description: articleDescription,
  author: {
    "@type": "Person",
    name: siteConfig.personName
  },
  publisher: {
    "@type": "Organization",
    name: siteConfig.brandName
  },
  mainEntityOfPage: articleUrl,
  datePublished: publishedTime,
  dateModified: modifiedTime,
  inLanguage: "en"
};

const articleFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: articleFaqs.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer
    }
  }))
};

export const metadata: Metadata = {
  title: `${articleTitle} | Gialoop`,
  description: articleDescription,
  openGraph: {
    type: "article",
    title: articleTitle,
    description: articleDescription,
    url: articleUrl,
    publishedTime,
    modifiedTime,
  },
};

export default function BlogArticlePage() {
  return (
    <main className="relative w-full max-w-[1280px] mx-auto px-6 pt-6 pb-20">
      <article className="grid gap-6 p-6 rounded-3xl bg-card border border-border shadow-sm">
        <Link className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-primary hover:border-primary transition-colors w-fit" href="/blog">
          <ChevronLeft className="w-3.5 h-3.5" /> back / blog
        </Link>
        <nav className="flex flex-wrap gap-3 items-center text-muted-foreground text-[0.82rem] font-medium" aria-label="Breadcrumb">
          <Link className="text-primary font-semibold" href="/">Home</Link>
          <span>/</span>
          <Link className="text-primary font-semibold" href="/blog">Blog</Link>
          <span>/</span>
          <span>{articleTitle}</span>
        </nav>

        <header className="grid gap-[0.8rem]">
          <p className="m-0 mb-[0.75rem] text-primary text-[0.8rem] font-semibold tracking-[0.06em] uppercase">Flutter Architecture</p>
          <h1>{articleTitle}</h1>
          <p className="text-[1.1rem] text-foreground leading-[1.7]">
            The short answer: a scalable Flutter app needs clear feature boundaries, predictable state management,
            modular dependency injection, and a delivery workflow that keeps performance and refactoring under control.
          </p>
          <div className="flex flex-wrap gap-3 items-center text-muted-foreground text-[0.82rem] font-medium">
            <time dateTime={publishedTime}>April 29, 2026</time>
            <span>8 min read</span>
          </div>
        </header>

        <section className="p-5 rounded-xl bg-card border border-border shadow-sm">
          <h2>Direct answer</h2>
          <p>
            If you want a Flutter app to stay maintainable after version 1, organize it by feature, keep business rules
            out of widgets, isolate APIs and local storage behind repositories, and make state transitions explicit. This
            reduces regression risk, shortens onboarding time, and makes new features easier to ship.
          </p>
        </section>

        <section className="grid gap-[0.9rem]">
          <h2>1. Start with feature-first modules</h2>
          <p>
            Avoid a giant app where screens, blocs, repositories, and models from unrelated features all live in the
            same folders. Group code by feature first, then by responsibility inside that feature.
          </p>
          <p>
            A practical baseline is one folder per feature, containing presentation, domain, and data layers only when
            the feature is complex enough to need them. Smaller apps can stay simpler, but the rule should still be:
            feature ownership comes before technical folder purity.
          </p>
        </section>

        <section className="grid gap-[0.9rem]">
          <h2>2. Keep widgets thin and state predictable</h2>
          <p>
            Widgets should render UI and dispatch user intent. They should not own heavy orchestration logic, networking
            decisions, or data transformation pipelines. That logic belongs in state classes, use cases, or services.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-foreground leading-relaxed">
            <li>Use one clear state owner per screen or flow.</li>
            <li>Prefer explicit loading, success, empty, and error states.</li>
            <li>Avoid hidden side effects in `build()` and large widget constructors.</li>
          </ul>
        </section>

        <section className="grid gap-[0.9rem]">
          <h2>3. Put APIs, cache, and storage behind stable interfaces</h2>
          <p>
            Repositories are valuable when they simplify the rest of the app. They should hide request formatting,
            response mapping, local persistence, and retry or fallback rules from the UI layer.
          </p>
          <p>
            This becomes especially useful when the app later needs offline support, a staging environment, analytics,
            or a backend migration. Your feature logic stays mostly unchanged because the infrastructure details are
            already isolated.
          </p>
        </section>

        <section className="grid gap-[0.9rem]">
          <h2>4. Standardize dependency injection and app configuration</h2>
          <p>
            Teams lose time when dependency setup is inconsistent. Use a single pattern for registering services,
            repositories, and state factories. Also separate environment config for development, staging, and production.
          </p>
          <p>
            This matters for scalable delivery because configuration drift is one of the fastest ways to create fragile
            releases.
          </p>
        </section>

        <section className="grid gap-[0.9rem]">
          <h2>5. Treat performance as part of architecture</h2>
          <p>
            Scalability is not only about folder structure. It also means the app still feels fast as features, data, and
            interactions grow. Watch rebuild scope, image sizing, network waterfalls, and expensive startup work.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-foreground leading-relaxed">
            <li>Measure startup and navigation hotspots early.</li>
            <li>Use pagination and local caching where data volume grows.</li>
            <li>Keep image dimensions explicit and avoid layout shift.</li>
          </ul>
        </section>

        <section className="grid gap-[0.9rem]">
          <h2>6. Document the rules that future contributors must follow</h2>
          <p>
            Even strong architecture fails when the team cannot tell where new code belongs. Write short conventions for
            feature structure, state ownership, naming, async error handling, and release flow.
          </p>
          <p>
            This is also where a public portfolio helps: your <Link href="/projects">project archive</Link> can show how those
            rules appear in real work, while the main <Link href="/">homepage</Link> explains the engineering value you bring.
          </p>
        </section>

        <section className="grid gap-[0.9rem]">
          <h2>FAQ</h2>
          <div className="grid gap-4">
            {articleFaqs.map((item, idx) => (
              <article key={idx} className="p-5 rounded-xl bg-card border border-border shadow-sm">
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleFaqSchema),
        }}
      />
    </main>
  );
}

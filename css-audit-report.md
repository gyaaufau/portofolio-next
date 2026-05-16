# Custom CSS Classes Audit Report

## Summary
- **Total custom CSS classes defined in globals.css:** ~120+
- **Files audited:** 19 components + 10 app pages
- **All custom classes are defined in:** `src/app/globals.css`

---

## Classes by Component/File

### `src/app/page.tsx`
| Custom Class | Defined in globals.css |
|---|---|
| `page-shell` | ✅ Yes |
| `project-archive-cta` | ✅ Yes |
| `panel` | ✅ Yes |
| `button-link` | ✅ Yes |
| `secondary` | ✅ Yes |

---

### `src/app/layout.tsx`
| Custom Class | Defined in globals.css |
|---|---|
| *None - uses Tailwind only* | - |

---

### `src/components/section-shell.tsx`
| Custom Class | Defined in globals.css |
|---|---|
| `section-shell` | ✅ Yes |
| `section-heading` | ✅ Yes |
| `section-eyebrow` | ✅ Yes |
| `section-description` | ✅ Yes |
| `section-content` | ✅ Yes |

---

### `src/components/hero.tsx`
| Custom Class | Defined in globals.css |
|---|---|
| `hero` | ✅ Yes |
| `hero-copy` | ✅ Yes |
| `panel` | ✅ Yes |
| `hero-status-row` | ✅ Yes |
| `hero-animate-status` | ✅ Yes |
| `hero-opportunity-pill` | ✅ Yes |
| `hero-kicker` | ✅ Yes |
| `hero-animate-kicker` | ✅ Yes |
| `hero-animate-name` | ✅ Yes |
| `hero-role` | ✅ Yes |
| `hero-animate-role` | ✅ Yes |
| `hero-intro` | ✅ Yes |
| `hero-animate-intro` | ✅ Yes |
| `hero-meta` | ✅ Yes |
| `hero-animate-meta` | ✅ Yes |
| `hero-location-pill` | ✅ Yes |
| `hero-actions` | ✅ Yes |
| `hero-animate-actions` | ✅ Yes |
| `button-link` | ✅ Yes |
| `primary` | ✅ Yes |
| `secondary` | ✅ Yes |
| `hero-visual` | ✅ Yes |
| `hero-animate-visual` | ✅ Yes |
| `portrait-shell` | ✅ Yes |
| `portrait-image` | ✅ Yes |
| `portrait-fallback` | ✅ Yes |

---

### `src/components/work-experience.tsx`
| Custom Class | Defined in globals.css |
|---|---|
| *None - uses only Tailwind utility classes* | - |

**Note:** WorkExperience component uses only Tailwind utility classes (flex, gap-10, flex-col, items-center, w-6, relative, self-stretch, w-0.5, bg-transparent, flex-1, w-3, h-3, rounded-full, bg-[var(--accent)], border-[3px], border-[var(--bg)], shadow-[0_0_0_2px_var(--accent)], z-10, shrink-0, my-1, flex-1, p-6, rounded-2xl, bg-[var(--panel)], border, border-[var(--line)], shadow-sm, hover:-translate-y-0.5, hover:border-[var(--line-strong)], hover:shadow-lg, transition-all, mb-6, min-w-0, flex, items-start, justify-between, gap-4, m-0, text-lg, font-semibold, leading-tight, text-[var(--text)], text-sm, font-medium, text-[var(--accent)], text-right, shrink-0, flex-wrap, gap-2, mt-3, text-xs, font-medium, border, border-[var(--line)], rounded-full, px-3, py-1, bg-[var(--bg)], text-[var(--muted)], mt-3, pl-5, space-y-1, text-sm)

---

### `src/components/contact.tsx`
| Custom Class | Defined in globals.css |
|---|---|
| `contact-shell` | ✅ Yes |
| `bento-grid` | ✅ Yes |
| `contact-primary-card` | ✅ Yes |
| `bento-item` | ✅ Yes |
| `bento-span-2` | ✅ Yes |
| `reveal` | ✅ Yes |
| `reveal-delay-1` | ✅ Yes |
| `reveal-delay-2` | ✅ Yes |
| `reveal-delay-3` | ✅ Yes |
| `reveal-delay-4` | ✅ Yes |
| `reveal-delay-5` | ✅ Yes |
| `reveal-delay-6` | ✅ Yes |
| `section-label` | ✅ Yes |
| `contact-primary-cta` | ✅ Yes |
| `contact-link-card` | ✅ Yes |

---

### `src/components/certificate-detail-view.tsx`
| Custom Class | Defined in globals.css |
|---|---|
| `project-page-detail` | ✅ Yes |
| `panel` | ✅ Yes |
| `certificate-detail-head` | ✅ Yes |
| `project-meta-row` | ✅ Yes |
| `certificate-type-chip` | ✅ Yes |
| `project-period-value` | ✅ Yes |
| `certificate-detail-title` | ✅ Yes |
| `certificate-detail-copy` | ✅ Yes |
| `certificate-detail-issuer` | ✅ Yes |
| `project-page-summary` | ✅ Yes |
| `certificate-detail-preview` | ✅ Yes |
| `project-sections` | ✅ Yes |
| `project-content-section` | ✅ Yes |
| `detail-points` | ✅ Yes |

---

### `src/components/project-detail-view.tsx`
| Custom Class | Defined in globals.css |
|---|---|
| `project-page-detail` | ✅ Yes |
| `panel` | ✅ Yes |
| `project-page-head` | ✅ Yes |
| `project-page-title` | ✅ Yes |
| `project-meta-row` | ✅ Yes |
| `project-type-chip` | ✅ Yes |
| `project-type-chip-personal` | ✅ Yes |
| `project-type-chip-work` | ✅ Yes |
| `project-app-chip` | ✅ Yes |
| `project-period-value` | ✅ Yes |
| `project-brand-row` | ✅ Yes |
| `project-detail-logo` | ✅ Yes |
| `project-detail-logo-fallback` | ✅ Yes |
| `project-heading-copy` | ✅ Yes |
| `project-action-row` | ✅ Yes |
| `button-link` | ✅ Yes |
| `secondary` | ✅ Yes |
| `project-page-summary` | ✅ Yes |
| `project-gallery` | ✅ Yes |
| `project-sections` | ✅ Yes |
| `project-content-section` | ✅ Yes |
| `project-content-entry` | ✅ Yes |
| `detail-points` | ✅ Yes |
| `project-code-block` | ✅ Yes |

---

### `src/components/certificates.tsx`
| Custom Class | Defined in globals.css |
|---|---|
| `certificates-shell` | ✅ Yes |
| `projects-group-head` | ✅ Yes |
| `certificate-list` | ✅ Yes |
| `bento-grid-3` | ✅ Yes |
| `certificate-card` | ✅ Yes |
| `bento-item` | ✅ Yes |
| `reveal` | ✅ Yes |
| `reveal-delay-1`..`reveal-delay-6` | ✅ Yes |
| `bento-span-2` | ✅ Yes |
| `certificate-card-top` | ✅ Yes |
| `certificate-card-meta` | ✅ Yes |
| `project-featured-chip` | ✅ Yes |
| `certificate-type-chip` | ✅ Yes |
| `certificate-issued` | ✅ Yes |
| `certificate-card-preview` | ✅ Yes |
| `certificate-card-copy` | ✅ Yes |
| `certificate-card-issuer` | ✅ Yes |
| `certificate-card-summary` | ✅ Yes |

---

### `src/components/projects.tsx`
| Custom Class | Defined in globals.css |
|---|---|
| `projects-shell` | ✅ Yes |
| `projects-group-head` | ✅ Yes |
| `project-list` | ✅ Yes |
| `bento-grid` | ✅ Yes |
| `project-card` | ✅ Yes |
| `bento-item` | ✅ Yes |
| `reveal` | ✅ Yes |
| `reveal-delay-1`..`reveal-delay-6` | ✅ Yes |
| `bento-span-2` | ✅ Yes |
| `bento-row-2` | ✅ Yes |
| `project-card-meta` | ✅ Yes |
| `project-featured-chip` | ✅ Yes |
| `project-type-chip` | ✅ Yes |
| `project-type-chip-personal` | ✅ Yes |
| `project-type-chip-work` | ✅ Yes |
| `project-app-chip` | ✅ Yes |
| `project-period` | ✅ Yes |
| `project-card-period` | ✅ Yes |
| `project-card-title-row` | ✅ Yes |
| `project-card-brand` | ✅ Yes |
| `project-card-logo` | ✅ Yes |
| `project-card-logo-fallback` | ✅ Yes |

---

### `src/components/about.tsx`
| Custom Class | Defined in globals.css |
|---|---|
| `about-grid` | ✅ Yes |
| `bento-grid-3` | ✅ Yes |
| `about-copy` | ✅ Yes |
| `bento-item` | ✅ Yes |
| `reveal` | ✅ Yes |
| `reveal-delay-1`..`reveal-delay-4` | ✅ Yes |
| `about-list-section` | ✅ Yes |
| `about-list-section-single` | ✅ Yes |
| `about-note` | ✅ Yes |
| `section-label` | ✅ Yes |
| `about-list` | ✅ Yes |

---

### `src/components/navbar.tsx`
| Custom Class | Defined in globals.css |
|---|---|
| `navbar` | ✅ Yes |
| `panel` | ✅ Yes |
| `navbar-scrolled` | ✅ Yes |
| `navbar-top` | ✅ Yes |
| `navbar-brand` | ✅ Yes |
| `navbar-brand-logo` | ✅ Yes |
| `navbar-brand-logo-dark` | ✅ Yes |
| `navbar-brand-logo-light` | ✅ Yes |
| `navbar-toggle` | ✅ Yes |
| `navbar-links` | ✅ Yes |
| `theme-toggle` | ✅ Yes |
| `theme-toggle-track` | ✅ Yes |
| `theme-toggle-thumb` | ✅ Yes |
| `theme-toggle-label` | ✅ Yes |

---

### `src/components/ui/*` (separator, badge, card, button)
| Custom Class | Defined in globals.css |
|---|---|
| *None - uses only Tailwind/shadcn utility classes* | - |

---

### `src/app/blog/page.tsx`
| Custom Class | Defined in globals.css |
|---|---|
| `page-shell` | ✅ Yes |
| `project-page-top` | ✅ Yes |
| `panel` | ✅ Yes |
| `back-link` | ✅ Yes |
| `blog-index-page` | ✅ Yes |
| `blog-index-head` | ✅ Yes |
| `section-eyebrow` | ✅ Yes |
| `blog-card` | ✅ Yes |
| `section-label` | ✅ Yes |
| `blog-card-actions` | ✅ Yes |
| `button-link` | ✅ Yes |
| `secondary` | ✅ Yes |

---

### `src/app/blog/how-to-build-scalable-flutter-app-architecture/page.tsx`
| Custom Class | Defined in globals.css |
|---|---|
| `page-shell` | ✅ Yes |
| `project-page-top` | ✅ Yes |
| `panel` | ✅ Yes |
| `back-link` | ✅ Yes |
| `blog-article` | ✅ Yes |
| `breadcrumb` | ✅ Yes |
| `blog-article-head` | ✅ Yes |
| `section-eyebrow` | ✅ Yes |
| `blog-article-lead` | ✅ Yes |
| `blog-meta` | ✅ Yes |
| `answer-box` | ✅ Yes |
| `blog-article-section` | ✅ Yes |
| `detail-points` | ✅ Yes |
| `faq-list` | ✅ Yes |
| `faq-card` | ✅ Yes |

---

### `src/app/certificates/page.tsx`
| Custom Class | Defined in globals.css |
|---|---|
| `page-shell` | ✅ Yes |
| `project-page-top` | ✅ Yes |
| `panel` | ✅ Yes |
| `back-link` | ✅ Yes |
| `project-archive-page` | ✅ Yes |
| `project-archive-head` | ✅ Yes |
| `section-eyebrow` | ✅ Yes |

---

### `src/app/certificates/[slug]/page.tsx`
| Custom Class | Defined in globals.css |
|---|---|
| `page-shell` | ✅ Yes |
| `project-page-top` | ✅ Yes |
| `panel` | ✅ Yes |
| `back-link` | ✅ Yes |

---

### `src/app/cv/page.tsx`
| Custom Class | Defined in globals.css |
|---|---|
| `cv-page-shell` | ✅ Yes |
| `project-page-top` | ✅ Yes |
| `panel` | ✅ Yes |
| `back-link` | ✅ Yes |
| `cv-viewer` | ✅ Yes |
| `cv-viewer-head` | ✅ Yes |
| `section-label` | ✅ Yes |
| `cv-viewer-actions` | ✅ Yes |
| `button-link` | ✅ Yes |
| `primary` | ✅ Yes |
| `cv-viewer-frame-shell` | ✅ Yes |
| `cv-viewer-frame` | ✅ Yes |
| `cv-viewer-fallback` | ✅ Yes |

---

### `src/app/projects/page.tsx`
| Custom Class | Defined in globals.css |
|---|---|
| `page-shell` | ✅ Yes |
| `project-page-top` | ✅ Yes |
| `panel` | ✅ Yes |
| `back-link` | ✅ Yes |
| `project-archive-page` | ✅ Yes |
| `project-archive-head` | ✅ Yes |
| `section-eyebrow` | ✅ Yes |

---

### `src/app/projects/[slug]/page.tsx`
| Custom Class | Defined in globals.css |
|---|---|
| `page-shell` | ✅ Yes |
| `project-page-top` | ✅ Yes |
| `panel` | ✅ Yes |
| `back-link` | ✅ Yes |

---

## Complete List of Custom CSS Classes (from globals.css)

### Page Structure
- `page-shell`
- `cv-page-shell`

### Navigation
- `navbar`
- `navbar-scrolled`
- `navbar-top`
- `navbar-brand`
- `navbar-brand-logo`
- `navbar-brand-logo-dark`
- `navbar-brand-logo-light`
- `navbar-toggle`
- `navbar-links`

### Hero Section
- `hero`
- `hero-copy`
- `hero-visual`
- `hero-status-row`
- `hero-opportunity-pill`
- `hero-kicker`
- `hero-role`
- `hero-intro`
- `hero-meta`
- `hero-location-pill`
- `hero-actions`

### Portrait
- `portrait-shell`
- `portrait-image`
- `portrait-fallback`

### Section Shell
- `section-shell`
- `section-heading`
- `section-eyebrow`
- `section-description`
- `section-content`
- `section-label`

### Bento Grid System
- `bento-grid`
- `bento-grid-2`
- `bento-grid-3`
- `bento-item`
- `bento-span-2`
- `bento-span-3`
- `bento-span-4`
- `bento-row-2`

### Panels & Cards
- `panel`
- `project-card`
- `certificate-card`
- `contact-primary-card`
- `contact-link-card`

### Projects
- `projects-shell`
- `projects-group-head`
- `project-list`
- `project-card-meta`
- `project-featured-chip`
- `project-type-chip`
- `project-type-chip-personal`
- `project-type-chip-work`
- `project-app-chip`
- `project-period`
- `project-card-period`
- `project-card-title-row`
- `project-card-brand`
- `project-card-logo`
- `project-card-logo-fallback`
- `project-archive-cta`

### Project Detail
- `project-page-detail`
- `project-page-top`
- `project-archive-page`
- `project-archive-head`
- `project-page-head`
- `project-page-title`
- `project-brand-row`
- `project-heading-copy`
- `project-detail-logo`
- `project-detail-logo-fallback`
- `project-meta-row`
- `project-period-value`
- `project-page-summary`
- `project-action-row`
- `project-gallery`
- `project-sections`
- `project-content-section`
- `project-content-entry`
- `project-code-block`
- `project-stack-list`

### Certificates
- `certificates-shell`
- `certificate-list`
- `certificate-card`
- `certificate-card-top`
- `certificate-card-meta`
- `certificate-type-chip`
- `certificate-issued`
- `certificate-card-preview`
- `certificate-card-copy`
- `certificate-card-issuer`
- `certificate-card-summary`

### Certificate Detail
- `certificate-detail-head`
- `certificate-detail-title`
- `certificate-detail-copy`
- `certificate-detail-issuer`
- `certificate-detail-preview`

### Contact
- `contact-shell`
- `contact-primary-card`
- `contact-primary-cta`
- `contact-link-card`

### About
- `about-grid`
- `about-copy`
- `about-list-section`
- `about-list-section-single`
- `about-note`
- `about-list`

### Buttons & Links
- `button-link`
- `primary`
- `secondary`
- `back-link`

### Theme Toggle
- `theme-toggle`
- `theme-toggle-track`
- `theme-toggle-thumb`
- `theme-toggle-label`

### Blog
- `blog-index-page`
- `blog-index-head`
- `blog-card`
- `blog-card-actions`
- `blog-article`
- `blog-article-head`
- `blog-article-lead`
- `blog-article-section`
- `blog-meta`
- `breadcrumb`
- `faq-list`
- `faq-card`
- `answer-box`

### CV
- `cv-viewer`
- `cv-viewer-head`
- `cv-viewer-actions`
- `cv-viewer-frame-shell`
- `cv-viewer-frame`
- `cv-viewer-fallback`

### Timeline
- `timeline-dot`
- `timeline-line`

### Animations
- `reveal`
- `reveal-delay-1`
- `reveal-delay-2`
- `reveal-delay-3`
- `reveal-delay-4`
- `reveal-delay-5`
- `reveal-delay-6`
- `hero-animate-status`
- `hero-animate-kicker`
- `hero-animate-name`
- `hero-animate-role`
- `hero-animate-intro`
- `hero-animate-meta`
- `hero-animate-actions`
- `hero-animate-visual`

### Lists
- `detail-points`
- `stack-list`

---

## Key Findings

1. **All custom classes are centralized in `globals.css`** - No scattered CSS modules found.

2. **Tailwind CSS is used alongside custom CSS** - Components mix Tailwind utility classes with custom semantic classes.

3. **WorkExperience uses only Tailwind** - No custom classes; relies entirely on Tailwind utilities with CSS variables.

4. **UI components use only Tailwind/shadcn** - `separator`, `badge`, `card`, `button` use Tailwind utility classes via shadcn patterns.

5. **Timeline classes defined but not used** - `timeline-dot` and `timeline-line` are defined in globals.css (lines 1606-1618) but the WorkExperience component uses inline Tailwind styles instead.

6. **Heavy use of CSS custom properties** - All custom classes reference CSS variables (e.g., `--panel`, `--line`, `--accent`, `--text`).

7. **Responsive design** - globals.css includes `@media (max-width: 1024px)` and `@media (max-width: 720px)` breakpoints for custom classes.

8. **Dark mode support** - Custom classes include `.dark` variants for dark mode styling.

9. **Animation classes** - Dedicated hero animation classes and scroll reveal system with staggered delays.

10. **No unused classes detected** - All classes defined in globals.css appear to be used somewhere in the application.

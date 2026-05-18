# Redesign Certificate Detail Page

## Files to Edit

### 1. `src/app/certificates/[slug]/page.tsx`
- Add `ChevronLeft` import from `lucide-react`
- Remove separate back-link `<section>`, make it an inline `<Link>` with `ChevronLeft` icon before `<CertificateDetailView>`
- Remove unused `Link` import? No, still used.

**Changes:**
```diff
+ import { ChevronLeft } from "lucide-react";
- <section className="mt-4 p-5 rounded-xl bg-card border border-border shadow-sm">
-   <Link className="text-primary text-[0.82rem] font-semibold lowercase" href="/certificates">back / certificates</Link>
- </section>
+ <Link className="mt-4 inline-flex items-center gap-1.5 text-primary text-[0.82rem] font-semibold lowercase" href="/certificates">
+   <ChevronLeft className="w-4 h-4" /> back / certificates
+ </Link>
```

### 2. `src/components/certificate-detail-view.tsx`

**Container:**
```diff
- <article className="mt-4 p-5 rounded-xl bg-card border border-border shadow-sm">
+ <article className="mt-4 p-6 rounded-3xl bg-card border border-border shadow-sm">
```

**Meta row (type chip + date):**
```diff
- <div className="flex flex-wrap items-center gap-[0.55rem] mt-[0.6rem] mb-[0.9rem]">
-   <span className="inline-flex items-center min-h-[1.8rem] border border-border rounded-full px-[0.65rem] py-[0.3rem] text-[0.72rem] font-semibold text-success bg-secondary">
-   <span className="inline-flex items-center min-h-[2rem] text-[0.76rem] font-semibold text-primary">
+ <div className="flex flex-wrap items-center gap-2 mt-1 mb-3">
+   <span className="inline-flex items-center h-7 border border-border rounded-full px-2.5 py-1 text-xs font-semibold text-success bg-secondary">
+   <span className="inline-flex items-center text-sm font-semibold text-primary">
```

**Header area grid:**
```diff
- <div className="grid gap-[0.9rem]">
+ <div className="grid gap-3">
```

**Issuer:**
```diff
- <p className="text-primary text-[0.78rem] font-semibold">{certificate.issuer}</p>
+ <p className="text-primary text-sm font-semibold">{certificate.issuer}</p>
```

**Summary:**
```diff
- <p className="mt-4 m-0 text-muted-foreground leading-[1.8]">{certificate.summary}</p>
+ <p className="mt-4 text-muted-foreground leading-relaxed">{certificate.summary}</p>
```

**Image:**
```diff
- <Image className="w-full h-auto max-h-[720px] border border-border rounded-xl bg-muted/5 object-contain"
+ <Image className="w-full h-auto max-h-[600px] border border-border rounded-lg bg-muted/5 object-contain"
```

**Sections container:**
```diff
- <div className="grid gap-6 mt-6">
+ <div className="grid gap-6 mt-6 max-w-[65ch]">
```

**Section headings:**
```diff
- <h2 className="m-0 text-foreground text-[1.1rem] font-semibold">Issuer</h2>
+ <h2 className="text-foreground text-base font-semibold">Issuer</h2>
```

**Section body spacing:**
```diff
- <div className="mt-[0.8rem]">
-   <ul className="m-0 pl-[1.15rem]">
-     {certificate.issuerNotes.map((note, idx) => (
-       <li key={idx} className="mt-[0.6rem] text-muted-foreground">{note}</li>
-     ))}
+ <div className="mt-3">
+   <ul className="pl-5">
+     {certificate.issuerNotes.map((note, idx) => (
+       <li key={idx} className="mt-1.5 text-muted-foreground">{note}</li>
+     ))}
```

**Section border:**
```diff
- <section className="border-t border-border pt-4">
+ <section className="border-t border-border pt-5">
```

## Summary of Changes
- `rounded-xl` → `rounded-3xl` on article container
- `p-5` → `p-6` on container
- Back link: separate section → inline with `ChevronLeft` icon
- Image: `rounded-xl` → `rounded-lg`, `max-h-[720px]` → `max-h-[600px]`
- Custom spacing (`[0.9rem]`, `[0.55rem]`, `[0.6rem]`, etc.) → Tailwind scale
- Custom font sizes (`[0.72rem]`, `[0.76rem]`, `[0.78rem]`) → `text-xs`, `text-sm`
- Content sections wrapped in `max-w-[65ch]` for better readability
- Section headings: `text-[1.1rem]` → `text-base`

import Image from "next/image";
import { siteConfig } from "@/data/seo";
import { formatCopyrightYear } from "@/lib/copyright";

export function Footer() {
  const copyrightYear = formatCopyrightYear(new Date().getFullYear());

  return (
    <footer className="mb-20 mt-8 border-t border-border bg-background text-muted-foreground md:mb-0">
      <div className="mx-auto flex max-w-[1280px] items-center justify-center gap-2 px-5 py-6 text-center text-xs font-medium leading-5 md:px-6 md:py-7 md:text-sm">
        <Image
          src="/assets/pixel-ornaments/footer/copyright_pixel_icon.png"
          alt=""
          aria-hidden="true"
          width={32}
          height={32}
          unoptimized
          className="size-4 shrink-0 [image-rendering:pixelated] [image-rendering:crisp-edges]"
        />
        <span>© {copyrightYear} {siteConfig.personName}</span>
      </div>
    </footer>
  );
}

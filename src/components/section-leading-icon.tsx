import Image from "next/image";

const SECTION_ICONS = {
  about: "/assets/pixel-ornaments/section-icons/section_icon_about.png",
  "app-catalog": "/assets/pixel-ornaments/section-icons/section_icon_app_catalog.png",
  "work-experience": "/assets/pixel-ornaments/section-icons/section_icon_work_experience.png",
  certificates: "/assets/pixel-ornaments/section-icons/section_icon_certificates.png",
  contact: "/assets/pixel-ornaments/section-icons/section_icon_contact.png",
} as const;

export type SectionLeadingIconName = keyof typeof SECTION_ICONS;

export function SectionLeadingIcon({ name }: { name: SectionLeadingIconName }) {
  return (
    <span className="block size-8 md:size-16 shrink-0" aria-hidden="true">
      <Image
        src={SECTION_ICONS[name]}
        alt=""
        width={64}
        height={64}
        unoptimized
        className="size-8 md:size-16 object-contain [image-rendering:pixelated] [image-rendering:crisp-edges]"
      />
    </span>
  );
}

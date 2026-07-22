import Image from "next/image";

const ORNAMENTS = {
  "reclaimed-computer-folder": {
    light: "/assets/pixel-ornaments/icons/reclaimed-computer-folder/light.png",
    dark: "/assets/pixel-ornaments/icons/reclaimed-computer-folder/dark.png",
    width: 96,
    height: 96,
  },
  "blog-notebook": {
    light: "/assets/pixel-ornaments/icons/blog-notebook/light.png",
    dark: "/assets/pixel-ornaments/icons/blog-notebook/dark.png",
    width: 96,
    height: 96,
  },
  "certificate-plaque": {
    light: "/assets/pixel-ornaments/icons/certificate-plaque/light.png",
    dark: "/assets/pixel-ornaments/icons/certificate-plaque/dark.png",
    width: 96,
    height: 96,
  },
  "cv-document": {
    light: "/assets/pixel-ornaments/icons/cv-document/light.png",
    dark: "/assets/pixel-ornaments/icons/cv-document/dark.png",
    width: 96,
    height: 96,
  },
  "mossy-masonry-vine": {
    light: "/assets/pixel-ornaments/corners/mossy-masonry-vine/light.png",
    dark: "/assets/pixel-ornaments/corners/mossy-masonry-vine/dark.png",
    width: 256,
    height: 256,
  },
  "weathered-conduit": {
    light: "/assets/pixel-ornaments/dividers/weathered-conduit/light.png",
    dark: "/assets/pixel-ornaments/dividers/weathered-conduit/dark.png",
    width: 768,
    height: 128,
  },
  "abandoned-workstation-window": {
    light: "/assets/pixel-ornaments/scenes/abandoned-workstation-window/light.png",
    dark: "/assets/pixel-ornaments/scenes/abandoned-workstation-window/dark.png",
    width: 384,
    height: 288,
  },
} as const;

export type PixelOrnamentName = keyof typeof ORNAMENTS;

export function PixelOrnament({ name, className = "" }: { name: PixelOrnamentName; className?: string }) {
  const ornament = ORNAMENTS[name];

  return (
    <span className={`pixel-ornament ${className}`} aria-hidden="true">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcSet={ornament.dark} />
        <Image
          src={ornament.light}
          alt=""
          width={ornament.width}
          height={ornament.height}
          unoptimized
        />
      </picture>
    </span>
  );
}

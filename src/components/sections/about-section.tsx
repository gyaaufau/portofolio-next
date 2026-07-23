import { About } from "@/components/about";
import { PixelOrnament } from "@/components/pixel-ornament";
import { SectionShell } from "@/components/section-shell";
import { SectionLeadingIcon } from "@/components/section-leading-icon";
import { getProfile, getSkillCategories } from "@/data/db";

export async function AboutSection() {
  const [profile, skills] = await Promise.all([getProfile(), getSkillCategories()]);
  const skillItems = skills.find((s) => s.name === "skills")?.items ?? [];
  const techItems = skills.find((s) => s.name === "tech")?.items ?? [];
  const softItems = skills.find((s) => s.name === "softSkills")?.items ?? [];
  return (
    <SectionShell
      id="about"
      title="Tools in the inventory."
      description="A focused Flutter toolkit, backed by product thinking and reliable delivery."
      headingAdornment={<SectionLeadingIcon name="about" />}
      asideAdornment={<PixelOrnament name="abandoned-workstation-window" className="w-48" />}
    >
      <About
        paragraphs={[profile.intro]}
        skills={skillItems}
        tech={techItems}
        softSkills={softItems}
        photo={{ src: profile.photoSrc, alt: profile.photoAlt, width: profile.photoWidth, height: profile.photoHeight }}
      />
    </SectionShell>
  );
}

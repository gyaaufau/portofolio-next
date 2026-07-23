import { Hero } from "@/components/hero";
import { getProfile, getSiteSettings } from "@/data/db";

export async function HeroSection() {
  const [profile, settings] = await Promise.all([getProfile(), getSiteSettings()]);
  return (
    <Hero
      name={profile.name}
      role={profile.role}
      intro={profile.intro}
      location={profile.location}
      openToOpportunities={profile.openToOpportunities}
      gameId={settings.heroGameId}
    />
  );
}

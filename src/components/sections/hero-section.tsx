import { Hero } from "@/components/hero";
import { getProfile } from "@/data/db";

export async function HeroSection() {
  const profile = await getProfile();
  return (
    <Hero
      name={profile.name}
      role={profile.role}
      intro={profile.intro}
      location={profile.location}
      openToOpportunities={profile.openToOpportunities}
    />
  );
}

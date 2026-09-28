import { EditorialHome } from "@/components/editorial-home";
import { getCertificates, getCmsSections, getFeaturedApps, getNotes, getProfile, getContact, getSkillCategories, getWorkExperiences } from "@/data/db";
import { publishedSections } from "@/lib/public-content";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [profile, contact, apps, certificates, experience, skills, notes, sections] = await Promise.all([
    getProfile(), getContact(), getFeaturedApps(), getCertificates(), getWorkExperiences(), getSkillCategories(), getNotes(), getCmsSections(),
  ]);
  return <EditorialHome profile={profile} contact={contact} apps={apps} certificates={certificates} experience={experience} skills={skills} notes={notes} sections={publishedSections(sections)} hasConfiguredSections={sections.length > 0} />;
}

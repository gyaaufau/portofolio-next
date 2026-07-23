import { WorkExperience } from "@/components/work-experience";
import { SectionShell } from "@/components/section-shell";
import { SectionLeadingIcon } from "@/components/section-leading-icon";
import { getWorkExperiences } from "@/data/db";

export async function WorkSection() {
  const experiences = await getWorkExperiences();
  return (
    <SectionShell id="work-experience" title="The quest log." description="Teams, roles, and the practical work completed along the way." headingAdornment={<SectionLeadingIcon name="work-experience" />}>
      <WorkExperience experiences={experiences} />
    </SectionShell>
  );
}

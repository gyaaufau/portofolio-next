import { Contact } from "@/components/contact";
import { SectionShell } from "@/components/section-shell";
import { SectionLeadingIcon } from "@/components/section-leading-icon";
import { getContact } from "@/data/db";

export async function ContactSection() {
  const contact = await getContact();
  return (
    <SectionShell id="contact" title="Ready for the next build?" headingAdornment={<SectionLeadingIcon name="contact" />}>
      <div className="relative">
        <div className="relative z-[1]">
          <Contact email={contact.email} whatsapp={contact.whatsapp} github={contact.github} linkedin={contact.linkedin} playConsole={contact.playStore} cv={contact.cv} />
        </div>

      </div>
    </SectionShell>
  );
}

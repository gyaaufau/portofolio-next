import { createWorkExperience } from "@/app/admin/actions";
import { WorkForm } from "../work-form";

export default function NewWorkExperiencePage() {
  return (
    <WorkForm
      action={async (formData) => { "use server"; await createWorkExperience(formData); }}
      submitLabel="Create"
    />
  );
}

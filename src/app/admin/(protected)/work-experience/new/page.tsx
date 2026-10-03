import { saveCmsContent } from "@/app/admin/cms-actions";
import { WorkForm } from "../work-form";

export default function NewWorkExperiencePage() {
  return (
    <WorkForm
      action={saveCmsContent.bind(null,"experience","new")}
      submitLabel="Create role"
    />
  );
}

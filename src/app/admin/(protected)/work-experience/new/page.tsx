import { saveAndPublishCmsDraft, saveCmsDraft } from "@/app/admin/cms-actions";
import { WorkForm } from "../work-form";

export default function NewWorkExperiencePage() {
  return (
    <WorkForm
      action={saveAndPublishCmsDraft.bind(null,"experience","new")}
      draftAction={saveCmsDraft.bind(null,"experience","new")}
      submitLabel="Save and publish"
    />
  );
}

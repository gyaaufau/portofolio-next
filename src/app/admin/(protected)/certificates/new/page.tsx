import { saveAndPublishCmsDraft, saveCmsDraft } from "@/app/admin/cms-actions";
import { CertForm } from "../cert-form";

export default function NewCertificatePage() {
  return (
    <CertForm
      action={saveAndPublishCmsDraft.bind(null,"certificate","new")}
      draftAction={saveCmsDraft.bind(null,"certificate","new")}
      submitLabel="Save and publish"
    />
  );
}

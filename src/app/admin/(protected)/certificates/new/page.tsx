import { saveCmsContent } from "@/app/admin/cms-actions";
import { CertForm } from "../cert-form";

export default function NewCertificatePage() {
  return (
    <CertForm
      action={saveCmsContent.bind(null,"certificate","new")}
      submitLabel="Create certificate"
    />
  );
}

import { createCertificate } from "../../actions";
import { CertForm } from "../cert-form";

export default function NewCertificatePage() {
  return (
    <CertForm
      action={async (formData) => { "use server"; await createCertificate(formData); }}
      submitLabel="Create"
    />
  );
}

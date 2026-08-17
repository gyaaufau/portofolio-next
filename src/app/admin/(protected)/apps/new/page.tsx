import { createApp } from "@/app/admin/actions";
import { AppForm } from "../app-form";

export default function NewAppPage() {
  return (
    <AppForm
      action={async (formData) => {
        "use server";
        await createApp(formData);
      }}
      submitLabel="Create"
      showScreenshots
    />
  );
}

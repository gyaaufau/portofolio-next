import { redirect } from "next/navigation";

export default function NewAppPage() {
  redirect("/admin/content/apps/new");
}

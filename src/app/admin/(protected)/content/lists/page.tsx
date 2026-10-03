import { redirect } from "next/navigation";

export default function ListsPage() {
  redirect("/admin/content?type=experience");
}

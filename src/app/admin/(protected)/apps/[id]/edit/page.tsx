import { redirect } from "next/navigation";

export default async function EditAppPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/content/apps/${id}`);
}

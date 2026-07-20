import { redirect } from "next/navigation";

export default function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  redirect("/apps");
}

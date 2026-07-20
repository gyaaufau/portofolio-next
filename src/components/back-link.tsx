import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BackLink({ href, label }: { href: string; label: string }) {
  return <Link href={href} className="inline-flex items-center gap-2 rounded-[4px] text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"><ArrowLeft className="size-4" /> {label}</Link>;
}

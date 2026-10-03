import Markdown from "react-markdown";
import { toLegalMarkdown } from "@/lib/legal-content";

export function LegalContent({ content }: { content: string }) {
  return <div className="editorial-legal-prose"><Markdown skipHtml>{toLegalMarkdown(content)}</Markdown></div>;
}

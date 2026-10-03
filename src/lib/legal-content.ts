import TurndownService from "turndown";

const converter = new TurndownService({ headingStyle: "atx", strongDelimiter: "**", bulletListMarker: "-" });
converter.remove(["script", "style", "noscript"]);

export function toLegalMarkdown(content: string) {
  return /^\s*<(?:h[1-6]|p|div|ul|ol|blockquote|script|style)\b/i.test(content)
    ? converter.turndown(content)
    : content;
}

export function validateLegalContent(data: Record<string, unknown>) {
  for (const [enabled, content, label] of [
    ["hasPrivacyPolicy", "privacyPolicyContent", "Privacy Policy"],
    ["hasAccountDeletion", "accountDeletionContent", "Account Deletion"],
  ]) {
    if (data[enabled] !== "on") continue;
    const text = toLegalMarkdown(String(data[content] || ""))
      .replace(/<!--[\s\S]*?-->|<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;|&#0*160;|&#x0*a0;/gi, " ")
      .trim();
    if (!/[\p{L}\p{N}]/u.test(text)) throw new Error(`${label} content is required when the page is enabled.`);
  }
}

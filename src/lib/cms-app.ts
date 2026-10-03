import { toLegalMarkdown, validateLegalContent } from "./legal-content";
import { supportEmailOrDefault } from "./support";

/** Missing fields come from older forms and must leave saved values intact. */
export function appSupportFields(payload: Record<string, unknown>) {
  const fields: Record<string, string> = {};
  if (payload.supportEmail !== undefined) {
    const email = supportEmailOrDefault(payload.supportEmail);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid support email.");
    fields.support_email = email;
  }
  if (payload.supportContent !== undefined) fields.support_content = toLegalMarkdown(String(payload.supportContent || "")).trim();
  return fields;
}

/** Omitted fields belong to older editors; never overwrite their saved values. */
export function appLegalFields(payload: Record<string, string>) {
  if (payload.appType && payload.appType !== "mobile") return {};
  validateLegalContent(payload);
  const fields: Record<string, boolean | string> = {};
  for (const [name, column] of [
    ["hasPrivacyPolicy", "has_privacy_policy"],
    ["hasAccountDeletion", "has_account_deletion"],
    ["accountDeletionRequiresAuth", "account_deletion_requires_auth"],
  ]) {
    if (payload.legalFieldsPresent === "on" || payload[name] !== undefined) fields[column] = payload[name] === "on";
  }
  for (const [name, column] of [
    ["privacyPolicyContent", "privacy_policy_content"],
    ["accountDeletionContent", "account_deletion_content"],
  ]) {
    if (payload[name] !== undefined) fields[column] = toLegalMarkdown(payload[name]);
  }
  return fields;
}

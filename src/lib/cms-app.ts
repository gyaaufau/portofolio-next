import { toLegalMarkdown, validateLegalContent } from "./legal-content";

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

export const DEFAULT_SUPPORT_EMAIL = "gyaaufau@gmail.com";

export function supportEmailOrDefault(email: unknown): string {
  return typeof email === "string" && email.trim() ? email.trim() : DEFAULT_SUPPORT_EMAIL;
}

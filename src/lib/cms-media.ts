export function validateMediaUpload(type: string, size: number): string | null {
  if (!["image/png","image/jpeg","image/webp"].includes(type)) return "Choose a PNG, JPG, or WEBP image.";
  if (size > 10 * 1024 * 1024) return "Image must be 10 MB or smaller.";
  return null;
}

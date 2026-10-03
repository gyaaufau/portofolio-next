export function screenshotDimensions(width: unknown, height: unknown) {
  const w = Number(width);
  const h = Number(height);
  return Number.isInteger(w) && w > 0 && Number.isInteger(h) && h > 0
    ? { width: w, height: h }
    : { width: 0, height: 0 };
}

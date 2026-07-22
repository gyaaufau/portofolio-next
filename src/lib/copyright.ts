export const COPYRIGHT_START_YEAR = 2026;

export function formatCopyrightYear(currentYear: number) {
  return currentYear === COPYRIGHT_START_YEAR
    ? `${COPYRIGHT_START_YEAR}`
    : `${COPYRIGHT_START_YEAR}–${currentYear}`;
}

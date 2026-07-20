export const ACCENT_PRESETS = {
  moss: { label: "Moss", color: "#4F7A68" },
  ember: { label: "Ember", color: "#A35F43" },
  berry: { label: "Berry", color: "#98586B" },
  lake: { label: "Lake", color: "#53748E" },
} as const;

export type AccentPreset = keyof typeof ACCENT_PRESETS | "custom";

export const DEFAULT_ACCENT = ACCENT_PRESETS.moss.color;

export function normalizeHexColor(value: unknown): string | null {
  const color = String(value ?? "").trim();
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) return null;
  return color.toUpperCase();
}

export function resolveAccent(presetValue: unknown, customValue: unknown) {
  const preset = String(presetValue ?? "moss") as AccentPreset;

  if (preset === "custom") {
    const custom = normalizeHexColor(customValue);
    if (!custom) return { error: "Enter a six-digit hex color, such as #4F7A68." } as const;
    return { preset, color: custom } as const;
  }

  if (!(preset in ACCENT_PRESETS)) {
    return { error: "Choose one of the available accent presets." } as const;
  }

  return {
    preset,
    color: ACCENT_PRESETS[preset as keyof typeof ACCENT_PRESETS].color,
  } as const;
}

export function readableForeground(hex: string): "#FDFCF9" | "#17201D" {
  const normalized = normalizeHexColor(hex) ?? DEFAULT_ACCENT;
  const red = Number.parseInt(normalized.slice(1, 3), 16) / 255;
  const green = Number.parseInt(normalized.slice(3, 5), 16) / 255;
  const blue = Number.parseInt(normalized.slice(5, 7), 16) / 255;
  const linearize = (channel: number) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  const luminance =
    0.2126 * linearize(red) + 0.7152 * linearize(green) + 0.0722 * linearize(blue);
  return luminance > 0.42 ? "#17201D" : "#FDFCF9";
}

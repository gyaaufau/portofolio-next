"use client";

import { useActionState, useState } from "react";
import { updateSiteSettings } from "@/app/admin/actions";
import { ACCENT_PRESETS, readableForeground } from "@/lib/theme";

export function AppearanceForm({ initialPreset, initialColor }: { initialPreset: string; initialColor: string }) {
  const [preset, setPreset] = useState(initialPreset);
  const [color, setColor] = useState(initialColor);
  const [state, action, pending] = useActionState(updateSiteSettings, null);
  const activeColor = preset === "custom"
    ? color
    : ACCENT_PRESETS[preset as keyof typeof ACCENT_PRESETS]?.color ?? color;
  const foreground = readableForeground(activeColor);

  return (
    <form action={action} className="space-y-6">
      <fieldset className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <legend className="sr-only">Accent preset</legend>
        {Object.entries(ACCENT_PRESETS).map(([key, value]) => (
          <label key={key} className="cursor-pointer rounded-lg border border-border bg-card p-3 has-[:checked]:border-primary has-[:checked]:ring-2 has-[:checked]:ring-primary/20">
            <input className="sr-only" type="radio" name="accentPreset" value={key} checked={preset === key} onChange={() => setPreset(key)} />
            <span className="block h-10 rounded-md mb-2" style={{ backgroundColor: value.color }} />
            <span className="text-sm font-medium">{value.label}</span>
          </label>
        ))}
      </fieldset>

      <label className="block rounded-lg border border-border bg-card p-4 cursor-pointer">
        <span className="flex items-center gap-3">
          <input type="radio" name="accentPreset" value="custom" checked={preset === "custom"} onChange={() => setPreset("custom")} />
          <span className="font-medium">Custom color</span>
          <input
            type="color"
            name="accentColor"
            value={color}
            onChange={(event) => { setColor(event.target.value.toUpperCase()); setPreset("custom"); }}
            className="size-10 ml-auto"
            aria-label="Custom accent color"
          />
          <code className="text-xs text-muted-foreground">{color}</code>
        </span>
      </label>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-lg p-5 border border-black/10" style={{ backgroundColor: "#F5F4EF", color: "#202320" }}>
          <p className="text-xs mb-3">Light preview</p>
          <button type="button" className="px-4 py-2 rounded-md text-sm font-semibold" style={{ backgroundColor: activeColor, color: foreground }}>View apps</button>
        </div>
        <div className="rounded-lg p-5 border border-white/10" style={{ backgroundColor: "#171B1E", color: "#F4F2EC" }}>
          <p className="text-xs mb-3">Dark preview</p>
          <button type="button" className="px-4 py-2 rounded-md text-sm font-semibold" style={{ backgroundColor: activeColor, color: foreground }}>View apps</button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm" aria-live="polite">
          {state?.error && <span className="text-destructive">{state.error}</span>}
          {state?.success && <span className="text-primary">{state.success}</span>}
        </p>
        <button disabled={pending} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">
          {pending ? "Saving..." : "Save appearance"}
        </button>
      </div>
    </form>
  );
}

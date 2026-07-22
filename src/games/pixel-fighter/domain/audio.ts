import type { AttackDefinition, CharacterId, ContainerId, ImpactId, ItemId } from "./types";

export type SoundCueId =
  | "step"
  | "jump"
  | "swing"
  | "sword"
  | "dash"
  | "revolver"
  | "snow-shot"
  | "hit-light"
  | "hit-medium"
  | "hit-heavy"
  | "finisher"
  | "knockout"
  | "pickup-coin"
  | "pickup-powerup"
  | "container-wood"
  | "container-metal";

export interface SoundAssetDefinition {
  files: readonly string[];
  volume: number;
}

const AUDIO_ROOT = "/games/pixel-fighter/audio";

export const SOUND_ASSETS: Record<SoundCueId, SoundAssetDefinition> = {
  step: { files: [`${AUDIO_ROOT}/step-1.ogg`, `${AUDIO_ROOT}/step-2.ogg`, `${AUDIO_ROOT}/step-3.ogg`], volume: 0.22 },
  jump: { files: [`${AUDIO_ROOT}/jump.wav`], volume: 0.34 },
  swing: { files: [`${AUDIO_ROOT}/swing.wav`], volume: 0.32 },
  sword: { files: [`${AUDIO_ROOT}/sword-1.ogg`, `${AUDIO_ROOT}/sword-2.ogg`], volume: 0.38 },
  dash: { files: [`${AUDIO_ROOT}/dash.wav`], volume: 0.36 },
  revolver: { files: [`${AUDIO_ROOT}/revolver.wav`], volume: 0.48 },
  "snow-shot": { files: [`${AUDIO_ROOT}/snow-shot.wav`], volume: 0.42 },
  "hit-light": { files: [`${AUDIO_ROOT}/hit-light.wav`], volume: 0.38 },
  "hit-medium": { files: [`${AUDIO_ROOT}/hit-medium.wav`], volume: 0.44 },
  "hit-heavy": { files: [`${AUDIO_ROOT}/hit-heavy.wav`], volume: 0.52 },
  finisher: { files: [`${AUDIO_ROOT}/finisher.wav`], volume: 0.58 },
  knockout: { files: [`${AUDIO_ROOT}/knockout.wav`], volume: 0.56 },
  "pickup-coin": { files: [`${AUDIO_ROOT}/pickup-coin.wav`], volume: 0.4 },
  "pickup-powerup": { files: [`${AUDIO_ROOT}/pickup-powerup.wav`], volume: 0.42 },
  "container-wood": { files: [`${AUDIO_ROOT}/container-wood.ogg`], volume: 0.42 },
  "container-metal": { files: [`${AUDIO_ROOT}/container-metal.ogg`], volume: 0.4 },
};

export function getAttackCue(character: CharacterId, attack: AttackDefinition): SoundCueId {
  if (attack.projectileSpeed) return character === "MARSTON" ? "revolver" : "snow-shot";
  if (attack.dashSpeed) return "dash";
  return character === "MUSASHI" ? "sword" : "swing";
}

export function getAttackCueAtMs(attack: AttackDefinition): number {
  if (attack.dashSpeed) return 0;
  const firstHitAt = attack.hits[0]?.atMs ?? 0;
  return attack.projectileSpeed ? firstHitAt : Math.max(0, firstHitAt - 35);
}

export function getImpactCue(impact: ImpactId): SoundCueId {
  if (impact === "impactHuge") return "finisher";
  if (impact === "impact3") return "hit-heavy";
  if (impact === "impact2") return "hit-medium";
  return "hit-light";
}

export function getPickupCue(item: ItemId): SoundCueId {
  return item === "coin" ? "pickup-coin" : "pickup-powerup";
}

export function getContainerCue(container: ContainerId): SoundCueId {
  return container === "metal-crate" ? "container-metal" : "container-wood";
}

export function getSoundAssetKey(cue: SoundCueId, variant: number): string {
  return `pixel-fighter-sfx-${cue}-${variant}`;
}

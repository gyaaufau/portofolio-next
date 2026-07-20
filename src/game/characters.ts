import type { AnimationDefinition, AttackDefinition, CharacterDefinition, CharacterId, HitWindow, ImpactId } from "./types";

const frame = (character: CharacterId, path: string) => `CHARAs/${character}/${path}`;
const sequence = (character: CharacterId, directory: string, prefix: string, count: number, start = 1) =>
  Array.from({ length: count }, (_, index) => frame(character, `${directory}/${prefix}_${index + start}.png`));
const animation = (frames: string[], frameRate: number, repeat = 0): AnimationDefinition => ({ frames, frameRate, repeat });
const hit = (atMs: number, damage: number, range: number, knockback: number, lift: number, impact: ImpactId, verticalRange = 20): HitWindow => ({ atMs, damage, range, verticalRange, knockback, lift, impact });
const attack = (id: string, animationId: AttackDefinition["animation"], durationMs: number, recoveryStartMs: number, cooldownMs: number, hits: HitWindow[], extras: Partial<AttackDefinition> = {}): AttackDefinition => ({ id, animation: animationId, durationMs, recoveryStartMs, cooldownMs, hits, ...extras });

export const CHARACTERS: Record<CharacterId, CharacterDefinition> = {
  MARSTON: {
    id: "MARSTON",
    name: "Marston",
    role: "Balanced gunslinger",
    idleFrame: frame("MARSTON", "Idle.png"),
    nameFrame: frame("MARSTON", "name.png"),
    speed: 74,
    jumpSpeed: 146,
    weight: 1,
    animations: {
      idle: animation([frame("MARSTON", "Idle.png")], 1, -1),
      run: animation(sequence("MARSTON", "running", "running", 8), 12, -1),
      runArmed: animation(sequence("MARSTON", "running_gun", "running_gun", 8), 12, -1),
      jump: animation(sequence("MARSTON", "jump", "jump", 2), 8),
      fall: animation([frame("MARSTON", "fall.png")], 1, -1),
      combo1: animation(sequence("MARSTON", "attack1", "attack1", 2), 13),
      combo2: animation(sequence("MARSTON", "attack2", "attack2", 2), 13),
      combo3: animation(sequence("MARSTON", "attack3", "attack3", 2), 12),
      special: animation([...sequence("MARSTON", "gun_start", "gun_start", 5), ...sequence("MARSTON", "gun_shoot", "gun_shoot", 3)], 14),
      dodge: animation([sequence("MARSTON", "running", "running", 8)[1]], 1),
      hurt: animation(sequence("MARSTON", "damage", "hit", 2), 10),
      knockout: animation([...sequence("MARSTON", "death_hit", "death_hit", 2), ...sequence("MARSTON", "death_ground", "death_ground", 2)], 7),
    },
    idle: { durationMs: 1360, delayMs: 80, shiftPx: 1 },
    combo: {
      stages: [
        attack("marston-jab", "combo1", 190, 140, 0, [hit(72, 5, 20, 48, 18, "impact1")]),
        attack("marston-cross", "combo2", 210, 150, 0, [hit(82, 7, 23, 62, 25, "impact2")]),
        attack("marston-finisher", "combo3", 310, 215, 480, [hit(118, 11, 28, 102, 42, "impact3")]),
      ],
      aerialStages: 2,
    },
    special: attack("marston-revolver", "special", 650, 510, 1150, [hit(390, 11, 112, 88, 24, "impact3", 16)], { projectileSpeed: 180 }),
    ai: { aggression: 0.58, preferredRange: 76, dodgeChance: 0.18, jumpChance: 0.18 },
  },
  MUSASHI: {
    id: "MUSASHI",
    name: "Musashi",
    role: "Fast close-range swordsman",
    idleFrame: frame("MUSASHI", "Idle.png"),
    nameFrame: frame("MUSASHI", "name.png"),
    speed: 88,
    jumpSpeed: 154,
    weight: 0.88,
    animations: {
      idle: animation([frame("MUSASHI", "Idle.png")], 1, -1),
      run: animation(sequence("MUSASHI", "running", "running", 8), 14, -1),
      runArmed: animation(sequence("MUSASHI", "running", "running", 8), 14, -1),
      jump: animation([frame("MUSASHI", "jump.png")], 1),
      fall: animation(sequence("MUSASHI", "fall", "fall", 2), 8),
      combo1: animation(sequence("MUSASHI", "attack1", "attack1", 2), 15),
      combo2: animation(sequence("MUSASHI", "attack2", "attack2", 2), 15),
      combo3: animation(sequence("MUSASHI", "attack3", "attack3", 2), 14),
      special: animation([...sequence("MUSASHI", "dash_attack", "dash_attack", 3), ...sequence("MUSASHI", "dash_stop", "dash_stop", 4)], 15),
      dodge: animation([frame("MUSASHI", "dash.png")], 1),
      hurt: animation(sequence("MUSASHI", "damage", "hit", 2), 10),
      knockout: animation([...sequence("MUSASHI", "death_hit", "death_hit", 2), ...sequence("MUSASHI", "death_ground", "death_ground", 2)], 7),
    },
    idle: { durationMs: 1120, delayMs: 10, shiftPx: 1 },
    combo: {
      stages: [
        attack("musashi-cut", "combo1", 170, 118, 0, [hit(58, 5, 23, 46, 18, "impact1")]),
        attack("musashi-return", "combo2", 185, 128, 0, [hit(66, 7, 25, 61, 24, "impact2")]),
        attack("musashi-finisher", "combo3", 270, 180, 390, [hit(94, 12, 31, 112, 36, "impact3")]),
      ],
      aerialStages: 2,
    },
    special: attack("musashi-dash-strike", "special", 560, 420, 1020, [hit(190, 14, 39, 108, 30, "impactHuge")], { dashSpeed: 172 }),
    ai: { aggression: 0.78, preferredRange: 27, dodgeChance: 0.25, jumpChance: 0.24 },
  },
  NAMKA: {
    id: "NAMKA",
    name: "Namka",
    role: "Powerful space controller",
    idleFrame: frame("NAMKA", "Idle.png"),
    nameFrame: frame("NAMKA", "name.png"),
    speed: 66,
    jumpSpeed: 140,
    weight: 1.15,
    animations: {
      idle: animation([frame("NAMKA", "Idle.png")], 1, -1),
      run: animation(sequence("NAMKA", "running", "running", 8), 11, -1),
      runArmed: animation(sequence("NAMKA", "running_gun", "running_gun", 8), 11, -1),
      jump: animation(sequence("NAMKA", "jump", "jump", 2), 8),
      fall: animation(sequence("NAMKA", "fall", "fall", 2), 8),
      combo1: animation(sequence("NAMKA", "attack_prepare", "attack_prepare", 5), 15),
      combo2: animation(sequence("NAMKA", "attack", "attack", 4), 15),
      combo3: animation(sequence("NAMKA", "attack", "attack", 5, 5), 14),
      special: animation([...sequence("NAMKA", "gun_prepare", "gun_prepare", 3), ...sequence("NAMKA", "gun_shot", "gun_shot", 3)], 12),
      dodge: animation([sequence("NAMKA", "running", "running", 8)[1]], 1),
      hurt: animation(sequence("NAMKA", "damage", "hit", 2), 10),
      knockout: animation([...sequence("NAMKA", "death_hit", "death_hit", 2), ...sequence("NAMKA", "death_ground", "death_ground", 2)], 7),
    },
    idle: { durationMs: 1580, delayMs: 160, shiftPx: 1 },
    combo: {
      stages: [
        attack("namka-charge", "combo1", 340, 250, 0, [hit(214, 4, 27, 38, 15, "impact1", 24)]),
        attack("namka-wave", "combo2", 315, 228, 0, [hit(94, 4, 32, 52, 28, "impact2", 26), hit(205, 4, 36, 58, 32, "impact2", 28)]),
        attack("namka-finisher", "combo3", 410, 288, 820, [hit(142, 13, 42, 105, 52, "impactHuge", 30)]),
      ],
      aerialStages: 2,
    },
    special: attack("namka-snow-shot", "special", 720, 560, 1220, [hit(410, 10, 105, 82, 32, "impact3", 19)], { projectileSpeed: 142 }),
    ai: { aggression: 0.48, preferredRange: 82, dodgeChance: 0.14, jumpChance: 0.13 },
  },
};

export const CHARACTER_IDS = Object.keys(CHARACTERS) as CharacterId[];

export function parseCharacterSelection(value: string | null): CharacterId | null {
  return CHARACTER_IDS.find((character) => character === value) ?? null;
}

export function chooseOpponent(player: CharacterId, random = Math.random()): CharacterId {
  const candidates = CHARACTER_IDS.filter((id) => id !== player);
  return candidates[Math.min(candidates.length - 1, Math.floor(random * candidates.length))];
}

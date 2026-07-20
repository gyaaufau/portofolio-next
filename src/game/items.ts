import type { ContainerId, ItemId } from "./types";

export const CONTAINERS: Record<ContainerId, { frame: string; hitPoints: number }> = {
  crate: { frame: "ITEMs/caisse.png", hitPoints: 2 },
  "metal-crate": { frame: "ITEMs/caisse_metal.png", hitPoints: 3 },
  chest: { frame: "ITEMs/chest.png", hitPoints: 3 },
};

export const ITEMS: Record<ItemId, { frame: string; label: string }> = {
  heal: { frame: "ITEMs/bonus1.png", label: "+12 vitality" },
  cooldown: { frame: "ITEMs/bonus2.png", label: "Special ready" },
  haste: { frame: "ITEMs/bonus3.png", label: "Speed boost" },
  coin: { frame: "ITEMs/coin.png", label: "+100 score" },
};

export function chooseContainer(random: number): ContainerId {
  return (["crate", "metal-crate", "chest"] as const)[Math.min(2, Math.floor(random * 3))];
}

export function chooseDrop(random: number): ItemId {
  return (["heal", "cooldown", "haste", "coin"] as const)[Math.min(3, Math.floor(random * 4))];
}

export function applyPickup(item: ItemId, vitality: number, score: number) {
  return {
    vitality: item === "heal" ? Math.min(100, vitality + 12) : vitality,
    score: item === "coin" ? score + 100 : score,
    resetCooldown: item === "cooldown",
    hasteMs: item === "haste" ? 5000 : 0,
  };
}

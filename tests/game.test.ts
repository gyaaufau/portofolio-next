import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { decideAI } from "../src/games/pixel-fighter/domain/ai";
import { canDodgeCancel, nextComboStage, readyHitIndexes, shouldEnterVisualState } from "../src/games/pixel-fighter/domain/combat";
import { CHARACTER_IDS, CHARACTERS, chooseOpponent, parseCharacterSelection } from "../src/games/pixel-fighter/domain/characters";
import { applyPickup, chooseContainer, chooseDrop, CONTAINERS, ITEMS } from "../src/games/pixel-fighter/domain/items";
import { createArenaLayout } from "../src/games/pixel-fighter/domain/layout";
import { canUseBufferedJump, fastFallVelocity, isOutsideBlastBoundary, needsEdgeRecovery } from "../src/games/pixel-fighter/domain/movement";
import { applyDamage, awardRound, calculateKnockback, createSeededRandom, getMatchResult, resolveTimedRound } from "../src/games/pixel-fighter/domain/rules";
import { EMPTY_INPUT, type FighterState, type RoundState } from "../src/games/pixel-fighter/domain/types";

test("all fighters have complete animation and combat manifests", () => {
  for (const id of CHARACTER_IDS) {
    const fighter = CHARACTERS[id];
    assert.ok(fighter.idle.durationMs >= 1000);
    assert.ok(fighter.idle.shiftPx <= 1);
    assert.ok(fighter.speed > 0 && fighter.jumpSpeed > 0);
    assert.equal(fighter.combo.stages.length, 3);
    for (const attack of [...fighter.combo.stages, fighter.special]) {
      assert.ok(attack.recoveryStartMs < attack.durationMs);
      assert.ok(attack.hits.length > 0);
      assert.ok(attack.hits.every((window) => window.atMs > 0 && window.atMs < attack.durationMs));
    }
    for (const animation of Object.values(fighter.animations)) {
      assert.ok(animation.frames.length > 0);
      for (const frame of animation.frames) {
        assert.ok(frame.startsWith(`CHARAs/${id}/`));
      }
    }
  }
});

test("generated atlases contain every declared character frame with stable origins", () => {
  const atlasPath = new URL("../public/games/pixel-fighter/generated/characters.json", import.meta.url);
  assert.equal(existsSync(atlasPath), true);
  type AtlasFrame = { frame: { x: number; y: number; w: number; h: number }; pivot: { x: number; y: number }; sourceSize: { w: number; h: number } };
  const atlas = JSON.parse(readFileSync(atlasPath, "utf8")) as { frames: Record<string, AtlasFrame>; meta: { image: string; size: { w: number; h: number } } };
  assert.equal(atlas.meta.image, "characters.png");
  assert.ok(atlas.meta.size.w > 0 && atlas.meta.size.h > 0);
  for (const fighter of Object.values(CHARACTERS)) {
    const characterFrames = Object.entries(atlas.frames).filter(([name]) => name.startsWith(`CHARAs/${fighter.id}/`));
    assert.ok(characterFrames.length > 0);
    const sizes = new Set(characterFrames.map(([, metadata]) => `${metadata.sourceSize.w}x${metadata.sourceSize.h}`));
    assert.equal(sizes.size, 1, `${fighter.name} frames should share one normalized canvas`);
    assert.ok(characterFrames.every(([, metadata]) => metadata.pivot.x === 0.5 && metadata.pivot.y === 1));
    for (const animation of Object.values(fighter.animations)) {
      for (const frame of animation.frames) assert.ok(atlas.frames[frame], `Missing ${frame}`);
    }
  }
});

test("environment, effects, finishers, and UI atlases have valid Phaser metadata and production files", () => {
  for (const name of ["environment", "effects", "finishers", "items"]) {
    const jsonPath = new URL(`../public/games/pixel-fighter/generated/${name}.json`, import.meta.url);
    const imagePath = new URL(`../public/games/pixel-fighter/generated/${name}.png`, import.meta.url);
    assert.equal(existsSync(jsonPath), true);
    assert.equal(existsSync(imagePath), true);
    const atlas = JSON.parse(readFileSync(jsonPath, "utf8")) as { frames: Record<string, { frame: { x: number; y: number; w: number; h: number } }>; meta: { image: string } };
    assert.equal(atlas.meta.image, `${name}.png`);
    assert.ok(Object.values(atlas.frames).every(({ frame }) => frame.w > 0 && frame.h > 0 && frame.x >= 0 && frame.y >= 0));
  }
});

test("combat damage clamps and knockback grows as vitality falls", () => {
  assert.equal(applyDamage(100, 12), 88);
  assert.equal(applyDamage(4, 12), 0);
  assert.ok(calculateKnockback(70, 20) > calculateKnockback(70, 90));
  assert.ok(calculateKnockback(70, 20, 0.8) > calculateKnockback(70, 20, 1.2));
});

test("round and match rules handle timeouts, sudden death, and best of three", () => {
  assert.equal(resolveTimedRound(70, 20), "player");
  assert.equal(resolveTimedRound(20, 70), "enemy");
  assert.equal(resolveTimedRound(40, 40), "sudden-death");
  const initial: RoundState = { playerWins: 1, enemyWins: 0, playerVitality: 100, enemyVitality: 100, playerScore: 200, enemyScore: 0, secondsRemaining: 45, suddenDeath: false };
  const won = awardRound(initial, "player");
  assert.deepEqual(getMatchResult(won), { winner: "player", playerWins: 2, enemyWins: 0, playerScore: 200, enemyScore: 0 });
});

test("opponent selection is deterministic and never creates a mirror match", () => {
  const random = createSeededRandom(42);
  for (const player of CHARACTER_IDS) {
    for (let index = 0; index < 10; index += 1) assert.notEqual(chooseOpponent(player, random()), player);
  }
  const first = createSeededRandom(99);
  const second = createSeededRandom(99);
  assert.deepEqual(Array.from({ length: 5 }, first), Array.from({ length: 5 }, second));
});

test("stored character selection accepts only the three real fighters", () => {
  assert.equal(parseCharacterSelection("MUSASHI"), "MUSASHI");
  assert.equal(parseCharacterSelection("NAMKA"), "NAMKA");
  assert.equal(parseCharacterSelection("unknown"), null);
  assert.equal(parseCharacterSelection(null), null);
});

test("movement rules cover coyote time, jump buffering, double jump, fast fall, and blast bounds", () => {
  assert.equal(canUseBufferedJump({ now: 100, bufferedUntil: 150, grounded: false, coyoteUntil: 110, jumpsUsed: 1 }), true);
  assert.equal(canUseBufferedJump({ now: 100, bufferedUntil: 150, grounded: false, coyoteUntil: 0, jumpsUsed: 1 }), true);
  assert.equal(canUseBufferedJump({ now: 160, bufferedUntil: 150, grounded: true, coyoteUntil: 200, jumpsUsed: 0 }), false);
  assert.equal(canUseBufferedJump({ now: 100, bufferedUntil: 150, grounded: false, coyoteUntil: 0, jumpsUsed: 2 }), false);
  assert.equal(fastFallVelocity(-40), 108);
  assert.equal(fastFallVelocity(140), 140);
  assert.equal(isOutsideBlastBoundary(-25, 100, 300, 200), true);
  assert.equal(isOutsideBlastBoundary(150, 225, 300, 200), true);
  assert.equal(isOutsideBlastBoundary(150, 100, 300, 200), false);
  assert.equal(needsEdgeRecovery(8, 100, 300, 171), true);
});

test("attack manifests keep valid hit, dodge, stun, and cooldown windows", () => {
  for (const fighter of Object.values(CHARACTERS)) {
    for (const attack of [...fighter.combo.stages, fighter.special]) {
      assert.ok(attack.hits.every((window) => window.damage > 0));
      assert.ok(attack.hits.every((window) => window.knockback > 0));
      assert.ok(attack.hits.every((window) => window.atMs > 0 && window.atMs < attack.durationMs));
      assert.ok(attack.cooldownMs >= 0);
      assert.ok(attack.recoveryStartMs > 0 && attack.recoveryStartMs < attack.durationMs);
    }
  }
});

test("automatic combos advance, truncate in air, expose hit windows, and allow only recovery cancels", () => {
  const attack = CHARACTERS.NAMKA.combo.stages[1];
  assert.equal(nextComboStage(0, true, 2), 1);
  assert.equal(nextComboStage(1, true, 2), 2);
  assert.equal(nextComboStage(2, true, 2), null);
  assert.equal(nextComboStage(1, false, 2), null);
  assert.deepEqual(readyHitIndexes(attack, 100, new Set()).map(({ index }) => index), [0]);
  assert.deepEqual(readyHitIndexes(attack, 240, new Set([0])).map(({ index }) => index), [1]);
  assert.equal(canDodgeCancel(attack, attack.recoveryStartMs - 1), false);
  assert.equal(canDodgeCancel(attack, attack.recoveryStartMs), true);
});

test("looping visual states enter once instead of restarting every physics frame", () => {
  assert.equal(shouldEnterVisualState(undefined, "run"), true);
  assert.equal(shouldEnterVisualState("idle", "run"), true);
  assert.equal(shouldEnterVisualState("run", "run"), false);
  assert.equal(shouldEnterVisualState("combo2", "run"), true);
});

test("seeded containers and pickup effects stay restrained and deterministic", () => {
  assert.equal(chooseContainer(0), "crate");
  assert.equal(chooseContainer(0.5), "metal-crate");
  assert.equal(chooseDrop(0.99), "coin");
  assert.equal(CONTAINERS.crate.hitPoints, 2);
  assert.equal(CONTAINERS["metal-crate"].hitPoints, 3);
  assert.equal(Object.keys(ITEMS).length, 4);
  assert.deepEqual(applyPickup("heal", 94, 0), { vitality: 100, score: 0, resetCooldown: false, hasteMs: 0 });
  assert.deepEqual(applyPickup("cooldown", 80, 0), { vitality: 80, score: 0, resetCooldown: true, hasteMs: 0 });
  assert.deepEqual(applyPickup("haste", 80, 0), { vitality: 80, score: 0, resetCooldown: false, hasteMs: 5000 });
  assert.deepEqual(applyPickup("coin", 80, 200), { vitality: 80, score: 300, resetCooldown: false, hasteMs: 0 });
});

test("responsive arena layout expands from the authored 300 by 200 baseline", () => {
  const baseline = createArenaLayout(300, 200);
  const ultrawide = createArenaLayout(540, 200);
  assert.equal(baseline.floorY, 171);
  assert.equal(ultrawide.width, 540);
  assert.ok(ultrawide.playerSpawnX < ultrawide.enemySpawnX);
  assert.ok(ultrawide.upperPlatforms.every((platform) => platform.x > 0 && platform.x < ultrawide.width));
});

test("AI recovers below the stage and attacks inside preferred range", () => {
  const base: FighterState = {
    character: "MUSASHI", x: 120, y: 150, velocityX: 0, velocityY: 0,
    vitality: 100, grounded: true, facing: 1, cooldownUntil: 0, hitStunUntil: 0, dodgeUntil: 0,
    comboStage: -1,
  };
  const recovering = decideAI({ self: { ...base, y: 195 }, opponent: { ...base, x: 150 }, now: 1000, arenaWidth: 300, floorY: 170, random: 0.5 });
  assert.equal(recovering.state, "recover");
  assert.equal(recovering.input.jump, true);

  const attacking = decideAI({ self: base, opponent: { ...base, x: 136 }, now: 1000, arenaWidth: 300, floorY: 170, random: 0.8 });
  assert.equal(attacking.state, "attack");
  assert.notDeepEqual(attacking.input, EMPTY_INPUT);
  const movingSpecial = decideAI({ self: base, opponent: { ...base, x: 136 }, now: 1000, arenaWidth: 300, floorY: 170, random: 0.27 });
  assert.equal(movingSpecial.input.special, true);
  assert.equal(movingSpecial.input.right, true);
});

test("AI dodges active finishers and pursues useful pickups", () => {
  const base: FighterState = {
    character: "MUSASHI", x: 120, y: 150, velocityX: 0, velocityY: 0,
    vitality: 45, grounded: true, facing: 1, cooldownUntil: 0, hitStunUntil: 0, dodgeUntil: 0, comboStage: -1,
  };
  const dodging = decideAI({ self: base, opponent: { ...base, x: 142, comboStage: 2 }, now: 1000, arenaWidth: 300, floorY: 170, random: 0.2 });
  assert.equal(dodging.state, "dodge");
  const collecting = decideAI({ self: base, opponent: { ...base, x: 210 }, now: 1000, arenaWidth: 300, floorY: 170, random: 0.5, activeItem: { x: 150, y: 150, kind: "pickup", item: "heal" } });
  assert.equal(collecting.state, "collect");
});

import * as Phaser from "phaser";
import type { CharacterId, GameBridge } from "../domain/types";
import { BASE_HEIGHT, BASE_WIDTH, FightScene } from "./scene";
import type { FightGameController } from "./types";

export function mountFightGame(parent: HTMLElement, playerId: CharacterId, bridge: GameBridge, reducedMotion: boolean): FightGameController {
  const scene = new FightScene(playerId, bridge, reducedMotion);
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: BASE_WIDTH,
    height: BASE_HEIGHT,
    parent,
    transparent: true,
    pixelArt: true,
    roundPixels: true,
    antialias: false,
    physics: { default: "arcade", arcade: { gravity: { x: 0, y: 0 }, debug: false, fixedStep: true, fps: 60 } },
    scale: { mode: Phaser.Scale.EXPAND, autoCenter: Phaser.Scale.CENTER_BOTH, width: BASE_WIDTH, height: BASE_HEIGHT },
    input: { activePointers: 6 },
    scene,
    banner: false,
    render: { pixelArt: true, antialias: false, roundPixels: true, transparent: true, maxTextures: 16 },
  });

  return {
    start: () => scene.startMatch(),
    replay: () => scene.replay(),
    pause: (paused) => scene.setPaused(paused),
    setMobileInput: (next) => scene.setMobileInput(next),
    setMuted: (muted) => scene.setMuted(muted),
    destroy: () => {
      scene.shutdownAudio();
      game.destroy(true);
    },
  };
}


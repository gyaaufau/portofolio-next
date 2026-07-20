import * as Phaser from "phaser";
import { decideAI } from "../domain/ai";
import { canDodgeCancel, nextComboStage, readyHitIndexes, shouldEnterVisualState } from "../domain/combat";
import { CHARACTERS, chooseOpponent } from "../domain/characters";
import { applyPickup, chooseContainer, chooseDrop, CONTAINERS, ITEMS } from "../domain/items";
import { createArenaLayout } from "../domain/layout";
import { canUseBufferedJump, COYOTE_TIME_MS, fastFallVelocity, JUMP_BUFFER_MS } from "../domain/movement";
import { applyDamage, awardRound, calculateKnockback, createSeededRandom, getMatchResult, MAX_VITALITY, resolveTimedRound, ROUND_SECONDS } from "../domain/rules";
import {
  EMPTY_INPUT,
  type ActiveItemState,
  type AnimationId,
  type ArenaLayout,
  type AttackDefinition,
  type CharacterDefinition,
  type CharacterId,
  type ContainerId,
  type FighterState,
  type GameBridge,
  type HitWindow,
  type HudState,
  type InputState,
  type ItemId,
  type RoundState,
} from "../domain/types";

export const BASE_WIDTH = 300;
export const BASE_HEIGHT = 200;
const GRAVITY = 430;
const SOURCE_ASSET_ROOT = "/FIGHTGAME_Assets";
const RUNTIME_ASSET_ROOT = "/games/pixel-fighter/generated";

type KeyMap = {
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  leftAlt: Phaser.Input.Keyboard.Key;
  rightAlt: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  downAlt: Phaser.Input.Keyboard.Key;
  jump: Phaser.Input.Keyboard.Key;
  jumpAlt: Phaser.Input.Keyboard.Key;
  jumpSpace: Phaser.Input.Keyboard.Key;
  light: Phaser.Input.Keyboard.Key;
  special: Phaser.Input.Keyboard.Key;
  dodge: Phaser.Input.Keyboard.Key;
  pause: Phaser.Input.Keyboard.Key;
  exit: Phaser.Input.Keyboard.Key;
};

type FighterRuntime = {
  definition: CharacterDefinition;
  bodyObject: Phaser.GameObjects.Zone;
  body: Phaser.Physics.Arcade.Body;
  visual: Phaser.GameObjects.Sprite;
  shadow: Phaser.GameObjects.Ellipse;
  vitality: number;
  score: number;
  facing: -1 | 1;
  jumpsUsed: number;
  jumpBufferedUntil: number;
  coyoteUntil: number;
  cooldownUntil: number;
  dodgeCooldownUntil: number;
  dodgeUntil: number;
  hitStunUntil: number;
  armedUntil: number;
  hasteUntil: number;
  lastFootstepAt: number;
  activeAttack?: AttackDefinition;
  attackStartedAt: number;
  comboStage: number;
  comboStartedGrounded: boolean;
  consumedHits: Set<number>;
  visualState?: AnimationId;
  isPlayer: boolean;
};

type ProjectileRuntime = {
  image: Phaser.GameObjects.Image;
  active: boolean;
  owner?: FighterRuntime;
  hit?: HitWindow;
  velocity: number;
  expiresAt: number;
};

type ContainerRuntime = {
  id: ContainerId;
  image: Phaser.GameObjects.Image;
  hitPoints: number;
};

type PickupRuntime = {
  id: ItemId;
  image: Phaser.GameObjects.Image;
  spawnedAt: number;
};

export class FightScene extends Phaser.Scene {
  private playerId: CharacterId;
  private enemyId: CharacterId;
  private bridge: GameBridge;
  private reducedMotion: boolean;
  private layout: ArenaLayout = createArenaLayout(BASE_WIDTH, BASE_HEIGHT);
  private worldScale = 1;
  private player!: FighterRuntime;
  private enemy!: FighterRuntime;
  private keys!: KeyMap;
  private mobileInput: InputState = { ...EMPTY_INPUT };
  private aiInput: InputState = { ...EMPTY_INPUT };
  private aiNextDecisionAt = 0;
  private platforms: Phaser.GameObjects.Zone[] = [];
  private projectiles: ProjectileRuntime[] = [];
  private effects: Phaser.GameObjects.Sprite[] = [];
  private ambient: Phaser.GameObjects.Image[] = [];
  private roundState: RoundState = {
    playerWins: 0,
    enemyWins: 0,
    playerVitality: MAX_VITALITY,
    enemyVitality: MAX_VITALITY,
    playerScore: 0,
    enemyScore: 0,
    secondsRemaining: ROUND_SECONDS,
    suddenDeath: false,
  };
  private playing = false;
  private paused = false;
  private roundTransition = false;
  private countdownUntil = 0;
  private roundStartedAt = 0;
  private nextContainerAt = Number.POSITIVE_INFINITY;
  private lastHudSecond = -1;
  private lastAmbientAt = 0;
  private statusText!: Phaser.GameObjects.Text;
  private audioContext?: AudioContext;
  private muted = true;
  private activeContainer?: ContainerRuntime;
  private activePickup?: PickupRuntime;
  private finishersReady = false;
  private readonly random: () => number;

  constructor(playerId: CharacterId, bridge: GameBridge, reducedMotion: boolean) {
    super({ key: "fight" });
    this.playerId = playerId;
    this.random = createSeededRandom(playerId.charCodeAt(0) * 7919 + playerId.length * 97);
    this.enemyId = chooseOpponent(playerId, this.random());
    this.bridge = bridge;
    this.reducedMotion = reducedMotion;
  }

  preload() {
    this.load.atlas("characters", `${RUNTIME_ASSET_ROOT}/characters.png`, `${RUNTIME_ASSET_ROOT}/characters.json`);
    this.load.atlas("environment", `${RUNTIME_ASSET_ROOT}/environment.png`, `${RUNTIME_ASSET_ROOT}/environment.json`);
    this.load.atlas("effects", `${RUNTIME_ASSET_ROOT}/effects.png`, `${RUNTIME_ASSET_ROOT}/effects.json`);
    this.load.atlas("items", `${RUNTIME_ASSET_ROOT}/items.png`, `${RUNTIME_ASSET_ROOT}/items.json`);
    this.load.image("snowball", `${SOURCE_ASSET_ROOT}/FXs/Snowball.png`);
    this.load.image("muzzle", `${SOURCE_ASSET_ROOT}/FXs/MuzzleFlash.png`);
  }

  create() {
    this.layout = createArenaLayout(this.scale.width, this.scale.height);
    this.worldScale = Phaser.Math.Clamp(this.layout.height / 280, 1, 1.75);
    this.createArena();
    this.createAnimations();
    this.player = this.createFighter(this.playerId, this.layout.playerSpawnX, true);
    this.enemy = this.createFighter(this.enemyId, this.layout.enemySpawnX, false);
    this.enemy.visual.setAlpha(0.72);
    this.createPools();
    this.createInput();
    this.statusText = this.add.text(this.layout.width / 2, Math.max(31, this.layout.height * 0.16), "", {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: "8px",
      color: "#f5f4ef",
      align: "center",
      stroke: "#17201d",
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(80);
    this.setVisualState(this.player, "idle");
    this.setVisualState(this.enemy, "idle");
    this.emitHud();
    this.bridge.onReady();
  }

  update(time: number, delta: number) {
    this.updateAmbient(time);
    this.syncFighterVisual(this.player, time);
    this.syncFighterVisual(this.enemy, time);
    this.updateProjectiles(time, delta);
    this.updatePickup(time);

    if (!this.playing || this.paused || this.roundTransition) return;
    if (time < this.countdownUntil) {
      const seconds = Math.max(1, Math.ceil((this.countdownUntil - time) / 700));
      this.statusText.setText(String(seconds));
      return;
    }
    if (this.roundStartedAt === 0) {
      this.roundStartedAt = time;
      this.nextContainerAt = time + 12000 + Math.floor(this.random() * 6001);
      this.statusText.setText("FIGHT");
      this.time.delayedCall(420, () => this.statusText.setText(""));
    }

    this.updateTimer(time);
    this.updateItems(time);
    this.updateAI(time);
    const playerInput = this.readPlayerInput();
    this.updateFighter(this.player, this.enemy, playerInput, time);
    this.updateFighter(this.enemy, this.player, this.aiInput, time);
    this.consumeActionInputs();
    this.checkRoundEnd();
  }

  startMatch() {
    this.ensureFinishers();
    this.roundState = {
      playerWins: 0,
      enemyWins: 0,
      playerVitality: MAX_VITALITY,
      enemyVitality: MAX_VITALITY,
      playerScore: 0,
      enemyScore: 0,
      secondsRemaining: ROUND_SECONDS,
      suddenDeath: false,
    };
    this.player.score = 0;
    this.enemy.score = 0;
    this.player.visual.setAlpha(1);
    this.enemy.visual.setAlpha(1);
    this.playing = true;
    this.paused = false;
    this.startRound();
  }

  replay() {
    this.startMatch();
  }

  setPaused(next: boolean) {
    if (!this.playing || this.roundTransition) return;
    this.paused = next;
    this.physics.world.isPaused = next;
    this.anims.globalTimeScale = next ? 0 : 1;
    this.statusText.setText(next ? "PAUSED" : "");
    this.emitHud();
  }

  setMobileInput(next: Partial<InputState>) {
    this.mobileInput = { ...this.mobileInput, ...next };
  }

  setMuted(next: boolean) {
    this.muted = next;
    if (!next && !this.audioContext) this.audioContext = new AudioContext();
    if (!next && this.audioContext?.state === "suspended") void this.audioContext.resume();
  }

  shutdownAudio() {
    void this.audioContext?.close();
    this.audioContext = undefined;
  }

  private createArena() {
    const { width, height, floorY } = this.layout;
    this.add.rectangle(width / 2, height / 2, width, height, 0x10231f).setDepth(-40);
    this.add.image(width / 2, height / 2, "environment", "ENVIRO/Background/background_color.png")
      .setDisplaySize(width, height).setDepth(-39);

    const trunkFiles = Array.from({ length: 8 }, (_, index) => `tree_trunk${index + 1}.png`);
    trunkFiles.forEach((file, index) => {
      const x = width * ((index + 0.25) / trunkFiles.length);
      const y = floorY + 5 + (index % 3) * 4;
      const tree = this.add.image(x, y, "environment", `ENVIRO/Background/${file}`)
        .setOrigin(0.5, 1).setAlpha(index % 2 ? 0.7 : 0.86).setDepth(-32 + (index % 3));
      tree.setScale(index % 2 ? 0.82 : 1);
    });

    this.add.image(width / 2, height / 2, "environment", "ENVIRO/Background/fog_color.png")
      .setDisplaySize(width, height).setAlpha(0.2).setDepth(-27);

    const leafFiles = Array.from({ length: 5 }, (_, index) => `tree_leaves${index + 1}.png`);
    leafFiles.forEach((file, index) => {
      const leaf = this.add.image(width * ((index + 0.45) / leafFiles.length), 22 + (index % 2) * 17, "environment", `ENVIRO/Background/${file}`)
        .setAlpha(0.82).setDepth(-22 + (index % 2));
      leaf.setData("originX", leaf.x).setData("phase", index * 617);
      this.ambient.push(leaf);
    });

    this.add.rectangle(width / 2, floorY + 17, width, 38, 0x0c1c19, 0.76).setDepth(-10);
    this.addPlatform(width / 2, floorY, width - 22, 9, 3, true);
    for (const platform of this.layout.upperPlatforms) this.addPlatform(platform.x, platform.y, platform.width, 8, 1, false);

    const trunks = ["trunk1.png", "trunk2.png", "trunk3.png", "trunk4.png"];
    trunks.forEach((file, index) => {
      this.add.image(width * (0.11 + index * 0.26), floorY + 2, "environment", `ENVIRO/Level Design/${file}`)
        .setOrigin(0.5, 1).setAlpha(index === 1 || index === 2 ? 0.72 : 0.94).setDepth(index % 2 ? 2 : -7);
    });

    const lianas = Array.from({ length: 6 }, (_, index) => `liana${index + 1}.png`);
    lianas.forEach((file, index) => {
      const image = this.add.image(width * ((index + 0.65) / 6), index % 2 ? 2 : 0, "environment", `ENVIRO/Props/${file}`)
        .setOrigin(0.5, 0).setAlpha(0.6).setDepth(-17);
      image.setData("originX", image.x).setData("phase", 390 + index * 481);
      this.ambient.push(image);
    });

    const groundProps = ["grass1.png", "flower1.png", "grass2.png", "flower2.png", "grass1.png", "grass2.png"];
    groundProps.forEach((file, index) => {
      const x = width * (0.07 + index * 0.17);
      this.add.image(x, floorY - 2, "environment", `ENVIRO/Props/${file}`).setOrigin(0.5, 1).setDepth(4).setAlpha(0.9);
    });

    this.add.image(0, 0, "environment", "POSTPRO/overlay.png").setOrigin(0).setDisplaySize(width, height)
      .setAlpha(0.1).setBlendMode(Phaser.BlendModes.OVERLAY).setDepth(55);
    this.add.image(0, 0, "environment", "POSTPRO/lineardodge.png").setOrigin(0).setDisplaySize(width, height)
      .setAlpha(this.reducedMotion ? 0 : 0.045).setBlendMode(Phaser.BlendModes.ADD).setDepth(56);
    this.add.image(0, 0, "environment", "POSTPRO/vignette.png").setOrigin(0).setDisplaySize(width, height)
      .setAlpha(0.48).setDepth(57);
  }

  private addPlatform(x: number, y: number, width: number, height: number, depth: number, edges: boolean) {
    this.add.image(x, y, "environment", "ENVIRO/Level Design/platform.png")
      .setDisplaySize(width, height).setOrigin(0.5, 0).setDepth(depth);
    if (edges) {
      this.add.image(x - width / 2, y, "environment", "ENVIRO/Level Design/platform_edge.png").setOrigin(0.5, 0).setDepth(depth + 1);
      this.add.image(x + width / 2, y, "environment", "ENVIRO/Level Design/platform_edge.png").setOrigin(0.5, 0).setFlipX(true).setDepth(depth + 1);
    }
    const zone = this.add.zone(x, y + height / 2, width, height);
    this.physics.add.existing(zone, true);
    this.platforms.push(zone);
  }

  private createAnimations() {
    for (const definition of Object.values(CHARACTERS)) {
      for (const [id, animation] of Object.entries(definition.animations)) {
        const key = `${definition.id}-${id}`;
        if (this.anims.exists(key) || animation.frames.length === 1) continue;
        this.anims.create({
          key,
          frames: animation.frames.map((frame) => ({ key: "characters", frame })),
          frameRate: animation.frameRate,
          repeat: animation.repeat ?? 0,
        });
      }
    }
    this.createEffectAnimation("impact1", "FXs/impact1/impact1_", 4, 19);
    this.createEffectAnimation("impact2", "FXs/impact2/impact2_", 4, 19);
    this.createEffectAnimation("impact3", "FXs/impact3/impact1_", 4, 19);
    this.createEffectAnimation("impactHuge", "FXs/impactHUGE/impactHUGE_", 5, 18);
    for (let index = 1; index <= 6; index += 1) {
      this.createEffectAnimation(`smoke${index}`, `FXs/smoke${index}/smoke${index}_`, index < 5 ? 7 : 8, 16);
    }
    this.createEffectAnimation("snow1", "FXs/snow1/snow1_", 4, 12);
    this.createEffectAnimation("snow2", "FXs/snow2/snow2_", 7, 14);
    this.createEffectAnimation("snow3", "FXs/snow3/snow3_", 5, 14);
    this.createEffectAnimation("speed", "FXs/Speed_OnScreen/vitesse_", 5, 16);
  }

  private createEffectAnimation(key: string, framePrefix: string, count: number, frameRate: number) {
    if (this.anims.exists(key)) return;
    this.anims.create({
      key,
      frames: Array.from({ length: count }, (_, index) => ({ key: "effects", frame: `${framePrefix}${index + 1}.png` })),
      frameRate,
    });
  }

  private createFighter(character: CharacterId, x: number, isPlayer: boolean): FighterRuntime {
    const definition = CHARACTERS[character];
    const bodyWidth = 12 * this.worldScale;
    const bodyHeight = 20 * this.worldScale;
    const bodyObject = this.add.zone(x, this.layout.floorY - bodyHeight / 2, bodyWidth, bodyHeight);
    this.physics.add.existing(bodyObject);
    const body = bodyObject.body as Phaser.Physics.Arcade.Body;
    body.setSize(bodyWidth, bodyHeight).setGravityY(GRAVITY).setMaxVelocity(220, 310).setDragX(560);
    for (const platform of this.platforms) this.physics.add.collider(bodyObject, platform);
    const shadow = this.add.ellipse(x, this.layout.floorY + 1, 14 * this.worldScale, 3 * this.worldScale, 0x07120f, 0.42).setDepth(4);
    const visual = this.add.sprite(x, this.layout.floorY, "characters", definition.idleFrame).setOrigin(0.5, 1).setScale(this.worldScale).setDepth(8);
    const fighter: FighterRuntime = {
      definition,
      bodyObject,
      body,
      visual,
      shadow,
      vitality: MAX_VITALITY,
      score: 0,
      facing: isPlayer ? 1 : -1,
      jumpsUsed: 0,
      jumpBufferedUntil: 0,
      coyoteUntil: 0,
      cooldownUntil: 0,
      dodgeCooldownUntil: 0,
      dodgeUntil: 0,
      hitStunUntil: 0,
      armedUntil: 0,
      hasteUntil: 0,
      lastFootstepAt: 0,
      attackStartedAt: 0,
      comboStage: -1,
      comboStartedGrounded: true,
      consumedHits: new Set(),
      isPlayer,
    };
    visual.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      if (!fighter.activeAttack && this.time.now >= fighter.hitStunUntil && this.time.now >= fighter.dodgeUntil) fighter.visualState = undefined;
    });
    return fighter;
  }

  private createPools() {
    this.add.graphics().fillStyle(0xf4d477).fillRect(0, 0, 3, 1).generateTexture("bullet", 3, 1).destroy();
    for (let index = 0; index < 10; index += 1) {
      const image = this.add.image(-40, -40, index % 2 ? "snowball" : "bullet").setVisible(false).setDepth(20);
      this.projectiles.push({ image, active: false, velocity: 0, expiresAt: 0 });
    }
    for (let index = 0; index < 24; index += 1) {
      const effect = this.add.sprite(-40, -40, "effects", "FXs/impact1/impact1_1.png").setVisible(false).setDepth(22);
      this.effects.push(effect);
    }
  }

  private createInput() {
    const keyboard = this.input.keyboard;
    if (!keyboard) return;
    this.keys = {
      left: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A), right: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      leftAlt: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT), rightAlt: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      down: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S), downAlt: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      jump: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W), jumpAlt: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      jumpSpace: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE), light: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J),
      special: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K), dodge: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
      pause: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P), exit: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
    };
    keyboard.addCapture(["UP", "DOWN", "LEFT", "RIGHT", "SPACE"]);
    this.keys.pause.on("down", () => this.setPaused(!this.paused));
    this.keys.exit.on("down", () => this.bridge.onExit());
  }

  private startRound() {
    this.clearItems();
    this.roundTransition = false;
    this.roundState = {
      ...this.roundState,
      playerVitality: MAX_VITALITY,
      enemyVitality: MAX_VITALITY,
      playerScore: this.player.score,
      enemyScore: this.enemy.score,
      secondsRemaining: ROUND_SECONDS,
      suddenDeath: false,
    };
    this.resetFighter(this.player, this.layout.playerSpawnX, 1);
    this.resetFighter(this.enemy, this.layout.enemySpawnX, -1);
    this.roundStartedAt = 0;
    this.nextContainerAt = Number.POSITIVE_INFINITY;
    this.countdownUntil = this.time.now + 2100;
    this.lastHudSecond = -1;
    this.physics.world.isPaused = false;
    this.anims.globalTimeScale = 1;
    this.emitHud();
  }

  private resetFighter(fighter: FighterRuntime, x: number, facing: -1 | 1) {
    const bodyHalfHeight = 10 * this.worldScale;
    fighter.bodyObject.setPosition(x, this.layout.floorY - bodyHalfHeight);
    fighter.body.reset(x, this.layout.floorY - bodyHalfHeight);
    fighter.body.setVelocity(0, 0).setAcceleration(0, 0);
    fighter.vitality = MAX_VITALITY;
    fighter.facing = facing;
    fighter.jumpsUsed = 0;
    fighter.jumpBufferedUntil = 0;
    fighter.cooldownUntil = 0;
    fighter.dodgeCooldownUntil = 0;
    fighter.dodgeUntil = 0;
    fighter.hitStunUntil = 0;
    fighter.armedUntil = 0;
    fighter.hasteUntil = 0;
    fighter.activeAttack = undefined;
    fighter.attackStartedAt = 0;
    fighter.comboStage = -1;
    fighter.consumedHits.clear();
    fighter.visualState = undefined;
    fighter.visual.setAlpha(1).setFlipX(facing < 0);
    this.setVisualState(fighter, "idle");
  }

  private readPlayerInput(): InputState {
    if (!this.keys) return { ...this.mobileInput };
    return {
      left: this.keys.left.isDown || this.keys.leftAlt.isDown || this.mobileInput.left,
      right: this.keys.right.isDown || this.keys.rightAlt.isDown || this.mobileInput.right,
      down: this.keys.down.isDown || this.keys.downAlt.isDown || this.mobileInput.down,
      jump: Phaser.Input.Keyboard.JustDown(this.keys.jump) || Phaser.Input.Keyboard.JustDown(this.keys.jumpAlt) || Phaser.Input.Keyboard.JustDown(this.keys.jumpSpace) || this.mobileInput.jump,
      light: Phaser.Input.Keyboard.JustDown(this.keys.light) || this.mobileInput.light,
      special: Phaser.Input.Keyboard.JustDown(this.keys.special) || this.mobileInput.special,
      dodge: Phaser.Input.Keyboard.JustDown(this.keys.dodge) || this.mobileInput.dodge,
    };
  }

  private updateAI(time: number) {
    if (time < this.aiNextDecisionAt) return;
    const decision = decideAI({
      self: this.toFighterState(this.enemy),
      opponent: this.toFighterState(this.player),
      now: time,
      arenaWidth: this.layout.width,
      floorY: this.layout.floorY,
      random: this.random(),
      activeItem: this.getActiveItemState(),
    });
    this.aiInput = decision.input;
    this.aiNextDecisionAt = time + 180 + Math.floor(this.random() * 141) + decision.holdMs / 3;
  }

  private getActiveItemState(): ActiveItemState | undefined {
    if (this.activePickup) return { x: this.activePickup.image.x, y: this.activePickup.image.y, kind: "pickup", item: this.activePickup.id };
    if (this.activeContainer) return { x: this.activeContainer.image.x, y: this.activeContainer.image.y, kind: "container" };
    return undefined;
  }

  private toFighterState(fighter: FighterRuntime): FighterState {
    return {
      character: fighter.definition.id,
      x: fighter.bodyObject.x,
      y: fighter.bodyObject.y,
      velocityX: fighter.body.velocity.x,
      velocityY: fighter.body.velocity.y,
      vitality: fighter.vitality,
      grounded: fighter.body.blocked.down || fighter.body.touching.down,
      facing: fighter.facing,
      cooldownUntil: fighter.cooldownUntil,
      hitStunUntil: fighter.hitStunUntil,
      dodgeUntil: fighter.dodgeUntil,
      comboStage: fighter.comboStage,
    };
  }

  private updateFighter(fighter: FighterRuntime, opponent: FighterRuntime, input: InputState, time: number) {
    const grounded = fighter.body.blocked.down || fighter.body.touching.down;
    if (grounded) {
      fighter.jumpsUsed = 0;
      fighter.coyoteUntil = time + COYOTE_TIME_MS;
      if (!fighter.comboStartedGrounded && fighter.activeAttack) this.interruptAttack(fighter);
    }
    if (time < fighter.hitStunUntil) {
      fighter.body.setAccelerationX(0);
      return;
    }

    const attackElapsed = fighter.activeAttack ? time - fighter.attackStartedAt : 0;
    if (input.dodge && time >= fighter.dodgeCooldownUntil && canDodgeCancel(fighter.activeAttack, attackElapsed)) {
      this.interruptAttack(fighter);
      fighter.dodgeUntil = time + 190;
      fighter.dodgeCooldownUntil = time + 620;
      fighter.body.setAccelerationX(0).setVelocityX(fighter.facing * 132);
      fighter.visual.setAlpha(0.5);
      this.setVisualState(fighter, "dodge");
      this.playEffect("smoke4", fighter.bodyObject.x, fighter.bodyObject.y + 8, fighter.facing < 0);
      this.time.delayedCall(190, () => fighter.visual.setAlpha(1));
      this.playCue("dash");
      return;
    }

    const direction = Number(input.right) - Number(input.left);
    if (!fighter.activeAttack) {
      if (direction) {
        fighter.facing = direction < 0 ? -1 : 1;
        const boost = (time < fighter.hasteUntil ? 1.15 : 1) * (this.worldScale > 1.2 ? 1.12 : 1);
        fighter.body.setAccelerationX(direction * fighter.definition.speed * boost * 8);
        fighter.body.setMaxVelocity(fighter.definition.speed * boost, 285);
      } else {
        fighter.body.setAccelerationX(0);
      }
    } else {
      fighter.body.setAccelerationX(0);
      if (fighter.activeAttack.projectileSpeed && direction) {
        fighter.body.setVelocityX(direction * fighter.definition.speed * 0.28);
        fighter.facing = direction < 0 ? -1 : 1;
      }
    }

    if (input.down && !grounded) fighter.body.setVelocityY(fastFallVelocity(fighter.body.velocity.y));
    if (input.jump) fighter.jumpBufferedUntil = time + JUMP_BUFFER_MS;
    if (!fighter.activeAttack && canUseBufferedJump({
      now: time,
      bufferedUntil: fighter.jumpBufferedUntil,
      grounded,
      coyoteUntil: fighter.coyoteUntil,
      jumpsUsed: fighter.jumpsUsed,
    })) {
      fighter.body.setVelocityY(-fighter.definition.jumpSpeed);
      fighter.jumpsUsed += 1;
      fighter.coyoteUntil = 0;
      fighter.jumpBufferedUntil = 0;
      this.setVisualState(fighter, "jump");
      this.playEffect("smoke2", fighter.bodyObject.x, fighter.bodyObject.y + 8);
      this.playCue("jump");
    }

    if (!fighter.activeAttack && time >= fighter.cooldownUntil) {
      if (input.special) this.startAttack(fighter, fighter.definition.special, -1, grounded, time);
      else if (input.light) this.startAttack(fighter, fighter.definition.combo.stages[0], 0, grounded, time);
    }

    this.updateActiveAttack(fighter, opponent, time, grounded);
  }

  private startAttack(fighter: FighterRuntime, attack: AttackDefinition, comboStage: number, grounded: boolean, time: number) {
    fighter.activeAttack = attack;
    fighter.attackStartedAt = time;
    fighter.comboStage = comboStage;
    fighter.comboStartedGrounded = grounded;
    fighter.consumedHits.clear();
    fighter.body.setAccelerationX(0);
    if (attack.dashSpeed) fighter.body.setVelocityX(fighter.facing * attack.dashSpeed);
    this.setVisualState(fighter, attack.animation);
    if (attack.projectileSpeed) fighter.armedUntil = time + attack.durationMs + 900;
    this.playCue(attack.projectileSpeed ? "gun" : attack.dashSpeed ? "dash" : "swing");
  }

  private updateActiveAttack(fighter: FighterRuntime, opponent: FighterRuntime, time: number, grounded: boolean) {
    const attack = fighter.activeAttack;
    if (!attack) return;
    const elapsed = time - fighter.attackStartedAt;
    for (const { window, index } of readyHitIndexes(attack, elapsed, fighter.consumedHits)) {
      fighter.consumedHits.add(index);
      if (attack.projectileSpeed) this.launchProjectile(fighter, window, attack.projectileSpeed, time);
      else {
        this.tryMeleeHit(fighter, opponent, window, time);
        this.tryContainerHit(fighter, window, time);
      }
      if (fighter.comboStage >= 0) this.playEffect(`smoke${Math.min(6, fighter.comboStage + 3)}`, fighter.bodyObject.x + fighter.facing * 10, fighter.bodyObject.y - 4, fighter.facing < 0);
    }
    if (elapsed < attack.durationMs) return;

    if (fighter.comboStage >= 0) {
      const next = nextComboStage(fighter.comboStage, grounded && fighter.comboStartedGrounded, fighter.definition.combo.aerialStages);
      if (next !== null) {
        this.startAttack(fighter, fighter.definition.combo.stages[next], next, grounded, time);
        return;
      }
    }
    fighter.cooldownUntil = time + attack.cooldownMs;
    fighter.activeAttack = undefined;
    fighter.comboStage = -1;
    fighter.consumedHits.clear();
    fighter.visualState = undefined;
  }

  private interruptAttack(fighter: FighterRuntime) {
    fighter.activeAttack = undefined;
    fighter.comboStage = -1;
    fighter.consumedHits.clear();
  }

  private tryMeleeHit(source: FighterRuntime, target: FighterRuntime, hit: HitWindow, time: number) {
    const dx = target.bodyObject.x - source.bodyObject.x;
    const dy = target.bodyObject.y - source.bodyObject.y;
    if (Math.abs(dx) > hit.range * this.worldScale || Math.abs(dy) > hit.verticalRange * this.worldScale || dx * source.facing < -4) return;
    this.applyHit(source, target, hit, time);
  }

  private launchProjectile(source: FighterRuntime, hit: HitWindow, speed: number, time: number) {
    const projectile = this.projectiles.find((item) => !item.active);
    if (!projectile) return;
    const snowball = source.definition.id === "NAMKA";
    projectile.image.setTexture(snowball ? "snowball" : "bullet");
    projectile.image.setPosition(source.bodyObject.x + source.facing * 13 * this.worldScale, source.bodyObject.y - 3 * this.worldScale)
      .setScale(this.worldScale).setVisible(true).setFlipX(source.facing < 0);
    projectile.active = true;
    projectile.owner = source;
    projectile.hit = hit;
    projectile.velocity = source.facing * speed;
    projectile.expiresAt = time + 1400;
    if (snowball) this.playEffect("snow3", projectile.image.x, projectile.image.y);
    else this.flashMuzzle(source.bodyObject.x + source.facing * 11, source.bodyObject.y - 4, source.facing < 0);
  }

  private updateProjectiles(time: number, delta: number) {
    for (const projectile of this.projectiles) {
      if (!projectile.active || !projectile.owner || !projectile.hit) continue;
      projectile.image.x += projectile.velocity * delta / 1000;
      const target = projectile.owner === this.player ? this.enemy : this.player;
      if (time >= projectile.expiresAt || projectile.image.x < -this.layout.blastPaddingX || projectile.image.x > this.layout.width + this.layout.blastPaddingX) {
        this.releaseProjectile(projectile);
        continue;
      }
      if (this.activeContainer && Math.abs(projectile.image.x - this.activeContainer.image.x) < 9 && Math.abs(projectile.image.y - this.activeContainer.image.y) < 16) {
        this.damageContainer(projectile.owner, time);
        this.releaseProjectile(projectile);
        continue;
      }
      if (Math.abs(projectile.image.x - target.bodyObject.x) < 9 && Math.abs(projectile.image.y - target.bodyObject.y) < 14) {
        this.applyHit(projectile.owner, target, projectile.hit, time);
        this.releaseProjectile(projectile);
      }
    }
  }

  private releaseProjectile(projectile: ProjectileRuntime) {
    projectile.active = false;
    projectile.image.setVisible(false).setPosition(-40, -40);
    projectile.owner = undefined;
    projectile.hit = undefined;
  }

  private applyHit(source: FighterRuntime, target: FighterRuntime, hit: HitWindow, time: number) {
    if (time < target.dodgeUntil || this.roundTransition) return;
    this.interruptAttack(target);
    target.vitality = applyDamage(target.vitality, hit.damage);
    const knockback = calculateKnockback(hit.knockback, target.vitality, target.definition.weight);
    target.body.setVelocity(source.facing * knockback, -hit.lift);
    target.hitStunUntil = time + 150 + Math.round((MAX_VITALITY - target.vitality) * 1.7);
    this.setVisualState(target, "hurt");
    this.playEffect(hit.impact, target.bodyObject.x, target.bodyObject.y - 5, source.facing < 0);
    if (hit.impact === "impactHuge" || knockback > 105) this.playEffect("speed", target.bodyObject.x, target.bodyObject.y - 8, source.facing < 0);
    if (!this.reducedMotion) {
      this.cameras.main.shake(hit.impact === "impactHuge" ? 105 : 58, hit.impact === "impactHuge" ? 0.0032 : 0.0015);
      this.physics.world.isPaused = true;
      this.time.delayedCall(hit.impact === "impactHuge" ? 62 : 34, () => {
        if (!this.paused && !this.roundTransition) this.physics.world.isPaused = false;
      });
    }
    this.playCue(hit.impact === "impactHuge" ? "finisher" : "hit");
    this.roundState = {
      ...this.roundState,
      playerVitality: this.player.vitality,
      enemyVitality: this.enemy.vitality,
    };
    this.emitHud();
  }

  private playEffect(key: string, x: number, y: number, flip = false) {
    const effect = this.effects.find((item) => !item.visible);
    if (!effect || !this.anims.exists(key)) return;
    effect.setPosition(Math.round(x), Math.round(y)).setScale(this.worldScale).setVisible(true).setFlipX(flip).setAlpha(1).play(key);
    effect.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => effect.setVisible(false).setPosition(-40, -40));
  }

  private flashMuzzle(x: number, y: number, flip: boolean) {
    const image = this.add.image(x, y, "muzzle").setFlipX(flip).setDepth(23);
    this.tweens.add({ targets: image, alpha: 0, duration: 90, onComplete: () => image.destroy() });
  }

  private setVisualState(fighter: FighterRuntime, requested: AnimationId) {
    if (!shouldEnterVisualState(fighter.visualState, requested)) return;
    fighter.visualState = requested;
    const animation = fighter.definition.animations[requested];
    if (animation.frames.length === 1) {
      fighter.visual.stop().setTexture("characters", animation.frames[0]);
      return;
    }
    fighter.visual.play(`${fighter.definition.id}-${requested}`, true);
  }

  private syncFighterVisual(fighter: FighterRuntime, time: number) {
    const grounded = fighter.body.blocked.down || fighter.body.touching.down;
    if (time < fighter.hitStunUntil) this.setVisualState(fighter, "hurt");
    else if (time < fighter.dodgeUntil) this.setVisualState(fighter, "dodge");
    else if (fighter.activeAttack) this.setVisualState(fighter, fighter.activeAttack.animation);
    else if (!grounded) this.setVisualState(fighter, fighter.body.velocity.y < 0 ? "jump" : "fall");
    else if (Math.abs(fighter.body.velocity.x) > 9) this.setVisualState(fighter, time < fighter.armedUntil ? "runArmed" : "run");
    else this.setVisualState(fighter, "idle");

    const idle = grounded && Math.abs(fighter.body.velocity.x) <= 9 && !fighter.activeAttack && time >= fighter.hitStunUntil && time >= fighter.dodgeUntil && !this.reducedMotion;
    const phase = (time + fighter.definition.idle.delayMs) % fighter.definition.idle.durationMs;
    const bob = idle && phase > fighter.definition.idle.durationMs * 0.48 && phase < fighter.definition.idle.durationMs * 0.72 ? -fighter.definition.idle.shiftPx : 0;
    const bodyHalfHeight = 10 * this.worldScale;
    fighter.visual.setPosition(Math.round(fighter.bodyObject.x), Math.round(fighter.bodyObject.y + bodyHalfHeight + bob)).setFlipX(fighter.facing < 0);
    const groundDistance = Math.max(0, this.layout.floorY - (fighter.bodyObject.y + bodyHalfHeight));
    fighter.shadow.setPosition(Math.round(fighter.bodyObject.x), this.layout.floorY + 2)
      .setScale(Phaser.Math.Clamp(1 - groundDistance / 80, 0.48, 1), 1)
      .setAlpha(groundDistance > 60 ? 0.12 : 0.42);

    if (grounded && Math.abs(fighter.body.velocity.x) > 18 && time - fighter.lastFootstepAt > 220) {
      fighter.lastFootstepAt = time;
      this.playEffect(`smoke${1 + Math.floor(this.random() * 3)}`, fighter.bodyObject.x - fighter.facing * 4, fighter.bodyObject.y + 9, fighter.facing < 0);
      this.playCue("step");
    }
  }

  private updateAmbient(time: number) {
    if (!this.reducedMotion) {
      for (const item of this.ambient) {
        const phase = Number(item.getData("phase") ?? 0);
        const originX = Number(item.getData("originX") ?? item.x);
        item.x = originX + Math.sin((time + phase) / 1700) * 0.75;
        item.angle = Math.sin((time + phase) / 2200) * 0.7;
      }
      if (time - this.lastAmbientAt > 1050 && this.effects.length) {
        this.lastAmbientAt = time;
        this.playEffect(`snow${1 + Math.floor(this.random() * 3)}`, this.random() * this.layout.width, 10 + this.random() * this.layout.height * 0.45);
      }
    }
  }

  private updateTimer(time: number) {
    if (this.roundState.suddenDeath) return;
    const seconds = Math.max(0, ROUND_SECONDS - Math.floor((time - this.roundStartedAt) / 1000));
    if (seconds === this.lastHudSecond) return;
    this.lastHudSecond = seconds;
    this.roundState = { ...this.roundState, secondsRemaining: seconds };
    this.emitHud();
    if (seconds === 0) {
      const result = resolveTimedRound(this.player.vitality, this.enemy.vitality);
      if (result === "sudden-death") {
        this.roundState = { ...this.roundState, suddenDeath: true, secondsRemaining: 0 };
        this.player.vitality = 1;
        this.enemy.vitality = 1;
        this.statusText.setText("SUDDEN DEATH");
        this.playEffect("speed", this.layout.width / 2, this.layout.height / 2);
        this.time.delayedCall(720, () => this.statusText.setText(""));
        this.emitHud("One hit decides it");
      } else this.endRound(result);
    }
  }

  private updateItems(time: number) {
    if (!this.activeContainer && !this.activePickup && time >= this.nextContainerAt) this.spawnContainer();
  }

  private spawnContainer() {
    const id = chooseContainer(this.random());
    const definition = CONTAINERS[id];
    const x = Phaser.Math.Clamp(this.layout.width * (0.24 + this.random() * 0.52), this.layout.arenaLeft + 28, this.layout.arenaRight - 28);
    const image = this.add.image(x, this.layout.floorY - 1, "items", definition.frame).setOrigin(0.5, 1).setScale(this.worldScale).setDepth(7);
    this.activeContainer = { id, image, hitPoints: definition.hitPoints };
    this.nextContainerAt = Number.POSITIVE_INFINITY;
    this.playEffect("smoke6", x, this.layout.floorY - 5);
    this.emitHud("Supply drop");
  }

  private tryContainerHit(source: FighterRuntime, hit: HitWindow, time: number) {
    if (!this.activeContainer) return;
    const dx = this.activeContainer.image.x - source.bodyObject.x;
    const dy = this.activeContainer.image.y - (source.bodyObject.y + 10 * this.worldScale);
    if (Math.abs(dx) > hit.range * this.worldScale || Math.abs(dy) > hit.verticalRange * this.worldScale || dx * source.facing < -4) return;
    this.damageContainer(source, time);
  }

  private damageContainer(source: FighterRuntime, time: number) {
    if (!this.activeContainer) return;
    this.activeContainer.hitPoints -= 1;
    this.activeContainer.image.setTint(0xffffff).setTintMode(Phaser.TintModes.FILL);
    this.time.delayedCall(55, () => this.activeContainer?.image.clearTint().setTintMode(Phaser.TintModes.MULTIPLY));
    this.playEffect("impact2", this.activeContainer.image.x, this.activeContainer.image.y - 6);
    if (this.activeContainer.hitPoints > 0) return;
    const x = this.activeContainer.image.x;
    const y = this.activeContainer.image.y;
    this.activeContainer.image.destroy();
    this.activeContainer = undefined;
    this.playEffect("smoke6", x, y - 6);
    const id = chooseDrop(this.random());
    const image = this.add.image(x, y - 3, "items", ITEMS[id].frame).setOrigin(0.5, 1).setScale(this.worldScale).setDepth(9);
    this.activePickup = { id, image, spawnedAt: time };
    image.setData("owner", source.isPlayer ? "player" : "enemy");
  }

  private updatePickup(time: number) {
    if (!this.activePickup) return;
    this.activePickup.image.y += Math.sin((time - this.activePickup.spawnedAt) / 240) * 0.025;
    for (const fighter of [this.player, this.enemy]) {
      if (Math.abs(fighter.bodyObject.x - this.activePickup.image.x) > 12 * this.worldScale || Math.abs(fighter.bodyObject.y - this.activePickup.image.y) > 18 * this.worldScale) continue;
      const id = this.activePickup.id;
      const applied = applyPickup(id, fighter.vitality, fighter.score);
      fighter.vitality = applied.vitality;
      fighter.score = applied.score;
      if (applied.resetCooldown) fighter.cooldownUntil = 0;
      if (applied.hasteMs) fighter.hasteUntil = time + applied.hasteMs;
      this.playCue("pickup");
      this.playEffect(id === "haste" ? "speed" : "snow1", this.activePickup.image.x, this.activePickup.image.y - 4);
      this.activePickup.image.destroy();
      this.activePickup = undefined;
      this.roundState = {
        ...this.roundState,
        playerVitality: this.player.vitality,
        enemyVitality: this.enemy.vitality,
        playerScore: this.player.score,
        enemyScore: this.enemy.score,
      };
      this.emitHud(`${fighter.definition.name}: ${ITEMS[id].label}`);
      break;
    }
  }

  private clearItems() {
    this.activeContainer?.image.destroy();
    this.activePickup?.image.destroy();
    this.activeContainer = undefined;
    this.activePickup = undefined;
  }

  private checkRoundEnd() {
    if (this.roundTransition) return;
    const playerOut = this.isFighterOut(this.player);
    const enemyOut = this.isFighterOut(this.enemy);
    if (playerOut && enemyOut) this.endRound(this.player.vitality >= this.enemy.vitality ? "player" : "enemy");
    else if (playerOut) this.endRound("enemy");
    else if (enemyOut) this.endRound("player");
  }

  private isFighterOut(fighter: FighterRuntime) {
    const { x, y } = fighter.bodyObject;
    return fighter.vitality <= 0
      || x < -this.layout.blastPaddingX
      || x > this.layout.width + this.layout.blastPaddingX
      || y < -this.layout.blastPaddingTop
      || y > this.layout.height + this.layout.blastPaddingBottom;
  }

  private endRound(winner: "player" | "enemy") {
    this.roundTransition = true;
    this.physics.world.isPaused = true;
    this.roundState = awardRound({
      ...this.roundState,
      playerScore: this.player.score,
      enemyScore: this.enemy.score,
    }, winner);
    const defeated = winner === "player" ? this.enemy : this.player;
    this.interruptAttack(defeated);
    this.setVisualState(defeated, "knockout");
    this.playKnockoutEffect(defeated.bodyObject.x, defeated.bodyObject.y);
    this.playCue("knockout");
    this.statusText.setText(winner === "player" ? "ROUND WON" : "ROUND LOST");
    this.emitHud();
    const match = getMatchResult(this.roundState);
    this.time.delayedCall(1500, () => {
      if (match) {
        this.playing = false;
        this.statusText.setText(match.winner === "player" ? "VICTORY" : "DEFEAT");
        this.bridge.onMatchEnd(match);
      } else this.startRound();
    });
  }

  private ensureFinishers() {
    if (this.finishersReady || this.textures.exists("finishers")) return;
    this.load.atlas("finishers", `${RUNTIME_ASSET_ROOT}/finishers.png`, `${RUNTIME_ASSET_ROOT}/finishers.json`);
    this.load.once(Phaser.Loader.Events.COMPLETE, () => {
      this.finishersReady = true;
      if (!this.anims.exists("out-glow")) {
        this.anims.create({
          key: "out-glow",
          frames: Array.from({ length: 18 }, (_, index) => ({ key: "finishers", frame: `FXs/OUT!/BOUM${index + 1}.png` })),
          frameRate: 18,
        });
      }
      if (!this.anims.exists("out-clean")) {
        this.anims.create({
          key: "out-clean",
          frames: Array.from({ length: 18 }, (_, index) => ({ key: "finishers", frame: `FXs/OUT!_NoGlow/BOUM_NoGlow_${index + 1}.png` })),
          frameRate: 18,
        });
      }
    });
    this.load.start();
  }

  private playKnockoutEffect(x: number, y: number) {
    this.playEffect("impactHuge", x, y - 6);
    this.playEffect("speed", x, y - 6);
    if (!this.finishersReady || !this.anims.exists("out-glow")) return;
    const glow = this.add.sprite(x, y - 8, "finishers", "FXs/OUT!/BOUM1.png").setScale(this.worldScale).setDepth(75).play("out-glow");
    const clean = this.add.sprite(x, y - 8, "finishers", "FXs/OUT!_NoGlow/BOUM_NoGlow_1.png").setScale(this.worldScale).setDepth(76).play("out-clean");
    glow.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => glow.destroy());
    clean.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => clean.destroy());
  }

  private emitHud(notice?: string) {
    const hud: HudState = {
      ...this.roundState,
      playerVitality: this.player?.vitality ?? this.roundState.playerVitality,
      enemyVitality: this.enemy?.vitality ?? this.roundState.enemyVitality,
      playerScore: this.player?.score ?? this.roundState.playerScore,
      enemyScore: this.enemy?.score ?? this.roundState.enemyScore,
      playerName: CHARACTERS[this.playerId].name,
      enemyName: CHARACTERS[this.enemyId].name,
      paused: this.paused,
      notice,
    };
    this.bridge.onHud(hud);
  }

  private consumeActionInputs() {
    this.mobileInput = { ...this.mobileInput, jump: false, light: false, special: false, dodge: false };
    this.aiInput = { ...this.aiInput, jump: false, light: false, special: false, dodge: false };
  }

  private playCue(kind: "step" | "jump" | "swing" | "gun" | "hit" | "dash" | "pickup" | "finisher" | "knockout") {
    if (this.muted || !this.audioContext) return;
    const settings = {
      step: [82, 0.018, 0.012], jump: [310, 0.035, 0.018], swing: [155, 0.045, 0.02],
      gun: [620, 0.055, 0.028], hit: [96, 0.06, 0.03], dash: [225, 0.04, 0.018],
      pickup: [740, 0.09, 0.022], finisher: [68, 0.13, 0.038], knockout: [52, 0.2, 0.04],
    } as const;
    const [frequency, duration, volume] = settings[kind];
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    oscillator.type = kind === "gun" || kind === "hit" ? "square" : "triangle";
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, frequency * 0.72), this.audioContext.currentTime + duration);
    gain.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + duration);
    oscillator.connect(gain).connect(this.audioContext.destination);
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration);
  }
}

export type WorldTheme = 'plains' | 'desert' | 'snow' | 'volcano';

export type UnitCategory = 'swordsman' | 'archer' | 'knight' | 'mage' | 'catapult' | 'giant' | 'paladin' | 'dragon' | 'boss';

export interface UnitBaseStats {
  id: UnitCategory;
  name: string;
  cost: number;
  health: number;
  damage: number;
  speed: number;
  range: number;
  attackSpeed: number; // seconds between attacks
  spawnCooldown: number; // seconds
  size: 'small' | 'large' | 'huge'; // 32x32, 64x64, 128x128
  spriteWidth: number;
  spriteHeight: number;
  isRanged: boolean;
  projectileSpeed?: number;
  splashRadius?: number;
  unlockLevel: number;
  description: string;
  counterDescription: string;
}

export interface UnitInstance {
  id: string;
  type: UnitCategory;
  size: 'small' | 'large' | 'huge';
  team: 'player' | 'enemy';
  x: number; // horizontal coordinate (0 to LANE_WIDTH)
  y: number; // slight vertical lane jitter for natural overlapping (-10 to 10)
  maxHp: number;
  hp: number;
  damage: number;
  speed: number;
  range: number;
  attackSpeed: number;
  attackCooldown: number;
  state: 'idle' | 'walking' | 'attacking' | 'dying';
  frame: number;
  frameTimer: number;
  targetId: string | null; // target unit or 'castle'
  hitFlashTimer: number; // for brief white flash when damaged
  rallyBuffTimer: number; // boosted stats duration
  isBoss?: boolean;
  bossName?: string;
  kills?: number;
  isVeteran?: boolean;
  goldReward: number;
}

export interface Projectile {
  id: string;
  team: 'player' | 'enemy';
  type: 'arrow' | 'magic' | 'rock' | 'fireball' | 'frostbolt';
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  targetX: number;
  targetY: number;
  targetUnitId: string | null;
  speed: number;
  progress: number; // 0 to 1
  damage: number;
  splashRadius: number;
  arcHeight: number;
  sourceUnitType?: UnitCategory;
  sourceUnitId?: string;
}

export interface WeatherParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  baseAlpha: number;
  layer: 'background' | 'foreground';
  shape: 'snowflake' | 'ember' | 'sand_grain' | 'leaf' | 'smoke_wisp' | 'dust_devil';
  oscillationSpeed?: number;
  oscillationAmplitude?: number;
  seed: number;
  rotation?: number;
  rotationSpeed?: number;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  maxLife: number;
  currentLife: number;
  gravity?: number;
  shape?: 'square' | 'circle' | 'spark' | 'smoke' | 'ring';
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  life: number;
  vy: number;
  isCrit?: boolean;
}

export type SpecialAbilityType = 'arrowRain' | 'lightningStrike' | 'rallyCry';

export interface SpecialAbility {
  id: SpecialAbilityType;
  name: string;
  description: string;
  cooldown: number; // seconds
  icon: string;
  damage?: number;
  duration?: number;
}

export interface CastleState {
  maxHp: number;
  hp: number;
  x: number;
  width: number;
  height: number;
  damageState: 'intact' | 'cracked' | 'burning' | 'crumbling';
  hitFlashTimer: number;
}

export interface LevelConfig {
  id: number;
  world: WorldTheme;
  title: string;
  subtitle: string;
  enemyCastleHp: number;
  enemyStartingGold: number;
  enemyGoldRate: number; // gold per second
  enemyUnitPool: UnitCategory[];
  enemySpawnIntervalMin: number;
  enemySpawnIntervalMax: number;
  boss?: {
    type: UnitCategory;
    name: string;
    health: number;
    damage: number;
    spawnAtCastleHpPercent: number; // e.g. 0.7 = spawn when castle at 70% or at start
  };
  rewardGold: number;
  rewardStars: number;
}

export interface PlayerProgress {
  unlockedLevel: number;
  levelStars: Record<number, number>; // levelId -> stars (1-3)
  gold: number;
  stars: number;
  upgrades: {
    income: number; // 0 to 5
    unitHealth: number; // 0 to 5
    unitDamage: number; // 0 to 5
    castleHealth: number; // 0 to 5
    abilityPower: number; // 0 to 5
  };
  equippedAbility: SpecialAbilityType;
  upgradeTokens: number;
  completedQuests: Record<string, boolean>;
  hasSeenTutorial: boolean;
  soundEnabled: boolean;
  musicEnabled: boolean;
  screenShake: boolean;
}

export type GameScreen = 'MENU' | 'LEVEL_SELECT' | 'PLAYING' | 'UPGRADES' | 'SETTINGS';

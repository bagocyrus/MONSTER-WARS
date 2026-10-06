import { UnitBaseStats, LevelConfig, SpecialAbility, SpecialAbilityType, PlayerProgress, WorldTheme, UnitCategory } from '../types/game';

export const LANE_WIDTH = 1800;
export const LANE_HEIGHT = 450;
export const GROUND_Y = 360;

// Unit Roster: Player STARTS with Archer and Knight (unlockLevel: 1)
export const UNIT_ROSTER: Record<string, UnitBaseStats> = {
  archer: {
    id: 'archer',
    name: 'Archer',
    cost: 65,
    health: 70,
    damage: 15,
    speed: 42,
    range: 230,
    attackSpeed: 1.3,
    spawnCooldown: 2.5,
    size: 'small',
    spriteWidth: 32,
    spriteHeight: 32,
    isRanged: true,
    projectileSpeed: 380,
    unlockLevel: 1, // STARTER UNIT
    description: 'Long-range bowman. Fires arrows over friendly frontlines from safety.',
    counterDescription: 'Snipes slow Knights from afar; vulnerable to fast flankers.'
  },
  knight: {
    id: 'knight',
    name: 'Knight',
    cost: 120,
    health: 320,
    damage: 18,
    speed: 34,
    range: 42,
    attackSpeed: 1.4,
    spawnCooldown: 4.5,
    size: 'large',
    spriteWidth: 50,
    spriteHeight: 50,
    isRanged: false,
    unlockLevel: 1, // STARTER UNIT
    description: 'Armored vanguard with tower shield. Absorbs heavy punishment to protect Archers.',
    counterDescription: 'Supreme frontline shield tank; counters light infantry.'
  },
  swordsman: {
    id: 'swordsman',
    name: 'Swordsman',
    cost: 45,
    health: 110,
    damage: 12,
    speed: 54,
    range: 36,
    attackSpeed: 1.0,
    spawnCooldown: 1.8,
    size: 'small',
    spriteWidth: 32,
    spriteHeight: 32,
    isRanged: false,
    unlockLevel: 3, // REWARD AT LEVEL 3
    description: 'Fast, agile skirmisher. Cheap and quick to overwhelm enemy ranged troops.',
    counterDescription: 'Rushes enemy Archers quickly; weak against heavy Knights.'
  },
  mage: {
    id: 'mage',
    name: 'Mage',
    cost: 180,
    health: 90,
    damage: 28,
    speed: 38,
    range: 190,
    attackSpeed: 1.9,
    spawnCooldown: 6.5,
    size: 'small',
    spriteWidth: 36,
    spriteHeight: 36,
    isRanged: true,
    projectileSpeed: 290,
    splashRadius: 60,
    unlockLevel: 8, // REWARD AT LEVEL 8
    description: 'Arcane sorcerer. Hurls explosive magic orbs that damage whole enemy clusters.',
    counterDescription: 'Punishes clumped enemy armies; high gold cost.'
  },
  catapult: {
    id: 'catapult',
    name: 'Catapult',
    cost: 240,
    health: 160,
    damage: 60,
    speed: 24,
    range: 370,
    attackSpeed: 3.2,
    spawnCooldown: 8.5,
    size: 'large',
    spriteWidth: 56,
    spriteHeight: 50,
    isRanged: true,
    projectileSpeed: 240,
    splashRadius: 80,
    unlockLevel: 15, // REWARD AT LEVEL 15
    description: 'Siege engine. Launches massive boulders that crush enemy castles and armies from far away.',
    counterDescription: 'Devastates castles and dense lines; defenseless in close melee.'
  },
  giant: {
    id: 'giant',
    name: 'Giant',
    cost: 380,
    health: 950,
    damage: 48,
    speed: 20,
    range: 54,
    attackSpeed: 2.2,
    spawnCooldown: 13.0,
    size: 'huge',
    spriteWidth: 70,
    spriteHeight: 70,
    isRanged: false,
    splashRadius: 48,
    unlockLevel: 25, // REWARD AT LEVEL 25
    description: 'Colossal titan. Massive durability with sweeping ground-shattering cleave attacks.',
    counterDescription: 'Supreme unstoppable frontline bruiser.'
  },
  paladin: {
    id: 'paladin',
    name: 'Paladin',
    cost: 280,
    health: 650,
    damage: 32,
    speed: 30,
    range: 46,
    attackSpeed: 1.6,
    spawnCooldown: 10.0,
    size: 'large',
    spriteWidth: 54,
    spriteHeight: 54,
    isRanged: false,
    unlockLevel: 100, // REWARD AT LEVEL 100
    description: 'Holy crusader radiating a golden aura that heals and empowers surrounding troops.',
    counterDescription: 'Sustained team vanguard with holy radiance.'
  },
  dragon: {
    id: 'dragon',
    name: 'Fire Dragon',
    cost: 500,
    health: 1300,
    damage: 80,
    speed: 28,
    range: 210,
    attackSpeed: 2.1,
    spawnCooldown: 18.0,
    size: 'huge',
    spriteWidth: 84,
    spriteHeight: 84,
    isRanged: true,
    projectileSpeed: 320,
    splashRadius: 90,
    unlockLevel: 200, // REWARD AT LEVEL 200 (BIOME BOSS CLEAR)
    description: 'Ancient flying drake. Exhales torrents of incinerating dragonfire across the battlefield.',
    counterDescription: 'Ultimate aerial siege terror.'
  },
};

export const BOSS_ROSTER: Record<string, UnitBaseStats> = {
  ogre_boss: {
    id: 'boss',
    name: 'Groz the Goblin King',
    cost: 0,
    health: 1500,
    damage: 50,
    speed: 22,
    range: 55,
    attackSpeed: 2.0,
    spawnCooldown: 0,
    size: 'huge',
    spriteWidth: 80,
    spriteHeight: 80,
    isRanged: false,
    splashRadius: 55,
    unlockLevel: 999,
    description: 'Wields a spiked iron mace.',
    counterDescription: 'Boss of Green Plains.'
  },
  anubis_boss: {
    id: 'boss',
    name: 'Anubis Tomb Warden',
    cost: 0,
    health: 2600,
    damage: 65,
    speed: 26,
    range: 160,
    attackSpeed: 1.8,
    spawnCooldown: 0,
    size: 'huge',
    spriteWidth: 80,
    spriteHeight: 80,
    isRanged: true,
    projectileSpeed: 320,
    splashRadius: 65,
    unlockLevel: 999,
    description: 'Casts dark cursed sand spears.',
    counterDescription: 'Boss of Desert Ruins.'
  },
  frost_titan: {
    id: 'boss',
    name: 'Ymir the Frost Titan',
    cost: 0,
    health: 3800,
    damage: 85,
    speed: 18,
    range: 65,
    attackSpeed: 2.4,
    spawnCooldown: 0,
    size: 'huge',
    spriteWidth: 90,
    spriteHeight: 90,
    isRanged: false,
    splashRadius: 75,
    unlockLevel: 999,
    description: 'Glacial colossus that slams the earth.',
    counterDescription: 'Boss of Frozen Peaks.'
  },
  infernal_dragon: {
    id: 'boss',
    name: 'Ignis the Fire Drake',
    cost: 0,
    health: 5500,
    damage: 100,
    speed: 28,
    range: 200,
    attackSpeed: 2.2,
    spawnCooldown: 0,
    size: 'huge',
    spriteWidth: 96,
    spriteHeight: 96,
    isRanged: true,
    projectileSpeed: 300,
    splashRadius: 90,
    unlockLevel: 999,
    description: 'Spits molten breath across the whole army.',
    counterDescription: 'Supreme Boss of Volcano Fortress.'
  }
};

export const SPECIAL_ABILITIES: Record<SpecialAbilityType, SpecialAbility> = {
  arrowRain: {
    id: 'arrowRain',
    name: 'Arrow Rain',
    description: 'Volley of 35 piercing pixel arrows across the battlefield center.',
    cooldown: 20,
    icon: '🏹',
    damage: 75
  },
  lightningStrike: {
    id: 'lightningStrike',
    name: 'Lightning Strike',
    description: 'High-voltage lightning blast directly on the strongest front enemy.',
    cooldown: 18,
    icon: '⚡',
    damage: 260
  },
  rallyCry: {
    id: 'rallyCry',
    name: 'Rally Cry',
    description: 'War horn boosts friendly unit speed +40% and attack speed +50% for 8s.',
    cooldown: 24,
    icon: '🎺',
    duration: 8
  }
};

export const UPGRADE_DEFINITIONS = [
  {
    id: 'income',
    name: 'Royal Treasury',
    description: '+1.5 gold generated per second in battle.',
    maxLevel: 10,
    costFormula: (lvl: number) => 100 + lvl * 140,
    starFormula: (lvl: number) => 1 + Math.floor(lvl / 2),
    valuePerLevel: '+1.5/s'
  },
  {
    id: 'unitHealth',
    name: 'Iron Armor',
    description: '+10% maximum health for all friendly units.',
    maxLevel: 10,
    costFormula: (lvl: number) => 90 + lvl * 130,
    starFormula: (lvl: number) => 1 + Math.floor(lvl / 2),
    valuePerLevel: '+10% HP'
  },
  {
    id: 'unitDamage',
    name: 'Sharpened Blades',
    description: '+10% attack damage for all friendly units.',
    maxLevel: 10,
    costFormula: (lvl: number) => 90 + lvl * 130,
    starFormula: (lvl: number) => 1 + Math.floor(lvl / 2),
    valuePerLevel: '+10% DMG'
  },
  {
    id: 'castleHealth',
    name: 'Fortified Castle',
    description: '+20% castle maximum hit points.',
    maxLevel: 10,
    costFormula: (lvl: number) => 80 + lvl * 110,
    starFormula: (lvl: number) => 1 + Math.floor(lvl / 2),
    valuePerLevel: '+20% Castle HP'
  },
  {
    id: 'abilityPower',
    name: 'Battle Magic',
    description: '-10% ability cooldown and +15% ability potency.',
    maxLevel: 10,
    costFormula: (lvl: number) => 120 + lvl * 160,
    starFormula: (lvl: number) => 2,
    valuePerLevel: '-10% CD / +15% Pwr'
  }
] as const;

// 4 BIOMES - 200 LEVELS PER BIOME (TOTAL 800 LEVELS!)
export const WORLDS = [
  {
    id: 'plains' as const,
    name: 'Green Plains',
    startLevel: 1,
    endLevel: 200,
    bgColor: '#152e1e',
    groundColor: '#2d6a4f',
    description: 'Levels 1 - 200: Rolling grasslands, bandit hideouts, and goblin warcamps.'
  },
  {
    id: 'desert' as const,
    name: 'Desert Ruins',
    startLevel: 201,
    endLevel: 400,
    bgColor: '#3b2512',
    groundColor: '#c27803',
    description: 'Levels 201 - 400: Scorching dunes, cursed pyramids, and tomb guardians.'
  },
  {
    id: 'snow' as const,
    name: 'Frozen Peaks',
    startLevel: 401,
    endLevel: 600,
    bgColor: '#10223b',
    groundColor: '#93c5fd',
    description: 'Levels 401 - 600: Glacial blizzards, frost giants, and frozen bastions.'
  },
  {
    id: 'volcano' as const,
    name: 'Volcano Fortress',
    startLevel: 601,
    endLevel: 800,
    bgColor: '#2a0a0a',
    groundColor: '#b91c1c',
    description: 'Levels 601 - 800: Magma lakes, infernal drakes, and the obsidian citadel.'
  }
];

export const TOTAL_LEVELS = 800;
export const LEVELS_PER_BIOME = 200;

/**
 * Check if a specific level awards a new unit
 */
export function getUnitUnlockAtLevel(level: number): UnitBaseStats | null {
  for (const unit of Object.values(UNIT_ROSTER)) {
    if (unit.unlockLevel === level && level > 1) {
      return unit;
    }
  }
  return null;
}

/**
 * Procedural Deterministic Level Generator for 800 Levels across 4 Biomes
 */
export function getLevelConfig(levelId: number): LevelConfig {
  const lvl = Math.max(1, Math.min(TOTAL_LEVELS, levelId));

  // Determine World Theme
  let world: WorldTheme = 'plains';
  if (lvl > 600) world = 'volcano';
  else if (lvl > 400) world = 'snow';
  else if (lvl > 200) world = 'desert';

  const levelInWorld = ((lvl - 1) % LEVELS_PER_BIOME) + 1; // 1 to 200

  // Title generation
  const isMajorBoss = lvl === 200 || lvl === 400 || lvl === 600 || lvl === 800;
  const isMiniBoss = !isMajorBoss && (lvl % 10 === 0);

  let title = `Stage ${lvl}`;
  let subtitle = `Defeat the enemy forces in ${world === 'plains' ? 'Green Plains' : world === 'desert' ? 'Desert Ruins' : world === 'snow' ? 'Frozen Peaks' : 'Volcano Fortress'}.`;

  const unlockedUnitReward = getUnitUnlockAtLevel(lvl);
  if (unlockedUnitReward) {
    subtitle = `⭐ CLEAR THIS LEVEL TO UNLOCK: ${unlockedUnitReward.name.toUpperCase()}!`;
  }

  let miniBossName = 'Elite Vanguard';
  if (world === 'plains') miniBossName = `Forest Ogre Champion (Lv ${lvl})`;
  else if (world === 'desert') miniBossName = `Cursed Tomb Guardian (Lv ${lvl})`;
  else if (world === 'snow') miniBossName = `Glacial Frost Yeti (Lv ${lvl})`;
  else if (world === 'volcano') miniBossName = `Magma Inferno Golem (Lv ${lvl})`;

  if (isMajorBoss) {
    if (lvl === 200) title = 'Groz the Goblin Warlord (Biome Boss)';
    else if (lvl === 400) title = 'Anubis High Tomb Sovereign (Biome Boss)';
    else if (lvl === 600) title = 'Ymir the Ancient Frost Colossus (Biome Boss)';
    else if (lvl === 800) title = 'Ignis the Supreme Fire Drake (Final Boss)';
    subtitle = `MAJOR BIOME BOSS BATTLE: Defeat the supreme ${world} monster to conquer this realm!`;
  } else if (isMiniBoss) {
    title = `${miniBossName}`;
    subtitle = `BIOME MONSTER BATTLE (Every 10 Levels): Defeat the colossal ${world} beast!`;
  }

  // Enemy Castle HP: smoothly scales from 500 up through the levels
  const enemyCastleHp = Math.floor(
    500 + lvl * 18 + Math.pow(lvl, 1.15) * 8 + (isMajorBoss ? 3500 : isMiniBoss ? 1200 : 0)
  );

  // Enemy Gold Economy
  const enemyStartingGold = Math.min(800, Math.floor(60 + lvl * 1.5 + (isMiniBoss ? 150 : 0)));
  const enemyGoldRate = Number((3.0 + Math.min(9.0, Math.sqrt(lvl) * 0.45) + (isMajorBoss ? 2.5 : isMiniBoss ? 1.2 : 0)).toFixed(1));

  // Enemy Unit Pool (progressively adds higher units)
  const enemyUnitPool: UnitCategory[] = ['archer', 'knight'];
  if (lvl >= 2) enemyUnitPool.push('swordsman');
  if (lvl >= 6) enemyUnitPool.push('mage');
  if (lvl >= 12) enemyUnitPool.push('catapult');
  if (lvl >= 20) enemyUnitPool.push('giant');
  if (lvl >= 45) enemyUnitPool.push('paladin');
  if (lvl >= 90) enemyUnitPool.push('dragon');

  // Spawn Intervals
  const spawnMin = Math.max(1.2, 4.5 - Math.min(3.0, (lvl / 100) * 1.2));
  const spawnMax = Math.max(2.0, 6.8 - Math.min(4.0, (lvl / 100) * 1.5));

  // Money reward: Each level gives gold to spend on upgrades & roster!
  const rewardGold = Math.floor(80 + lvl * 12 + Math.pow(lvl, 1.08) * 3 + (isMajorBoss ? 1000 : isMiniBoss ? 400 : 0));

  // Boss config
  let boss: LevelConfig['boss'] = undefined;
  if (isMajorBoss) {
    const bossType: UnitCategory = 'boss';
    let bName = 'Groz the Goblin King';
    let bHp = 3500 + lvl * 8;
    let bDmg = 65 + Math.floor(lvl * 0.15);

    if (lvl === 400) {
      bName = 'Anubis High Tomb Sovereign';
      bHp = 6000;
      bDmg = 90;
    } else if (lvl === 600) {
      bName = 'Ymir the Frost Colossus';
      bHp = 8500;
      bDmg = 120;
    } else if (lvl === 800) {
      bName = 'Ignis the Supreme Fire Drake';
      bHp = 12000;
      bDmg = 150;
    }

    boss = {
      type: bossType,
      name: bName,
      health: bHp,
      damage: bDmg,
      spawnAtCastleHpPercent: 0.85
    };
  } else if (isMiniBoss) {
    boss = {
      type: 'boss',
      name: miniBossName,
      health: Math.floor(1200 + lvl * 12),
      damage: Math.floor(40 + lvl * 0.12),
      spawnAtCastleHpPercent: 0.8
    };
  }

  return {
    id: lvl,
    world,
    title,
    subtitle,
    enemyCastleHp,
    enemyStartingGold,
    enemyGoldRate,
    enemyUnitPool,
    enemySpawnIntervalMin: spawnMin,
    enemySpawnIntervalMax: spawnMax,
    boss,
    rewardGold,
    rewardStars: 3
  };
}

// Generate pre-populated initial levels array for backward compatibility
export const GAME_LEVELS: LevelConfig[] = Array.from({ length: 20 }, (_, i) => getLevelConfig(i + 1));

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  rewardGold: number;
  rewardTokens: number;
}

export const DAILY_QUESTS: DailyQuest[] = [
  {
    id: 'flawless_victory',
    title: 'Flawless Victory',
    description: 'Win a level without losing any friendly units.',
    rewardGold: 180,
    rewardTokens: 2
  },
  {
    id: 'speed_blitz',
    title: 'Lightning Blitz',
    description: 'Win any level in under 45 seconds.',
    rewardGold: 120,
    rewardTokens: 1
  },
  {
    id: 'heavy_investment',
    title: 'Royal Treasury Spending',
    description: 'Spend 400+ Gold on units in a single battle.',
    rewardGold: 150,
    rewardTokens: 2
  },
  {
    id: 'monster_slayer',
    title: 'Monster Slayer',
    description: 'Vanquish an Elite Biome Monster or Boss.',
    rewardGold: 250,
    rewardTokens: 3
  }
];

export const INITIAL_PLAYER_PROGRESS: PlayerProgress = {
  unlockedLevel: 1,
  levelStars: {},
  gold: 150, // Starting gold for workshop
  stars: 0,
  upgradeTokens: 0,
  completedQuests: {},
  upgrades: {
    income: 0,
    unitHealth: 0,
    unitDamage: 0,
    castleHealth: 0,
    abilityPower: 0
  },
  equippedAbility: 'arrowRain',
  hasSeenTutorial: false,
  soundEnabled: true,
  musicEnabled: true,
  screenShake: true
};

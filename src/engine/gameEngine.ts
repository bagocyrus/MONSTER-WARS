import { 
  UnitInstance, CastleState, Projectile, Particle, WeatherParticle, FloatingText, 
  LevelConfig, PlayerProgress, SpecialAbilityType, UnitCategory 
} from '../types/game';
import { 
  LANE_WIDTH, GROUND_Y, UNIT_ROSTER, BOSS_ROSTER, 
  SPECIAL_ABILITIES, getLevelConfig 
} from '../data/gameData';
import { soundEngine } from '../audio/soundEngine';

export class GameEngine {
  public level: LevelConfig;
  public progress: PlayerProgress;
  public isPaused: boolean = false;
  public gameSpeed: number = 1.0; // 1x or 2x
  public gameTime: number = 0;
  public gameOver: boolean = false;
  public isVictory: boolean = false;

  // Gold economy
  public playerGold: number = 100;
  public playerGoldRate: number = 5.0; // gold / sec
  public enemyGold: number = 50;
  public enemyGoldRate: number = 3.5;

  // Castles
  public playerCastle: CastleState;
  public enemyCastle: CastleState;

  // Units, Projectiles, Particles
  public units: UnitInstance[] = [];
  public projectiles: Projectile[] = [];
  public particles: Particle[] = [];
  public weatherParticles: WeatherParticle[] = [];
  public floatingTexts: FloatingText[] = [];
  public selectedUnitId: string | null = null;

  // Cooldowns
  public playerSpawnCooldowns: Record<string, number> = {};
  public abilityCooldown: number = 0;
  public maxAbilityCooldown: number = 20;

  // Enemy AI
  public enemySpawnTimer: number = 3.0;
  public bossSpawned: boolean = false;
  public secondBossSpawned: boolean = false;

  // Screen effects
  public screenShakeIntensity: number = 0;
  public screenShakeX: number = 0;
  public screenShakeY: number = 0;
  public lightningFlashAlpha: number = 0;

  // Camera viewport
  public cameraX: number = 400; // starts focused near player base

  // Match stats & Combat log
  public totalGoldSpent: number = 0;
  public unitSpawnCounts: Record<string, number> = {};
  public unitKillCounts: Record<string, number> = {};
  public battleLog: { id: string; text: string; time: number }[] = [];
  private lastAbilityReadyLogged: boolean = true;
  private castleUnderAttackCooldown: number = 0;

  // Callbacks
  private onGameOverCallback?: (victory: boolean, starsEarned: number, goldEarned: number) => void;

  constructor(levelId: number, progress: PlayerProgress, onGameOver?: (victory: boolean, starsEarned: number, goldEarned: number) => void) {
    const lvl = getLevelConfig(levelId);
    this.level = lvl;
    this.progress = progress;
    this.onGameOverCallback = onGameOver;

    // Upgrades calculation
    const incomeUpgrade = progress.upgrades.income || 0;
    this.playerGoldRate = 5.0 + incomeUpgrade * 1.5;
    this.playerGold = 100 + (lvl.id > 10 ? 50 : 0);

    const castleUpgrade = progress.upgrades.castleHealth || 0;
    const playerMaxCastleHp = Math.floor(1000 * (1 + castleUpgrade * 0.25));

    this.playerCastle = {
      maxHp: playerMaxCastleHp,
      hp: playerMaxCastleHp,
      x: 80,
      width: 110,
      height: 160,
      damageState: 'intact',
      hitFlashTimer: 0
    };

    this.enemyCastle = {
      maxHp: lvl.enemyCastleHp,
      hp: lvl.enemyCastleHp,
      x: LANE_WIDTH - 190,
      width: 110,
      height: 160,
      damageState: 'intact',
      hitFlashTimer: 0
    };

    this.enemyGold = lvl.enemyStartingGold;
    this.enemyGoldRate = lvl.enemyGoldRate;
    this.enemySpawnTimer = 3.0;

    const ability = SPECIAL_ABILITIES[progress.equippedAbility || 'arrowRain'];
    const abilityUpgrade = progress.upgrades.abilityPower || 0;
    this.maxAbilityCooldown = Math.max(8, ability.cooldown * (1 - abilityUpgrade * 0.15));
    this.abilityCooldown = 0;

    this.initWeather();
    this.logEvent(`Battle started: Stage ${lvl.id}`);

    // Start battle music
    if (lvl.boss) {
      soundEngine.playMusic('boss');
    } else {
      soundEngine.playMusic('battle');
    }
  }

  public logEvent(text: string) {
    const newEntry = {
      id: `log_${Date.now()}_${Math.random()}`,
      text,
      time: this.gameTime
    };
    this.battleLog = [newEntry, ...this.battleLog].slice(0, 5); // Keep last 5 events
  }

  private initWeather() {
    this.weatherParticles = [];
    const world = this.level.world;

    if (world === 'plains') {
      // 1. Green Plains: Fluttering leaves & floating golden pollen spores
      for (let i = 0; i < 45; i++) {
        const isGolden = Math.random() > 0.5;
        this.weatherParticles.push({
          id: `leaf_${i}`,
          x: Math.random() * (LANE_WIDTH + 300) - 150,
          y: Math.random() * GROUND_Y,
          vx: 35 + Math.random() * 45,
          vy: 20 + Math.random() * 25,
          size: Math.random() * 3 + 3,
          color: isGolden ? '#facc15' : '#4ade80',
          alpha: Math.random() * 0.6 + 0.35,
          baseAlpha: Math.random() * 0.6 + 0.35,
          layer: Math.random() > 0.3 ? 'background' : 'foreground',
          shape: 'leaf',
          oscillationSpeed: 2.5 + Math.random() * 2,
          oscillationAmplitude: 20 + Math.random() * 25,
          seed: Math.random() * 100,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() * 2 - 1) * 2.5
        });
      }

      // Spores / floating dandelion seeds
      for (let i = 0; i < 30; i++) {
        this.weatherParticles.push({
          id: `spore_${i}`,
          x: Math.random() * (LANE_WIDTH + 300) - 150,
          y: Math.random() * GROUND_Y,
          vx: 15 + Math.random() * 25,
          vy: 8 + Math.random() * 12,
          size: Math.random() * 2 + 1,
          color: '#fef08a',
          alpha: Math.random() * 0.5 + 0.3,
          baseAlpha: Math.random() * 0.5 + 0.3,
          layer: 'background',
          shape: 'smoke_wisp',
          oscillationSpeed: 1.5 + Math.random() * 1.5,
          oscillationAmplitude: 15 + Math.random() * 15,
          seed: Math.random() * 100
        });
      }
    } else if (world === 'desert') {
      // 2. Desert Ruins: Furious sandstorm streaks, dust devils & particulate haze
      for (let i = 0; i < 90; i++) {
        const isDark = Math.random() > 0.7;
        this.weatherParticles.push({
          id: `sand_${i}`,
          x: Math.random() * (LANE_WIDTH + 400) - 200,
          y: Math.random() * GROUND_Y,
          vx: 240 + Math.random() * 160,
          vy: 12 + Math.random() * 24,
          size: Math.random() * 3 + 2,
          color: isDark ? '#b45309' : Math.random() > 0.4 ? '#fde047' : '#fbbf24',
          alpha: Math.random() * 0.65 + 0.25,
          baseAlpha: Math.random() * 0.65 + 0.25,
          layer: Math.random() > 0.4 ? 'background' : 'foreground',
          shape: 'sand_grain',
          seed: Math.random() * 100
        });
      }

      // Dust Devils (whirlwinds)
      for (let i = 0; i < 6; i++) {
        this.weatherParticles.push({
          id: `devil_${i}`,
          x: Math.random() * (LANE_WIDTH + 200),
          y: GROUND_Y - 40 - Math.random() * 50,
          vx: 70 + Math.random() * 50,
          vy: -5 + Math.random() * 10,
          size: 20 + Math.random() * 16,
          color: '#d97706',
          alpha: 0.35,
          baseAlpha: 0.35,
          layer: 'foreground',
          shape: 'dust_devil',
          oscillationSpeed: 4.5,
          oscillationAmplitude: 24,
          seed: Math.random() * 100,
          rotation: 0,
          rotationSpeed: 6.0
        });
      }
    } else if (world === 'snow') {
      // 3. Frozen Peaks: 3-Tier Multi-Layer Blizzard Snowfall
      // Tier 1: Far micro snow dust
      for (let i = 0; i < 50; i++) {
        this.weatherParticles.push({
          id: `snow_far_${i}`,
          x: Math.random() * (LANE_WIDTH + 300) - 150,
          y: Math.random() * GROUND_Y,
          vx: 40 + Math.random() * 30,
          vy: 35 + Math.random() * 25,
          size: 1.5,
          color: '#cbd5e1',
          alpha: 0.4,
          baseAlpha: 0.4,
          layer: 'background',
          shape: 'snowflake',
          seed: Math.random() * 100
        });
      }

      // Tier 2: Midground fluffy crystal flakes
      for (let i = 0; i < 60; i++) {
        this.weatherParticles.push({
          id: `snow_mid_${i}`,
          x: Math.random() * (LANE_WIDTH + 300) - 150,
          y: Math.random() * GROUND_Y,
          vx: 65 + Math.random() * 50,
          vy: 55 + Math.random() * 40,
          size: Math.random() * 2 + 2.5,
          color: '#f8fafc',
          alpha: 0.7,
          baseAlpha: 0.7,
          layer: 'background',
          shape: 'snowflake',
          oscillationSpeed: 3.5 + Math.random() * 2,
          oscillationAmplitude: 18 + Math.random() * 18,
          seed: Math.random() * 100,
          rotation: Math.random() * Math.PI,
          rotationSpeed: (Math.random() * 2 - 1) * 2
        });
      }

      // Tier 3: Foreground heavy drifting snowflakes
      for (let i = 0; i < 25; i++) {
        this.weatherParticles.push({
          id: `snow_close_${i}`,
          x: Math.random() * (LANE_WIDTH + 300) - 150,
          y: Math.random() * GROUND_Y,
          vx: 90 + Math.random() * 60,
          vy: 75 + Math.random() * 45,
          size: Math.random() * 2.5 + 4,
          color: '#ffffff',
          alpha: 0.85,
          baseAlpha: 0.85,
          layer: 'foreground',
          shape: 'snowflake',
          oscillationSpeed: 4.0,
          oscillationAmplitude: 24,
          seed: Math.random() * 100
        });
      }
    } else {
      // 4. Volcano Fortress: Rising glowing magma embers & volcanic ash clouds
      for (let i = 0; i < 80; i++) {
        const isYellow = Math.random() > 0.6;
        this.weatherParticles.push({
          id: `ember_${i}`,
          x: Math.random() * (LANE_WIDTH + 300) - 150,
          y: GROUND_Y + 10 - Math.random() * 320,
          vx: (Math.random() * 2 - 1) * 28 + 15,
          vy: -45 - Math.random() * 65, // Rising upwards!
          size: Math.random() * 2.5 + 2,
          color: isYellow ? '#fde047' : Math.random() > 0.5 ? '#f97316' : '#ef4444',
          alpha: Math.random() * 0.6 + 0.4,
          baseAlpha: Math.random() * 0.6 + 0.4,
          layer: Math.random() > 0.35 ? 'background' : 'foreground',
          shape: 'ember',
          oscillationSpeed: 3.0 + Math.random() * 3,
          oscillationAmplitude: 12 + Math.random() * 14,
          seed: Math.random() * 100
        });
      }

      // Dark volcanic ash plumes & soot
      for (let i = 0; i < 35; i++) {
        this.weatherParticles.push({
          id: `ash_${i}`,
          x: Math.random() * (LANE_WIDTH + 300) - 150,
          y: GROUND_Y + 10 - Math.random() * 320,
          vx: 20 + Math.random() * 30,
          vy: -25 - Math.random() * 35,
          size: Math.random() * 4 + 4,
          color: Math.random() > 0.5 ? '#27272a' : '#18181b',
          alpha: Math.random() * 0.4 + 0.2,
          baseAlpha: Math.random() * 0.4 + 0.2,
          layer: 'background',
          shape: 'smoke_wisp',
          oscillationSpeed: 2.0,
          oscillationAmplitude: 16,
          seed: Math.random() * 100
        });
      }
    }
  }

  /**
   * Main game tick (called each frame with deltaTime in seconds)
   */
  public update(dt: number) {
    if (this.isPaused || this.gameOver) return;

    // Apply 1x or 2x speed multiplier
    const effectiveDt = Math.min(dt, 0.1) * this.gameSpeed;
    this.gameTime += effectiveDt;

    // 1. Update Gold Income
    this.playerGold += this.playerGoldRate * effectiveDt;
    this.enemyGold += this.enemyGoldRate * effectiveDt;

    // 2. Decrement Cooldowns
    for (const key of Object.keys(this.playerSpawnCooldowns)) {
      if (this.playerSpawnCooldowns[key] > 0) {
        this.playerSpawnCooldowns[key] = Math.max(0, this.playerSpawnCooldowns[key] - effectiveDt);
      }
    }
    if (this.abilityCooldown > 0) {
      this.abilityCooldown = Math.max(0, this.abilityCooldown - effectiveDt);
    }
    if (this.castleUnderAttackCooldown > 0) {
      this.castleUnderAttackCooldown -= effectiveDt;
    }

    if (this.abilityCooldown <= 0 && !this.lastAbilityReadyLogged) {
      this.logEvent('Ability ready!');
      this.lastAbilityReadyLogged = true;
    } else if (this.abilityCooldown > 0) {
      this.lastAbilityReadyLogged = false;
    }

    // 3. Castle hit flash timers
    if (this.playerCastle.hitFlashTimer > 0) {
      this.playerCastle.hitFlashTimer -= effectiveDt;
    }
    if (this.enemyCastle.hitFlashTimer > 0) {
      this.enemyCastle.hitFlashTimer -= effectiveDt;
    }

    // 4. Update Screen Shake & Flash
    if (this.screenShakeIntensity > 0) {
      this.screenShakeIntensity = Math.max(0, this.screenShakeIntensity - effectiveDt * 18);
      this.screenShakeX = (Math.random() * 2 - 1) * this.screenShakeIntensity;
      this.screenShakeY = (Math.random() * 2 - 1) * this.screenShakeIntensity;
    } else {
      this.screenShakeX = 0;
      this.screenShakeY = 0;
    }

    if (this.lightningFlashAlpha > 0) {
      this.lightningFlashAlpha = Math.max(0, this.lightningFlashAlpha - effectiveDt * 3.5);
    }

    // 5. Update Units
    this.updateUnits(effectiveDt);

    // 6. Update Projectiles
    this.updateProjectiles(effectiveDt);

    // 7. Update Enemy AI Spawning
    this.updateEnemyAI(effectiveDt);

    // 8. Update Particles & Floating Text
    this.updateParticles(effectiveDt);
    this.updateWeather(effectiveDt);

    // 9. Auto Camera Tracking: gently follows the battle frontline
    this.updateCamera(effectiveDt);

    // 10. Check Win / Lose conditions
    this.checkGameConditions();
  }

  // --- UNIT SPAWNING ---
  public spawnPlayerUnit(unitType: UnitCategory): boolean {
    if (this.gameOver || this.isPaused) return false;
    const baseStats = UNIT_ROSTER[unitType];
    if (!baseStats) return false;

    // Check cost
    if (this.playerGold < baseStats.cost) return false;

    // Check cooldown
    if ((this.playerSpawnCooldowns[unitType] || 0) > 0) return false;

    // Apply upgrades
    const healthUpgrade = this.progress.upgrades.unitHealth || 0;
    const damageUpgrade = this.progress.upgrades.unitDamage || 0;

    const finalHp = Math.floor(baseStats.health * (1 + healthUpgrade * 0.12));
    const finalDmg = Math.floor(baseStats.damage * (1 + damageUpgrade * 0.12));

    this.playerGold -= baseStats.cost;
    this.playerSpawnCooldowns[unitType] = baseStats.spawnCooldown;
    this.totalGoldSpent += baseStats.cost;
    this.unitSpawnCounts[unitType] = (this.unitSpawnCounts[unitType] || 0) + 1;
    this.logEvent(`Player spawned ${baseStats.name}!`);

    // Create unit instance
    const newUnit: UnitInstance = {
      id: `p_${Date.now()}_${Math.random()}`,
      type: unitType,
      size: baseStats.size,
      team: 'player',
      x: this.playerCastle.x + 85,
      y: (Math.random() * 16 - 8), // natural lane spread
      maxHp: finalHp,
      hp: finalHp,
      damage: finalDmg,
      speed: baseStats.speed,
      range: baseStats.range,
      attackSpeed: baseStats.attackSpeed,
      attackCooldown: 0.3,
      state: 'walking',
      frame: 0,
      frameTimer: 0,
      targetId: null,
      hitFlashTimer: 0,
      rallyBuffTimer: 0,
      goldReward: Math.floor(baseStats.cost * 0.4)
    };

    this.units.push(newUnit);
    soundEngine.playSpawn();

    // Fair Reactive Enemy Spawning: Enemy AI reacts by spawning a different unit type
    this.triggerReactiveEnemySpawn(unitType);

    return true;
  }

  private triggerReactiveEnemySpawn(playerUnitType: UnitCategory) {
    if (this.gameOver || this.isPaused) return;

    const pool = this.level.enemyUnitPool;
    // Filter out the same unit type so enemy spawns a different unit
    const availableDifferentUnits = pool.filter(u => u !== playerUnitType);

    if (availableDifferentUnits.length === 0) return;

    // Tactical Counter Selection (different from player's unit)
    let counterUnit: UnitCategory = availableDifferentUnits[0];

    if (playerUnitType === 'knight' && availableDifferentUnits.includes('archer')) {
      counterUnit = 'archer';
    } else if (playerUnitType === 'archer' && availableDifferentUnits.includes('swordsman')) {
      counterUnit = 'swordsman';
    } else if (playerUnitType === 'swordsman' && availableDifferentUnits.includes('knight')) {
      counterUnit = 'knight';
    } else if (playerUnitType === 'mage' && availableDifferentUnits.includes('catapult')) {
      counterUnit = 'catapult';
    } else if (playerUnitType === 'giant' && availableDifferentUnits.includes('mage')) {
      counterUnit = 'mage';
    } else {
      // Pick a random different unit from available pool
      counterUnit = availableDifferentUnits[Math.floor(Math.random() * availableDifferentUnits.length)];
    }

    // Reaction delay (0.4s to 0.7s) for a natural, fair duel response
    const delayMs = 400 + Math.random() * 300;
    setTimeout(() => {
      if (!this.gameOver && !this.isPaused) {
        this.spawnEnemyUnit(counterUnit);
      }
    }, delayMs);
  }

  public selectUnitAt(x: number, y: number): UnitInstance | null {
    let bestUnit: UnitInstance | null = null;
    let minDist = 50; // Click radius in lane space

    for (const unit of this.units) {
      if (unit.state === 'dying') continue;
      const uy = GROUND_Y + unit.y;
      const dist = Math.hypot(unit.x - x, uy - y);
      if (dist < minDist) {
        minDist = dist;
        bestUnit = unit;
      }
    }

    this.selectedUnitId = bestUnit ? bestUnit.id : null;
    if (bestUnit) {
      soundEngine.playButtonClick();
    }
    return bestUnit;
  }

  public spawnEnemyUnit(unitType: UnitCategory, isBossUnit = false): boolean {
    const baseStats = isBossUnit ? (BOSS_ROSTER[unitType] || UNIT_ROSTER[unitType]) : UNIT_ROSTER[unitType];
    if (!baseStats) return false;

    const cycleTime = this.gameTime % 60;
    const isNight = cycleTime >= 35 && cycleTime < 55;
    const statMultiplier = isNight ? 1.25 : 1.0;

    const newUnit: UnitInstance = {
      id: `e_${Date.now()}_${Math.random()}`,
      type: unitType,
      size: baseStats.size,
      team: 'enemy',
      x: this.enemyCastle.x - 10,
      y: (Math.random() * 16 - 8),
      maxHp: Math.floor(baseStats.health * statMultiplier),
      hp: Math.floor(baseStats.health * statMultiplier),
      damage: Math.floor(baseStats.damage * statMultiplier),
      speed: Math.floor(baseStats.speed * (isNight ? 1.2 : 1.0)),
      range: baseStats.range,
      attackSpeed: baseStats.attackSpeed,
      attackCooldown: 0.5,
      state: 'walking',
      frame: 0,
      frameTimer: 0,
      targetId: null,
      hitFlashTimer: 0,
      rallyBuffTimer: 0,
      isBoss: isBossUnit,
      bossName: isBossUnit ? (this.level.boss?.name || 'Boss') : undefined,
      goldReward: isBossUnit ? 150 : Math.floor(baseStats.cost * 0.5)
    };

    this.units.push(newUnit);
    if (isBossUnit) {
      this.triggerScreenShake(8);
      this.addFloatingText('BOSS SPAWNED!', this.enemyCastle.x - 40, GROUND_Y - 80, '#ef4444', true);
      this.logEvent(`Boss spawned: ${newUnit.bossName}!`);
    } else {
      if (isNight) {
        this.logEvent(`Night Surge: Enemy ${baseStats.name} (+25% Stats)!`);
      } else {
        this.logEvent(`Enemy ${baseStats.name} spawned!`);
      }
    }
    return true;
  }

  // --- SPECIAL ABILITY ACTIVATION ---
  public useSpecialAbility(): boolean {
    if (this.gameOver || this.isPaused || this.abilityCooldown > 0) return false;

    const abilityType = this.progress.equippedAbility || 'arrowRain';
    const abilityUpgrade = this.progress.upgrades.abilityPower || 0;
    const powerMultiplier = 1 + abilityUpgrade * 0.2;

    this.abilityCooldown = this.maxAbilityCooldown;

    if (abilityType === 'arrowRain') {
      soundEngine.playArrowShoot();
      this.triggerScreenShake(5);

      // Rain arrows down in center-front of lane
      const targetZoneX = Math.min(LANE_WIDTH - 250, Math.max(300, this.cameraX));

      for (let i = 0; i < 30; i++) {
        setTimeout(() => {
          if (this.gameOver) return;
          const dropX = targetZoneX - 250 + Math.random() * 500;
          const dropY = GROUND_Y + (Math.random() * 20 - 10);

          this.projectiles.push({
            id: `arrow_rain_${Math.random()}`,
            team: 'player',
            type: 'arrow',
            startX: dropX - 80,
            startY: -50,
            currentX: dropX - 80,
            currentY: -50,
            targetX: dropX,
            targetY: dropY,
            targetUnitId: null,
            speed: 550,
            progress: 0,
            damage: Math.floor(25 * powerMultiplier),
            splashRadius: 28,
            arcHeight: 20
          });
        }, i * 35);
      }
    } else if (abilityType === 'lightningStrike') {
      soundEngine.playLightning();
      this.triggerScreenShake(12);
      this.lightningFlashAlpha = 0.85;

      // Find the enemy unit closest to player castle or highest HP boss
      const enemyUnits = this.units.filter(u => u.team === 'enemy' && u.state !== 'dying');
      enemyUnits.sort((a, b) => a.x - b.x); // frontmost enemy

      const primaryTarget = enemyUnits[0];
      const strikeX = primaryTarget ? primaryTarget.x : this.enemyCastle.x;
      const strikeDamage = Math.floor(240 * powerMultiplier);

      if (primaryTarget) {
        this.applyDamageToUnit(primaryTarget, strikeDamage, true);
      } else {
        this.damageCastle('enemy', strikeDamage);
      }

      // Splash damage to nearby enemies
      for (const enemy of enemyUnits) {
        if (enemy !== primaryTarget && Math.abs(enemy.x - strikeX) < 90) {
          this.applyDamageToUnit(enemy, Math.floor(strikeDamage * 0.5), false);
        }
      }

      // Spawn lightning ground sparks & shockwave ring
      this.spawnImpactParticles(strikeX, GROUND_Y, '#38bdf8', 25);
      this.particles.push({
        id: `shockwave_${Math.random()}`,
        x: strikeX,
        y: GROUND_Y,
        vx: 0,
        vy: 0,
        color: '#38bdf8',
        size: 8,
        alpha: 1.0,
        maxLife: 0.4,
        currentLife: 0,
        shape: 'ring'
      });
    } else if (abilityType === 'rallyCry') {
      soundEngine.playRally();
      this.triggerScreenShake(4);

      // Buff all friendly units
      const playerUnits = this.units.filter(u => u.team === 'player' && u.state !== 'dying');
      for (const unit of playerUnits) {
        unit.rallyBuffTimer = 8.0 * powerMultiplier;
        unit.speed = UNIT_ROSTER[unit.type].speed * 1.45;
        unit.attackSpeed = UNIT_ROSTER[unit.type].attackSpeed * 0.65;
        this.spawnImpactParticles(unit.x, GROUND_Y + unit.y, '#fbbf24', 8);
      }

      this.addFloatingText('RALLY BOOST!', this.playerCastle.x + 120, GROUND_Y - 90, '#fbbf24', true);
    }

    return true;
  }

  // --- UNIT SIMULATION & COMBAT ---
  private updateUnits(dt: number) {
    for (let i = this.units.length - 1; i >= 0; i--) {
      const unit = this.units[i];

      // Handle hit flash decay
      if (unit.hitFlashTimer > 0) {
        unit.hitFlashTimer -= dt;
      }

      // Handle rally buff decay
      if (unit.rallyBuffTimer > 0) {
        unit.rallyBuffTimer -= dt;
        if (unit.rallyBuffTimer <= 0) {
          const base = UNIT_ROSTER[unit.type];
          unit.speed = base.speed;
          unit.attackSpeed = base.attackSpeed;
        }
      }

      // Handle Dying state
      if (unit.state === 'dying') {
        unit.frameTimer += dt;
        if (unit.frameTimer > 0.09) {
          unit.frameTimer = 0;
          unit.frame++;
          if (unit.frame >= 4) {
            // Remove unit & reward gold to killer
            if (unit.team === 'enemy') {
              this.playerGold += unit.goldReward;
              soundEngine.playCoin();
              this.addFloatingText(`+${unit.goldReward}G`, unit.x, GROUND_Y + unit.y - 25, '#fbbf24');

              if (unit.isBoss) {
                this.triggerScreenShake(12);
                this.spawnImpactParticles(unit.x, GROUND_Y, '#ef4444', 30);
                this.addFloatingText('BOSS DEFEATED!', unit.x, GROUND_Y - 70, '#facc15', true);
                // Boss defeat bonus: deal heavy damage to enemy castle when elite boss is vanquished!
                this.damageCastle('enemy', Math.floor(this.enemyCastle.maxHp * 0.4));
                this.logEvent(`Boss ${unit.bossName || 'Monster'} defeated! Enemy castle damaged!`);
              }
            }
            this.units.splice(i, 1);
          }
        }
        continue;
      }

      // Update attack cooldown
      if (unit.attackCooldown > 0) {
        unit.attackCooldown -= dt;
      }

      // Target finding
      const isPlayer = unit.team === 'player';
      const enemies = this.units.filter(u => u.team !== unit.team && u.state !== 'dying');

      // Check castle in range
      const enemyCastleX = isPlayer ? this.enemyCastle.x : this.playerCastle.x + this.playerCastle.width;
      const distToCastle = isPlayer ? (enemyCastleX - unit.x) : (unit.x - enemyCastleX);

      let currentTarget: UnitInstance | null = null;
      let minDistance = 99999;

      for (const enemy of enemies) {
        const d = isPlayer ? (enemy.x - unit.x) : (unit.x - enemy.x);
        if (d >= 0 && d < minDistance) {
          minDistance = d;
          currentTarget = enemy;
        }
      }

      // Check if target or castle is in attack range
      const targetInRange = currentTarget && minDistance <= unit.range;
      const castleInRange = distToCastle <= unit.range;

      if (targetInRange || castleInRange) {
        // Stop & Attack
        unit.state = 'attacking';
        unit.targetId = (targetInRange && currentTarget) ? currentTarget.id : 'castle';

        // Animate attack
        unit.frameTimer += dt;
        const frameTime = unit.attackSpeed / 3;
        if (unit.frameTimer >= frameTime) {
          unit.frameTimer = 0;
          unit.frame = (unit.frame + 1) % 3;

          // Attack strike on frame 1
          if (unit.frame === 1 && unit.attackCooldown <= 0) {
            this.executeUnitAttack(unit, (targetInRange && currentTarget) ? currentTarget : null, castleInRange);
            unit.attackCooldown = unit.attackSpeed;
          }
        }
      } else {
        // Advance / Walk
        unit.state = 'walking';
        unit.targetId = null;

        // Check friendly unit blocking in front (to avoid infinite tight stacking)
        let blocked = false;
        for (const ally of this.units) {
          if (ally !== unit && ally.team === unit.team && ally.state !== 'dying') {
            const allyDist = isPlayer ? (ally.x - unit.x) : (unit.x - ally.x);
            if (allyDist > 0 && allyDist < (unit.size === 'huge' ? 24 : 14) && (ally.state === 'attacking' || ally.state === 'idle')) {
              blocked = true;
              break;
            }
          }
        }

        if (!blocked) {
          const moveStep = unit.speed * dt;
          unit.x += isPlayer ? moveStep : -moveStep;

          // Animate walk
          unit.frameTimer += dt;
          if (unit.frameTimer > 0.12) {
            unit.frameTimer = 0;
            unit.frame = (unit.frame + 1) % 4;
          }
        } else {
          unit.state = 'idle';
          unit.frame = 0;
        }
      }
    }
  }

  private executeUnitAttack(unit: UnitInstance, target: UnitInstance | null, attackingCastle: boolean) {
    const isPlayer = unit.team === 'player';
    const isRanged = UNIT_ROSTER[unit.type]?.isRanged || (unit.isBoss && unit.range > 60);

    if (isRanged) {
      // Spawn Projectile
      const projType = unit.type === 'catapult' ? 'rock' : unit.type === 'mage' ? 'magic' : (unit.type === 'dragon' || unit.isBoss) ? 'fireball' : 'arrow';
      const startX = unit.x + (isPlayer ? 15 : -15);
      const startY = GROUND_Y + unit.y - 20;

      let targetX = attackingCastle ? (isPlayer ? this.enemyCastle.x + 30 : this.playerCastle.x + 60) : (target ? target.x : startX + 100);
      let targetY = attackingCastle ? GROUND_Y - 50 : (target ? GROUND_Y + target.y - 12 : GROUND_Y);

      if (projType === 'arrow') soundEngine.playArrowShoot();
      else if (projType === 'magic' || projType === 'fireball') soundEngine.playMagic();

      this.projectiles.push({
        id: `p_${Date.now()}_${Math.random()}`,
        team: unit.team,
        type: projType,
        startX,
        startY,
        currentX: startX,
        currentY: startY,
        targetX,
        targetY,
        targetUnitId: target ? target.id : null,
        speed: UNIT_ROSTER[unit.type]?.projectileSpeed || 320,
        progress: 0,
        damage: unit.damage,
        splashRadius: UNIT_ROSTER[unit.type]?.splashRadius || (unit.isBoss ? 65 : 0),
        arcHeight: projType === 'arrow' || projType === 'rock' ? 45 : 10,
        sourceUnitType: unit.type,
        sourceUnitId: unit.id
      });
    } else {
      // Direct Melee Hit
      soundEngine.playSwordHit();
      if (unit.size === 'huge' || unit.isBoss) {
        this.triggerScreenShake(3);
      }

      if (target) {
        this.applyDamageToUnit(target, unit.damage, false, unit.type, unit.id);
        this.spawnImpactParticles(target.x, GROUND_Y + target.y - 15, '#e2e8f0', 6);

        // Synchronized Clumped Volley Attack: when friendly units are scrambled together, sync nearby attack timers to strike all at once!
        const clusteredAllies = this.units.filter(
          u => u !== unit && u.team === unit.team && u.state === 'attacking' && Math.abs(u.x - unit.x) < 50
        );
        for (const ally of clusteredAllies) {
          if (ally.attackCooldown > 0.1) {
            ally.attackCooldown = 0.05; // Synchronize volley strike!
          }
        }

        // Paladin Holy Radiant Healing on Strike
        if (unit.type === 'paladin') {
          const allies = this.units.filter(u => u.team === unit.team && u.state !== 'dying');
          for (const ally of allies) {
            if (Math.abs(ally.x - unit.x) < 70 && ally.hp < ally.maxHp) {
              ally.hp = Math.min(ally.maxHp, ally.hp + 15);
              this.addFloatingText('+15 HP', ally.x, GROUND_Y + ally.y - 25, '#4ade80');
            }
          }
        }

        // Cleave splash for giant
        if (unit.type === 'giant' || unit.isBoss) {
          const enemies = this.units.filter(u => u.team !== unit.team && u.state !== 'dying' && u !== target);
          for (const enemy of enemies) {
            if (Math.abs(enemy.x - target.x) < 45) {
              this.applyDamageToUnit(enemy, Math.floor(unit.damage * 0.6), false, unit.type, unit.id);
            }
          }
        }
      } else if (attackingCastle) {
        this.damageCastle(isPlayer ? 'enemy' : 'player', unit.damage);
      }
    }
  }

  // --- PROJECTILES UPDATE ---
  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      const totalDist = Math.hypot(p.targetX - p.startX, p.targetY - p.startY);
      const stepProgress = (p.speed * dt) / Math.max(1, totalDist);

      p.progress += stepProgress;

      if (p.progress >= 1.0) {
        // Impact!
        this.handleProjectileImpact(p);
        this.projectiles.splice(i, 1);
      } else {
        // Ballistic parabolic trajectory
        p.currentX = p.startX + (p.targetX - p.startX) * p.progress;
        const linearY = p.startY + (p.targetY - p.startY) * p.progress;
        const arc = 4 * p.arcHeight * p.progress * (1 - p.progress);
        p.currentY = linearY - arc;
      }
    }
  }

  private handleProjectileImpact(p: Projectile) {
    const isPlayer = p.team === 'player';
    const hitCastle = Math.abs(p.targetX - (isPlayer ? this.enemyCastle.x : this.playerCastle.x)) < 70;

    if (p.type === 'arrow') {
      soundEngine.playArrowHit();
      this.spawnImpactParticles(p.targetX, p.targetY, '#f8fafc', 5);
    } else if (p.type === 'rock') {
      soundEngine.playExplosion();
      this.triggerScreenShake(6);
      this.spawnImpactParticles(p.targetX, p.targetY, '#64748b', 16);
    } else {
      soundEngine.playExplosion();
      this.spawnImpactParticles(p.targetX, p.targetY, p.type === 'fireball' ? '#f97316' : '#38bdf8', 14);
    }

    if (p.splashRadius > 0) {
      // Area of Effect Damage
      const enemies = this.units.filter(u => u.team !== p.team && u.state !== 'dying');
      for (const enemy of enemies) {
        if (Math.abs(enemy.x - p.targetX) <= p.splashRadius) {
          this.applyDamageToUnit(enemy, p.damage, false, p.sourceUnitType, p.sourceUnitId);
        }
      }
      if (hitCastle) {
        this.damageCastle(isPlayer ? 'enemy' : 'player', p.damage);
      }
    } else {
      // Single Target Damage
      if (p.targetUnitId) {
        const target = this.units.find(u => u.id === p.targetUnitId && u.state !== 'dying');
        if (target) {
          this.applyDamageToUnit(target, p.damage, false, p.sourceUnitType, p.sourceUnitId);
        }
      } else if (hitCastle) {
        this.damageCastle(isPlayer ? 'enemy' : 'player', p.damage);
      }
    }
  }

  // --- DAMAGE & HEALTH RESOLUTION ---
  private applyDamageToUnit(unit: UnitInstance, baseDmg: number, forceCrit = false, attackerType?: UnitCategory, attackerId?: string) {
    const isCrit = forceCrit || Math.random() < 0.18; // 18% Critical Hit chance
    const finalDmg = isCrit ? Math.floor(baseDmg * 1.6) : baseDmg;

    const wasAlive = unit.hp > 0 && unit.state !== 'dying';
    unit.hp = Math.max(0, unit.hp - finalDmg);
    unit.hitFlashTimer = 0.08;

    const textStr = isCrit ? `CRIT -${finalDmg}!` : `-${finalDmg}`;
    const textColor = isCrit
      ? '#f59e0b' // Vibrant amber gold for CRIT
      : unit.team === 'player'
      ? '#f87171' // Crimson red when player unit receives damage
      : '#ffffff'; // Crisp pixel white when enemy receives damage

    this.addFloatingText(textStr, unit.x, GROUND_Y + unit.y - 20, textColor, isCrit);

    if (isCrit) {
      this.spawnImpactParticles(unit.x, GROUND_Y + unit.y - 15, '#fbbf24', 8);
    }

    if (wasAlive && unit.hp <= 0 && unit.state !== 'dying') {
      unit.state = 'dying';
      unit.frame = 0;
      unit.frameTimer = 0;

      // Track kill leaderboard count for player unit types
      if (unit.team === 'enemy') {
        const kType = attackerType || 'swordsman';
        this.unitKillCounts[kType] = (this.unitKillCounts[kType] || 0) + 1;
      }

      // Check killer unit mid-battle leveling & Veteran Rank promotion
      if (attackerId) {
        const killer = this.units.find(u => u.id === attackerId && u.state !== 'dying');
        if (killer) {
          killer.kills = (killer.kills || 0) + 1;
          if (killer.kills >= 2 && !killer.isVeteran) {
            killer.isVeteran = true;
            // Promote to Veteran: +30% HP, +25% Damage, +15% Speed!
            killer.maxHp = Math.floor(killer.maxHp * 1.3);
            killer.hp = Math.floor(killer.hp * 1.3);
            killer.damage = Math.floor(killer.damage * 1.25);
            killer.speed = Math.floor(killer.speed * 1.15);

            this.addFloatingText('⭐ VETERAN RANK! ⭐', killer.x, GROUND_Y + killer.y - 45, '#facc15', true);
            this.spawnImpactParticles(killer.x, GROUND_Y + killer.y - 15, '#fbbf24', 16);
            this.logEvent(`${killer.team === 'player' ? 'Player' : 'Enemy'} ${killer.type.toUpperCase()} promoted to VETERAN!`);
            soundEngine.playCoin();
          }
        }
      }
    }
  }

  private damageCastle(team: 'player' | 'enemy', dmg: number) {
    const castle = team === 'player' ? this.playerCastle : this.enemyCastle;
    castle.hp = Math.max(0, castle.hp - dmg);
    castle.hitFlashTimer = 0.08;
    this.triggerScreenShake(3);

    if (team === 'player' && this.castleUnderAttackCooldown <= 0) {
      this.logEvent('Castle under attack!');
      this.castleUnderAttackCooldown = 7.0;
    }

    this.addFloatingText(`-${dmg}`, castle.x + 50, GROUND_Y - 100, team === 'player' ? '#f87171' : '#60a5fa');
  }

  // --- ENEMY AI SPAWNING LOGIC ---
  private updateEnemyAI(dt: number) {
    const cycleTime = this.gameTime % 60;
    const isNight = cycleTime >= 35 && cycleTime < 55;

    this.enemySpawnTimer -= dt * (isNight ? 1.6 : 1.0);

    // Check boss trigger
    if (this.level.boss && !this.bossSpawned) {
      const castlePercent = this.enemyCastle.hp / this.enemyCastle.maxHp;
      if (castlePercent <= this.level.boss.spawnAtCastleHpPercent || this.gameTime > 60) {
        this.bossSpawned = true;
        this.spawnEnemyUnit(this.level.boss.type, true);
      }
    }

    // Check boss final phase transformation twist when base is about to be destroyed (< 18% HP)
    if (this.level.boss && this.bossSpawned && !this.secondBossSpawned) {
      const castlePercent = this.enemyCastle.hp / this.enemyCastle.maxHp;
      if (castlePercent <= 0.18 && castlePercent > 0) {
        this.secondBossSpawned = true;
        this.enemyCastle.hp = Math.floor(this.enemyCastle.maxHp * 0.45); // Transforms & regains health into a new boss citadel!
        this.triggerScreenShake(16);
        this.lightningFlashAlpha = 0.95;
        this.spawnEnemyUnit(this.level.boss.type, true); // Spawns the boss guardian again
        this.addFloatingText('⚡ BASE TRANSFORMS INTO BOSS CITADEL! ⚡', this.enemyCastle.x - 30, GROUND_Y - 120, '#f59e0b', true);
        this.logEvent('Base destroyed? NO! Castle transforms into Boss Citadel and awakens final guardian!');
        soundEngine.playLightning();
      }
    }

    if (this.enemySpawnTimer <= 0) {
      // Pick unit to spawn from pool
      const pool = this.level.enemyUnitPool;
      if (pool.length > 0) {
        // Counter-pick intelligence: inspect player army composition
        const playerCounts = {
          swordsman: 0,
          archer: 0,
          knight: 0,
          mage: 0,
          catapult: 0,
          giant: 0
        };

        for (const u of this.units) {
          if (u.team === 'player' && u.state !== 'dying' && playerCounts[u.type as keyof typeof playerCounts] !== undefined) {
            playerCounts[u.type as keyof typeof playerCounts]++;
          }
        }

        let chosenUnit = pool[Math.floor(Math.random() * pool.length)];

        // Adaptive Counter logic
        if (playerCounts.knight > 1 && pool.includes('archer')) {
          chosenUnit = 'archer';
        } else if (playerCounts.archer > 2 && pool.includes('swordsman')) {
          chosenUnit = 'swordsman';
        } else if ((playerCounts.swordsman + playerCounts.archer > 4) && pool.includes('mage')) {
          chosenUnit = 'mage';
        } else if (playerCounts.giant > 0 && pool.includes('catapult')) {
          chosenUnit = 'catapult';
        }

        const cost = UNIT_ROSTER[chosenUnit]?.cost || 50;
        if (this.enemyGold >= cost) {
          this.enemyGold -= cost;
          this.spawnEnemyUnit(chosenUnit);
        }
      }

      // Reset timer with slight randomization
      const minT = this.level.enemySpawnIntervalMin;
      const maxT = this.level.enemySpawnIntervalMax;
      this.enemySpawnTimer = minT + Math.random() * (maxT - minT);
    }
  }

  // --- PARTICLES & FLOATING TEXTS ---
  private spawnImpactParticles(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 20 + Math.random() * 80;
      this.particles.push({
        id: `p_${Math.random()}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 20,
        color,
        size: Math.random() * 3 + 2,
        alpha: 1.0,
        maxLife: 0.35 + Math.random() * 0.25,
        currentLife: 0,
        gravity: 120
      });
    }
  }

  private addFloatingText(text: string, x: number, y: number, color: string, isCrit = false) {
    this.floatingTexts.push({
      id: `ft_${Math.random()}`,
      text,
      x: x + (Math.random() * 16 - 8),
      y,
      color,
      alpha: 1.0,
      life: 0.9,
      vy: -35,
      isCrit
    });
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.currentLife += dt;
      if (p.currentLife >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.gravity) {
        p.vy += p.gravity * dt;
      }
      p.alpha = Math.max(0, 1 - (p.currentLife / p.maxLife));
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
        continue;
      }

      ft.y += ft.vy * dt;
      ft.alpha = Math.max(0, ft.life / 0.9);
    }
  }

  private updateWeather(dt: number) {
    const windGust = Math.sin(this.gameTime * 0.8) * 0.35 + Math.cos(this.gameTime * 0.3) * 0.25 + 1.0;

    for (const wp of this.weatherParticles) {
      // Apply wind gust to horizontal velocity
      let currentVx = wp.vx * windGust;
      let currentVy = wp.vy;

      // Handle sinusoidal oscillation for floating leaves / snowflakes / embers
      if (wp.oscillationSpeed && wp.oscillationAmplitude) {
        const osc = Math.sin(this.gameTime * wp.oscillationSpeed + wp.seed);
        currentVx += osc * wp.oscillationAmplitude * 0.8;
      }

      // Handle rotation
      if (wp.rotationSpeed && wp.rotation !== undefined) {
        wp.rotation += wp.rotationSpeed * dt;
      }

      // Embers flickering alpha
      if (wp.shape === 'ember') {
        const flicker = Math.sin(this.gameTime * 12 + wp.seed) * 0.25;
        wp.alpha = Math.max(0.2, Math.min(1.0, wp.baseAlpha + flicker));
      }

      wp.x += currentVx * dt;
      wp.y += currentVy * dt;

      // Wrap around lane boundaries
      if (wp.shape === 'ember' || wp.vy < 0) {
        // Upward floating particles (volcano embers & smoke)
        if (wp.y < -30) {
          wp.y = GROUND_Y + 15 + Math.random() * 20;
          wp.x = Math.random() * (LANE_WIDTH + 200) - 100;
        }
      } else {
        // Downward falling particles (snow & leaves)
        if (wp.y > GROUND_Y + 30) {
          wp.y = -20 - Math.random() * 20;
          wp.x = Math.random() * (LANE_WIDTH + 200) - 100;
        }
      }

      if (wp.x > LANE_WIDTH + 150) {
        wp.x = -100;
        wp.y = Math.random() * GROUND_Y;
      }
      if (wp.x < -150) {
        wp.x = LANE_WIDTH + 100;
        wp.y = Math.random() * GROUND_Y;
      }
    }
  }

  private updateCamera(dt: number) {
    // Determine the center of action (weighted midpoint of units)
    let sumX = 0;
    let count = 0;

    for (const u of this.units) {
      if (u.state !== 'dying') {
        sumX += u.x;
        count++;
      }
    }

    const targetCameraX = count > 0 ? (sumX / count) : LANE_WIDTH / 2;
    // Smooth damp towards target
    this.cameraX += (targetCameraX - this.cameraX) * Math.min(1.0, dt * 2.5);
  }

  public triggerScreenShake(intensity: number) {
    if (!this.progress.screenShake) return;
    this.screenShakeIntensity = Math.max(this.screenShakeIntensity, intensity);
  }

  // --- WIN / LOSE CONDITIONS ---
  private checkGameConditions() {
    if (this.gameOver) return;

    if (this.enemyCastle.hp <= 0) {
      this.gameOver = true;
      this.isVictory = true;
      this.logEvent('Victory achieved!');
      soundEngine.playVictory();

      // Calculate Stars (1 to 3 based on player castle remaining HP)
      const healthRatio = this.playerCastle.hp / this.playerCastle.maxHp;
      let stars = 1;
      if (healthRatio >= 0.75) stars = 3;
      else if (healthRatio >= 0.35) stars = 2;

      this.onGameOverCallback?.(true, stars, this.level.rewardGold);
    } else if (this.playerCastle.hp <= 0) {
      this.gameOver = true;
      this.isVictory = false;
      soundEngine.playDefeat();

      this.onGameOverCallback?.(false, 0, Math.floor(this.level.rewardGold * 0.2));
    }
  }
}

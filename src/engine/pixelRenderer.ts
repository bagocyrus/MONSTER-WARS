import { UnitInstance, CastleState, Projectile, Particle, WeatherParticle, FloatingText, WorldTheme } from '../types/game';
import { LANE_WIDTH, LANE_HEIGHT, GROUND_Y } from '../data/gameData';

export class PixelRenderer {
  // Palettes for procedural pixel art
  private static readonly PALETTES = {
    player: {
      primary: '#2563eb', // royal blue
      secondary: '#60a5fa', // bright blue
      accent: '#fbbf24', // gold
      metal: '#e2e8f0', // steel
      darkMetal: '#475569',
      skin: '#fde047',
      dark: '#0f172a'
    },
    enemy: {
      primary: '#dc2626', // crimson red
      secondary: '#f87171', // bright red
      accent: '#f59e0b', // dark gold
      metal: '#475569', // dark steel
      darkMetal: '#1e293b',
      skin: '#a3e635', // goblin/orc greenish or pale
      dark: '#050505'
    }
  };

  /**
   * Draw the complete frame onto the canvas
   */
  public static render(
    ctx: CanvasRenderingContext2D,
    world: WorldTheme,
    cameraX: number,
    viewportWidth: number,
    viewportHeight: number,
    playerCastle: CastleState,
    enemyCastle: CastleState,
    units: UnitInstance[],
    projectiles: Projectile[],
    particles: Particle[],
    floatingTexts: FloatingText[],
    weatherParticles: WeatherParticle[],
    gameTime: number,
    screenShakeX: number,
    screenShakeY: number,
    lightningFlashAlpha: number,
    selectedUnitId?: string | null
  ) {
    ctx.save();

    // Disable image smoothing for pure pixel perfection
    ctx.imageSmoothingEnabled = false;

    // Apply camera viewport transform
    const scale = Math.min(viewportWidth / 960, viewportHeight / LANE_HEIGHT);
    const renderScale = Math.max(0.6, Math.min(1.8, scale));

    // Clear background
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, viewportWidth, viewportHeight);

    // Apply Screen Shake & Center Camera
    ctx.translate(screenShakeX, screenShakeY);

    // Camera transform: map LANE_WIDTH into the view
    // Center camera horizontally based on cameraX
    const offsetX = viewportWidth / 2 - cameraX * renderScale;
    const offsetY = Math.max(0, (viewportHeight - LANE_HEIGHT * renderScale) / 2);

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(renderScale, renderScale);

    // 1. Draw Parallax Background Layers
    this.drawBackground(ctx, world, cameraX, gameTime);

    // 2. Draw Background Weather Layer (behind castles and units)
    this.drawWeatherLayer(ctx, weatherParticles, 'background', gameTime);

    // 3. Draw Castles
    this.drawCastle(ctx, playerCastle, 'player', world, gameTime);
    this.drawCastle(ctx, enemyCastle, 'enemy', world, gameTime);

    // 3.5. Draw Lane Active Conflict & Enemy Push Highlights
    this.drawLaneConflictHighlights(ctx, units, playerCastle, gameTime);

    // 4. Draw Units (sorted by Y for correct layering)
    const sortedUnits = [...units].sort((a, b) => a.y - b.y);
    for (const unit of sortedUnits) {
      this.drawUnit(ctx, unit, gameTime);
    }

    // 5. Draw Projectiles
    for (const proj of projectiles) {
      this.drawProjectile(ctx, proj, gameTime);
    }

    // 6. Draw Combat Particles & Effects
    for (const p of particles) {
      this.drawParticle(ctx, p);
    }

    // 7. Draw Foreground Weather Layer (in front of units for authentic depth)
    this.drawWeatherLayer(ctx, weatherParticles, 'foreground', gameTime);

    // 8. Draw Atmospheric Biome Ambient Overlay (sand mist, blizzard haze, heat shimmer)
    this.drawAtmosphereOverlay(ctx, world, gameTime);

    // 8.5. Draw Global Day / Night Lighting Filter Transition
    this.drawLightingFilter(ctx, gameTime);

    // 9. Draw Floating Numbers
    for (const ft of floatingTexts) {
      this.drawFloatingText(ctx, ft);
    }

    ctx.restore();

    // 10. Screen Flash Effect (e.g. Lightning Strike or Castle destruction)
    if (lightningFlashAlpha > 0.01) {
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, lightningFlashAlpha)})`;
      ctx.fillRect(0, 0, viewportWidth, viewportHeight);
    }

    ctx.restore();
  }

  // --- BACKGROUND & PARALLAX ---
  private static drawBackground(
    ctx: CanvasRenderingContext2D,
    world: WorldTheme,
    cameraX: number,
    gameTime: number
  ) {
    // Sky gradient
    let skyGradient = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    if (world === 'plains') {
      skyGradient.addColorStop(0, '#38bdf8');
      skyGradient.addColorStop(0.7, '#bae6fd');
      skyGradient.addColorStop(1, '#e0f2fe');
    } else if (world === 'desert') {
      skyGradient.addColorStop(0, '#f97316');
      skyGradient.addColorStop(0.5, '#fb923c');
      skyGradient.addColorStop(1, '#fef08a');
    } else if (world === 'snow') {
      skyGradient.addColorStop(0, '#0284c7');
      skyGradient.addColorStop(0.6, '#7dd3fc');
      skyGradient.addColorStop(1, '#e0f2fe');
    } else {
      // volcano
      skyGradient.addColorStop(0, '#450a0a');
      skyGradient.addColorStop(0.5, '#7f1d1d');
      skyGradient.addColorStop(1, '#dc2626');
    }

    ctx.fillStyle = skyGradient;
    ctx.fillRect(-200, 0, LANE_WIDTH + 400, GROUND_Y + 50);

    // Sun / Moon / Celestial body
    ctx.save();
    if (world === 'plains' || world === 'snow') {
      // Glowing pixel sun
      ctx.fillStyle = '#fef08a';
      this.fillPixelRect(ctx, 300 - cameraX * 0.05, 50, 48, 48);
      ctx.fillStyle = '#fef9c3';
      this.fillPixelRect(ctx, 306 - cameraX * 0.05, 56, 36, 36);
    } else if (world === 'desert') {
      // Blazing desert giant sun
      ctx.fillStyle = '#fde047';
      this.fillPixelRect(ctx, 400 - cameraX * 0.05, 40, 64, 64);
      ctx.fillStyle = '#ffffff';
      this.fillPixelRect(ctx, 410 - cameraX * 0.05, 50, 44, 44);
    } else {
      // Blood moon with ash ring
      ctx.fillStyle = '#991b1b';
      this.fillPixelRect(ctx, 500 - cameraX * 0.05, 45, 54, 54);
      ctx.fillStyle = '#f87171';
      this.fillPixelRect(ctx, 508 - cameraX * 0.05, 53, 38, 38);
    }
    ctx.restore();

    // Far Mountains Layer (Parallax 0.15)
    ctx.fillStyle = world === 'plains' ? '#93c5fd' : world === 'desert' ? '#d97706' : world === 'snow' ? '#64748b' : '#3f1111';
    for (let x = -200; x < LANE_WIDTH + 300; x += 140) {
      const peakHeight = 110 + Math.sin(x * 0.02) * 45;
      const mountainX = x - cameraX * 0.15;
      this.drawPixelTriangle(ctx, mountainX, GROUND_Y - 40, 160, peakHeight);
    }

    // Midground Hills / Dunes / Volcano Crags (Parallax 0.35)
    ctx.fillStyle = world === 'plains' ? '#16a34a' : world === 'desert' ? '#b45309' : world === 'snow' ? '#94a3b8' : '#7f1d1d';
    for (let x = -200; x < LANE_WIDTH + 300; x += 90) {
      const hillHeight = 65 + Math.cos(x * 0.03) * 25;
      const hillX = x - cameraX * 0.35;
      this.drawPixelTriangle(ctx, hillX, GROUND_Y - 20, 110, hillHeight);
    }

    // Ground Base
    let groundTopColor = '#4ade80';
    let groundBaseColor = '#15803d';
    let groundDirtColor = '#78350f';

    if (world === 'desert') {
      groundTopColor = '#fde047';
      groundBaseColor = '#ca8a04';
      groundDirtColor = '#854d0e';
    } else if (world === 'snow') {
      groundTopColor = '#f8fafc';
      groundBaseColor = '#cbd5e1';
      groundDirtColor = '#475569';
    } else if (world === 'volcano') {
      groundTopColor = '#ef4444';
      groundBaseColor = '#991b1b';
      groundDirtColor = '#18181b';
    }

    // Ground top trim
    ctx.fillStyle = groundTopColor;
    ctx.fillRect(-200, GROUND_Y - 12, LANE_WIDTH + 400, 14);

    // Ground main body
    ctx.fillStyle = groundBaseColor;
    ctx.fillRect(-200, GROUND_Y + 2, LANE_WIDTH + 400, 24);

    // Dirt subsurface
    ctx.fillStyle = groundDirtColor;
    ctx.fillRect(-200, GROUND_Y + 26, LANE_WIDTH + 400, LANE_HEIGHT - (GROUND_Y + 26) + 50);

    // Decorative ground pattern / path / cobblestones
    ctx.fillStyle = '#000000';
    ctx.globalAlpha = 0.15;
    for (let gx = -100; gx < LANE_WIDTH + 200; gx += 28) {
      this.fillPixelRect(ctx, gx + (Math.sin(gx) * 6), GROUND_Y + 8 + (gx % 12), 16, 6);
      this.fillPixelRect(ctx, gx + 10, GROUND_Y + 34 + (gx % 18), 12, 5);
    }
    ctx.globalAlpha = 1.0;

    // Road track in the center of the lane
    ctx.fillStyle = world === 'snow' ? '#94a3b8' : world === 'volcano' ? '#450a0a' : '#92400e';
    ctx.globalAlpha = 0.25;
    ctx.fillRect(-200, GROUND_Y - 4, LANE_WIDTH + 400, 8);
    ctx.globalAlpha = 1.0;
  }

  // --- CASTLE RENDERING ---
  private static drawCastle(
    ctx: CanvasRenderingContext2D,
    castle: CastleState,
    team: 'player' | 'enemy',
    world: WorldTheme,
    gameTime: number
  ) {
    ctx.save();
    const cx = castle.x;
    const cy = GROUND_Y - 160;

    // Castle colors
    const isPlayer = team === 'player';
    const stoneColor = isPlayer ? '#475569' : world === 'volcano' ? '#18181b' : '#334155';
    const darkStone = isPlayer ? '#1e293b' : '#09090b';
    const lightStone = isPlayer ? '#64748b' : '#475569';
    const bannerColor = isPlayer ? '#2563eb' : '#dc2626';
    const bannerGold = '#fbbf24';

    // Flash white on hit
    if (castle.hitFlashTimer > 0) {
      ctx.filter = 'brightness(2.2)';
    }

    // Main Keep Body
    ctx.fillStyle = stoneColor;
    this.fillPixelRect(ctx, cx, cy + 30, 110, 130);

    // Brick texture details
    ctx.fillStyle = lightStone;
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 4; col++) {
        const bx = cx + 12 + col * 24 + (row % 2) * 12;
        const by = cy + 40 + row * 18;
        this.fillPixelRect(ctx, bx, by, 16, 4);
      }
    }

    // Castle Towers (Left & Right)
    ctx.fillStyle = darkStone;
    this.fillPixelRect(ctx, cx - 15, cy, 35, 160);
    this.fillPixelRect(ctx, cx + 90, cy, 35, 160);

    // Tower battlements / crenellations
    ctx.fillStyle = stoneColor;
    this.fillPixelRect(ctx, cx - 18, cy - 12, 10, 14);
    this.fillPixelRect(ctx, cx - 4, cy - 12, 10, 14);
    this.fillPixelRect(ctx, cx + 10, cy - 12, 10, 14);

    this.fillPixelRect(ctx, cx + 88, cy - 12, 10, 14);
    this.fillPixelRect(ctx, cx + 102, cy - 12, 10, 14);
    this.fillPixelRect(ctx, cx + 116, cy - 12, 10, 14);

    // Central Tower Roof / Crown
    ctx.fillStyle = stoneColor;
    this.fillPixelRect(ctx, cx + 25, cy + 10, 60, 20);
    this.fillPixelRect(ctx, cx + 20, cy - 2, 70, 12);
    // Crenellations center
    this.fillPixelRect(ctx, cx + 22, cy - 14, 12, 12);
    this.fillPixelRect(ctx, cx + 49, cy - 14, 12, 12);
    this.fillPixelRect(ctx, cx + 76, cy - 14, 12, 12);

    // Giant Gate archway
    const gateX = isPlayer ? cx + 60 : cx + 10;
    ctx.fillStyle = '#0f172a';
    this.fillPixelRect(ctx, gateX, cy + 90, 40, 70);
    // Portcullis iron bars
    ctx.fillStyle = '#94a3b8';
    for (let bar = 0; bar < 5; bar++) {
      this.fillPixelRect(ctx, gateX + 6 + bar * 7, cy + 92, 2, 66);
    }
    this.fillPixelRect(ctx, gateX + 2, cy + 110, 36, 3);
    this.fillPixelRect(ctx, gateX + 2, cy + 130, 36, 3);

    // Royal / Warlord Banners (animated wave)
    const waveOffset = Math.sin(gameTime * 4 + (isPlayer ? 0 : 2)) * 3;
    ctx.fillStyle = bannerColor;
    this.fillPixelRect(ctx, cx + 45, cy + 28, 20, 42 + waveOffset);
    ctx.fillStyle = bannerGold;
    this.fillPixelRect(ctx, cx + 51, cy + 38, 8, 8); // Crest icon

    // Tower flags
    ctx.fillStyle = '#cbd5e1'; // Pole
    this.fillPixelRect(ctx, cx + 1, cy - 30, 3, 20);
    this.fillPixelRect(ctx, cx + 107, cy - 30, 3, 20);
    ctx.fillStyle = bannerColor;
    this.fillPixelRect(ctx, cx + 4, cy - 30, 14 + waveOffset, 10);
    this.fillPixelRect(ctx, cx + 110, cy - 30, 14 + waveOffset, 10);

    // Damage Visual States
    const hpRatio = castle.hp / castle.maxHp;

    if (hpRatio < 0.7) {
      // Cracked State
      ctx.fillStyle = '#09090b';
      this.drawCrack(ctx, cx + 30, cy + 50, 35, 45);
      this.drawCrack(ctx, cx + 75, cy + 70, 25, 35);
    }

    if (hpRatio < 0.4) {
      // Burning State (fire particles & smoke)
      const fireAnim = Math.floor((gameTime * 12) % 3);
      ctx.fillStyle = '#f97316';
      this.fillPixelRect(ctx, cx + 20, cy + 30 - fireAnim * 2, 14, 18 + fireAnim * 2);
      this.fillPixelRect(ctx, cx + 75, cy + 20 - fireAnim * 3, 16, 20 + fireAnim * 2);
      ctx.fillStyle = '#fbbf24';
      this.fillPixelRect(ctx, cx + 23, cy + 34, 8, 12);
      this.fillPixelRect(ctx, cx + 78, cy + 25, 10, 14);

      // Dark smoke plumes
      ctx.fillStyle = 'rgba(50, 50, 50, 0.6)';
      this.fillPixelRect(ctx, cx + 22, cy + 10 - fireAnim * 4, 12, 14);
      this.fillPixelRect(ctx, cx + 78, cy - 2 - fireAnim * 4, 16, 18);
    }

    if (hpRatio < 0.15) {
      // Crumbling & Heavy Ruins
      ctx.fillStyle = '#09090b';
      this.fillPixelRect(ctx, cx - 10, cy + 10, 20, 25);
      this.fillPixelRect(ctx, cx + 95, cy + 15, 20, 30);
    }

    // Mini Castle Floating Health Bar above fortress
    const barWidth = 100;
    const barHeight = 8;
    const barX = cx + 5;
    const barY = cy - 42;

    ctx.fillStyle = '#000000';
    this.fillPixelRect(ctx, barX - 2, barY - 2, barWidth + 4, barHeight + 4);

    ctx.fillStyle = '#334155';
    this.fillPixelRect(ctx, barX, barY, barWidth, barHeight);

    const fillW = Math.max(0, barWidth * hpRatio);
    ctx.fillStyle = hpRatio > 0.5 ? '#22c55e' : hpRatio > 0.25 ? '#eab308' : '#ef4444';
    this.fillPixelRect(ctx, barX, barY, fillW, barHeight);

    ctx.restore();
  }

  // --- UNIT SPRITE RENDERING ---
  private static drawUnit(ctx: CanvasRenderingContext2D, unit: UnitInstance, gameTime: number) {
    ctx.save();

    const isPlayer = unit.team === 'player';
    const palette = isPlayer ? PixelRenderer.PALETTES.player : PixelRenderer.PALETTES.enemy;

    // Unit positioning on lane
    const ux = unit.x;
    const uy = GROUND_Y + unit.y;

    // Hit flash effect
    if (unit.hitFlashTimer > 0) {
      ctx.filter = 'brightness(2.5)';
    }

    // Rally boost aura
    if (unit.rallyBuffTimer > 0) {
      ctx.fillStyle = 'rgba(251, 191, 36, 0.35)';
      const pulse = Math.sin(gameTime * 10) * 3;
      ctx.beginPath();
      ctx.ellipse(ux, uy + 2, 16 + pulse, 6, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ground contact shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    const shadowRadius = unit.isBoss ? 26 : unit.type === 'giant' ? 22 : unit.type === 'knight' ? 16 : 10;
    ctx.ellipse(ux, uy + 2, shadowRadius, shadowRadius * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Veteran Rank Golden Aura Ring
    if (unit.isVeteran) {
      const vetPulse = Math.sin(gameTime * 8) * 2;
      ctx.fillStyle = `rgba(250, 204, 21, ${0.4 + Math.sin(gameTime * 6) * 0.15})`;
      ctx.beginPath();
      ctx.ellipse(ux, uy + 2, shadowRadius + 8 + vetPulse, (shadowRadius + 8 + vetPulse) * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Determine frame & animation
    const animFrame = unit.frame;
    const facing = isPlayer ? 1 : -1; // 1 = right, -1 = left

    ctx.translate(ux, uy);
    ctx.scale(facing * (unit.isVeteran ? 1.15 : 1.0), unit.isVeteran ? 1.15 : 1.0);

    // If unit is in dying state, trigger the dedicated 4-frame death animation sequence
    if (unit.state === 'dying') {
      this.renderDeathSequence(ctx, unit, palette, animFrame, gameTime);
      ctx.restore();
      return;
    }

    // Render Unit by Type
    switch (unit.type) {
      case 'swordsman':
        this.renderSwordsman(ctx, unit, palette, animFrame);
        break;
      case 'archer':
        this.renderArcher(ctx, unit, palette, animFrame);
        break;
      case 'knight':
        this.renderKnight(ctx, unit, palette, animFrame);
        break;
      case 'mage':
        this.renderMage(ctx, unit, palette, animFrame);
        break;
      case 'catapult':
        this.renderCatapult(ctx, unit, palette, animFrame);
        break;
      case 'giant':
        this.renderGiant(ctx, unit, palette, animFrame);
        break;
      case 'paladin':
        this.renderPaladin(ctx, unit, palette, animFrame, gameTime);
        break;
      case 'dragon':
        this.renderDragon(ctx, unit, palette, animFrame, gameTime);
        break;
      case 'boss':
        this.renderBoss(ctx, unit, palette, animFrame);
        break;
    }

    ctx.restore();

    // Draw Unit Health Bar (only if wounded and alive)
    if (unit.hp < unit.maxHp || unit.isBoss || unit.isVeteran) {
      this.drawUnitHealthBar(ctx, unit, ux, uy);
    }

    // Draw Veteran Crown Badge above unit head
    if (unit.isVeteran) {
      ctx.save();
      ctx.font = 'bold 8px "Press Start 2P", monospace';
      ctx.fillStyle = '#000000';
      const badgeY = uy - (unit.isBoss ? 75 : unit.size === 'huge' ? 62 : 42);
      ctx.fillText('⭐ VET', ux - 15, badgeY + 1);
      ctx.fillStyle = '#facc15';
      ctx.fillText('⭐ VET', ux - 16, badgeY);
      ctx.restore();
    }
  }

  // --- SPECIFIC SPRITE GENERATORS (Authentic Pixel Grid) ---

  private static renderSwordsman(ctx: CanvasRenderingContext2D, unit: UnitInstance, pal: typeof PixelRenderer.PALETTES.player, frame: number) {
    const isAttacking = unit.state === 'attacking';

    const walkOffset = unit.state === 'walking' ? (frame % 2 === 0 ? 0 : -2) : 0;
    const legOffset = unit.state === 'walking' ? (frame % 2 === 0 ? 2 : -2) : 0;

    // Feet / Boots
    ctx.fillStyle = pal.darkMetal;
    this.fillPixelRect(ctx, -5 + legOffset, -4, 4, 4);
    this.fillPixelRect(ctx, 2 - legOffset, -4, 4, 4);

    // Legs / Pants
    ctx.fillStyle = pal.primary;
    this.fillPixelRect(ctx, -4, -8 + walkOffset, 9, 5);

    // Torso / Tunics / Armor
    ctx.fillStyle = pal.metal;
    this.fillPixelRect(ctx, -5, -18 + walkOffset, 11, 10);
    // Gold crest trim
    ctx.fillStyle = pal.accent;
    this.fillPixelRect(ctx, -2, -15 + walkOffset, 5, 4);

    // Head / Helmet
    ctx.fillStyle = pal.skin;
    this.fillPixelRect(ctx, -3, -24 + walkOffset, 8, 6);
    // Iron Cap
    ctx.fillStyle = pal.metal;
    this.fillPixelRect(ctx, -5, -27 + walkOffset, 11, 4);
    ctx.fillStyle = pal.accent;
    this.fillPixelRect(ctx, -1, -30 + walkOffset, 3, 4); // Feather plume

    // Eyes
    ctx.fillStyle = pal.dark;
    this.fillPixelRect(ctx, 2, -22 + walkOffset, 2, 2);

    // Sword Arm & Sword
    if (isAttacking) {
      const attackPhase = frame % 3;
      if (attackPhase === 0) {
        // Wind-up backwards
        ctx.fillStyle = pal.metal;
        this.fillPixelRect(ctx, -12, -20, 4, 16); // Blade angled back
        ctx.fillStyle = pal.accent;
        this.fillPixelRect(ctx, -10, -12, 6, 2); // Crossguard
      } else if (attackPhase === 1) {
        // Full Forward Slash!
        ctx.fillStyle = pal.metal;
        this.fillPixelRect(ctx, 6, -16, 16, 4); // Forward blade
        ctx.fillStyle = '#ffffff';
        this.fillPixelRect(ctx, 16, -15, 6, 2); // Sharp edge glint
        ctx.fillStyle = pal.accent;
        this.fillPixelRect(ctx, 6, -18, 2, 8); // Crossguard
        // Slash Trail Arc
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.fillPixelRect(ctx, 12, -24, 10, 3);
        this.fillPixelRect(ctx, 20, -12, 3, 10);
      } else {
        // Recovery
        ctx.fillStyle = pal.metal;
        this.fillPixelRect(ctx, 6, -8, 12, 4);
        ctx.fillStyle = pal.accent;
        this.fillPixelRect(ctx, 6, -10, 2, 8);
      }
    } else {
      // Idle / Walking blade at side
      ctx.fillStyle = pal.metal;
      this.fillPixelRect(ctx, 5, -14 + walkOffset, 3, 14);
      ctx.fillStyle = pal.accent;
      this.fillPixelRect(ctx, 3, -12 + walkOffset, 7, 2);
    }

    // Small Buckler Shield on back hand
    ctx.fillStyle = pal.primary;
    this.fillPixelRect(ctx, -7, -16 + walkOffset, 4, 8);
    ctx.fillStyle = pal.accent;
    this.fillPixelRect(ctx, -8, -14 + walkOffset, 2, 4);
  }

  private static renderArcher(ctx: CanvasRenderingContext2D, unit: UnitInstance, pal: typeof PixelRenderer.PALETTES.player, frame: number) {
    const walkOffset = unit.state === 'walking' ? (frame % 2 === 0 ? 0 : -2) : 0;
    const legOffset = unit.state === 'walking' ? (frame % 2 === 0 ? 2 : -2) : 0;
    const isAttacking = unit.state === 'attacking';

    // Boots
    ctx.fillStyle = '#78350f';
    this.fillPixelRect(ctx, -4 + legOffset, -4, 3, 4);
    this.fillPixelRect(ctx, 2 - legOffset, -4, 3, 4);

    // Legs / Tunic
    ctx.fillStyle = pal.primary;
    this.fillPixelRect(ctx, -4, -8 + walkOffset, 8, 5);

    // Body / Leather Vest
    ctx.fillStyle = '#92400e';
    this.fillPixelRect(ctx, -4, -17 + walkOffset, 9, 9);

    // Quiver on back with arrows
    ctx.fillStyle = '#78350f';
    this.fillPixelRect(ctx, -7, -19 + walkOffset, 3, 11);
    ctx.fillStyle = '#f8fafc'; // arrow fletching
    this.fillPixelRect(ctx, -8, -22 + walkOffset, 3, 3);

    // Head / Hood
    ctx.fillStyle = pal.primary;
    this.fillPixelRect(ctx, -4, -25 + walkOffset, 9, 8);
    ctx.fillStyle = pal.skin;
    this.fillPixelRect(ctx, 0, -23 + walkOffset, 5, 5);
    ctx.fillStyle = pal.dark;
    this.fillPixelRect(ctx, 2, -22 + walkOffset, 2, 2); // Eye

    // Wooden Bow
    const bowX = isAttacking ? 6 : 4;
    ctx.fillStyle = '#713f12';
    // Curved bow stave
    this.fillPixelRect(ctx, bowX, -24 + walkOffset, 2, 3);
    this.fillPixelRect(ctx, bowX + 2, -21 + walkOffset, 2, 10);
    this.fillPixelRect(ctx, bowX, -11 + walkOffset, 2, 3);

    // Bowstring & Arrow
    ctx.fillStyle = '#cbd5e1';
    if (isAttacking) {
      const drawPhase = frame % 3;
      if (drawPhase === 0) {
        // Drawing bow back
        this.fillPixelRect(ctx, bowX - 3, -16 + walkOffset, 1, 12);
        // Arrow nocked
        ctx.fillStyle = '#f8fafc';
        this.fillPixelRect(ctx, -2, -17 + walkOffset, 10, 2);
        ctx.fillStyle = '#0f172a'; // Tip
        this.fillPixelRect(ctx, 8, -17 + walkOffset, 2, 2);
      } else {
        // String released
        this.fillPixelRect(ctx, bowX + 1, -16 + walkOffset, 1, 12);
      }
    } else {
      this.fillPixelRect(ctx, bowX, -16 + walkOffset, 1, 10);
    }
  }

  private static renderKnight(ctx: CanvasRenderingContext2D, unit: UnitInstance, pal: typeof PixelRenderer.PALETTES.player, frame: number) {
    const walkOffset = unit.state === 'walking' ? (frame % 2 === 0 ? 0 : -2) : 0;
    const isAttacking = unit.state === 'attacking';

    // Heavy Sabatons
    ctx.fillStyle = pal.darkMetal;
    this.fillPixelRect(ctx, -7, -5, 6, 5);
    this.fillPixelRect(ctx, 2, -5, 6, 5);

    // Armored Greaves & Plate
    ctx.fillStyle = pal.metal;
    this.fillPixelRect(ctx, -6, -12 + walkOffset, 13, 8);

    // Heavy Breastplate
    ctx.fillStyle = pal.metal;
    this.fillPixelRect(ctx, -8, -25 + walkOffset, 16, 14);
    ctx.fillStyle = pal.accent; // Golden lion crest
    this.fillPixelRect(ctx, -3, -22 + walkOffset, 7, 7);

    // Great Helm with Visor
    ctx.fillStyle = pal.metal;
    this.fillPixelRect(ctx, -6, -34 + walkOffset, 13, 10);
    ctx.fillStyle = pal.dark; // Visor slit
    this.fillPixelRect(ctx, -1, -29 + walkOffset, 8, 2);
    // Plume
    ctx.fillStyle = pal.primary;
    this.fillPixelRect(ctx, -8, -39 + walkOffset, 6, 6);
    this.fillPixelRect(ctx, -4, -40 + walkOffset, 5, 4);

    // Tower Shield (Massive Frontal Defense)
    ctx.fillStyle = pal.primary;
    this.fillPixelRect(ctx, 4, -26 + walkOffset, 8, 24);
    ctx.fillStyle = pal.accent;
    this.fillPixelRect(ctx, 5, -24 + walkOffset, 6, 20);
    ctx.fillStyle = pal.metal;
    this.fillPixelRect(ctx, 6, -18 + walkOffset, 4, 8);

    // Broadsword
    if (isAttacking) {
      const p = frame % 3;
      ctx.fillStyle = pal.metal;
      if (p === 1) {
        // Heavy thrust
        this.fillPixelRect(ctx, 12, -22, 18, 5);
        ctx.fillStyle = '#ffffff';
        this.fillPixelRect(ctx, 26, -21, 5, 3);
      } else {
        this.fillPixelRect(ctx, -12, -30, 6, 20);
      }
    } else {
      ctx.fillStyle = pal.metal;
      this.fillPixelRect(ctx, -10, -22 + walkOffset, 4, 18);
    }
  }

  private static renderMage(ctx: CanvasRenderingContext2D, unit: UnitInstance, pal: typeof PixelRenderer.PALETTES.player, frame: number) {
    const hoverOffset = Math.sin(frame * 1.5) * 2;
    const isAttacking = unit.state === 'attacking';

    // Flowing Robes
    ctx.fillStyle = pal.primary;
    this.fillPixelRect(ctx, -6, -12 + hoverOffset, 12, 12);
    ctx.fillStyle = pal.accent; // Golden Runes
    this.fillPixelRect(ctx, -4, -8 + hoverOffset, 8, 2);

    // Upper Robe
    ctx.fillStyle = pal.primary;
    this.fillPixelRect(ctx, -5, -22 + hoverOffset, 10, 11);

    // Wizard Hood
    ctx.fillStyle = pal.primary;
    this.fillPixelRect(ctx, -5, -31 + hoverOffset, 11, 10);
    ctx.fillStyle = pal.dark; // Shadowed face
    this.fillPixelRect(ctx, -2, -28 + hoverOffset, 8, 6);
    // Glowing Arcane Eyes
    ctx.fillStyle = '#38bdf8';
    this.fillPixelRect(ctx, 1, -27 + hoverOffset, 2, 2);
    this.fillPixelRect(ctx, 4, -27 + hoverOffset, 2, 2);

    // Staff
    ctx.fillStyle = '#78350f';
    this.fillPixelRect(ctx, 7, -30 + hoverOffset, 3, 30);
    // Glowing Crystal Orb on Staff
    const crystalColor = isAttacking ? '#f43f5e' : '#38bdf8';
    ctx.fillStyle = crystalColor;
    this.fillPixelRect(ctx, 5, -36 + hoverOffset, 7, 7);
    ctx.fillStyle = '#ffffff';
    this.fillPixelRect(ctx, 7, -34 + hoverOffset, 3, 3);

    // Magic Casting Energy Swirl
    if (isAttacking) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.8)';
      this.fillPixelRect(ctx, 14, -38 + hoverOffset, 8, 8);
      ctx.fillStyle = '#ffffff';
      this.fillPixelRect(ctx, 16, -36 + hoverOffset, 4, 4);
    }
  }

  private static renderCatapult(ctx: CanvasRenderingContext2D, unit: UnitInstance, pal: typeof PixelRenderer.PALETTES.player, frame: number) {
    const isAttacking = unit.state === 'attacking';

    // Wheels (Front & Back)
    ctx.fillStyle = '#451a03';
    this.fillPixelRect(ctx, -18, -10, 10, 10);
    this.fillPixelRect(ctx, 8, -10, 10, 10);
    ctx.fillStyle = pal.metal;
    this.fillPixelRect(ctx, -15, -7, 4, 4);
    this.fillPixelRect(ctx, 11, -7, 4, 4);

    // Wooden Chassis
    ctx.fillStyle = '#78350f';
    this.fillPixelRect(ctx, -20, -18, 38, 9);
    ctx.fillStyle = pal.primary;
    this.fillPixelRect(ctx, -12, -16, 22, 5); // Team color plate

    // Cross Support A-frame
    ctx.fillStyle = '#92400e';
    this.fillPixelRect(ctx, -4, -28, 6, 12);

    // Catapult Arm & Cup
    if (isAttacking) {
      const p = frame % 3;
      if (p === 0) {
        // Tension pulled back
        ctx.fillStyle = '#451a03';
        this.fillPixelRect(ctx, -22, -16, 18, 4);
        // Loaded boulder
        ctx.fillStyle = '#64748b';
        this.fillPixelRect(ctx, -24, -20, 8, 8);
      } else {
        // Fired forward!
        ctx.fillStyle = '#451a03';
        this.fillPixelRect(ctx, 4, -36, 6, 20);
        ctx.fillStyle = '#78350f';
        this.fillPixelRect(ctx, 2, -40, 10, 6);
      }
    } else {
      // Idle / Resting arm
      ctx.fillStyle = '#451a03';
      this.fillPixelRect(ctx, -14, -24, 18, 5);
      ctx.fillStyle = '#64748b'; // boulder loaded
      this.fillPixelRect(ctx, -18, -28, 8, 8);
    }
  }

  private static renderGiant(ctx: CanvasRenderingContext2D, unit: UnitInstance, pal: typeof PixelRenderer.PALETTES.player, frame: number) {
    const walkOffset = unit.state === 'walking' ? (frame % 2 === 0 ? 0 : -3) : 0;
    const isAttacking = unit.state === 'attacking';

    // Massive Tree-Trunk Legs
    ctx.fillStyle = pal.darkMetal;
    this.fillPixelRect(ctx, -14, -10, 10, 10);
    this.fillPixelRect(ctx, 4, -10, 10, 10);

    // Loincloth / Armor Tassets
    ctx.fillStyle = pal.primary;
    this.fillPixelRect(ctx, -14, -22 + walkOffset, 28, 14);
    ctx.fillStyle = pal.accent;
    this.fillPixelRect(ctx, -4, -18 + walkOffset, 8, 8);

    // Muscular Torso
    ctx.fillStyle = pal.skin;
    this.fillPixelRect(ctx, -18, -46 + walkOffset, 36, 26);
    // Iron Spaulder Pauldrons
    ctx.fillStyle = pal.metal;
    this.fillPixelRect(ctx, -22, -48 + walkOffset, 10, 12);
    this.fillPixelRect(ctx, 12, -48 + walkOffset, 10, 12);

    // Head
    ctx.fillStyle = pal.skin;
    this.fillPixelRect(ctx, -8, -58 + walkOffset, 16, 14);
    ctx.fillStyle = pal.dark;
    this.fillPixelRect(ctx, 2, -52 + walkOffset, 4, 3); // Eye
    // Iron Brow / Horned Helm
    ctx.fillStyle = pal.metal;
    this.fillPixelRect(ctx, -10, -62 + walkOffset, 20, 6);
    ctx.fillStyle = '#f8fafc'; // Horn
    this.fillPixelRect(ctx, 8, -68 + walkOffset, 4, 8);

    // Colossal Spiked Club
    if (isAttacking) {
      const p = frame % 3;
      if (p === 0) {
        // Overhead Windup
        ctx.fillStyle = '#451a03';
        this.fillPixelRect(ctx, -18, -75, 12, 35);
        ctx.fillStyle = pal.metal; // Spikes
        this.fillPixelRect(ctx, -22, -72, 20, 14);
      } else {
        // Ground Slam Smash!
        ctx.fillStyle = '#451a03';
        this.fillPixelRect(ctx, 14, -20, 32, 14);
        ctx.fillStyle = pal.metal;
        this.fillPixelRect(ctx, 36, -24, 14, 22);
        // Ground Shockwave
        ctx.fillStyle = '#ffffff';
        this.fillPixelRect(ctx, 28, -2, 26, 4);
      }
    } else {
      // Resting club on shoulder
      ctx.fillStyle = '#451a03';
      this.fillPixelRect(ctx, -26, -55 + walkOffset, 12, 35);
      ctx.fillStyle = pal.metal;
      this.fillPixelRect(ctx, -28, -58 + walkOffset, 16, 16);
    }
  }

  private static renderBoss(ctx: CanvasRenderingContext2D, unit: UnitInstance, pal: typeof PixelRenderer.PALETTES.enemy, frame: number) {
    const walkOffset = unit.state === 'walking' ? (frame % 2 === 0 ? 0 : -3) : 0;
    const isAttacking = unit.state === 'attacking';

    // Boss Aura
    ctx.fillStyle = 'rgba(220, 38, 38, 0.25)';
    ctx.beginPath();
    ctx.arc(0, -35, 45, 0, Math.PI * 2);
    ctx.fill();

    // Dark Colossus Base Body
    ctx.fillStyle = '#18181b';
    this.fillPixelRect(ctx, -20, -12, 14, 12);
    this.fillPixelRect(ctx, 6, -12, 14, 12);

    // Torso / Plate
    ctx.fillStyle = '#7f1d1d';
    this.fillPixelRect(ctx, -24, -55 + walkOffset, 48, 44);
    ctx.fillStyle = '#dc2626';
    this.fillPixelRect(ctx, -16, -45 + walkOffset, 32, 24);

    // Spiked Pauldrons
    ctx.fillStyle = '#09090b';
    this.fillPixelRect(ctx, -32, -60 + walkOffset, 16, 18);
    this.fillPixelRect(ctx, 16, -60 + walkOffset, 16, 18);
    ctx.fillStyle = '#fbbf24';
    this.fillPixelRect(ctx, -30, -68 + walkOffset, 6, 10);
    this.fillPixelRect(ctx, 24, -68 + walkOffset, 6, 10);

    // Demonic Boss Head / Crown
    ctx.fillStyle = '#09090b';
    this.fillPixelRect(ctx, -12, -74 + walkOffset, 24, 20);
    // Glowing Crimson Eyes
    ctx.fillStyle = '#ef4444';
    this.fillPixelRect(ctx, 2, -66 + walkOffset, 6, 4);

    // Dragon / Demon Horns
    ctx.fillStyle = '#f59e0b';
    this.fillPixelRect(ctx, -14, -84 + walkOffset, 6, 12);
    this.fillPixelRect(ctx, 10, -84 + walkOffset, 6, 12);

    // Giant Infernal Halberd / Weapon
    if (isAttacking) {
      ctx.fillStyle = '#ef4444';
      this.fillPixelRect(ctx, 20, -45, 45, 12);
      ctx.fillStyle = '#ffffff';
      this.fillPixelRect(ctx, 45, -43, 18, 8);
    } else {
      ctx.fillStyle = '#450a0a';
      this.fillPixelRect(ctx, 18, -80 + walkOffset, 8, 80);
      ctx.fillStyle = '#ef4444';
      this.fillPixelRect(ctx, 14, -90 + walkOffset, 24, 20);
    }
  }

  private static renderPaladin(
    ctx: CanvasRenderingContext2D,
    unit: UnitInstance,
    pal: typeof PixelRenderer.PALETTES.player,
    frame: number,
    gameTime: number
  ) {
    const walkOffset = unit.state === 'walking' ? (frame % 2 === 0 ? 0 : -2) : 0;
    const isAttacking = unit.state === 'attacking';

    // Radiant Holy Aura Pulse
    ctx.fillStyle = 'rgba(253, 224, 71, 0.2)';
    ctx.beginPath();
    ctx.arc(0, -22, 28 + Math.sin(gameTime * 6) * 3, 0, Math.PI * 2);
    ctx.fill();

    // Greaves
    ctx.fillStyle = '#d97706';
    this.fillPixelRect(ctx, -6, -6, 5, 6);
    this.fillPixelRect(ctx, 2, -6, 5, 6);

    // Armor Leggings
    ctx.fillStyle = '#fbbf24';
    this.fillPixelRect(ctx, -6, -14 + walkOffset, 14, 9);

    // Golden Torso Plate with White Tabard
    ctx.fillStyle = '#f8fafc';
    this.fillPixelRect(ctx, -7, -26 + walkOffset, 15, 13);
    ctx.fillStyle = '#fbbf24'; // Gold Cross
    this.fillPixelRect(ctx, -2, -24 + walkOffset, 4, 10);
    this.fillPixelRect(ctx, -5, -21 + walkOffset, 10, 4);

    // Winged Golden Helm
    ctx.fillStyle = '#fbbf24';
    this.fillPixelRect(ctx, -6, -36 + walkOffset, 13, 10);
    ctx.fillStyle = '#ffffff'; // Wings on helm
    this.fillPixelRect(ctx, -9, -40 + walkOffset, 4, 7);
    this.fillPixelRect(ctx, 6, -40 + walkOffset, 4, 7);
    // Glowing visor
    ctx.fillStyle = '#38bdf8';
    this.fillPixelRect(ctx, 0, -32 + walkOffset, 6, 2);

    // Golden Holy Cross Shield
    ctx.fillStyle = '#fbbf24';
    this.fillPixelRect(ctx, 4, -28 + walkOffset, 8, 22);
    ctx.fillStyle = '#f8fafc';
    this.fillPixelRect(ctx, 5, -26 + walkOffset, 6, 18);
    ctx.fillStyle = '#3b82f6';
    this.fillPixelRect(ctx, 7, -23 + walkOffset, 2, 12);
    this.fillPixelRect(ctx, 5, -18 + walkOffset, 6, 2);

    // Radiant Sunblade
    if (isAttacking) {
      ctx.fillStyle = '#fde047';
      this.fillPixelRect(ctx, 12, -26, 20, 5);
      ctx.fillStyle = '#ffffff';
      this.fillPixelRect(ctx, 26, -25, 6, 3);
    } else {
      ctx.fillStyle = '#fde047';
      this.fillPixelRect(ctx, -10, -32 + walkOffset, 4, 22);
      ctx.fillStyle = '#ffffff';
      this.fillPixelRect(ctx, -9, -30 + walkOffset, 2, 18);
    }
  }

  private static renderDragon(
    ctx: CanvasRenderingContext2D,
    unit: UnitInstance,
    pal: typeof PixelRenderer.PALETTES.player,
    frame: number,
    gameTime: number
  ) {
    // Flying / Hovering Y displacement
    const hoverY = -24 + Math.sin(gameTime * 5) * 6;
    const wingFlap = Math.floor((gameTime * 8) % 3);
    const isAttacking = unit.state === 'attacking';

    // Tail
    ctx.fillStyle = unit.team === 'player' ? '#2563eb' : '#dc2626';
    this.fillPixelRect(ctx, -32, -8 + hoverY, 14, 6);
    this.fillPixelRect(ctx, -40, -4 + hoverY, 10, 5);

    // Dragon Body
    ctx.fillStyle = unit.team === 'player' ? '#1d4ed8' : '#b91c1c';
    this.fillPixelRect(ctx, -20, -18 + hoverY, 32, 20);
    // Underbelly scales
    ctx.fillStyle = '#f59e0b';
    this.fillPixelRect(ctx, -14, -8 + hoverY, 22, 9);

    // Animated Large Dragon Wings
    ctx.fillStyle = unit.team === 'player' ? '#60a5fa' : '#ef4444';
    if (wingFlap === 0) {
      // Wings high
      this.fillPixelRect(ctx, -16, -42 + hoverY, 26, 24);
      this.fillPixelRect(ctx, -8, -48 + hoverY, 16, 10);
    } else if (wingFlap === 1) {
      // Wings middle
      this.fillPixelRect(ctx, -18, -32 + hoverY, 28, 16);
    } else {
      // Wings down
      this.fillPixelRect(ctx, -16, -14 + hoverY, 26, 18);
    }

    // Dragon Head & Neck
    ctx.fillStyle = unit.team === 'player' ? '#1d4ed8' : '#b91c1c';
    this.fillPixelRect(ctx, 10, -26 + hoverY, 16, 14);
    this.fillPixelRect(ctx, 22, -22 + hoverY, 14, 10); // Snout
    // Horns
    ctx.fillStyle = '#fbbf24';
    this.fillPixelRect(ctx, 12, -34 + hoverY, 4, 9);
    this.fillPixelRect(ctx, 16, -32 + hoverY, 4, 7);
    // Glowing eye
    ctx.fillStyle = '#fef08a';
    this.fillPixelRect(ctx, 20, -24 + hoverY, 3, 3);

    // Fire breath when attacking
    if (isAttacking) {
      ctx.fillStyle = '#f97316';
      this.fillPixelRect(ctx, 36, -24 + hoverY, 24, 12);
      ctx.fillStyle = '#fef08a';
      this.fillPixelRect(ctx, 42, -22 + hoverY, 16, 8);
    }
  }

  // --- HEALTH BAR RENDERING ---
  private static drawUnitHealthBar(ctx: CanvasRenderingContext2D, unit: UnitInstance, ux: number, uy: number) {
    const isBoss = unit.isBoss;
    const barWidth = isBoss ? 50 : unit.size === 'huge' ? 36 : unit.size === 'large' ? 26 : 18;
    const barHeight = isBoss ? 6 : 4;
    const barY = uy - (isBoss ? 88 : unit.size === 'huge' ? 70 : unit.size === 'large' ? 52 : 36);
    const barX = ux - barWidth / 2;

    const hpRatio = Math.max(0, unit.hp / unit.maxHp);

    ctx.fillStyle = '#000000';
    this.fillPixelRect(ctx, barX - 1, barY - 1, barWidth + 2, barHeight + 2);

    ctx.fillStyle = '#334155';
    this.fillPixelRect(ctx, barX, barY, barWidth, barHeight);

    const fillW = Math.max(0, barWidth * hpRatio);
    ctx.fillStyle = unit.team === 'player' ? '#3b82f6' : '#ef4444';
    this.fillPixelRect(ctx, barX, barY, fillW, barHeight);
  }

  // --- PROJECTILE RENDERING ---
  private static drawProjectile(ctx: CanvasRenderingContext2D, proj: Projectile, gameTime: number) {
    ctx.save();
    const px = proj.currentX;
    const py = proj.currentY;

    if (proj.type === 'arrow') {
      // Calculate angle along ballistic trajectory
      const dx = proj.targetX - proj.startX;
      const dy = proj.targetY - proj.startY;
      const angle = Math.atan2(dy, dx) + (proj.progress - 0.5) * 0.5;

      ctx.translate(px, py);
      ctx.rotate(angle);

      // Arrow shaft
      ctx.fillStyle = '#78350f';
      this.fillPixelRect(ctx, -8, -1, 14, 2);
      // Arrowhead
      ctx.fillStyle = '#e2e8f0';
      this.fillPixelRect(ctx, 6, -2, 4, 4);
      // Fletching
      ctx.fillStyle = proj.team === 'player' ? '#60a5fa' : '#f87171';
      this.fillPixelRect(ctx, -8, -3, 3, 6);
    } else if (proj.type === 'magic' || proj.type === 'fireball') {
      const isFire = proj.type === 'fireball';
      ctx.fillStyle = isFire ? '#f97316' : '#38bdf8';
      this.fillPixelRect(ctx, px - 6, py - 6, 12, 12);
      ctx.fillStyle = '#ffffff';
      this.fillPixelRect(ctx, px - 3, py - 3, 6, 6);

      // Trailing sparks
      ctx.fillStyle = isFire ? '#ef4444' : '#818cf8';
      this.fillPixelRect(ctx, px - 10 + Math.sin(gameTime * 20) * 3, py - 2, 4, 4);
    } else if (proj.type === 'rock') {
      // Catapult boulder with rotation
      ctx.translate(px, py);
      ctx.rotate(gameTime * 8);
      ctx.fillStyle = '#475569';
      this.fillPixelRect(ctx, -7, -7, 14, 14);
      ctx.fillStyle = '#64748b';
      this.fillPixelRect(ctx, -4, -4, 8, 8);
    }

    ctx.restore();
  }

  // --- PARTICLES & COMBAT FX ---
  private static drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;

    if (p.shape === 'ring') {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.stroke();
    } else if (p.shape === 'circle' || p.shape === 'smoke') {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Crisp pixel square
      this.fillPixelRect(ctx, p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.restore();
  }

  private static drawWeatherLayer(
    ctx: CanvasRenderingContext2D,
    weatherParticles: WeatherParticle[],
    targetLayer: 'background' | 'foreground',
    gameTime: number
  ) {
    ctx.save();
    for (const wp of weatherParticles) {
      if (wp.layer !== targetLayer) continue;

      ctx.globalAlpha = wp.alpha;
      const px = wp.x;
      const py = wp.y;

      if (wp.shape === 'snowflake') {
        // High-fidelity pixel snowflake
        if (wp.size >= 4) {
          // 5x5 pixel crystalline snowflake cross
          ctx.fillStyle = '#ffffff';
          this.fillPixelRect(ctx, px - 2, py, 5, 1);
          this.fillPixelRect(ctx, px, py - 2, 1, 5);
          this.fillPixelRect(ctx, px - 1, py - 1, 3, 3);
          ctx.fillStyle = '#e0f2fe';
          this.fillPixelRect(ctx, px - 2, py - 2, 1, 1);
          this.fillPixelRect(ctx, px + 2, py - 2, 1, 1);
          this.fillPixelRect(ctx, px - 2, py + 2, 1, 1);
          this.fillPixelRect(ctx, px + 2, py + 2, 1, 1);
        } else {
          // Crisp 2x2 or 3x3 pixel snow flake
          ctx.fillStyle = wp.color;
          this.fillPixelRect(ctx, px - wp.size / 2, py - wp.size / 2, wp.size, wp.size);
        }
      } else if (wp.shape === 'ember') {
        // Glowing Volcanic Magma Ember
        // Outer heat glow
        ctx.fillStyle = '#ef4444';
        this.fillPixelRect(ctx, px - wp.size, py - wp.size, wp.size * 2, wp.size * 2);
        // Bright core
        ctx.fillStyle = wp.color;
        this.fillPixelRect(ctx, px - wp.size / 2, py - wp.size / 2, wp.size, wp.size);
        ctx.fillStyle = '#ffffff';
        this.fillPixelRect(ctx, px - 1, py - 1, 2, 2);
      } else if (wp.shape === 'sand_grain') {
        // Fast-moving horizontal sandstorm streak line
        const streakLength = Math.max(6, Math.min(18, wp.vx * 0.04));
        ctx.fillStyle = wp.color;
        this.fillPixelRect(ctx, px - streakLength, py - 1, streakLength, 2);
        // Head glint
        ctx.fillStyle = '#fef08a';
        this.fillPixelRect(ctx, px, py - 1, 2, 2);
      } else if (wp.shape === 'leaf') {
        // Fluttering Rotated Diamond Leaf
        ctx.save();
        ctx.translate(px, py);
        if (wp.rotation !== undefined) {
          ctx.rotate(wp.rotation);
        }
        ctx.fillStyle = wp.color;
        // Diamond leaf shape
        this.fillPixelRect(ctx, -2, -1, 5, 3);
        this.fillPixelRect(ctx, -1, -3, 3, 7);
        // Leaf stem / vein
        ctx.fillStyle = '#713f12';
        this.fillPixelRect(ctx, -3, 0, 2, 1);
        ctx.restore();
      } else if (wp.shape === 'dust_devil') {
        // Swirling mini whirlwind / dust vortex
        ctx.save();
        ctx.translate(px, py);
        if (wp.rotation !== undefined) {
          ctx.rotate(wp.rotation);
        }
        ctx.strokeStyle = wp.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, wp.size * 0.4, 0, Math.PI * 1.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, wp.size * 0.8, Math.PI * 0.5, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      } else if (wp.shape === 'smoke_wisp') {
        // Volcanic ash or dandelion spore
        ctx.fillStyle = wp.color;
        this.fillPixelRect(ctx, px - wp.size / 2, py - wp.size / 2, wp.size, wp.size);
      }
    }
    ctx.restore();
  }

  private static drawAtmosphereOverlay(
    ctx: CanvasRenderingContext2D,
    world: WorldTheme,
    gameTime: number
  ) {
    ctx.save();

    if (world === 'desert') {
      // Warm Amber Dust Storm Haze
      const stormPulse = Math.sin(gameTime * 1.2) * 0.04 + 0.12;
      ctx.fillStyle = `rgba(217, 119, 6, ${stormPulse})`;
      ctx.fillRect(-200, 0, LANE_WIDTH + 400, LANE_HEIGHT);

      // Horizontal wind mist bands
      ctx.fillStyle = 'rgba(253, 230, 138, 0.08)';
      const bandOffset = (gameTime * 140) % (LANE_WIDTH + 400);
      ctx.fillRect(-200 + bandOffset, GROUND_Y - 120, 350, 40);
      ctx.fillRect(-200 + ((bandOffset + 600) % (LANE_WIDTH + 400)), GROUND_Y - 70, 450, 50);
    } else if (world === 'snow') {
      // Sub-Zero Frost Haze
      const frostPulse = Math.sin(gameTime * 1.5) * 0.03 + 0.10;
      ctx.fillStyle = `rgba(224, 242, 254, ${frostPulse})`;
      ctx.fillRect(-200, 0, LANE_WIDTH + 400, LANE_HEIGHT);

      // Low Ground Blizzard Mist
      ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
      const mistOffset = (gameTime * 80) % (LANE_WIDTH + 400);
      ctx.fillRect(-200 + mistOffset, GROUND_Y - 40, 500, 30);
    } else if (world === 'volcano') {
      // Fiery Magma Atmosphere & Heat Shimmer
      const heatPulse = Math.sin(gameTime * 2.5) * 0.05 + 0.14;
      ctx.fillStyle = `rgba(220, 38, 38, ${heatPulse})`;
      ctx.fillRect(-200, 0, LANE_WIDTH + 400, LANE_HEIGHT);

      // Ground Magma Vein Glow
      ctx.fillStyle = 'rgba(249, 115, 22, 0.25)';
      ctx.fillRect(-200, GROUND_Y - 4, LANE_WIDTH + 400, 12);
    } else if (world === 'plains') {
      // Soft Morning Sunbeams
      ctx.fillStyle = 'rgba(254, 240, 138, 0.04)';
      ctx.fillRect(-200, 0, LANE_WIDTH + 400, LANE_HEIGHT);
    }

    ctx.restore();
  }

  private static drawFloatingText(ctx: CanvasRenderingContext2D, ft: FloatingText) {
    ctx.save();
    ctx.globalAlpha = ft.alpha;
    ctx.font = ft.isCrit ? 'bold 12px "Press Start 2P", monospace' : '10px "Press Start 2P", monospace';

    // Black pixel text 4-direction outline for 100% crisp legibility
    ctx.fillStyle = '#000000';
    ctx.fillText(ft.text, ft.x + 1, ft.y + 1);
    ctx.fillText(ft.text, ft.x - 1, ft.y - 1);
    ctx.fillText(ft.text, ft.x + 1, ft.y - 1);
    ctx.fillText(ft.text, ft.x - 1, ft.y + 1);

    // Glowing crit effect
    if (ft.isCrit) {
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 8;
    }

    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  }

  // --- 4-FRAME UNIT DEATH ANIMATION SEQUENCE ---
  private static renderDeathSequence(
    ctx: CanvasRenderingContext2D,
    unit: UnitInstance,
    pal: typeof PixelRenderer.PALETTES.player,
    frame: number,
    gameTime: number
  ) {
    const scale = unit.isBoss ? 1.8 : unit.size === 'huge' ? 1.5 : unit.size === 'large' ? 1.2 : 1.0;
    const radius = 24 * scale;

    if (frame === 0) {
      // FRAME 0: Stagger & Hit Recoil (unit recoils back with bright flash & sparks)
      ctx.save();
      ctx.translate(-4, 0);
      ctx.rotate(-0.25);
      ctx.filter = 'brightness(2.4)';

      // Draw staggering silhouette
      ctx.fillStyle = pal.primary;
      this.fillPixelRect(ctx, -6 * scale, -22 * scale, 12 * scale, 16 * scale);
      ctx.fillStyle = pal.metal;
      this.fillPixelRect(ctx, -5 * scale, -20 * scale, 10 * scale, 10 * scale);
      ctx.fillStyle = pal.skin;
      this.fillPixelRect(ctx, -3 * scale, -28 * scale, 8 * scale, 7 * scale);
      // Recoil hit sparks
      ctx.fillStyle = '#ffffff';
      this.fillPixelRect(ctx, 8 * scale, -20 * scale, 3, 3);
      this.fillPixelRect(ctx, -12 * scale, -15 * scale, 3, 3);
      this.fillPixelRect(ctx, 4 * scale, -32 * scale, 2, 2);

      // Dropping weapon
      ctx.fillStyle = pal.metal;
      this.fillPixelRect(ctx, 8 * scale, -10 * scale, 4, 12);

      ctx.restore();
    } else if (frame === 1) {
      // FRAME 1: Kneeling Collapse (unit drops to knees, tilting back with closed eyes)
      ctx.save();
      ctx.translate(-8, 6 * scale);
      ctx.rotate(-0.75);

      // Body collapsing
      ctx.fillStyle = pal.primary;
      this.fillPixelRect(ctx, -6 * scale, -18 * scale, 12 * scale, 14 * scale);
      ctx.fillStyle = pal.metal;
      this.fillPixelRect(ctx, -5 * scale, -16 * scale, 10 * scale, 9 * scale);
      ctx.fillStyle = pal.skin;
      this.fillPixelRect(ctx, -4 * scale, -24 * scale, 8 * scale, 7 * scale);

      // Dead "X X" eyes
      ctx.fillStyle = '#000000';
      this.fillPixelRect(ctx, 0, -22 * scale, 2, 2);
      this.fillPixelRect(ctx, 3 * scale, -22 * scale, 2, 2);

      // Ground impact smoke puff popping out
      ctx.fillStyle = 'rgba(226, 232, 240, 0.7)';
      this.fillPixelRect(ctx, -14 * scale, -4 * scale, 8 * scale, 6 * scale);
      this.fillPixelRect(ctx, 6 * scale, -4 * scale, 8 * scale, 6 * scale);

      ctx.restore();
    } else if (frame === 2) {
      // FRAME 2: Ground Impact & Shatter (flat on ground, breaking into 8-bit pixel debris)
      ctx.save();
      ctx.translate(-12, 10 * scale);
      ctx.rotate(-1.45);

      // Fragmented shattered body
      ctx.fillStyle = pal.primary;
      this.fillPixelRect(ctx, -4 * scale, -12 * scale, 8 * scale, 8 * scale);
      this.fillPixelRect(ctx, 6 * scale, -16 * scale, 6 * scale, 6 * scale);
      this.fillPixelRect(ctx, -12 * scale, -8 * scale, 6 * scale, 6 * scale);

      // Shattered metal fragments
      ctx.fillStyle = pal.metal;
      this.fillPixelRect(ctx, -8 * scale, -18 * scale, 5 * scale, 5 * scale);
      ctx.fillStyle = pal.accent;
      this.fillPixelRect(ctx, 2 * scale, -22 * scale, 4 * scale, 4 * scale);

      // Ground impact dust shockline
      ctx.fillStyle = 'rgba(248, 250, 252, 0.85)';
      this.fillPixelRect(ctx, -18 * scale, -2, 36 * scale, 3);
      this.fillPixelRect(ctx, -12 * scale, -4, 24 * scale, 2);

      ctx.restore();
    } else {
      // FRAME 3: Disintegrating Pixel Dust Cloud & Ascending Soul Motes
      ctx.save();
      const pSize = radius * 0.9;

      // Multi-tier expanding 8-bit smoke puff
      ctx.fillStyle = 'rgba(241, 245, 249, 0.75)';
      this.fillPixelRect(ctx, -pSize, -pSize - 6, pSize * 2, pSize * 1.8);
      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      this.fillPixelRect(ctx, -pSize * 0.7, -pSize * 0.7 - 6, pSize * 1.4, pSize * 1.3);
      ctx.fillStyle = 'rgba(71, 85, 105, 0.4)';
      this.fillPixelRect(ctx, -pSize * 0.4, -pSize * 0.4 - 6, pSize * 0.8, pSize * 0.8);

      // Ascending golden/blue soul sparkle motes
      ctx.fillStyle = unit.team === 'player' ? '#93c5fd' : '#fca5a5';
      this.fillPixelRect(ctx, -6 * scale, -pSize - 16 * scale, 3, 3);
      this.fillPixelRect(ctx, 8 * scale, -pSize - 22 * scale, 3, 3);
      this.fillPixelRect(ctx, 0, -pSize - 28 * scale, 4, 4);

      ctx.restore();
    }
  }

  private static drawDeathPuff(ctx: CanvasRenderingContext2D, frame: number, radius: number) {
    const pSize = Math.max(2, radius * (0.3 + frame * 0.2));
    ctx.fillStyle = `rgba(226, 232, 240, ${Math.max(0, 1 - frame * 0.25)})`;
    this.fillPixelRect(ctx, -pSize, -pSize - 10, pSize * 2, pSize * 2);
    ctx.fillStyle = `rgba(148, 163, 184, ${Math.max(0, 1 - frame * 0.3)})`;
    this.fillPixelRect(ctx, -pSize * 0.7, -pSize * 0.7 - 10, pSize * 1.4, pSize * 1.4);
  }

  private static drawCrack(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    this.fillPixelRect(ctx, x, y, 3, h * 0.4);
    this.fillPixelRect(ctx, x + 3, y + h * 0.35, w * 0.5, 3);
    this.fillPixelRect(ctx, x + w * 0.5, y + h * 0.35, 3, h * 0.6);
  }

  private static drawLightingFilter(ctx: CanvasRenderingContext2D, gameTime: number) {
    const cycleTime = gameTime % 60; // 60s Day/Night cycle
    let tintColor = 'rgba(15, 23, 42, 0)';

    if (cycleTime >= 25 && cycleTime < 35) {
      // Dusk / Sunset
      const p = (cycleTime - 25) / 10;
      tintColor = `rgba(245, 158, 11, ${0.05 + p * 0.15})`;
    } else if (cycleTime >= 35 && cycleTime < 55) {
      // Night
      tintColor = 'rgba(15, 23, 42, 0.52)';
    } else if (cycleTime >= 55) {
      // Dawn
      const p = (60 - cycleTime) / 5;
      tintColor = `rgba(244, 63, 94, ${p * 0.15})`;
    }

    if (cycleTime >= 25) {
      ctx.save();
      ctx.fillStyle = tintColor;
      ctx.fillRect(-200, -200, LANE_WIDTH + 400, LANE_HEIGHT + 400);
      ctx.restore();
    }
  }

  private static drawLaneConflictHighlights(
    ctx: CanvasRenderingContext2D,
    units: UnitInstance[],
    playerCastle: CastleState,
    gameTime: number
  ) {
    ctx.save();

    // 1. Highlight Active Conflict Zones (Where units are actively attacking)
    const attackingUnits = units.filter(u => u.state === 'attacking');
    const pulseAlpha = (Math.sin(gameTime * 8) + 1) * 0.25 + 0.15;

    for (const unit of attackingUnits) {
      // Draw pulsating amber combat highlight beneath attacking frontline
      ctx.fillStyle = `rgba(245, 158, 11, ${pulseAlpha})`;
      this.fillPixelRect(ctx, unit.x - 30, GROUND_Y - 4, 60, 12);

      // Draw subtle clashing swords indicator badge floating above conflict spot
      ctx.fillStyle = `rgba(239, 68, 68, ${pulseAlpha * 1.2})`;
      this.fillPixelRect(ctx, unit.x - 12, GROUND_Y - 42, 24, 3);
      this.fillPixelRect(ctx, unit.x - 6, GROUND_Y - 45, 12, 3);
    }

    // 2. Highlight Enemy Hard Push Zones (Enemy units pushing near player keep < 380px)
    const enemyPushers = units.filter(u => u.team === 'enemy' && u.state !== 'dying' && u.x < playerCastle.x + 380);
    if (enemyPushers.length > 0) {
      const pushPulse = (Math.sin(gameTime * 12) + 1) * 0.3 + 0.2;
      ctx.fillStyle = `rgba(220, 38, 38, ${pushPulse})`;

      // Danger zone warning strip along lane floor near player base
      const minX = Math.min(...enemyPushers.map(u => u.x)) - 20;
      const maxX = Math.max(...enemyPushers.map(u => u.x)) + 20;
      this.fillPixelRect(ctx, Math.max(playerCastle.x, minX), GROUND_Y - 6, Math.max(40, maxX - minX), 14);

      // Warning text marker above danger push
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillStyle = `rgba(248, 113, 113, ${pushPulse + 0.3})`;
      ctx.fillText('▲ ENEMY PUSH ▲', minX + (maxX - minX) / 2 - 40, GROUND_Y - 32);
    }

    ctx.restore();
  }

  // --- PIXEL MATH UTILITIES ---
  private static fillPixelRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
  }

  private static drawPixelTriangle(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
    ctx.beginPath();
    ctx.moveTo(Math.floor(x), Math.floor(y));
    ctx.lineTo(Math.floor(x + w / 2), Math.floor(y - h));
    ctx.lineTo(Math.floor(x + w), Math.floor(y));
    ctx.closePath();
    ctx.fill();
  }
}

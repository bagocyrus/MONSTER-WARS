import React, { useEffect, useState } from 'react';
import { GameEngine } from '../engine/gameEngine';
import { UNIT_ROSTER, SPECIAL_ABILITIES, LANE_WIDTH } from '../data/gameData';
import { UnitCategory } from '../types/game';
import { soundEngine } from '../audio/soundEngine';
import { Play, Pause, FastForward, Shield, Zap, Sparkles } from 'lucide-react';

interface GameHUDProps {
  engine: GameEngine;
  onExitToMap: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({ engine, onExitToMap }) => {
  const [, setTick] = useState(0);

  // Re-render HUD at 30fps for smooth cooldown bars and gold counter
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 33);
    return () => clearInterval(interval);
  }, []);

  // Keyboard Shortcuts (1-8 for units, Space for ability, P for pause, S for speed)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (engine.gameOver) return;

      if (e.key >= '1' && e.key <= '8') {
        const index = parseInt(e.key) - 1;
        const availableUnits: UnitCategory[] = ['archer', 'knight', 'swordsman', 'mage', 'catapult', 'giant', 'paladin', 'dragon'];
        const unitType = availableUnits[index];
        if (unitType && engine.progress.unlockedLevel >= (UNIT_ROSTER[unitType]?.unlockLevel || 1)) {
          engine.spawnPlayerUnit(unitType);
        }
      } else if (e.code === 'Space') {
        e.preventDefault();
        engine.useSpecialAbility();
      } else if (e.key === 'p' || e.key === 'P') {
        engine.isPaused = !engine.isPaused;
      } else if (e.key === 's' || e.key === 'S') {
        engine.gameSpeed = engine.gameSpeed === 1.0 ? 2.0 : 1.0;
        soundEngine.playButtonClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [engine]);

  const playerHpRatio = Math.max(0, engine.playerCastle.hp / engine.playerCastle.maxHp);
  const enemyHpRatio = Math.max(0, engine.enemyCastle.hp / engine.enemyCastle.maxHp);

  const availableUnits: UnitCategory[] = ['archer', 'knight', 'swordsman', 'mage', 'catapult', 'giant', 'paladin', 'dragon'];
  const activeAbility = SPECIAL_ABILITIES[engine.progress.equippedAbility || 'arrowRain'];
  const abilityCdRatio = engine.abilityCooldown > 0 ? engine.abilityCooldown / engine.maxAbilityCooldown : 0;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2 md:p-4 select-none">
      {/* TOP HEADER: Castle Health, Gold, Lane Mini-Radar, Speed & Pause */}
      <div className="flex flex-col gap-2 w-full max-w-5xl mx-auto relative">
        {/* COMBAT EVENT LOG (Top Right overlay) */}
        <div className="absolute -top-1 right-0 bg-zinc-950/80 border border-zinc-700/80 p-2 rounded w-48 sm:w-60 pointer-events-none hidden sm:flex flex-col gap-1 z-30 shadow-lg">
          <div className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800 pb-0.5">
            Battle Log
          </div>
          <div className="flex flex-col gap-1 text-[8px] sm:text-[9px] font-mono text-zinc-300">
            {engine.battleLog.slice(0, 5).map((log, i) => (
              <div key={log.id} className={`truncate ${i === 0 ? 'text-amber-300 font-bold' : 'text-zinc-400 opacity-90'}`}>
                • {log.text}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 md:gap-4 pointer-events-auto">
          {/* PLAYER CASTLE HEALTH */}
          <div className="flex-1 bg-zinc-900/90 border-2 border-blue-600 p-1.5 md:p-2.5 rounded pixel-box">
            <div className="flex items-center justify-between text-[9px] md:text-xs text-blue-400 font-bold mb-1">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                Player Keep
              </span>
              <span className="tabular-nums">
                {Math.ceil(engine.playerCastle.hp)} / {engine.playerCastle.maxHp}
              </span>
            </div>
            <div className="w-full bg-zinc-950 h-3 md:h-4 border border-blue-900 overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-blue-700 to-blue-500 transition-all duration-100"
                style={{ width: `${playerHpRatio * 100}%` }}
              />
            </div>
          </div>

          {/* CENTER: GOLD COUNTER & CONTROLS */}
          <div className="flex items-center gap-2 md:gap-3 bg-zinc-900/95 border-2 border-amber-600 px-3 py-1.5 md:px-4 md:py-2 rounded pixel-box shrink-0">
            {/* Gold */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-xs md:text-sm">
                <div className="w-4 h-4 bg-amber-400 border border-amber-600 rounded-full flex items-center justify-center text-[10px] text-amber-950 font-black">
                  $
                </div>
                <span className="tabular-nums text-sm md:text-base font-black tracking-wide">
                  {Math.floor(engine.playerGold)}
                </span>
              </div>
              <span className="text-[8px] md:text-[9px] text-amber-300/80 font-mono">
                +{engine.playerGoldRate.toFixed(1)}/s
              </span>
            </div>

            <div className="h-6 w-px bg-zinc-700 mx-1" />

            {/* Speed Toggle */}
            <button
              onClick={() => {
                engine.gameSpeed = engine.gameSpeed === 1.0 ? 2.0 : 1.0;
                soundEngine.playButtonClick();
              }}
              className={`p-1.5 md:p-2 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-transform active:scale-95 ${
                engine.gameSpeed === 2.0
                  ? 'bg-amber-500 text-zinc-950 shadow-inner'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
              title="Toggle Game Speed (S)"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>{engine.gameSpeed}x</span>
            </button>

            {/* Pause Toggle */}
            <button
              onClick={() => {
                engine.isPaused = !engine.isPaused;
                soundEngine.playButtonClick();
              }}
              className="p-1.5 md:p-2 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 cursor-pointer transition-transform active:scale-95"
              title="Pause Game (P)"
            >
              {engine.isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* ENEMY CASTLE HEALTH */}
          <div className="flex-1 bg-zinc-900/90 border-2 border-red-600 p-1.5 md:p-2.5 rounded pixel-box">
            <div className="flex items-center justify-between text-[9px] md:text-xs text-red-400 font-bold mb-1">
              <span className="truncate">
                {engine.level.boss && engine.bossSpawned ? engine.level.boss.name : 'Enemy Keep'}
              </span>
              <span className="tabular-nums">
                {Math.ceil(engine.enemyCastle.hp)} / {engine.enemyCastle.maxHp}
              </span>
            </div>
            <div className="w-full bg-zinc-950 h-3 md:h-4 border border-red-900 overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-rose-400 transition-all duration-100"
                style={{ width: `${enemyHpRatio * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* MINI-LANE RADAR OVERVIEW */}
        <div className="w-full bg-zinc-950/80 border border-zinc-700 h-3.5 rounded relative overflow-hidden flex items-center px-1">
          {/* Player base line */}
          <div className="absolute left-1 top-0 bottom-0 w-1.5 bg-blue-500" />
          {/* Enemy base line */}
          <div className="absolute right-1 top-0 bottom-0 w-1.5 bg-red-500" />

          {/* Camera Viewport Indicator */}
          <div
            className="absolute top-0 bottom-0 bg-white/10 border border-white/30"
            style={{
              left: `${Math.max(0, Math.min(85, (engine.cameraX - 250) / LANE_WIDTH * 100))}%`,
              width: '25%'
            }}
          />

          {/* Units on Radar */}
          {engine.units.map(u => {
            if (u.state === 'dying') return null;
            const pct = Math.max(2, Math.min(98, (u.x / LANE_WIDTH) * 100));
            return (
              <div
                key={u.id}
                className={`absolute top-0.5 bottom-0.5 rounded-full ${
                  u.team === 'player' ? 'bg-blue-400 w-1.5' : 'bg-red-400 w-1.5'
                } ${u.isBoss ? 'w-2.5 bg-amber-400 ring-1 ring-red-500' : ''}`}
                style={{ left: `${pct}%` }}
              />
            );
          })}
        </div>
      </div>

      {/* PAUSE OVERLAY */}
      {engine.isPaused && (
        <div className="self-center bg-zinc-950/90 border-2 border-amber-500 p-4 md:p-6 rounded pixel-gold-border pointer-events-auto text-center flex flex-col gap-3">
          <h2 className="text-base md:text-xl font-bold text-amber-400">GAME PAUSED</h2>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => {
                engine.isPaused = false;
                soundEngine.playButtonClick();
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded pixel-box text-xs md:text-sm cursor-pointer"
            >
              Resume
            </button>
            <button
              onClick={() => {
                soundEngine.playButtonClick();
                onExitToMap();
              }}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded pixel-box text-xs md:text-sm cursor-pointer"
            >
              Surrender / Map
            </button>
          </div>
        </div>
      )}

      {/* BOTTOM DEPLOYMENT BAR: 6 UNITS + SPECIAL ABILITY */}
      <div className="flex items-end justify-center gap-1.5 md:gap-3 w-full max-w-4xl mx-auto pointer-events-auto pb-1">
        {/* UNIT CARDS (Swipeable / Scrollable Horizontal Roster) */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 text-[8px] text-amber-300 font-bold mb-0.5 tracking-wider uppercase animate-pulse">
            <span>◀</span>
            <span>SWIPE HORIZONTALLY TO VIEW ALL UNITS</span>
            <span>▶</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2.5 bg-zinc-900/90 border-2 border-zinc-700 p-1.5 md:p-2 rounded pixel-box overflow-x-auto max-w-[320px] sm:max-w-lg md:max-w-2xl scrollbar-none touch-pan-x shadow-xl">
            {availableUnits.map((type, idx) => {
              const stats = UNIT_ROSTER[type];
              if (!stats) return null;

              const isUnlocked = engine.progress.unlockedLevel >= stats.unlockLevel;
              const cd = engine.playerSpawnCooldowns[type] || 0;
              const cdRatio = cd > 0 ? cd / stats.spawnCooldown : 0;
              const hasEnoughGold = engine.playerGold >= stats.cost;
              const canSpawn = isUnlocked && cd <= 0 && hasEnoughGold;

              return (
                <button
                  key={type}
                  disabled={!canSpawn}
                  onClick={() => engine.spawnPlayerUnit(type)}
                  className={`relative flex flex-col items-center justify-between shrink-0 w-12 h-16 md:w-16 md:h-22 rounded border-2 transition-all cursor-pointer ${
                    !isUnlocked
                      ? 'bg-zinc-950/70 border-zinc-800 opacity-40 cursor-not-allowed'
                      : canSpawn
                      ? 'bg-zinc-800 hover:bg-zinc-700 border-blue-500 active:scale-95 pixel-blue-border'
                      : 'bg-zinc-900 border-zinc-700 opacity-60 cursor-not-allowed'
                  }`}
                  title={
                    !isUnlocked
                      ? `Locked: Unlock at Level ${stats.unlockLevel}`
                      : `${stats.name} (Hotkey: ${idx + 1})\nCost: ${stats.cost} Gold\n${stats.description}`
                  }
                >
                  {/* Hotkey / Level badge */}
                  <div className="absolute -top-2 -left-1.5 bg-zinc-950 border border-zinc-600 text-[8px] md:text-[10px] text-zinc-300 px-1 py-0.2 rounded font-mono z-10">
                    {isUnlocked ? idx + 1 : `Lv${stats.unlockLevel}`}
                  </div>

                  {/* Unit Icon / Name */}
                  <div className="flex-1 flex flex-col items-center justify-center pt-1">
                    <div className="text-lg md:text-2xl">
                      {type === 'archer' ? '🏹' : type === 'knight' ? '🛡️' : type === 'swordsman' ? '⚔️' : type === 'mage' ? '🔮' : type === 'catapult' ? '🎯' : type === 'giant' ? '🗿' : type === 'paladin' ? '✨' : '🐉'}
                    </div>
                    <span className="text-[7px] md:text-[9px] font-bold text-zinc-200 truncate max-w-full px-0.5">
                      {stats.name}
                    </span>
                  </div>

                  {/* Cost badge */}
                  <div className={`w-full py-0.5 text-center text-[8px] md:text-[10px] font-black rounded-b border-t ${
                    hasEnoughGold ? 'bg-amber-500/20 text-amber-300 border-amber-600/40' : 'bg-red-950 text-red-400 border-red-800'
                  }`}>
                    {stats.cost}G
                  </div>

                  {/* Cooldown Mask */}
                  {cdRatio > 0 && (
                    <div
                      className="absolute inset-0 bg-zinc-950/80 rounded flex items-center justify-center overflow-hidden"
                    >
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-blue-900/50"
                        style={{ height: `${cdRatio * 100}%` }}
                      />
                      <span className="relative z-10 text-[9px] font-mono font-bold text-amber-400">
                        {cd.toFixed(1)}s
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* SPECIAL ABILITY BUTTON */}
        <button
          disabled={abilityCdRatio > 0}
          onClick={() => engine.useSpecialAbility()}
          className={`relative flex flex-col items-center justify-center w-14 h-16 md:w-20 md:h-22 rounded border-2 p-1 transition-all cursor-pointer ${
            abilityCdRatio === 0
              ? 'bg-amber-950/90 border-amber-500 hover:bg-amber-900 active:scale-95 pixel-gold-border animate-pulse'
              : 'bg-zinc-900 border-zinc-800 opacity-60 cursor-not-allowed'
          }`}
          title={`${activeAbility.name} (Hotkey: SPACE)\n${activeAbility.description}`}
        >
          {/* Space Key badge */}
          <div className="absolute -top-2 -right-1 bg-amber-500 text-zinc-950 text-[7px] md:text-[9px] font-black px-1 rounded">
            SPACE
          </div>

          <div className="text-xl md:text-3xl mb-0.5">
            {activeAbility.icon}
          </div>
          <span className="text-[7px] md:text-[9px] font-black text-amber-300 text-center leading-tight">
            {activeAbility.name}
          </span>

          {/* Cooldown Overlay */}
          {abilityCdRatio > 0 && (
            <div className="absolute inset-0 bg-zinc-950/85 rounded flex items-center justify-center overflow-hidden">
              <div
                className="absolute bottom-0 left-0 right-0 bg-amber-600/30"
                style={{ height: `${abilityCdRatio * 100}%` }}
              />
              <span className="relative z-10 text-[10px] font-mono font-bold text-amber-400">
                {Math.ceil(engine.abilityCooldown)}s
              </span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

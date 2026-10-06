import React, { useState } from 'react';
import { PlayerProgress, LevelConfig, WorldTheme } from '../types/game';
import { WORLDS, getLevelConfig, getUnitUnlockAtLevel, TOTAL_LEVELS, LEVELS_PER_BIOME } from '../data/gameData';
import { soundEngine } from '../audio/soundEngine';
import { ArrowLeft, Swords, Sparkles, Skull, Lock, Gift, ChevronLeft, ChevronRight, Compass } from 'lucide-react';

interface LevelSelectProps {
  progress: PlayerProgress;
  onSelectLevel: (levelId: number) => void;
  onBackToMenu: () => void;
  onOpenUpgrades: () => void;
}

export const LevelSelect: React.FC<LevelSelectProps> = ({
  progress,
  onSelectLevel,
  onBackToMenu,
  onOpenUpgrades
}) => {
  // Determine starting biome based on current progress
  const initialWorldIndex = Math.min(3, Math.floor((progress.unlockedLevel - 1) / LEVELS_PER_BIOME));
  const [selectedWorldId, setSelectedWorldId] = useState<WorldTheme>(WORLDS[initialWorldIndex]?.id || 'plains');

  const currentWorld = WORLDS.find(w => w.id === selectedWorldId) || WORLDS[0];

  // Sector pagination (20 levels per page in the 200-level biome = 10 sectors)
  const currentLevelInWorld = Math.max(1, progress.unlockedLevel - (currentWorld.startLevel - 1));
  const initialSector = Math.min(9, Math.floor((currentLevelInWorld - 1) / 20));
  const [sectorIndex, setSectorIndex] = useState<number>(initialSector);

  const [selectedLevelId, setSelectedLevelId] = useState<number>(
    Math.min(progress.unlockedLevel, currentWorld.startLevel)
  );

  const selectedLevelConfig = getLevelConfig(selectedLevelId);
  const totalStars = Object.values(progress.levelStars).reduce((a, b) => a + b, 0);

  // Calculate the 20 levels for current sector
  const sectorStartLevel = currentWorld.startLevel + sectorIndex * 20;
  const sectorLevels = Array.from({ length: 20 }, (_, i) => sectorStartLevel + i).filter(l => l <= currentWorld.endLevel);

  const handleJumpToCurrent = () => {
    soundEngine.playButtonClick();
    const curLevel = Math.min(TOTAL_LEVELS, progress.unlockedLevel);
    let targetWorld: WorldTheme = 'plains';
    if (curLevel > 600) targetWorld = 'volcano';
    else if (curLevel > 400) targetWorld = 'snow';
    else if (curLevel > 200) targetWorld = 'desert';

    setSelectedWorldId(targetWorld);
    const worldObj = WORLDS.find(w => w.id === targetWorld) || WORLDS[0];
    const inWorld = curLevel - (worldObj.startLevel - 1);
    const sec = Math.min(9, Math.floor((inWorld - 1) / 20));
    setSectorIndex(sec);
    setSelectedLevelId(curLevel);
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-zinc-950 flex flex-col p-2 sm:p-4 md:p-6 overflow-y-auto select-none">
      {/* TOP HEADER */}
      <div className="flex items-center justify-between gap-2 max-w-5xl mx-auto w-full mb-3 bg-zinc-900/90 border-2 border-zinc-700 p-2.5 rounded pixel-box">
        <button
          onClick={() => {
            soundEngine.playButtonClick();
            onBackToMenu();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded pixel-box cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Menu</span>
        </button>

        <div className="flex items-center gap-2">
          <h1 className="text-xs md:text-base font-black text-amber-400 pixel-font truncate">
            CAMPAIGN ({TOTAL_LEVELS} STAGES)
          </h1>

          <button
            onClick={handleJumpToCurrent}
            className="hidden sm:flex items-center gap-1 text-[9px] bg-blue-950/80 hover:bg-blue-900 border border-blue-600 text-blue-300 px-2 py-1 rounded cursor-pointer"
            title="Jump to Current Unlocked Level"
          >
            <Compass className="w-3 h-3" />
            <span>Lv {progress.unlockedLevel}</span>
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
            <span className="text-amber-500 font-black">$</span>
            <span className="tabular-nums font-mono">{progress.gold}</span>
          </div>

          <div className="flex items-center gap-1 text-yellow-300 font-bold text-xs">
            <span>⭐</span>
            <span className="tabular-nums font-mono">{totalStars}</span>
          </div>

          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onOpenUpgrades();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-zinc-950 text-xs font-black rounded pixel-gold-border cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Upgrades</span>
          </button>
        </div>
      </div>

      {/* 4 BIOME TABS (200 LEVELS EACH) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-5xl mx-auto w-full mb-3">
        {WORLDS.map((world, idx) => {
          const isWorldUnlocked = progress.unlockedLevel >= world.startLevel;
          const isSelected = world.id === selectedWorldId;

          return (
            <button
              key={world.id}
              disabled={!isWorldUnlocked}
              onClick={() => {
                soundEngine.playButtonClick();
                setSelectedWorldId(world.id);
                setSectorIndex(0);
                setSelectedLevelId(world.startLevel);
              }}
              className={`p-2 rounded border-2 flex flex-col text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-zinc-800 border-amber-500 pixel-gold-border shadow-md'
                  : isWorldUnlocked
                  ? 'bg-zinc-900 hover:bg-zinc-850 border-zinc-700 opacity-90'
                  : 'bg-zinc-950 border-zinc-800 opacity-40 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-bold text-zinc-400 mb-0.5">
                <span>Biome {idx + 1}</span>
                {!isWorldUnlocked && <Lock className="w-3 h-3 text-zinc-600" />}
              </div>
              <span className={`text-xs md:text-sm font-black truncate ${isSelected ? 'text-amber-400' : 'text-zinc-200'}`}>
                {world.name}
              </span>
              <span className="text-[8px] text-zinc-500 mt-0.5">
                Lv {world.startLevel} - {world.endLevel} (200 Stages)
              </span>
            </button>
          );
        })}
      </div>

      {/* SECTOR PAGINATOR & CONTROLS */}
      <div className="flex items-center justify-between bg-zinc-900/80 border border-zinc-700 px-3 py-1.5 rounded max-w-5xl mx-auto w-full mb-3 text-xs">
        <button
          disabled={sectorIndex === 0}
          onClick={() => {
            soundEngine.playButtonClick();
            setSectorIndex(s => Math.max(0, s - 1));
          }}
          className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer ${
            sectorIndex > 0 ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'text-zinc-600 cursor-not-allowed'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Prev Sector</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-300">
            Sector {sectorIndex + 1} / 10
          </span>
          <span className="text-zinc-400 text-[10px]">
            (Stages {sectorStartLevel} - {sectorStartLevel + sectorLevels.length - 1})
          </span>
        </div>

        <button
          disabled={sectorIndex >= 9}
          onClick={() => {
            soundEngine.playButtonClick();
            setSectorIndex(s => Math.min(9, s + 1));
          }}
          className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer ${
            sectorIndex < 9 ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'text-zinc-600 cursor-not-allowed'
          }`}
        >
          <span className="hidden sm:inline">Next Sector</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* MAIN CONTENT: 20-NODE LEVEL GRID + INTEL BRIEFING */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto w-full flex-1">
        {/* LEVEL NODES (2 Cols) */}
        <div className="md:col-span-2 bg-zinc-900/90 border-2 border-zinc-700 p-3 sm:p-4 rounded pixel-stone-border flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2.5 border-b border-zinc-800 pb-2">
              <h2 className="text-xs sm:text-sm font-black text-zinc-200">
                {currentWorld.name} · Sector {sectorIndex + 1}
              </h2>
              <span className="text-[9px] text-zinc-400">
                20 Stages in Sector
              </span>
            </div>

            {/* 4 rows x 5 cols = 20 nodes */}
            <div className="grid grid-cols-5 gap-2 sm:gap-2.5 py-2">
              {sectorLevels.map((levelId) => {
                const isUnlocked = progress.unlockedLevel >= levelId;
                const stars = progress.levelStars[levelId] || 0;
                const isSelected = levelId === selectedLevelId;
                const isMajorBoss = levelId === 200 || levelId === 400 || levelId === 600 || levelId === 800;
                const isMiniBoss = !isMajorBoss && (levelId % 10 === 0 || levelId === 5);
                const unitUnlock = getUnitUnlockAtLevel(levelId);

                return (
                  <button
                    key={levelId}
                    disabled={!isUnlocked}
                    onClick={() => {
                      soundEngine.playButtonClick();
                      setSelectedLevelId(levelId);
                    }}
                    className={`relative flex flex-col items-center justify-center h-16 sm:h-20 rounded border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-950/90 border-amber-400 scale-105 pixel-gold-border z-10'
                        : isUnlocked
                        ? isMajorBoss
                          ? 'bg-red-950 hover:bg-red-900 border-red-500 pixel-red-border animate-pulse'
                          : isMiniBoss
                          ? 'bg-red-950/70 hover:bg-red-900/80 border-red-600 pixel-red-border'
                          : unitUnlock
                          ? 'bg-amber-950/60 hover:bg-amber-900/70 border-amber-500 pixel-gold-border'
                          : 'bg-zinc-800 hover:bg-zinc-750 border-blue-600 pixel-blue-border'
                        : 'bg-zinc-950 border-zinc-800 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    {/* Unit Unlock Gift Badge */}
                    {unitUnlock && isUnlocked && (
                      <div className="absolute -top-2 -right-1 text-xs" title={`Unlocks ${unitUnlock.name}!`}>
                        <Gift className="w-3.5 h-3.5 text-amber-400 fill-amber-500" />
                      </div>
                    )}

                    {/* Boss Skull Indicator */}
                    {(isMajorBoss || isMiniBoss) && isUnlocked && (
                      <div className="absolute -top-2 -left-1 text-xs">
                        <Skull className={`w-3.5 h-3.5 ${isMajorBoss ? 'text-amber-400 fill-red-600' : 'text-red-400'}`} />
                      </div>
                    )}

                    {/* Level Number */}
                    <span className="text-xs sm:text-base font-black text-white font-mono">
                      {isUnlocked ? levelId : <Lock className="w-3.5 h-3.5 text-zinc-600" />}
                    </span>

                    {/* Stars */}
                    {isUnlocked && (
                      <div className="flex gap-0.5 mt-0.5 text-[8px]">
                        {[1, 2, 3].map(s => (
                          <span key={s} className={s <= stars ? 'text-yellow-400' : 'text-zinc-600'}>
                            ★
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-[8px] text-zinc-500 text-center mt-2">
            Tip: Clear stages to earn Gold bounties and unlock new military units!
          </div>
        </div>

        {/* LEVEL BRIEFING & DEPLOYMENT PANEL (1 Col) */}
        {selectedLevelConfig && (
          <div className="bg-zinc-900/95 border-2 border-amber-600/80 p-4 rounded pixel-gold-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-[9px] text-amber-400 font-bold mb-1">
                <span>STAGE {selectedLevelConfig.id} / {TOTAL_LEVELS}</span>
                <span>{selectedLevelConfig.world.toUpperCase()}</span>
              </div>

              <h3 className="text-sm sm:text-base font-black text-white mb-1">
                {selectedLevelConfig.title}
              </h3>

              <p className="text-[10px] text-zinc-300 leading-relaxed mb-3 bg-zinc-950/60 p-2 rounded border border-zinc-800">
                {selectedLevelConfig.subtitle}
              </p>

              {/* UNLOCK REWARD SPOTLIGHT */}
              {getUnitUnlockAtLevel(selectedLevelConfig.id) && (
                <div className="bg-amber-950/70 border border-amber-500 p-2 rounded mb-3 flex items-center gap-2">
                  <span className="text-2xl">🎁</span>
                  <div>
                    <span className="text-[9px] text-amber-300 font-black block">
                      NEW UNIT UNLOCK REWARD!
                    </span>
                    <span className="text-[10px] text-white font-bold">
                      {getUnitUnlockAtLevel(selectedLevelConfig.id)?.name}
                    </span>
                  </div>
                </div>
              )}

              {/* INTEL STATS */}
              <div className="space-y-1.5 mb-3 text-[10px]">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-1">
                  <span className="text-zinc-400">Enemy Keep HP:</span>
                  <span className="font-bold text-red-400 font-mono">{selectedLevelConfig.enemyCastleHp}</span>
                </div>
                <div className="flex items-center justify-between border-b border-zinc-800 pb-1">
                  <span className="text-zinc-400">Enemy Gold Rate:</span>
                  <span className="font-bold text-amber-300 font-mono">+{selectedLevelConfig.enemyGoldRate}/s</span>
                </div>
                {selectedLevelConfig.boss && (
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-1 text-red-400 font-bold">
                    <span className="flex items-center gap-1">
                      <Skull className="w-3 h-3" />
                      Boss:
                    </span>
                    <span>{selectedLevelConfig.boss.name}</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-b border-zinc-800 pb-1">
                  <span className="text-zinc-400">Clear Bounty Reward:</span>
                  <span className="font-bold text-amber-400 font-mono">+{selectedLevelConfig.rewardGold}G / 3★</span>
                </div>
              </div>
            </div>

            {/* DEPLOY BUTTON */}
            <button
              disabled={progress.unlockedLevel < selectedLevelConfig.id}
              onClick={() => {
                soundEngine.playButtonClick();
                onSelectLevel(selectedLevelConfig.id);
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs md:text-sm rounded flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 pixel-gold-border shadow-lg"
            >
              <Swords className="w-4 h-4" />
              <span>DEPLOY TO BATTLE</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

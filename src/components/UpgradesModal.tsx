import React, { useState } from 'react';
import { PlayerProgress, SpecialAbilityType } from '../types/game';
import { UPGRADE_DEFINITIONS, SPECIAL_ABILITIES, UNIT_ROSTER } from '../data/gameData';
import { soundEngine } from '../audio/soundEngine';
import { ArrowLeft, Sparkles, Zap, Shield, Swords, DollarSign, BookOpen, Check } from 'lucide-react';

interface UpgradesModalProps {
  progress: PlayerProgress;
  onUpdateProgress: (newProgress: PlayerProgress) => void;
  onClose: () => void;
}

export const UpgradesModal: React.FC<UpgradesModalProps> = ({
  progress,
  onUpdateProgress,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'upgrades' | 'abilities' | 'codex'>('upgrades');

  const totalStars = Object.values(progress.levelStars).reduce((a, b) => a + b, 0);

  const handlePurchaseUpgrade = (upgradeId: keyof typeof progress.upgrades) => {
    const currentLevel = progress.upgrades[upgradeId] || 0;
    const def = UPGRADE_DEFINITIONS.find(u => u.id === upgradeId);
    if (!def || currentLevel >= def.maxLevel) return;

    const goldCost = def.costFormula(currentLevel);
    const starCost = def.starFormula(currentLevel);

    if (progress.gold < goldCost || totalStars < starCost) return;

    soundEngine.playCoin();

    const nextProgress: PlayerProgress = {
      ...progress,
      gold: progress.gold - goldCost,
      upgrades: {
        ...progress.upgrades,
        [upgradeId]: currentLevel + 1
      }
    };

    onUpdateProgress(nextProgress);
  };

  const handleEquipAbility = (abilityId: SpecialAbilityType) => {
    soundEngine.playButtonClick();
    onUpdateProgress({
      ...progress,
      equippedAbility: abilityId
    });
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-zinc-950 flex flex-col p-3 md:p-6 overflow-y-auto select-none">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-2 max-w-4xl mx-auto w-full mb-4 bg-zinc-900/90 border-2 border-zinc-700 p-2.5 rounded pixel-box">
        <button
          onClick={() => {
            soundEngine.playButtonClick();
            onClose();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold rounded pixel-box cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <h1 className="text-xs md:text-base font-black text-amber-400 pixel-font">
          ARMY & WORKSHOP
        </h1>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
            <span className="text-amber-500 font-black">$</span>
            <span className="tabular-nums font-mono">{progress.gold} Gold</span>
          </div>

          <div className="flex items-center gap-1 text-yellow-300 font-bold text-xs">
            <span>⭐</span>
            <span className="tabular-nums font-mono">{totalStars} Stars</span>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center justify-center gap-2 max-w-4xl mx-auto w-full mb-4">
        <button
          onClick={() => {
            soundEngine.playButtonClick();
            setActiveTab('upgrades');
          }}
          className={`px-4 py-2 text-xs font-black rounded border-2 cursor-pointer ${
            activeTab === 'upgrades'
              ? 'bg-amber-600 text-zinc-950 border-amber-400 pixel-gold-border'
              : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-white'
          }`}
        >
          Permanent Upgrades
        </button>

        <button
          onClick={() => {
            soundEngine.playButtonClick();
            setActiveTab('abilities');
          }}
          className={`px-4 py-2 text-xs font-black rounded border-2 cursor-pointer ${
            activeTab === 'abilities'
              ? 'bg-amber-600 text-zinc-950 border-amber-400 pixel-gold-border'
              : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-white'
          }`}
        >
          Special Abilities
        </button>

        <button
          onClick={() => {
            soundEngine.playButtonClick();
            setActiveTab('codex');
          }}
          className={`px-4 py-2 text-xs font-black rounded border-2 cursor-pointer ${
            activeTab === 'codex'
              ? 'bg-amber-600 text-zinc-950 border-amber-400 pixel-gold-border'
              : 'bg-zinc-900 text-zinc-400 border-zinc-700 hover:text-white'
          }`}
        >
          Unit Codex
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="max-w-4xl mx-auto w-full flex-1">
        {/* TAB 1: UPGRADES */}
        {activeTab === 'upgrades' && (
          <div className="space-y-3">
            {UPGRADE_DEFINITIONS.map((def) => {
              const currentLevel = progress.upgrades[def.id as keyof typeof progress.upgrades] || 0;
              const isMax = currentLevel >= def.maxLevel;
              const goldCost = def.costFormula(currentLevel);
              const starCost = def.starFormula(currentLevel);
              const canAfford = progress.gold >= goldCost && totalStars >= starCost && !isMax;

              return (
                <div
                  key={def.id}
                  className="bg-zinc-900/90 border-2 border-zinc-700 p-3 md:p-4 rounded pixel-box flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs md:text-sm font-black text-amber-300">
                        {def.name}
                      </span>
                      <span className="text-[10px] text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">
                        Rank {currentLevel} / {def.maxLevel}
                      </span>
                    </div>

                    <p className="text-[10px] md:text-xs text-zinc-300 leading-relaxed mb-2">
                      {def.description}
                    </p>

                    {/* Level pip bar */}
                    <div className="flex items-center gap-1 flex-wrap">
                      {Array.from({ length: def.maxLevel }, (_, i) => i + 1).map((lvl) => (
                        <div
                          key={lvl}
                          className={`w-4 md:w-5 h-2 rounded-sm ${
                            lvl <= currentLevel ? 'bg-amber-400 border border-amber-600' : 'bg-zinc-800 border border-zinc-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Purchase CTA */}
                  <div className="flex sm:flex-col items-end gap-2 w-full sm:w-auto justify-between sm:justify-center">
                    {!isMax ? (
                      <>
                        <div className="text-[10px] text-zinc-400 flex items-center gap-2">
                          <span className="text-amber-400 font-bold font-mono">{goldCost} Gold</span>
                          <span>·</span>
                          <span className="text-yellow-300 font-bold font-mono">{starCost}★ Req</span>
                        </div>

                        <button
                          disabled={!canAfford}
                          onClick={() => handlePurchaseUpgrade(def.id as keyof typeof progress.upgrades)}
                          className={`px-4 py-2 rounded text-xs font-black transition-all cursor-pointer ${
                            canAfford
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white pixel-gold-border active:scale-95 shadow-md'
                              : 'bg-zinc-800 border border-zinc-700 text-zinc-500 opacity-60 cursor-not-allowed'
                          }`}
                        >
                          Upgrade
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-black text-emerald-400 bg-emerald-950/60 px-3 py-1.5 rounded border border-emerald-700">
                        MAX LEVEL
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: SPECIAL ABILITIES */}
        {activeTab === 'abilities' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(Object.keys(SPECIAL_ABILITIES) as SpecialAbilityType[]).map((abilityKey) => {
              const ability = SPECIAL_ABILITIES[abilityKey];
              const isEquipped = progress.equippedAbility === abilityKey;

              return (
                <div
                  key={abilityKey}
                  className={`bg-zinc-900/90 border-2 p-4 rounded flex flex-col justify-between transition-all ${
                    isEquipped
                      ? 'border-amber-400 bg-amber-950/20 pixel-gold-border shadow-lg'
                      : 'border-zinc-700 pixel-box'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl">{ability.icon}</span>
                      {isEquipped && (
                        <span className="flex items-center gap-1 text-[9px] font-black text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-600">
                          <Check className="w-3 h-3" />
                          EQUIPPED
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-black text-amber-300 mb-1">
                      {ability.name}
                    </h3>

                    <p className="text-[10px] text-zinc-300 leading-relaxed mb-4">
                      {ability.description}
                    </p>

                    <div className="text-[9px] text-zinc-400 space-y-1 mb-4">
                      <div>Cooldown: <span className="text-white font-mono">{ability.cooldown}s</span></div>
                      {ability.damage && <div>Damage: <span className="text-red-400 font-mono">{ability.damage}</span></div>}
                      {ability.duration && <div>Duration: <span className="text-blue-400 font-mono">{ability.duration}s</span></div>}
                    </div>
                  </div>

                  <button
                    disabled={isEquipped}
                    onClick={() => handleEquipAbility(abilityKey)}
                    className={`w-full py-2.5 rounded text-xs font-black cursor-pointer ${
                      isEquipped
                        ? 'bg-zinc-800 text-zinc-500 cursor-default'
                        : 'bg-amber-600 hover:bg-amber-500 text-zinc-950 pixel-gold-border'
                    }`}
                  >
                    {isEquipped ? 'Active in Battle' : 'Equip Ability'}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: UNIT CODEX */}
        {activeTab === 'codex' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Object.values(UNIT_ROSTER).map((unit) => {
              const isUnlocked = progress.unlockedLevel >= unit.unlockLevel;

              return (
                <div
                  key={unit.id}
                  className={`bg-zinc-900/90 border-2 p-3 rounded pixel-box flex flex-col justify-between ${
                    isUnlocked ? 'border-zinc-700' : 'border-zinc-800 opacity-50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-amber-300">{unit.name}</span>
                      <span className="text-[9px] font-mono text-amber-400 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800">
                        {unit.cost} Gold
                      </span>
                    </div>

                    <p className="text-[9px] text-zinc-300 leading-relaxed mb-3">
                      {unit.description}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-1.5 text-[8px] bg-zinc-950/60 p-2 rounded border border-zinc-800 mb-2">
                      <div>HP: <span className="font-bold text-blue-400 font-mono">{unit.health}</span></div>
                      <div>DMG: <span className="font-bold text-red-400 font-mono">{unit.damage}</span></div>
                      <div>Range: <span className="font-bold text-zinc-300 font-mono">{unit.range}</span></div>
                      <div>Speed: <span className="font-bold text-emerald-400 font-mono">{unit.speed}</span></div>
                    </div>

                    <div className="text-[8px] text-amber-400/90 italic">
                      💡 {unit.counterDescription}
                    </div>
                  </div>

                  {!isUnlocked && (
                    <div className="mt-2 text-[8px] text-red-400 font-bold text-center border-t border-zinc-800 pt-1">
                      🔒 Unlocks at Level {unit.unlockLevel}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { PlayerProgress } from '../types/game';
import { soundEngine } from '../audio/soundEngine';
import { Shield, Sparkles, Trophy, Settings as SettingsIcon, Swords, HelpCircle, Volume2, VolumeX } from 'lucide-react';

interface MainMenuProps {
  progress: PlayerProgress;
  onStartCampaign: () => void;
  onOpenUpgrades: () => void;
  onOpenQuests: () => void;
  onOpenSettings: () => void;
  onOpenHowToPlay: () => void;
  onToggleSound: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  progress,
  onStartCampaign,
  onOpenUpgrades,
  onOpenQuests,
  onOpenSettings,
  onOpenHowToPlay,
  onToggleSound
}) => {
  const totalStars = Object.values(progress.levelStars).reduce((a, b) => a + b, 0);

  return (
    <div className="relative w-full h-full min-h-screen bg-zinc-950 flex flex-col items-center justify-between p-4 md:p-8 overflow-y-auto select-none">
      {/* Background Pixel Castle Art Backdrop */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/40 via-zinc-950/80 to-zinc-950 pointer-events-none" />

      {/* TOP BAR: Treasury, Stars, Audio */}
      <div className="relative z-10 w-full max-w-4xl flex items-center justify-between bg-zinc-900/90 border-2 border-zinc-700 px-4 py-2.5 rounded pixel-box">
        {/* Treasury */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs md:text-sm">
            <div className="w-5 h-5 bg-amber-400 border border-amber-600 rounded-full flex items-center justify-center text-xs text-amber-950 font-black">
              $
            </div>
            <span className="tabular-nums font-mono text-sm md:text-base">{progress.gold} Gold</span>
          </div>

          <div className="flex items-center gap-1.5 text-yellow-300 font-bold text-xs md:text-sm">
            <span className="text-base">⭐</span>
            <span className="tabular-nums font-mono text-sm md:text-base">{totalStars} Stars</span>
          </div>
        </div>

        {/* Audio Toggle */}
        <button
          onClick={() => {
            soundEngine.playButtonClick();
            onToggleSound();
          }}
          className="p-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 pixel-box cursor-pointer"
          title="Toggle Audio"
        >
          {progress.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
        </button>
      </div>

      {/* CENTER LOGO & HERO BANNER */}
      <div className="relative z-10 flex flex-col items-center text-center my-auto py-6">
        {/* Pixel Crown Icon */}
        <div className="text-4xl md:text-6xl mb-2 animate-bounce">
          👑
        </div>

        {/* Game Title */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 drop-shadow-[0_4px_0_#78350f] mb-2 pixel-font">
          KINGDOM WARS
        </h1>

        <p className="text-[10px] md:text-xs text-zinc-400 max-w-md uppercase tracking-wider mb-8">
          2D Pixel Art Lane Strategy & Siege Warfare
        </p>

        {/* Animated Battle Line Preview */}
        <div className="flex items-center justify-center gap-4 md:gap-8 bg-zinc-900/80 border-2 border-zinc-700 px-6 py-4 rounded-lg pixel-stone-border mb-8 max-w-lg w-full">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs md:text-sm">
            <span className="text-2xl">⚔️</span>
            <span>Blue Royal Army</span>
          </div>
          <span className="text-amber-500 font-black text-sm md:text-lg">VS</span>
          <div className="flex items-center gap-2 text-red-400 font-bold text-xs md:text-sm">
            <span>Crimson Horde</span>
            <span className="text-2xl">👹</span>
          </div>
        </div>

        {/* PRIMARY ACTION BUTTONS */}
        <div className="flex flex-col gap-3.5 w-full max-w-xs">
          {/* PLAY BUTTON */}
          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onStartCampaign();
            }}
            className="w-full py-3.5 md:py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm md:text-base rounded tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 pixel-gold-border shadow-lg"
          >
            <Swords className="w-5 h-5" />
            <span>PLAY CAMPAIGN</span>
          </button>

          {/* UPGRADES */}
          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onOpenUpgrades();
            }}
            className="w-full py-3 md:py-3.5 bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-bold text-xs md:text-sm rounded tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 pixel-box"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>ARMY & UPGRADES</span>
          </button>

          {/* DAILY QUESTS */}
          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onOpenQuests();
            }}
            className="w-full py-3 md:py-3.5 bg-zinc-800 hover:bg-zinc-700 text-yellow-400 font-bold text-xs md:text-sm rounded tracking-wide flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 pixel-box"
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>ROYAL DAILY QUESTS</span>
          </button>

          {/* HOW TO PLAY & SETTINGS */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                soundEngine.playButtonClick();
                onOpenHowToPlay();
              }}
              className="py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-[10px] md:text-xs rounded flex items-center justify-center gap-1.5 cursor-pointer pixel-box"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Guide</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playButtonClick();
                onOpenSettings();
              }}
              className="py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-[10px] md:text-xs rounded flex items-center justify-center gap-1.5 cursor-pointer pixel-box"
            >
              <SettingsIcon className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="relative z-10 text-[9px] text-zinc-600 text-center">
        Kingdom Wars · 800 Stages across 4 Biomes (200 per Biome) · Pixel Art Strategy
      </div>
    </div>
  );
};

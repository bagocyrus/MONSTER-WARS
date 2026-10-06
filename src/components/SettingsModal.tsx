import React from 'react';
import { PlayerProgress } from '../types/game';
import { soundEngine } from '../audio/soundEngine';
import { ArrowLeft, Volume2, VolumeX, Music, Shield, RotateCcw, Keyboard } from 'lucide-react';

interface SettingsModalProps {
  progress: PlayerProgress;
  onUpdateProgress: (newProgress: PlayerProgress) => void;
  onClose: () => void;
  onResetProgress: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  progress,
  onUpdateProgress,
  onClose,
  onResetProgress
}) => {
  return (
    <div className="relative w-full h-full min-h-screen bg-zinc-950 flex flex-col p-3 md:p-6 overflow-y-auto select-none">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-2 max-w-2xl mx-auto w-full mb-6 bg-zinc-900/90 border-2 border-zinc-700 p-2.5 rounded pixel-box">
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
          SETTINGS & CONTROLS
        </h1>

        <div className="w-16" />
      </div>

      <div className="max-w-2xl mx-auto w-full space-y-4 flex-1">
        {/* AUDIO SETTINGS */}
        <div className="bg-zinc-900/90 border-2 border-zinc-700 p-4 rounded pixel-box space-y-4">
          <h2 className="text-xs md:text-sm font-black text-amber-300">
            Audio & Sound FX
          </h2>

          {/* Sound FX Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-zinc-300">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>Sound Effects (SFX)</span>
            </div>
            <button
              onClick={() => {
                const nextVal = !progress.soundEnabled;
                soundEngine.toggleSfx(nextVal);
                onUpdateProgress({ ...progress, soundEnabled: nextVal });
                if (nextVal) soundEngine.playSpawn();
              }}
              className={`px-3 py-1.5 rounded text-xs font-black cursor-pointer pixel-box ${
                progress.soundEnabled ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {progress.soundEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Music Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-zinc-300">
              <Music className="w-4 h-4 text-blue-400" />
              <span>8-bit Background Music</span>
            </div>
            <button
              onClick={() => {
                const nextVal = !progress.musicEnabled;
                soundEngine.toggleMusic(nextVal);
                onUpdateProgress({ ...progress, musicEnabled: nextVal });
              }}
              className={`px-3 py-1.5 rounded text-xs font-black cursor-pointer pixel-box ${
                progress.musicEnabled ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {progress.musicEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Screen Shake */}
          <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
            <div className="flex items-center gap-2 text-xs text-zinc-300">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Screen Shake & Impact FX</span>
            </div>
            <button
              onClick={() => {
                soundEngine.playButtonClick();
                onUpdateProgress({ ...progress, screenShake: !progress.screenShake });
              }}
              className={`px-3 py-1.5 rounded text-xs font-black cursor-pointer pixel-box ${
                progress.screenShake ? 'bg-amber-600 text-zinc-950' : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              {progress.screenShake ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* KEYBOARD CONTROLS */}
        <div className="bg-zinc-900/90 border-2 border-zinc-700 p-4 rounded pixel-box space-y-3">
          <div className="flex items-center gap-2 text-xs md:text-sm font-black text-amber-300">
            <Keyboard className="w-4 h-4" />
            <span>Keyboard & Touch Controls</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-300 bg-zinc-950/60 p-3 rounded border border-zinc-800">
            <div><span className="text-amber-400 font-mono font-bold">[1 - 6]</span> : Spawn Units</div>
            <div><span className="text-amber-400 font-mono font-bold">[SPACE]</span> : Special Ability</div>
            <div><span className="text-amber-400 font-mono font-bold">[P]</span> : Pause / Resume</div>
            <div><span className="text-amber-400 font-mono font-bold">[S]</span> : Toggle Speed (1x/2x)</div>
            <div><span className="text-amber-400 font-mono font-bold">[Drag / Swipe]</span> : Pan Lane Camera</div>
            <div><span className="text-amber-400 font-mono font-bold">[Tap Buttons]</span> : Mobile 1-Thumb Play</div>
          </div>
        </div>

        {/* RESET PROGRESS */}
        <div className="bg-zinc-900/90 border-2 border-red-950 p-4 rounded pixel-box flex items-center justify-between">
          <div>
            <div className="text-xs font-black text-red-400 mb-0.5">Reset Campaign Data</div>
            <div className="text-[9px] text-zinc-500">Erase all stars, gold, and upgrade progress</div>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to reset all campaign progress? This cannot be undone.')) {
                onResetProgress();
              }
            }}
            className="px-3 py-2 bg-red-950/80 hover:bg-red-900 border border-red-700 text-red-300 text-xs font-bold rounded cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

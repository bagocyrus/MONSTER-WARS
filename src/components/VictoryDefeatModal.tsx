import React from 'react';
import { soundEngine } from '../audio/soundEngine';
import { getUnitUnlockAtLevel, UNIT_ROSTER } from '../data/gameData';
import { Trophy, RotateCcw, ArrowRight, Map, Skull, Sparkles, Clock, Coins, Award } from 'lucide-react';

interface VictoryDefeatModalProps {
  isVictory: boolean;
  starsEarned: number;
  goldEarned: number;
  levelId: number;
  totalGoldSpent: number;
  gameTime: number;
  unitSpawnCounts: Record<string, number>;
  unitKillCounts: Record<string, number>;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onRetry: () => void;
  onReturnToMap: () => void;
}

export const VictoryDefeatModal: React.FC<VictoryDefeatModalProps> = ({
  isVictory,
  starsEarned,
  goldEarned,
  levelId,
  totalGoldSpent,
  gameTime,
  unitSpawnCounts,
  unitKillCounts = {},
  hasNextLevel,
  onNextLevel,
  onRetry,
  onReturnToMap
}) => {
  const unlockedUnit = isVictory ? getUnitUnlockAtLevel(levelId) : null;

  // Compute Match Highlights & Kill Leaderboard
  const mins = Math.floor(gameTime / 60);
  const secs = Math.floor(gameTime % 60);
  const timeTakenStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

  let topUnit = 'None';
  let maxCount = 0;
  for (const [type, count] of Object.entries(unitSpawnCounts)) {
    if (count > maxCount) {
      maxCount = count;
      topUnit = UNIT_ROSTER[type]?.name || type;
    }
  }

  // Sorted Kill Leaderboard
  const killLeaderboard = Object.entries(unitKillCounts)
    .map(([type, kills]) => ({
      name: UNIT_ROSTER[type]?.name || type,
      type,
      kills
    }))
    .sort((a, b) => b.kills - a.kills)
    .slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div
        className={`w-full max-w-sm bg-zinc-950 p-5 md:p-6 rounded-lg border-4 flex flex-col items-center text-center shadow-2xl animate-in zoom-in-95 duration-200 ${
          isVictory ? 'border-amber-500 pixel-gold-border' : 'border-red-600 pixel-red-border'
        }`}
      >
        {/* Banner Header Icon */}
        <div className="text-4xl md:text-5xl mb-1.5">
          {isVictory ? '🏆' : '💀'}
        </div>

        {/* Title */}
        <h2
          className={`text-xl md:text-2xl font-black mb-1 pixel-font ${
            isVictory ? 'text-amber-400' : 'text-red-500'
          }`}
        >
          {isVictory ? 'VICTORY!' : 'DEFEAT!'}
        </h2>

        <p className="text-[10px] text-zinc-400 mb-2 uppercase tracking-wider">
          {isVictory ? `Stage ${levelId} Cleared` : `Castle Overrun on Stage ${levelId}`}
        </p>

        {/* UNLOCKED NEW UNIT BANNER */}
        {isVictory && levelId === 800 && (
          <div className="w-full bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-600 border-2 border-yellow-200 p-3 rounded my-2 animate-pulse text-zinc-950 font-black shadow-lg">
            <div className="text-sm font-black">👑 ULTIMATE CAMPAIGN MASTER! 👑</div>
            <div className="text-[9px] font-bold">You conquered all 800 stages across all 4 biomes and saved the realm!</div>
          </div>
        )}

        {unlockedUnit && (
          <div className="w-full bg-gradient-to-r from-amber-950 via-yellow-900 to-amber-950 border-2 border-yellow-400 p-2 rounded my-1.5 animate-bounce flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <div className="text-left">
              <span className="text-[8px] text-yellow-300 font-bold block">NEW UNIT UNLOCKED!</span>
              <span className="text-xs font-black text-white">{unlockedUnit.name.toUpperCase()}</span>
            </div>
          </div>
        )}

        {/* Stars Display (Victory only) */}
        {isVictory && (
          <div className="flex items-center gap-3 my-1">
            {[1, 2, 3].map((starIndex) => {
              const hasStar = starIndex <= starsEarned;
              return (
                <div
                  key={starIndex}
                  className={`text-2xl transition-all transform duration-300 ${
                    hasStar ? 'text-yellow-400 scale-110 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]' : 'text-zinc-700 opacity-40'
                  }`}
                >
                  ★
                </div>
              );
            })}
          </div>
        )}

        {/* Rewards Box */}
        <div className="w-full bg-zinc-900/90 border-2 border-zinc-800 p-2.5 rounded my-2 flex items-center justify-around text-xs">
          <div className="flex flex-col items-center">
            <span className="text-zinc-500 text-[9px]">Gold Earned</span>
            <span className="text-amber-400 font-black font-mono text-sm">+{goldEarned}G</span>
          </div>

          {isVictory && (
            <>
              <div className="w-px h-8 bg-zinc-800" />
              <div className="flex flex-col items-center">
                <span className="text-zinc-500 text-[9px]">Rating</span>
                <span className="text-yellow-300 font-black text-sm">{starsEarned} / 3 Stars</span>
              </div>
            </>
          )}
        </div>

        {/* MATCH HIGHLIGHTS */}
        <div className="w-full bg-zinc-900/80 border border-zinc-800 p-2.5 rounded mb-2 text-[10px] space-y-1 text-left">
          <div className="text-amber-400 font-black uppercase text-[8px] border-b border-zinc-800 pb-1 flex items-center gap-1">
            <Award className="w-3 h-3 text-amber-400" />
            <span>Match Highlights</span>
          </div>
          <div className="flex items-center justify-between text-zinc-300">
            <span>Most Deployed Unit:</span>
            <span className="font-bold text-white font-mono">{topUnit} ({maxCount}x)</span>
          </div>
          <div className="flex items-center justify-between text-zinc-300">
            <span>Total Gold Invested:</span>
            <span className="font-bold text-amber-400 font-mono">{totalGoldSpent}G</span>
          </div>
          <div className="flex items-center justify-between text-zinc-300">
            <span>Battle Duration:</span>
            <span className="font-bold text-emerald-400 font-mono">{timeTakenStr}</span>
          </div>
        </div>

        {/* UNIT KILL LEADERBOARD */}
        <div className="w-full bg-zinc-900/90 border border-zinc-800 p-2.5 rounded mb-3 text-[10px] text-left">
          <div className="text-amber-400 font-black uppercase text-[8px] border-b border-zinc-800 pb-1 flex items-center justify-between mb-1.5">
            <span className="flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-400" />
              <span>Unit Kill Leaderboard</span>
            </span>
            <span className="text-[7px] text-zinc-500 font-mono">MVP Troops</span>
          </div>
          {killLeaderboard.length > 0 ? (
            <div className="space-y-1">
              {killLeaderboard.map((item, idx) => (
                <div key={item.type} className="flex items-center justify-between text-zinc-300 font-mono">
                  <span className="flex items-center gap-1.5">
                    <span className="text-[11px]">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                    </span>
                    <span className="font-bold text-white">{item.name}</span>
                  </span>
                  <span className="font-black text-amber-400">{item.kills} Kills</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[9px] text-zinc-500 italic text-center py-0.5">
              No enemy kills recorded this match.
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 w-full">
          {isVictory && hasNextLevel && (
            <button
              onClick={() => {
                soundEngine.playButtonClick();
                onNextLevel();
              }}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs md:text-sm rounded flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95 pixel-gold-border"
            >
              <span>NEXT STAGE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onRetry();
            }}
            className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs rounded flex items-center justify-center gap-2 cursor-pointer pixel-box"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retry Stage</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playButtonClick();
              onReturnToMap();
            }}
            className="w-full py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold text-xs rounded flex items-center justify-center gap-2 cursor-pointer pixel-box"
          >
            <Map className="w-4 h-4" />
            <span>Campaign Map</span>
          </button>
        </div>
      </div>
    </div>
  );
};

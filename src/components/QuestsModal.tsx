import React from 'react';
import { PlayerProgress } from '../types/game';
import { DAILY_QUESTS, DailyQuest } from '../data/gameData';
import { soundEngine } from '../audio/soundEngine';
import { ArrowLeft, Trophy, CheckCircle, Sparkles, Award } from 'lucide-react';

interface QuestsModalProps {
  progress: PlayerProgress;
  onUpdateProgress: (newProg: PlayerProgress) => void;
  onClose: () => void;
}

export const QuestsModal: React.FC<QuestsModalProps> = ({
  progress,
  onUpdateProgress,
  onClose
}) => {
  const completedQuests = progress.completedQuests || {};

  const handleClaimReward = (quest: DailyQuest) => {
    soundEngine.playCoin();
    const updatedQuests = {
      ...completedQuests,
      [quest.id]: true
    };
    const newGold = progress.gold + quest.rewardGold;
    const newTokens = (progress.upgradeTokens || 0) + quest.rewardTokens;

    onUpdateProgress({
      ...progress,
      gold: newGold,
      upgradeTokens: newTokens,
      completedQuests: updatedQuests
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-lg bg-zinc-950 border-4 border-amber-600 rounded-lg p-5 md:p-6 flex flex-col shadow-2xl pixel-gold-border animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            <h2 className="text-lg md:text-xl font-black text-amber-400 pixel-font">
              ROYAL DAILY QUESTS
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-zinc-900 border border-amber-500/50 px-2.5 py-1 rounded text-xs font-bold text-amber-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{progress.upgradeTokens || 0} Tokens</span>
            </div>
            <button
              onClick={() => {
                soundEngine.playButtonClick();
                onClose();
              }}
              className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quests List */}
        <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1">
          {DAILY_QUESTS.map((quest) => {
            const isCompleted = !!completedQuests[quest.id];

            return (
              <div
                key={quest.id}
                className={`flex items-center justify-between p-3.5 rounded-lg border-2 ${
                  isCompleted
                    ? 'bg-zinc-900/50 border-emerald-900/50 opacity-80'
                    : 'bg-zinc-900 border-zinc-700'
                }`}
              >
                <div className="flex flex-col gap-1 pr-2">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-black text-xs md:text-sm text-zinc-100">
                      {quest.title}
                    </span>
                  </div>
                  <span className="text-[10px] md:text-xs text-zinc-400">
                    {quest.description}
                  </span>
                  <div className="flex items-center gap-3 mt-1 text-[10px] font-mono font-bold text-amber-300">
                    <span>+{quest.rewardGold} Gold</span>
                    <span>+{quest.rewardTokens} Upgrade Token{quest.rewardTokens > 1 ? 's' : ''}</span>
                  </div>
                </div>

                <div>
                  {isCompleted ? (
                    <div className="flex items-center gap-1 bg-emerald-950 border border-emerald-600 px-3 py-1.5 rounded text-emerald-400 text-xs font-bold">
                      <CheckCircle className="w-4 h-4" />
                      <span>Claimed</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleClaimReward(quest)}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-zinc-950 font-black text-xs rounded cursor-pointer transition-transform active:scale-95 shadow pixel-gold-border"
                    >
                      Claim Reward
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-zinc-800 text-[9px] text-zinc-500 text-center">
          Quests refresh daily. Complete milestones in campaign battles to claim rewards!
        </div>
      </div>
    </div>
  );
};

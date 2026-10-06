import React, { useState } from 'react';
import { Sparkles, X, Shield, ArrowRight } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface TutorialOverlayProps {
  onDismiss: () => void;
}

export const TutorialOverlay: React.FC<TutorialOverlayProps> = ({ onDismiss }) => {
  const [step, setStep] = useState(0);

  const tutorialSteps = [
    {
      title: 'STARTER ARMY: KNIGHT & ARCHER',
      text: 'You begin your campaign with the armored Knight and the long-range Archer! Gold generates automatically (+5.0G/s).',
      icon: '🛡️'
    },
    {
      title: 'TACTICAL FORMATION',
      text: 'Deploy your Knight [2] as a heavy shield wall to absorb enemy attacks, then deploy your Archer [1] right behind them to rain arrows from safety!',
      icon: '🏹'
    },
    {
      title: 'EARN GOLD & UNLOCK UNITS',
      text: 'Every level awards Gold! Spend it on permanent army upgrades. Clear Stage 3 to unlock the Swordsman, Stage 8 for the Mage, and advance through 200 stages in each biome!',
      icon: '💰'
    }
  ];

  const current = tutorialSteps[step];

  const handleNext = () => {
    soundEngine.playButtonClick();
    if (step < tutorialSteps.length - 1) {
      setStep(s => s + 1);
    } else {
      onDismiss();
    }
  };

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 max-w-md w-[92%] bg-zinc-950/95 border-2 border-amber-500 p-3 rounded-lg pixel-gold-border shadow-2xl pointer-events-auto">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 text-xs font-black text-amber-400">
          <span className="text-base">{current.icon}</span>
          <span>{current.title}</span>
        </div>
        <button
          onClick={() => {
            soundEngine.playButtonClick();
            onDismiss();
          }}
          className="text-zinc-500 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-[10px] sm:text-xs text-zinc-200 leading-relaxed mb-3">
        {current.text}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {tutorialSteps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${i === step ? 'bg-amber-400' : 'bg-zinc-700'}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="flex items-center gap-1 px-3 py-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-[10px] sm:text-xs rounded pixel-box cursor-pointer"
        >
          <span>{step < tutorialSteps.length - 1 ? 'Next' : 'Deploy Army!'}</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

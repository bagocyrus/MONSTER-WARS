import React from 'react';
import { soundEngine } from '../audio/soundEngine';
import { ArrowLeft, Swords, Shield, Zap, Sparkles } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="relative w-full h-full min-h-screen bg-zinc-950 flex flex-col p-3 md:p-6 overflow-y-auto select-none">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-2 max-w-3xl mx-auto w-full mb-4 bg-zinc-900/90 border-2 border-zinc-700 p-2.5 rounded pixel-box">
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
          HOW TO PLAY & TACTICS
        </h1>

        <div className="w-16" />
      </div>

      <div className="max-w-3xl mx-auto w-full space-y-4 flex-1">
        {/* CORE RULES */}
        <div className="bg-zinc-900/90 border-2 border-zinc-700 p-4 rounded pixel-box">
          <h2 className="text-xs md:text-sm font-black text-amber-300 mb-2">
            1. Core Objective & Lane Combat
          </h2>
          <p className="text-[10px] md:text-xs text-zinc-300 leading-relaxed mb-3">
            Two kingdoms face each other across a single horizontal battlefield. Your castle is on the left and the enemy castle is on the right. Spawn units to advance across the lane, defeat enemies in your way, and destroy their keep!
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
            <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800">
              <span className="text-amber-400 font-bold block mb-1">💰 Gold Economy</span>
              Gold generates every second and bonus gold is awarded whenever you eliminate enemy soldiers.
            </div>
            <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800">
              <span className="text-blue-400 font-bold block mb-1">🛡️ Army Deployment</span>
              Tap unit cards or press keys 1-6 to spawn units. Units advance automatically when the lane is clear.
            </div>
            <div className="bg-zinc-950 p-2.5 rounded border border-zinc-800">
              <span className="text-yellow-300 font-bold block mb-1">⭐ Star Ratings</span>
              Win with &gt;75% Castle HP to earn 3 Stars! Spend stars and gold on permanent army upgrades.
            </div>
          </div>
        </div>

        {/* ROCK PAPER SCISSORS COUNTERS */}
        <div className="bg-zinc-900/90 border-2 border-zinc-700 p-4 rounded pixel-box">
          <h2 className="text-xs md:text-sm font-black text-amber-300 mb-2">
            2. Tactical Matchups & Counters
          </h2>
          <div className="space-y-2 text-[10px] text-zinc-300">
            <div className="p-2 bg-zinc-950/60 rounded border border-zinc-800 flex items-center justify-between">
              <span className="font-bold text-blue-400">⚔️ Swordsman (50G)</span>
              <span>Cheap, fast vanguard · Closes distance to destroy fragile Archers.</span>
            </div>
            <div className="p-2 bg-zinc-950/60 rounded border border-zinc-800 flex items-center justify-between">
              <span className="font-bold text-blue-400">🏹 Archer (75G)</span>
              <span>Long-range bowman · Snipes slow Knights from behind frontline shields.</span>
            </div>
            <div className="p-2 bg-zinc-950/60 rounded border border-zinc-800 flex items-center justify-between">
              <span className="font-bold text-blue-400">🛡️ Knight (150G)</span>
              <span>Heavy armor vanguard · Soaks up massive damage and counters Swordsmen.</span>
            </div>
            <div className="p-2 bg-zinc-950/60 rounded border border-zinc-800 flex items-center justify-between">
              <span className="font-bold text-blue-400">🔮 Mage (200G)</span>
              <span>Arcane spellcaster · Deals area splash damage to annihilate clustered mobs.</span>
            </div>
            <div className="p-2 bg-zinc-950/60 rounded border border-zinc-800 flex items-center justify-between">
              <span className="font-bold text-blue-400">🎯 Catapult (250G)</span>
              <span>Siege engine · Heavy long range ballistic rocks crush enemy fortresses.</span>
            </div>
            <div className="p-2 bg-zinc-950/60 rounded border border-zinc-800 flex items-center justify-between">
              <span className="font-bold text-blue-400">🗿 Giant (400G)</span>
              <span>Supreme colossus · Massive HP & sweeping cleave attacks.</span>
            </div>
          </div>
        </div>

        {/* UNIT BESTIARY & LORE CODEX */}
        <div className="bg-zinc-900/90 border-2 border-zinc-700 p-4 rounded pixel-box">
          <h2 className="text-xs md:text-sm font-black text-amber-300 mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>4. Unit Bestiary & Lore Codex</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px] text-zinc-300">
            <div className="p-2.5 bg-zinc-950/80 rounded border border-zinc-800">
              <span className="font-bold text-amber-400 block mb-1">🏹 Archer (Starter Unit)</span>
              <p className="italic text-zinc-400 leading-relaxed">
                &quot;Trained in the whispering pine forests of the Green Plains. These marksmen can land a needle-sharp arrow at 300 paces over friendly battlelines.&quot;
              </p>
            </div>

            <div className="p-2.5 bg-zinc-950/80 rounded border border-zinc-800">
              <span className="font-bold text-amber-400 block mb-1">🛡️ Knight (Starter Unit)</span>
              <p className="italic text-zinc-400 leading-relaxed">
                &quot;Vanguards sworn to the Royal Blue Crest. Equipped with forged steel tower shields, they have stood firm against a thousand sieges.&quot;
              </p>
            </div>

            <div className="p-2.5 bg-zinc-950/80 rounded border border-zinc-800">
              <span className="font-bold text-amber-400 block mb-1">⚔️ Swordsman (Unlock: Stage 3)</span>
              <p className="italic text-zinc-400 leading-relaxed">
                &quot;Agile skirmishers recruited from elite foot-soldier guilds. They sprint across lanes to overwhelm enemy archers before they can notch a bow.&quot;
              </p>
            </div>

            <div className="p-2.5 bg-zinc-950/80 rounded border border-zinc-800">
              <span className="font-bold text-amber-400 block mb-1">🔮 Mage (Unlock: Stage 8)</span>
              <p className="italic text-zinc-400 leading-relaxed">
                &quot;Scholars of the arcane ivory tower who harness volatile starlight and primal mana into explosive orbs that vaporize enemy crowds.&quot;
              </p>
            </div>

            <div className="p-2.5 bg-zinc-950/80 rounded border border-zinc-800">
              <span className="font-bold text-amber-400 block mb-1">🎯 Catapult (Unlock: Stage 15)</span>
              <p className="italic text-zinc-400 leading-relaxed">
                &quot;Masterpieces of dwarven siege engineering. Each ballistic boulder is carved from solid granite to shatter fortress gates from afar.&quot;
              </p>
            </div>

            <div className="p-2.5 bg-zinc-950/80 rounded border border-zinc-800">
              <span className="font-bold text-amber-400 block mb-1">🗿 Giant (Unlock: Stage 25)</span>
              <p className="italic text-zinc-400 leading-relaxed">
                &quot;Colossal ancient titans awakened from the deep mountain bedrock. Their ground-shattering steps send shockwaves rippling across the battlefield.&quot;
              </p>
            </div>

            <div className="p-2.5 bg-zinc-950/80 rounded border border-zinc-800">
              <span className="font-bold text-amber-400 block mb-1">✨ Paladin (Unlock: Stage 100)</span>
              <p className="italic text-zinc-400 leading-relaxed">
                &quot;Holy crusaders radiating a golden aura of divine grace. Their presence heals wounds and empowers surrounding allied troops with holy zeal.&quot;
              </p>
            </div>

            <div className="p-2.5 bg-zinc-950/80 rounded border border-zinc-800">
              <span className="font-bold text-amber-400 block mb-1">🐉 Fire Dragon (Unlock: Stage 200)</span>
              <p className="italic text-zinc-400 leading-relaxed">
                &quot;Ancient legendary drakes of the volcanic peaks. They soar above the lane breathing incinerating dragonfire that melts armies to ash.&quot;
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

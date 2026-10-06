import React, { useState, useEffect, useRef } from 'react';
import { PlayerProgress, GameScreen } from './types/game';
import { INITIAL_PLAYER_PROGRESS, TOTAL_LEVELS } from './data/gameData';
import { GameEngine } from './engine/gameEngine';
import { GameCanvas } from './components/GameCanvas';
import { GameHUD } from './components/GameHUD';
import { MainMenu } from './components/MainMenu';
import { LevelSelect } from './components/LevelSelect';
import { UpgradesModal } from './components/UpgradesModal';
import { QuestsModal } from './components/QuestsModal';
import { SettingsModal } from './components/SettingsModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { VictoryDefeatModal } from './components/VictoryDefeatModal';
import { TutorialOverlay } from './components/TutorialOverlay';
import { soundEngine } from './audio/soundEngine';

const SAVE_KEY = 'kingdom_wars_save_v1';

export default function App() {
  // Load saved progress or default
  const [progress, setProgress] = useState<PlayerProgress>(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_PLAYER_PROGRESS,
          ...parsed,
          upgrades: {
            ...INITIAL_PLAYER_PROGRESS.upgrades,
            ...(parsed.upgrades || {})
          }
        };
      }
    } catch {
      // Ignore parse errors
    }
    return INITIAL_PLAYER_PROGRESS;
  });

  const [screen, setScreen] = useState<GameScreen | 'HOW_TO_PLAY' | 'QUESTS'>('MENU');
  const [activeLevelId, setActiveLevelId] = useState<number>(1);
  const [engine, setEngine] = useState<GameEngine | null>(null);
  const [modalResult, setModalResult] = useState<{
    isVictory: boolean;
    starsEarned: number;
    goldEarned: number;
  } | null>(null);
  const [showTutorial, setShowTutorial] = useState<boolean>(false);

  // Sync settings with soundEngine on load
  useEffect(() => {
    soundEngine.toggleSfx(progress.soundEnabled);
    soundEngine.toggleMusic(progress.musicEnabled);
    if (screen === 'MENU' || screen === 'LEVEL_SELECT' || screen === 'UPGRADES' || screen === 'SETTINGS' || screen === 'HOW_TO_PLAY') {
      soundEngine.playMusic('menu');
    }
  }, []);

  // Save progress changes to localStorage
  const updateProgress = (newProg: PlayerProgress) => {
    setProgress(newProg);
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(newProg));
    } catch {
      // Ignore storage errors
    }
  };

  // Start battle on specific level
  const handleStartLevel = (levelId: number) => {
    setActiveLevelId(levelId);
    setModalResult(null);

    const onGameOver = (victory: boolean, starsEarned: number, goldEarned: number) => {
      setModalResult({
        isVictory: victory,
        starsEarned,
        goldEarned
      });

      if (victory) {
        // Record stars & unlock next level
        const currentStars = progress.levelStars[levelId] || 0;
        const newStars = Math.max(currentStars, starsEarned);
        const nextLevel = Math.max(progress.unlockedLevel, Math.min(TOTAL_LEVELS, levelId + 1));

        updateProgress({
          ...progress,
          gold: progress.gold + goldEarned,
          unlockedLevel: nextLevel,
          levelStars: {
            ...progress.levelStars,
            [levelId]: newStars
          }
        });
      } else {
        // Consolation reward
        updateProgress({
          ...progress,
          gold: progress.gold + goldEarned
        });
      }
    };

    const newEngine = new GameEngine(levelId, progress, onGameOver);
    setEngine(newEngine);
    setScreen('PLAYING');

    if (levelId === 1 && !progress.hasSeenTutorial) {
      setShowTutorial(true);
    } else {
      setShowTutorial(false);
    }
  };

  const handleNextLevel = () => {
    const nextLvl = Math.min(TOTAL_LEVELS, activeLevelId + 1);
    handleStartLevel(nextLvl);
  };

  const handleRetryLevel = () => {
    handleStartLevel(activeLevelId);
  };

  const handleExitToMap = () => {
    if (engine) {
      engine.gameOver = true;
    }
    setEngine(null);
    setModalResult(null);
    setScreen('LEVEL_SELECT');
    soundEngine.playMusic('menu');
  };

  const handleBackToMenu = () => {
    if (engine) {
      engine.gameOver = true;
    }
    setEngine(null);
    setModalResult(null);
    setScreen('MENU');
    soundEngine.playMusic('menu');
  };

  const handleResetProgress = () => {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      // Ignore
    }
    setProgress(INITIAL_PLAYER_PROGRESS);
    setScreen('MENU');
    soundEngine.playMusic('menu');
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-zinc-950 font-sans text-white relative">
      {/* SCREEN 1: MAIN MENU */}
      {screen === 'MENU' && (
        <MainMenu
          progress={progress}
          onStartCampaign={() => {
            setScreen('LEVEL_SELECT');
            soundEngine.playMusic('menu');
          }}
          onOpenUpgrades={() => setScreen('UPGRADES')}
          onOpenQuests={() => setScreen('QUESTS')}
          onOpenSettings={() => setScreen('SETTINGS')}
          onOpenHowToPlay={() => setScreen('HOW_TO_PLAY')}
          onToggleSound={() => {
            const nextVal = !progress.soundEnabled;
            soundEngine.toggleSfx(nextVal);
            soundEngine.toggleMusic(nextVal);
            updateProgress({
              ...progress,
              soundEnabled: nextVal,
              musicEnabled: nextVal
            });
          }}
        />
      )}

      {/* SCREEN 2: LEVEL SELECT / CAMPAIGN MAP */}
      {screen === 'LEVEL_SELECT' && (
        <LevelSelect
          progress={progress}
          onSelectLevel={handleStartLevel}
          onBackToMenu={handleBackToMenu}
          onOpenUpgrades={() => setScreen('UPGRADES')}
        />
      )}

      {/* SCREEN 3: ACTIVE BATTLE PLAYING */}
      {screen === 'PLAYING' && engine && (
        <div className="relative w-full h-full">
          <GameCanvas engine={engine} />
          <GameHUD engine={engine} onExitToMap={handleExitToMap} />

          {/* Level 1 Tutorial Guide */}
          {showTutorial && (
            <TutorialOverlay
              onDismiss={() => {
                setShowTutorial(false);
                updateProgress({
                  ...progress,
                  hasSeenTutorial: true
                });
              }}
            />
          )}

          {/* Victory / Defeat Modal */}
          {modalResult && engine && (
            <VictoryDefeatModal
              isVictory={modalResult.isVictory}
              starsEarned={modalResult.starsEarned}
              goldEarned={modalResult.goldEarned}
              levelId={activeLevelId}
              totalGoldSpent={engine.totalGoldSpent}
              gameTime={engine.gameTime}
              unitSpawnCounts={engine.unitSpawnCounts}
              unitKillCounts={engine.unitKillCounts}
              hasNextLevel={activeLevelId < TOTAL_LEVELS}
              onNextLevel={handleNextLevel}
              onRetry={handleRetryLevel}
              onReturnToMap={handleExitToMap}
            />
          )}
        </div>
      )}

      {/* SCREEN 4: UPGRADES WORKSHOP */}
      {screen === 'UPGRADES' && (
        <UpgradesModal
          progress={progress}
          onUpdateProgress={updateProgress}
          onClose={() => setScreen('MENU')}
        />
      )}

      {/* SCREEN 4.5: DAILY QUESTS */}
      {screen === 'QUESTS' && (
        <QuestsModal
          progress={progress}
          onUpdateProgress={updateProgress}
          onClose={() => setScreen('MENU')}
        />
      )}

      {/* SCREEN 5: SETTINGS */}
      {screen === 'SETTINGS' && (
        <SettingsModal
          progress={progress}
          onUpdateProgress={updateProgress}
          onClose={() => setScreen('MENU')}
          onResetProgress={handleResetProgress}
        />
      )}

      {/* SCREEN 6: HOW TO PLAY */}
      {screen === 'HOW_TO_PLAY' && (
        <HowToPlayModal onClose={() => setScreen('MENU')} />
      )}
    </div>
  );
}

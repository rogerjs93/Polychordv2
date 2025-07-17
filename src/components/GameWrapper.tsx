import React, { useRef, useEffect } from 'react';
import Phaser from 'phaser';
import { VocabularyItem } from '../types';
import { useSpeech } from '../hooks/useSpeech';
import { GameFactory, GameType, BaseGame } from '../games';

interface GameWrapperProps {
  gameType: GameType;
  vocabulary: VocabularyItem[];
  onGameComplete: (score: number, accuracy: number) => void;
  nativeLanguage?: string;
  targetLanguage?: string;
}

const GameWrapper: React.FC<GameWrapperProps> = ({
  gameType,
  vocabulary,
  onGameComplete,
  nativeLanguage,
  targetLanguage
}) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGame = useRef<Phaser.Game | null>(null);
  
  // Only load voices for the languages being used in games, if provided
  const languageCodes = [];
  if (nativeLanguage) languageCodes.push(nativeLanguage);
  if (targetLanguage) languageCodes.push(targetLanguage);
  
  const { speak } = useSpeech({ languageCodes: languageCodes.length > 0 ? languageCodes : undefined });

  useEffect(() => {
    if (!gameRef.current || vocabulary.length === 0) return;

    if (phaserGame.current) {
      phaserGame.current.destroy(true);
      phaserGame.current = null;
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 900,
      height: 700,
      parent: gameRef.current,
      backgroundColor: '#f8fafc',
      scene: {
        preload: function() {
          const gameConfig = {
            vocabulary,
            onGameComplete,
            speak
          };
          
          const game = GameFactory.createGame(gameType, gameConfig);
          
          (this as Phaser.Scene & { gameInstance?: BaseGame }).gameInstance = game;
        },
        create: function() {
          const game = (this as Phaser.Scene & { gameInstance?: BaseGame }).gameInstance;
          if (game) {
            game.create(this);
          }
        }
      }
    };

    phaserGame.current = new Phaser.Game(config);

    return () => {
      if (phaserGame.current) {
        phaserGame.current.destroy(true);
        phaserGame.current = null;
      }
    };
  }, [gameType, vocabulary, onGameComplete, speak]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div ref={gameRef} className="w-full max-w-4xl mx-auto" />
    </div>
  );
};

export default GameWrapper;

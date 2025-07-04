import { BaseGame, GameConfig } from './BaseGame';
import { MatchingGame } from './MatchingGame';
import { MemoryGame } from './MemoryGame';
import { TypingGame } from './TypingGame';
import { ListeningGame } from './ListeningGame';
import { PuzzleGame } from './PuzzleGame';
import { QuizGame } from './QuizGame';

export type GameType = 'matching' | 'memory' | 'typing' | 'listening' | 'puzzle' | 'quiz';

export class GameFactory {
  static createGame(gameType: GameType, config: GameConfig): BaseGame {
    switch (gameType) {
      case 'matching':
        return new MatchingGame(config);
      case 'memory':
        return new MemoryGame(config);
      case 'typing':
        return new TypingGame(config);
      case 'listening':
        return new ListeningGame(config);
      case 'puzzle':
        return new PuzzleGame(config);
      case 'quiz':
        return new QuizGame(config);
      default:
        throw new Error(`Unknown game type: ${gameType}`);
    }
  }
}

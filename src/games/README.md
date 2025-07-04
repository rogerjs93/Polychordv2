# Games Organization

This directory contains all the individual game implementations that were previously in a single large `GameContainer.tsx` file. The games have been modularized for better organization, maintainability, and state management.

## Structure

```
src/games/
├── BaseGame.ts          # Abstract base class for all games
├── GameFactory.ts       # Factory pattern for game creation
├── MatchingGame.ts      # Word matching game implementation
├── MemoryGame.ts        # Memory card flip game implementation
├── TypingGame.ts        # Typing/translation input game implementation
├── ListeningGame.ts     # Audio listening comprehension game implementation
├── PuzzleGame.ts        # Word scramble/unscramble game implementation
├── QuizGame.ts          # Multiple choice quiz game implementation
└── index.ts             # Public exports for the games module
```

## Architecture

### BaseGame Class
- Abstract base class that provides common functionality
- Handles texture creation (buttons, cards, particles, etc.)
- Defines the interface that all games must implement
- Manages common game state and configuration

### Game Factory
- Uses the Factory pattern to create game instances
- Takes a game type and configuration
- Returns the appropriate game instance
- Centralizes game creation logic

### Individual Game Classes
Each game extends `BaseGame` and implements:
- Game-specific logic and UI
- Scoring systems
- Difficulty progression
- Visual feedback and animations
- Audio integration

## Benefits of This Organization

1. **Separation of Concerns**: Each game is self-contained with its own logic
2. **Maintainability**: Easier to modify individual games without affecting others
3. **Reusability**: Games can be easily reused or extended
4. **Testing**: Individual games can be tested in isolation
5. **Code Clarity**: Much easier to understand and debug specific game logic
6. **Team Development**: Multiple developers can work on different games simultaneously

## Usage

The games are used through the `GameContainer` component which:
1. Creates a Phaser game instance
2. Uses the GameFactory to create the appropriate game
3. Delegates the game creation to the specific game class

```typescript
// In GameContainer.tsx
const game = GameFactory.createGame(gameType, gameConfig);
game.create(scene);
```

## Game Types

- `matching`: Word-to-translation matching with difficulty progression
- `memory`: Memory card flip game with time pressure
- `typing`: Type the correct translation with virtual keyboard
- `listening`: Audio listening comprehension with multiple choice
- `puzzle`: Unscramble letters to form the correct translation
- `quiz`: Timed multiple choice questions with scoring

## State Management

Each game manages its own state including:
- Score and progress tracking
- User interactions and feedback
- Timer and difficulty systems
- Visual effects and animations

The games communicate with the parent component through the `onGameComplete` callback, providing the final score and accuracy metrics.

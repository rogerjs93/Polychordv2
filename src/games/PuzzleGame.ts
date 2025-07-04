import { BaseGame, GameConfig } from './BaseGame';

export class PuzzleGame extends BaseGame {
  constructor(config: GameConfig) {
    super(config);
  }

  create(scene: Phaser.Scene): void {
    this.createTextures(scene);
    this.createPuzzleGame(scene);
  }

  private createPuzzleGame(scene: Phaser.Scene): void {
    // Store reference to game instance methods for callbacks
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const gameInstance = this;
    const words = this.vocabulary.slice(0, 3);
    let currentWordIndex = 0;
    let score = 0;
    let correctAnswers = 0;

    // Game background panel
    scene.add.rectangle(450, 350, 860, 660, 0xf8fafc).setStrokeStyle(2, 0xe2e8f0);

    scene.add.text(450, 75, 'Unscramble the letters to form the correct translation!', {
      fontSize: '18px',
      color: '#6b7280'
    }).setOrigin(0.5);

    const scoreText = scene.add.text(80, 120, `Score: ${score}`, {
      fontSize: '20px',
      color: '#1f2937',
      fontStyle: 'bold'
    });

    const progressText = scene.add.text(80, 145, `Word: ${currentWordIndex + 1}/${words.length}`, {
      fontSize: '18px',
      color: '#1f2937'
    });

    let letterTiles: Phaser.GameObjects.Rectangle[] = [];
    let letterTexts: Phaser.GameObjects.Text[] = [];
    let answerSlots: Phaser.GameObjects.Rectangle[] = [];
    let answerTexts: Phaser.GameObjects.Text[] = [];
    let userAnswer: string[] = [];

    const createPuzzle = () => {
      const currentWord = words[currentWordIndex];
      
      // Show the word to translate
      scene.add.text(450, 170, `Translate: "${currentWord.word}"`, {
        fontSize: '28px',
        color: '#4f46e5',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // Scramble the translation
      const letters = currentWord.translation.toLowerCase().split('');
      const scrambledLetters = [...letters].sort(() => Math.random() - 0.5);
      
      userAnswer = new Array(letters.length).fill('');

      // Create letter tiles with better spacing
      scrambledLetters.forEach((letter, index) => {
        const x = 200 + index * 55;
        const y = 250;
        
        const tile = scene.add.rectangle(x, y, 45, 45, 0x3b82f6)
          .setStrokeStyle(2, 0x1d4ed8)
          .setInteractive();

        const text = scene.add.text(x, y, letter.toUpperCase(), {
          fontSize: '22px',
          color: '#ffffff',
          fontStyle: 'bold'
        }).setOrigin(0.5);

        tile.setData('letter', letter);
        tile.setData('originalIndex', index);
        tile.setData('used', false);

        tile.on('pointerdown', () => {
          if (tile.getData('used')) return;
          
          // Find first empty slot
          const emptySlotIndex = userAnswer.findIndex(slot => slot === '');
          if (emptySlotIndex !== -1) {
            userAnswer[emptySlotIndex] = letter;
            answerTexts[emptySlotIndex].setText(letter.toUpperCase());
            tile.setData('used', true);
            tile.setAlpha(0.5);
            
            // Check if puzzle is complete
            if (!userAnswer.includes('')) {
              checkPuzzle();
            }
          }
        });

        letterTiles.push(tile);
        letterTexts.push(text);
      });

      // Create answer slots with better spacing
      letters.forEach((_, index) => {
        const x = 250 + index * 55;
        const y = 350;
        
        const slot = scene.add.rectangle(x, y, 45, 45, 0xf3f4f6)
          .setStrokeStyle(2, 0xd1d5db)
          .setInteractive();

        const text = scene.add.text(x, y, '', {
          fontSize: '22px',
          color: '#1f2937',
          fontStyle: 'bold'
        }).setOrigin(0.5);

        slot.on('pointerdown', () => {
          if (userAnswer[index] !== '') {
            // Remove letter from slot
            const letter = userAnswer[index];
            userAnswer[index] = '';
            text.setText('');
            
            // Re-enable the corresponding tile
            const tile = letterTiles.find(t => 
              t.getData('letter') === letter && t.getData('used')
            );
            if (tile) {
              tile.setData('used', false);
              tile.setAlpha(1);
            }
          }
        });

        answerSlots.push(slot);
        answerTexts.push(text);
      });

      // Clear button
      const clearButton = scene.add.rectangle(450, 420, 110, 45, 0xef4444)
        .setStrokeStyle(2, 0xdc2626)
        .setInteractive();

      scene.add.text(450, 420, 'CLEAR', {
        fontSize: '18px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      clearButton.on('pointerdown', () => {
        userAnswer.fill('');
        answerTexts.forEach(text => text.setText(''));
        letterTiles.forEach(tile => {
          tile.setData('used', false);
          tile.setAlpha(1);
        });
      });
    };

    const checkPuzzle = () => {
      const currentWord = words[currentWordIndex];
      const userWord = userAnswer.join('');
      const isCorrect = userWord === currentWord.translation.toLowerCase();

      if (isCorrect) {
        correctAnswers++;
        score += 30;
        scoreText.setText(`Score: ${score}`);
        
        scene.add.text(450, 480, '✓ Correct!', {
          fontSize: '26px',
          color: '#10b981',
          fontStyle: 'bold'
        }).setOrigin(0.5);
      } else {
        scene.add.text(450, 480, `✗ Correct answer: ${currentWord.translation}`, {
          fontSize: '20px',
          color: '#ef4444',
          fontStyle: 'bold'
        }).setOrigin(0.5);
      }

      setTimeout(() => {
        currentWordIndex++;
        if (currentWordIndex < words.length) {
          // Clear everything and show next puzzle
          [...letterTiles, ...letterTexts, ...answerSlots, ...answerTexts].forEach(obj => obj.destroy());
          letterTiles = [];
          letterTexts = [];
          answerSlots = [];
          answerTexts = [];
          
          scene.children.list.forEach(child => {
            if (child instanceof Phaser.GameObjects.Text && 
                (child.text.includes('✓') || child.text.includes('✗') || child.text.includes('Translate:'))) {
              child.destroy();
            }
            if (child instanceof Phaser.GameObjects.Rectangle && 
                (child.fillColor === 0xef4444)) {
              child.destroy();
            }
          });
          
          progressText.setText(`Word: ${currentWordIndex + 1}/${words.length}`);
          createPuzzle();
        } else {
          // Game complete
          const accuracy = (correctAnswers / words.length) * 100;
          scene.add.text(450, 400, 'Game Complete!', {
            fontSize: '36px',
            color: '#4f46e5',
            fontStyle: 'bold'
          }).setOrigin(0.5);
          
          setTimeout(() => gameInstance.onGameComplete(score, accuracy), 2000);
        }
      }, 2000);
    };

    createPuzzle();
  }
}

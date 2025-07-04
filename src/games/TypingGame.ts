import { BaseGame, GameConfig } from './BaseGame';

export class TypingGame extends BaseGame {
  constructor(config: GameConfig) {
    super(config);
  }

  create(scene: Phaser.Scene): void {
    this.createTextures(scene);
    this.createTypingGame(scene);
  }

  private createTypingGame(scene: Phaser.Scene): void {
    // Store reference to game instance methods for callbacks
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const gameInstance = this;
    const words = this.vocabulary.slice(0, 5);
    let currentWordIndex = 0;
    let score = 0;
    let correctAnswers = 0;
    let userInput = '';

    // Game background panel
    scene.add.rectangle(450, 350, 860, 660, 0xf8fafc).setStrokeStyle(2, 0xe2e8f0);

    scene.add.text(450, 75, 'Type the translation of the word shown!', {
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

    const currentWordText = scene.add.text(450, 180, words[currentWordIndex].word, {
      fontSize: '40px',
      color: '#4f46e5',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    scene.add.rectangle(450, 250, 350, 55, 0xf3f4f6)
      .setStrokeStyle(2, 0xd1d5db);

    const inputText = scene.add.text(450, 250, '', {
      fontSize: '22px',
      color: '#1f2937'
    }).setOrigin(0.5);

    const hintText = scene.add.text(450, 300, `Hint: ${words[currentWordIndex].pronunciation}`, {
      fontSize: '16px',
      color: '#6b7280'
    }).setOrigin(0.5);

    // Create virtual keyboard with better spacing
    const keyboard = 'qwertyuiopasdfghjklzxcvbnm'.split('');
    const keyboardRows = [
      keyboard.slice(0, 10),
      keyboard.slice(10, 19),
      keyboard.slice(19, 26)
    ];

    const keys: Phaser.GameObjects.Rectangle[] = [];
    keyboardRows.forEach((row, rowIndex) => {
      row.forEach((letter, colIndex) => {
        const x = 180 + colIndex * 44 + (rowIndex * 22);
        const y = 380 + rowIndex * 55;
        
        const key = scene.add.rectangle(x, y, 38, 45, 0xe5e7eb)
          .setStrokeStyle(1, 0x9ca3af)
          .setInteractive();

        scene.add.text(x, y, letter.toUpperCase(), {
          fontSize: '18px',
          color: '#1f2937',
          fontStyle: 'bold'
        }).setOrigin(0.5);

        key.on('pointerdown', () => {
          userInput += letter;
          inputText.setText(userInput);
          key.setFillStyle(0xd1d5db);
          setTimeout(() => key.setFillStyle(0xe5e7eb), 100);
        });

        keys.push(key);
      });
    });

    // Backspace key
    const backspaceKey = scene.add.rectangle(650, 540, 90, 45, 0xfca5a5)
      .setStrokeStyle(1, 0xef4444)
      .setInteractive();

    scene.add.text(650, 540, 'DELETE', {
      fontSize: '14px',
      color: '#dc2626',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    backspaceKey.on('pointerdown', () => {
      userInput = userInput.slice(0, -1);
      inputText.setText(userInput);
      backspaceKey.setFillStyle(0xf87171);
      setTimeout(() => backspaceKey.setFillStyle(0xfca5a5), 100);
    });

    // Submit key
    const submitKey = scene.add.rectangle(760, 540, 90, 45, 0x86efac)
      .setStrokeStyle(1, 0x10b981)
      .setInteractive();

    scene.add.text(760, 540, 'SUBMIT', {
      fontSize: '14px',
      color: '#059669',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    submitKey.on('pointerdown', () => checkAnswer.call(scene));

    const checkAnswer = function(this: Phaser.Scene) {
      const currentWord = words[currentWordIndex];
      const isCorrect = userInput.toLowerCase().trim() === currentWord.translation.toLowerCase().trim();

      if (isCorrect) {
        correctAnswers++;
        score += 20;
        scoreText.setText(`Score: ${score}`);
        
        this.add.text(450, 320, '✓ Correct!', {
          fontSize: '26px',
          color: '#10b981',
          fontStyle: 'bold'
        }).setOrigin(0.5);
      } else {
        this.add.text(450, 320, `✗ Correct answer: ${currentWord.translation}`, {
          fontSize: '20px',
          color: '#ef4444',
          fontStyle: 'bold'
        }).setOrigin(0.5);
      }

      setTimeout(() => {
        currentWordIndex++;
        if (currentWordIndex < words.length) {
          // Next word
          currentWordText.setText(words[currentWordIndex].word);
          hintText.setText(`Hint: ${words[currentWordIndex].pronunciation}`);
          progressText.setText(`Word: ${currentWordIndex + 1}/${words.length}`);
          userInput = '';
          inputText.setText('');
          
          // Clear feedback
          this.children.list.forEach(child => {
            if (child instanceof Phaser.GameObjects.Text && 
                (child.text.includes('✓') || child.text.includes('✗'))) {
              child.destroy();
            }
          });
        } else {
          // Game complete
          const accuracy = (correctAnswers / words.length) * 100;
          this.add.text(450, 400, 'Game Complete!', {
            fontSize: '36px',
            color: '#4f46e5',
            fontStyle: 'bold'
          }).setOrigin(0.5);
          
          setTimeout(() => gameInstance.onGameComplete(score, accuracy), 2000);
        }
      }, 2000);
    };
  }
}

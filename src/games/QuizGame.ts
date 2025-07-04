import { BaseGame, GameConfig } from './BaseGame';

export class QuizGame extends BaseGame {
  constructor(config: GameConfig) {
    super(config);
  }

  create(scene: Phaser.Scene): void {
    this.createTextures(scene);
    this.createQuizGame(scene);
  }

  private createQuizGame(scene: Phaser.Scene): void {
    // Store reference to game instance methods for callbacks
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const gameInstance = this;
    const words = this.vocabulary.slice(0, 5);
    let currentQuestionIndex = 0;
    let score = 0;
    let correctAnswers = 0;
    let timeLeft = 30; // 30 seconds per question
    let timer: Phaser.Time.TimerEvent;

    // Game background panel
    scene.add.rectangle(450, 350, 860, 660, 0xf8fafc).setStrokeStyle(2, 0xe2e8f0);

    scene.add.text(450, 75, 'Quick Quiz - Answer as fast as you can!', {
      fontSize: '18px',
      color: '#6b7280'
    }).setOrigin(0.5);

    const scoreText = scene.add.text(80, 120, `Score: ${score}`, {
      fontSize: '20px',
      color: '#1f2937',
      fontStyle: 'bold'
    });

    const progressText = scene.add.text(80, 145, `Question: ${currentQuestionIndex + 1}/${words.length}`, {
      fontSize: '18px',
      color: '#1f2937'
    });

    const timerText = scene.add.text(720, 120, `Time: ${timeLeft}s`, {
      fontSize: '20px',
      color: '#ef4444',
      fontStyle: 'bold'
    });

    let questionButtons: Phaser.GameObjects.Rectangle[] = [];
    let questionTexts: Phaser.GameObjects.Text[] = [];

    const createQuestion = () => {
      const currentWord = words[currentQuestionIndex];
      timeLeft = 30;
      
      // Question types: 1 = word->translation, 2 = translation->word
      const questionType = Math.random() > 0.5 ? 1 : 2;
      
      let questionText: string;
      let correctAnswer: string;
      let options: string[] = [];

      if (questionType === 1) {
        questionText = `What is the translation of "${currentWord.word}"?`;
        correctAnswer = currentWord.translation;
        options = [correctAnswer];
        
        // Add wrong answers
        const otherWords = words.filter(w => w.id !== currentWord.id);
        while (options.length < 4 && otherWords.length > 0) {
          const randomWord = otherWords.splice(Math.floor(Math.random() * otherWords.length), 1)[0];
          options.push(randomWord.translation);
        }
      } else {
        questionText = `What word translates to "${currentWord.translation}"?`;
        correctAnswer = currentWord.word;
        options = [correctAnswer];
        
        // Add wrong answers
        const otherWords = words.filter(w => w.id !== currentWord.id);
        while (options.length < 4 && otherWords.length > 0) {
          const randomWord = otherWords.splice(Math.floor(Math.random() * otherWords.length), 1)[0];
          options.push(randomWord.word);
        }
      }

      // Shuffle options
      options.sort(() => Math.random() - 0.5);

      // Display question
      scene.add.text(450, 180, questionText, {
        fontSize: '22px',
        color: '#1f2937',
        fontStyle: 'bold',
        wordWrap: { width: 700 }
      }).setOrigin(0.5);

      // Create answer buttons with better spacing
      options.forEach((option, index) => {
        const x = 280 + (index % 2) * 340;
        const y = 280 + Math.floor(index / 2) * 90;
        
        const button = scene.add.rectangle(x, y, 200, 70, 0xe5e7eb)
          .setStrokeStyle(2, 0x9ca3af)
          .setInteractive();

        const text = scene.add.text(x, y, option, {
          fontSize: '18px',
          color: '#1f2937',
          fontStyle: 'bold',
          wordWrap: { width: 180 }
        }).setOrigin(0.5);

        button.on('pointerdown', () => {
          const isCorrect = option === correctAnswer;
          const timeBonus = Math.max(0, timeLeft - 10); // Bonus for quick answers
          
          if (isCorrect) {
            correctAnswers++;
            score += 20 + timeBonus;
            scoreText.setText(`Score: ${score}`);
            
            button.setFillStyle(0x10b981);
            
            scene.add.text(450, 450, `✓ Correct! (+${20 + timeBonus} points)`, {
              fontSize: '22px',
              color: '#10b981',
              fontStyle: 'bold'
            }).setOrigin(0.5);
          } else {
            button.setFillStyle(0xef4444);
            
            scene.add.text(450, 450, `✗ Correct answer: ${correctAnswer}`, {
              fontSize: '20px',
              color: '#ef4444',
              fontStyle: 'bold'
            }).setOrigin(0.5);
          }

          // Stop timer and disable buttons
          if (timer) timer.destroy();
          questionButtons.forEach(btn => btn.disableInteractive());

          setTimeout(() => nextQuestion(), 2000);
        });

        button.on('pointerover', () => {
          if (button.input?.enabled) button.setFillStyle(0xf3f4f6);
        });

        button.on('pointerout', () => {
          if (button.input?.enabled) button.setFillStyle(0xe5e7eb);
        });

        questionButtons.push(button);
        questionTexts.push(text);
      });

      // Start timer
      timer = scene.time.addEvent({
        delay: 1000,
        callback: () => {
          timeLeft--;
          timerText.setText(`Time: ${timeLeft}s`);
          
          if (timeLeft <= 0) {
            // Time's up
            scene.add.text(450, 450, '⏰ Time\'s up!', {
              fontSize: '22px',
              color: '#ef4444',
              fontStyle: 'bold'
            }).setOrigin(0.5);
            
            questionButtons.forEach(btn => btn.disableInteractive());
            setTimeout(() => nextQuestion(), 2000);
          }
        },
        repeat: 29
      });
    };

    const nextQuestion = () => {
      currentQuestionIndex++;
      if (currentQuestionIndex < words.length) {
        // Clear previous question
        questionButtons.forEach(btn => btn.destroy());
        questionTexts.forEach(txt => txt.destroy());
        questionButtons = [];
        questionTexts = [];
        
        scene.children.list.forEach(child => {
          if (child instanceof Phaser.GameObjects.Text && 
              (child.text.includes('✓') || child.text.includes('✗') || 
               child.text.includes('What is') || child.text.includes('What word') ||
               child.text.includes('Time\'s up'))) {
            child.destroy();
          }
        });
        
        progressText.setText(`Question: ${currentQuestionIndex + 1}/${words.length}`);
        createQuestion();
      } else {
        // Game complete
        const accuracy = (correctAnswers / words.length) * 100;
        scene.add.text(450, 350, 'Quiz Complete!', {
          fontSize: '36px',
          color: '#4f46e5',
          fontStyle: 'bold'
        }).setOrigin(0.5);
        
        scene.add.text(450, 390, `Final Score: ${score} points`, {
          fontSize: '22px',
          color: '#1f2937',
          fontStyle: 'bold'
        }).setOrigin(0.5);
        
        setTimeout(() => gameInstance.onGameComplete(score, accuracy), 2000);
      }
    };

    createQuestion();
  }
}

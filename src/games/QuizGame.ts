import { BaseGame, GameConfig } from './BaseGame';

export class QuizGame extends BaseGame {
  private particles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private backgroundContainer!: Phaser.GameObjects.Container;
  private hudContainer!: Phaser.GameObjects.Container;
  private gameContainer!: Phaser.GameObjects.Container;
  private timerBar!: Phaser.GameObjects.Graphics;
  private timerBarBg!: Phaser.GameObjects.Graphics;

  constructor(config: GameConfig) {
    super(config);
  }

  create(scene: Phaser.Scene): void {
    this.createTextures(scene);
    this.createAdvancedBackground(scene);
    this.createParticleSystem(scene);
    this.createQuizGame(scene);
  }

  private createAdvancedBackground(scene: Phaser.Scene): void {
    // Main background container
    this.backgroundContainer = scene.add.container(450, 350);
    
    // Multi-layered gradient background
    const mainBg = scene.add.graphics();
    mainBg.fillGradientStyle(0xfef7ff, 0xfef7ff, 0xfdf2f8, 0xfdf2f8, 1);
    mainBg.fillRoundedRect(-430, -330, 860, 660, 20);
    
    // Shadow layer for depth
    const shadowBg = scene.add.graphics();
    shadowBg.fillStyle(0x000000, 0.1);
    shadowBg.fillRoundedRect(-425, -325, 850, 650, 18);
    
    // Subtle pattern overlay with quiz-themed elements
    const patternOverlay = scene.add.graphics();
    patternOverlay.lineStyle(1, 0xe879f9, 0.15);
    for (let i = -400; i < 400; i += 80) {
      for (let j = -300; j < 300; j += 80) {
        // Create question mark patterns
        patternOverlay.strokeCircle(i, j, 12);
        patternOverlay.strokeCircle(i + 40, j + 40, 8);
      }
    }
    
    this.backgroundContainer.add([shadowBg, mainBg, patternOverlay]);
  }

  private createParticleSystem(scene: Phaser.Scene): void {
    // Create multiple particle textures for different effects
    const sparkleGraphics = scene.add.graphics();
    sparkleGraphics.fillStyle(0xffd700, 1);
    sparkleGraphics.fillCircle(4, 4, 4);
    sparkleGraphics.generateTexture('quiz-sparkle', 8, 8);
    sparkleGraphics.destroy();
    
    const starGraphics = scene.add.graphics();
    starGraphics.fillStyle(0xff6b6b, 1);
    starGraphics.beginPath();
    starGraphics.moveTo(0, -6);
    starGraphics.lineTo(2, -2);
    starGraphics.lineTo(6, 0);
    starGraphics.lineTo(2, 2);
    starGraphics.lineTo(0, 6);
    starGraphics.lineTo(-2, 2);
    starGraphics.lineTo(-6, 0);
    starGraphics.lineTo(-2, -2);
    starGraphics.closePath();
    starGraphics.fillPath();
    starGraphics.generateTexture('quiz-star', 12, 12);
    starGraphics.destroy();
    
    // Success particle system
    this.particles = scene.add.particles(0, 0, 'quiz-sparkle', {
      speed: { min: 80, max: 200 },
      lifespan: 1200,
      alpha: { start: 1, end: 0 },
      scale: { start: 0.8, end: 0.1 },
      quantity: 8,
      emitting: false
    });
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

    // Enhanced title with effects
    const titleText = scene.add.text(450, 75, '⚡ Quick Quiz Challenge', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold',
      shadow: {
        offsetX: 3,
        offsetY: 3,
        color: '#a855f7',
        blur: 6,
        stroke: true,
        fill: true
      }
    }).setOrigin(0.5);

    // Add pulsing animation to title
    scene.tweens.add({
      targets: titleText,
      scale: { from: 1, to: 1.08 },
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Enhanced subtitle
    scene.add.text(450, 115, 'Answer as fast as you can for bonus points!', {
      fontSize: '18px',
      color: '#7c3aed',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // Enhanced HUD with modern design
    this.hudContainer = scene.add.container(80, 160);
    
    // Score panel with gradient background
    const scoreBg = scene.add.graphics();
    scoreBg.fillGradientStyle(0x10b981, 0x10b981, 0x059669, 0x059669, 1);
    scoreBg.fillRoundedRect(-10, -25, 200, 50, 15);
    scoreBg.lineStyle(2, 0x34d399, 0.8);
    scoreBg.strokeRoundedRect(-10, -25, 200, 50, 15);
    
    const scoreIcon = scene.add.text(5, 0, '🏆', { fontSize: '20px' }).setOrigin(0.5);
    const scoreText = scene.add.text(35, 0, `Score: ${score}`, {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
      shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 2 }
    }).setOrigin(0, 0.5);
    
    this.hudContainer.add([scoreBg, scoreIcon, scoreText]);

    // Progress panel
    const progressBg = scene.add.graphics();
    progressBg.fillGradientStyle(0x3b82f6, 0x3b82f6, 0x1d4ed8, 0x1d4ed8, 1);
    progressBg.fillRoundedRect(-10, 35, 200, 40, 12);
    progressBg.lineStyle(2, 0x60a5fa, 0.8);
    progressBg.strokeRoundedRect(-10, 35, 200, 40, 12);
    
    const progressIcon = scene.add.text(5, 55, '📈', { fontSize: '16px' }).setOrigin(0.5);
    const progressText = scene.add.text(30, 55, `Question: ${currentQuestionIndex + 1}/${words.length}`, {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
      shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 2 }
    }).setOrigin(0, 0.5);
    
    this.hudContainer.add([progressBg, progressIcon, progressText]);

    // Enhanced timer display
    const timerContainer = scene.add.container(720, 160);
    
    // Timer background
    const timerBg = scene.add.graphics();
    timerBg.fillGradientStyle(0xef4444, 0xef4444, 0xdc2626, 0xdc2626, 1);
    timerBg.fillRoundedRect(-65, -25, 130, 50, 15);
    timerBg.lineStyle(2, 0xf87171, 0.8);
    timerBg.strokeRoundedRect(-65, -25, 130, 50, 15);
    
    const timerIcon = scene.add.text(-35, 0, '⏰', { fontSize: '20px' }).setOrigin(0.5);
    const timerText = scene.add.text(5, 0, `${timeLeft}s`, {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
      shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 2 }
    }).setOrigin(0, 0.5);
    
    timerContainer.add([timerBg, timerIcon, timerText]);

    // Timer bar background
    this.timerBarBg = scene.add.graphics();
    this.timerBarBg.fillStyle(0x374151, 0.3);
    this.timerBarBg.fillRoundedRect(620, 185, 200, 8, 4);
    
    // Timer bar fill
    this.timerBar = scene.add.graphics();
    this.timerBar.fillGradientStyle(0x10b981, 0x10b981, 0xf59e0b, 0xf59e0b, 1);
    this.timerBar.fillRoundedRect(620, 185, 200, 8, 4);

    // Game area container
    this.gameContainer = scene.add.container(450, 350);

    let questionButtons: Phaser.GameObjects.Container[] = [];

    // Store references for updates
    const scoreTextRef = scoreText;
    const progressTextRef = progressText;
    const timerTextRef = timerText;

    const updateTimerBar = (timeRemaining: number) => {
      const progress = timeRemaining / 30;
      const width = 200 * progress;
      this.timerBar.clear();
      
      // Change color based on time remaining
      if (progress > 0.6) {
        this.timerBar.fillGradientStyle(0x10b981, 0x10b981, 0x059669, 0x059669, 1);
      } else if (progress > 0.3) {
        this.timerBar.fillGradientStyle(0xf59e0b, 0xf59e0b, 0xd97706, 0xd97706, 1);
      } else {
        this.timerBar.fillGradientStyle(0xef4444, 0xef4444, 0xdc2626, 0xdc2626, 1);
      }
      
      this.timerBar.fillRoundedRect(620, 185, width, 8, 4);
    };

    const createQuestion = () => {
      const currentWord = words[currentQuestionIndex];
      timeLeft = 30;
      updateTimerBar(timeLeft);
      
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

      // Enhanced question display
      const questionBg = scene.add.graphics();
      questionBg.fillGradientStyle(0x6366f1, 0x6366f1, 0x4f46e5, 0x4f46e5, 1);
      questionBg.fillRoundedRect(200, 220, 500, 70, 15);
      questionBg.lineStyle(2, 0x8b5cf6, 0.8);
      questionBg.strokeRoundedRect(200, 220, 500, 70, 15);

      scene.add.text(450, 255, questionText, {
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold',
        wordWrap: { width: 450 },
        shadow: { offsetX: 2, offsetY: 2, color: '#312e81', blur: 3 }
      }).setOrigin(0.5);

      // Create enhanced answer buttons
      options.forEach((option, index) => {
        const x = 280 + (index % 2) * 340;
        const y = 340 + Math.floor(index / 2) * 100;
        
        const buttonContainer = scene.add.container(x, y);
        
        // Shadow layer
        const buttonShadow = scene.add.graphics();
        buttonShadow.fillStyle(0x000000, 0.2);
        buttonShadow.fillRoundedRect(-102, -37, 204, 74, 12);
        
        // Main button with gradient
        const button = scene.add.graphics();
        button.fillGradientStyle(0xf8fafc, 0xf8fafc, 0xf1f5f9, 0xf1f5f9, 1);
        button.fillRoundedRect(-105, -40, 210, 80, 12);
        button.lineStyle(2, 0xd1d5db, 0.8);
        button.strokeRoundedRect(-105, -40, 210, 80, 12);
        
        // Glow effect (initially hidden)
        const buttonGlow = scene.add.graphics();
        buttonGlow.lineStyle(6, 0x60a5fa, 0.6);
        buttonGlow.strokeRoundedRect(-108, -43, 216, 86, 15);
        buttonGlow.setVisible(false);
        
        const text = scene.add.text(0, 0, option, {
          fontSize: '16px',
          color: '#1f2937',
          fontStyle: 'bold',
          wordWrap: { width: 180 },
          shadow: { offsetX: 1, offsetY: 1, color: '#f8fafc', blur: 1 }
        }).setOrigin(0.5);

        buttonContainer.add([buttonShadow, button, buttonGlow, text]);
        buttonContainer.setSize(210, 80);
        buttonContainer.setInteractive();
        
        // Store data and references
        buttonContainer.setData('option', option);
        buttonContainer.setData('button', button);
        buttonContainer.setData('glow', buttonGlow);
        buttonContainer.setData('text', text);
        buttonContainer.setData('correctAnswer', correctAnswer);

        // Enhanced hover effects
        buttonContainer.on('pointerover', () => {
          if (buttonContainer.input?.enabled) {
            buttonGlow.setVisible(true);
            scene.tweens.add({
              targets: buttonContainer,
              scale: { from: 1, to: 1.05 },
              duration: 200,
              ease: 'Back.easeOut'
            });
          }
        });

        buttonContainer.on('pointerout', () => {
          if (buttonContainer.input?.enabled) {
            buttonGlow.setVisible(false);
            scene.tweens.add({
              targets: buttonContainer,
              scale: { from: buttonContainer.scale, to: 1 },
              duration: 200,
              ease: 'Back.easeOut'
            });
          }
        });

        buttonContainer.on('pointerdown', () => {
          if (!buttonContainer.input?.enabled) return;
          
          // Press animation
          scene.tweens.add({
            targets: buttonContainer,
            scale: { from: 1.05, to: 0.95 },
            duration: 100,
            yoyo: true,
            ease: 'Power2'
          });
          
          const isCorrect = option === correctAnswer;
          const timeBonus = Math.max(0, timeLeft - 10); // Bonus for quick answers
          
          // Disable all buttons
          questionButtons.forEach(btn => {
            btn.disableInteractive();
            const btnGlow = btn.getData('glow');
            if (btnGlow) btnGlow.setVisible(false);
          });
          
          if (isCorrect) {
            correctAnswers++;
            score += 20 + timeBonus;
            scoreTextRef.setText(`Score: ${score}`);
            
            // Success feedback
            button.clear();
            button.fillGradientStyle(0x10b981, 0x10b981, 0x059669, 0x059669, 1);
            button.fillRoundedRect(-105, -40, 210, 80, 12);
            button.lineStyle(2, 0x34d399, 0.8);
            button.strokeRoundedRect(-105, -40, 210, 80, 12);
            
            text.setColor('#ffffff');
            
            // Particle effects
            this.particles.emitParticleAt(x, y, 12);
            
            // Success message
            const successContainer = scene.add.container(450, 480);
            const successBg = scene.add.graphics();
            successBg.fillGradientStyle(0x10b981, 0x10b981, 0x059669, 0x059669, 1);
            successBg.fillRoundedRect(-150, -25, 300, 50, 15);
            successBg.lineStyle(2, 0x34d399, 0.8);
            successBg.strokeRoundedRect(-150, -25, 300, 50, 15);
            
            const successText = scene.add.text(0, 0, `🎉 Correct! +${20 + timeBonus} points`, {
              fontSize: '20px',
              color: '#ffffff',
              fontStyle: 'bold',
              shadow: { offsetX: 2, offsetY: 2, color: '#065f46', blur: 3 }
            }).setOrigin(0.5);
            
            successContainer.add([successBg, successText]);
            
            // Animate button success
            scene.tweens.add({
              targets: buttonContainer,
              scale: { from: 0.95, to: 1.1 },
              duration: 400,
              ease: 'Back.easeOut'
            });
            
            // Speak the correct answer
            this.speak(correctAnswer, 'en');
            
          } else {
            // Error feedback
            button.clear();
            button.fillGradientStyle(0xef4444, 0xef4444, 0xdc2626, 0xdc2626, 1);
            button.fillRoundedRect(-105, -40, 210, 80, 12);
            button.lineStyle(2, 0xf87171, 0.8);
            button.strokeRoundedRect(-105, -40, 210, 80, 12);
            
            text.setColor('#ffffff');
            
            // Highlight correct answer
            const correctButton = questionButtons.find(btn => btn.getData('option') === correctAnswer);
            if (correctButton) {
              const correctBtnGraphics = correctButton.getData('button');
              const correctBtnText = correctButton.getData('text');
              
              correctBtnGraphics.clear();
              correctBtnGraphics.fillGradientStyle(0x10b981, 0x10b981, 0x059669, 0x059669, 1);
              correctBtnGraphics.fillRoundedRect(-105, -40, 210, 80, 12);
              correctBtnGraphics.lineStyle(2, 0x34d399, 0.8);
              correctBtnGraphics.strokeRoundedRect(-105, -40, 210, 80, 12);
              
              correctBtnText.setColor('#ffffff');
              
              // Pulse animation for correct answer
              scene.tweens.add({
                targets: correctButton,
                scale: { from: 1, to: 1.1 },
                duration: 300,
                yoyo: true,
                repeat: 2,
                ease: 'Sine.easeInOut'
              });
            }
            
            // Error message
            const errorContainer = scene.add.container(450, 480);
            const errorBg = scene.add.graphics();
            errorBg.fillGradientStyle(0xef4444, 0xef4444, 0xdc2626, 0xdc2626, 1);
            errorBg.fillRoundedRect(-180, -25, 360, 50, 15);
            errorBg.lineStyle(2, 0xf87171, 0.8);
            errorBg.strokeRoundedRect(-180, -25, 360, 50, 15);
            
            const errorText = scene.add.text(0, 0, `❌ Correct answer: ${correctAnswer}`, {
              fontSize: '18px',
              color: '#ffffff',
              fontStyle: 'bold',
              shadow: { offsetX: 2, offsetY: 2, color: '#991b1b', blur: 3 }
            }).setOrigin(0.5);
            
            errorContainer.add([errorBg, errorText]);
            
            // Shake animation for wrong answer
            scene.tweens.add({
              targets: this.gameContainer,
              x: { from: 450, to: 460 },
              duration: 50,
              yoyo: true,
              repeat: 5
            });
            
            // Speak the correct answer
            this.speak(correctAnswer, 'en');
          }

          // Stop timer
          if (timer) timer.destroy();
          
          setTimeout(() => nextQuestion(), 2500);
        });

        questionButtons.push(buttonContainer);
      });

      // Start enhanced timer
      timer = scene.time.addEvent({
        delay: 1000,
        callback: () => {
          timeLeft--;
          timerTextRef.setText(`${timeLeft}s`);
          updateTimerBar(timeLeft);
          
          // Add urgency effects when time is running out
          if (timeLeft <= 5) {
            scene.tweens.add({
              targets: timerTextRef,
              scale: { from: 1, to: 1.2 },
              duration: 100,
              yoyo: true,
              ease: 'Power2'
            });
          }
          
          if (timeLeft <= 0) {
            // Time's up with enhanced feedback
            const timeUpContainer = scene.add.container(450, 480);
            const timeUpBg = scene.add.graphics();
            timeUpBg.fillGradientStyle(0xf59e0b, 0xf59e0b, 0xd97706, 0xd97706, 1);
            timeUpBg.fillRoundedRect(-120, -25, 240, 50, 15);
            timeUpBg.lineStyle(2, 0xfbbf24, 0.8);
            timeUpBg.strokeRoundedRect(-120, -25, 240, 50, 15);
            
            const timeUpText = scene.add.text(0, 0, '⏰ Time\'s Up!', {
              fontSize: '22px',
              color: '#ffffff',
              fontStyle: 'bold',
              shadow: { offsetX: 2, offsetY: 2, color: '#92400e', blur: 3 }
            }).setOrigin(0.5);
            
            timeUpContainer.add([timeUpBg, timeUpText]);
            
            // Disable all buttons
            questionButtons.forEach(btn => {
              btn.disableInteractive();
              const btnGlow = btn.getData('glow');
              if (btnGlow) btnGlow.setVisible(false);
            });
            
            setTimeout(() => nextQuestion(), 2500);
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
        questionButtons = [];
        
        // Clean up all question-related elements
        scene.children.list.forEach(child => {
          if (child instanceof Phaser.GameObjects.Graphics || 
              child instanceof Phaser.GameObjects.Text ||
              child instanceof Phaser.GameObjects.Container) {
            if ('y' in child && typeof child.y === 'number' && child.y >= 220 && child.y <= 520) {
              child.destroy();
            }
          }
        });
        
        // Update progress
        progressTextRef.setText(`Question: ${currentQuestionIndex + 1}/${words.length}`);
        
        // Reset game container position
        this.gameContainer.setPosition(450, 350);
        
        // Create next question
        createQuestion();
      } else {
        // Game complete with enhanced finale
        const accuracy = (correctAnswers / words.length) * 100;
        
        // Clear all remaining elements
        questionButtons.forEach(btn => btn.destroy());
        scene.children.list.forEach(child => {
          if ('y' in child && typeof child.y === 'number' && child.y >= 220 && child.y <= 520) {
            child.destroy();
          }
        });
        
        // Create finale container
        const finaleContainer = scene.add.container(450, 380);
        
        // Finale background
        const finaleBg = scene.add.graphics();
        finaleBg.fillGradientStyle(0x8b5cf6, 0x8b5cf6, 0x7c3aed, 0x7c3aed, 1);
        finaleBg.fillRoundedRect(-250, -100, 500, 200, 20);
        finaleBg.lineStyle(3, 0xa855f7, 0.9);
        finaleBg.strokeRoundedRect(-250, -100, 500, 200, 20);
        
        // Final celebration particles
        this.particles.emitParticleAt(450, 380, 20);
        
        const completeText = scene.add.text(0, -40, '🎉 Quiz Complete!', {
          fontSize: '36px',
          color: '#ffffff',
          fontStyle: 'bold',
          shadow: { offsetX: 3, offsetY: 3, color: '#581c87', blur: 5 }
        }).setOrigin(0.5);
        
        const scoreText = scene.add.text(0, 10, `🏆 Final Score: ${score} points`, {
          fontSize: '22px',
          color: '#ffffff',
          fontStyle: 'bold',
          shadow: { offsetX: 2, offsetY: 2, color: '#581c87', blur: 3 }
        }).setOrigin(0.5);
        
        const accuracyText = scene.add.text(0, 40, `📊 Accuracy: ${accuracy.toFixed(1)}%`, {
          fontSize: '18px',
          color: '#ffffff',
          fontStyle: 'bold',
          shadow: { offsetX: 2, offsetY: 2, color: '#581c87', blur: 3 }
        }).setOrigin(0.5);
        
        finaleContainer.add([finaleBg, completeText, scoreText, accuracyText]);
        
        // Finale animation
        scene.tweens.add({
          targets: finaleContainer,
          scale: { from: 0, to: 1 },
          duration: 800,
          ease: 'Back.easeOut'
        });
        
        // Continuous celebration particles
        const celebrationTimer = scene.time.addEvent({
          delay: 500,
          callback: () => {
            this.particles.emitParticleAt(450, 380, 8);
          },
          repeat: 5
        });
        
        setTimeout(() => {
          celebrationTimer.destroy();
          gameInstance.onGameComplete(score, accuracy);
        }, 3500);
      }
    };

    createQuestion();
  }
}

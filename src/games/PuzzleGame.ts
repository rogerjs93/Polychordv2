import { BaseGame, GameConfig } from './BaseGame';

export class PuzzleGame extends BaseGame {
  private particles!: Phaser.GameObjects.Particles.ParticleEmitter;
  private backgroundContainer!: Phaser.GameObjects.Container;
  private hudContainer!: Phaser.GameObjects.Container;
  private gameContainer!: Phaser.GameObjects.Container;

  constructor(config: GameConfig) {
    super(config);
  }

  create(scene: Phaser.Scene): void {
    this.createTextures(scene);
    this.createAdvancedBackground(scene);
    this.createParticleSystem(scene);
    this.createPuzzleGame(scene);
  }

  private createAdvancedBackground(scene: Phaser.Scene): void {
    // Main background container
    this.backgroundContainer = scene.add.container(450, 350);
    
    // Multi-layered gradient background
    const mainBg = scene.add.graphics();
    mainBg.fillGradientStyle(0xfef3ff, 0xfef3ff, 0xf0f9ff, 0xf0f9ff, 1);
    mainBg.fillRoundedRect(-430, -330, 860, 660, 20);
    
    // Shadow layer for depth
    const shadowBg = scene.add.graphics();
    shadowBg.fillStyle(0x000000, 0.1);
    shadowBg.fillRoundedRect(-425, -325, 850, 650, 18);
    
    // Subtle pattern overlay
    const patternOverlay = scene.add.graphics();
    patternOverlay.lineStyle(1, 0xddd6fe, 0.2);
    for (let i = -400; i < 400; i += 60) {
      for (let j = -300; j < 300; j += 60) {
        patternOverlay.strokeCircle(i, j, 8);
      }
    }
    
    this.backgroundContainer.add([shadowBg, mainBg, patternOverlay]);
  }

  private createParticleSystem(scene: Phaser.Scene): void {
    // Create sparkle texture for particles
    const sparkleGraphics = scene.add.graphics();
    sparkleGraphics.fillStyle(0xffd700, 1);
    sparkleGraphics.fillCircle(4, 4, 4);
    sparkleGraphics.generateTexture('sparkle', 8, 8);
    sparkleGraphics.destroy();
    
    // Particle system for success effects
    this.particles = scene.add.particles(0, 0, 'sparkle', {
      speed: { min: 50, max: 150 },
      lifespan: 1000,
      alpha: { start: 1, end: 0 },
      scale: { start: 0.5, end: 0.1 },
      quantity: 5,
      emitting: false
    });
  }

  private createPuzzleGame(scene: Phaser.Scene): void {
    // Store reference to game instance methods for callbacks
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const gameInstance = this;
    const words = this.vocabulary.slice(0, 3);
    let currentWordIndex = 0;
    let score = 0;
    let correctAnswers = 0;

    // Enhanced title with effects
    const titleText = scene.add.text(450, 75, '🧩 Word Puzzle Challenge', {
      fontSize: '28px',
      color: '#ffffff',
      fontStyle: 'bold',
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#4f46e5',
        blur: 4,
        stroke: true,
        fill: true
      }
    }).setOrigin(0.5);

    // Add pulsing animation to title
    scene.tweens.add({
      targets: titleText,
      scale: { from: 1, to: 1.05 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Enhanced subtitle with gradient effect
    scene.add.text(450, 110, 'Unscramble the letters to form the correct translation!', {
      fontSize: '18px',
      color: '#6b7280',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // Enhanced HUD with modern design
    this.hudContainer = scene.add.container(80, 150);
    
    // Score panel with gradient background
    const scoreBg = scene.add.graphics();
    scoreBg.fillGradientStyle(0x059669, 0x059669, 0x047857, 0x047857, 1);
    scoreBg.fillRoundedRect(-10, -25, 200, 50, 15);
    scoreBg.lineStyle(2, 0x10b981, 0.8);
    scoreBg.strokeRoundedRect(-10, -25, 200, 50, 15);
    
    const scoreIcon = scene.add.text(5, 0, '💎', { fontSize: '20px' }).setOrigin(0.5);
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
    
    const progressIcon = scene.add.text(5, 55, '📊', { fontSize: '16px' }).setOrigin(0.5);
    const progressText = scene.add.text(30, 55, `Word: ${currentWordIndex + 1}/${words.length}`, {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
      shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 2 }
    }).setOrigin(0, 0.5);
    
    this.hudContainer.add([progressBg, progressIcon, progressText]);

    // Game area container
    this.gameContainer = scene.add.container(450, 350);

    let letterTiles: Phaser.GameObjects.Container[] = [];
    let answerSlots: Phaser.GameObjects.Container[] = [];
    let userAnswer: string[] = [];

    // Store references for updates
    const scoreTextRef = scoreText;
    const progressTextRef = progressText;

    const createPuzzle = () => {
      const currentWord = words[currentWordIndex];
      
      // Enhanced word display with modern styling
      const wordDisplayBg = scene.add.graphics();
      wordDisplayBg.fillGradientStyle(0x4f46e5, 0x4f46e5, 0x6366f1, 0x6366f1, 1);
      wordDisplayBg.fillRoundedRect(300, 150, 300, 60, 15);
      wordDisplayBg.lineStyle(2, 0x8b5cf6, 0.8);
      wordDisplayBg.strokeRoundedRect(300, 150, 300, 60, 15);
      
      scene.add.text(450, 180, `📝 Translate: "${currentWord.word}"`, {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold',
        shadow: { offsetX: 2, offsetY: 2, color: '#312e81', blur: 3 }
      }).setOrigin(0.5);

      // Scramble the translation
      const letters = currentWord.translation.toLowerCase().split('');
      const scrambledLetters = [...letters].sort(() => Math.random() - 0.5);
      
      userAnswer = new Array(letters.length).fill('');

      // Create enhanced letter tiles
      scrambledLetters.forEach((letter, index) => {
        const x = 200 + index * 60;
        const y = 280;
        
        const tileContainer = scene.add.container(x, y);
        
        // Shadow layer
        const tileShadow = scene.add.graphics();
        tileShadow.fillStyle(0x000000, 0.2);
        tileShadow.fillRoundedRect(-24, -22, 48, 44, 8);
        
        // Main tile with gradient
        const tile = scene.add.graphics();
        tile.fillGradientStyle(0x3b82f6, 0x3b82f6, 0x1d4ed8, 0x1d4ed8, 1);
        tile.fillRoundedRect(-25, -25, 50, 50, 8);
        tile.lineStyle(2, 0x60a5fa, 0.8);
        tile.strokeRoundedRect(-25, -25, 50, 50, 8);
        
        // Glow effect (initially hidden)
        const tileGlow = scene.add.graphics();
        tileGlow.lineStyle(6, 0x60a5fa, 0.6);
        tileGlow.strokeRoundedRect(-28, -28, 56, 56, 10);
        tileGlow.setVisible(false);
        
        const text = scene.add.text(0, 0, letter.toUpperCase(), {
          fontSize: '24px',
          color: '#ffffff',
          fontStyle: 'bold',
          shadow: { offsetX: 1, offsetY: 1, color: '#1e40af', blur: 2 }
        }).setOrigin(0.5);

        tileContainer.add([tileShadow, tile, tileGlow, text]);
        tileContainer.setSize(50, 50);
        tileContainer.setInteractive();
        
        // Store data
        tileContainer.setData('letter', letter);
        tileContainer.setData('originalIndex', index);
        tileContainer.setData('used', false);
        tileContainer.setData('glow', tileGlow);
        tileContainer.setData('tile', tile);

        // Enhanced hover effects
        tileContainer.on('pointerover', () => {
          if (!tileContainer.getData('used')) {
            tileGlow.setVisible(true);
            scene.tweens.add({
              targets: tileContainer,
              scale: { from: 1, to: 1.1 },
              duration: 200,
              ease: 'Back.easeOut'
            });
          }
        });

        tileContainer.on('pointerout', () => {
          if (!tileContainer.getData('used')) {
            tileGlow.setVisible(false);
            scene.tweens.add({
              targets: tileContainer,
              scale: { from: tileContainer.scale, to: 1 },
              duration: 200,
              ease: 'Back.easeOut'
            });
          }
        });

        tileContainer.on('pointerdown', () => {
          if (tileContainer.getData('used')) return;
          
          // Press animation
          scene.tweens.add({
            targets: tileContainer,
            scale: { from: 1.1, to: 0.95 },
            duration: 100,
            yoyo: true,
            ease: 'Power2'
          });
          
          // Find first empty slot
          const emptySlotIndex = userAnswer.findIndex(slot => slot === '');
          if (emptySlotIndex !== -1) {
            userAnswer[emptySlotIndex] = letter;
            const targetSlot = answerSlots[emptySlotIndex];
            const slotText = targetSlot.getData('text');
            slotText.setText(letter.toUpperCase());
            
            tileContainer.setData('used', true);
            tileContainer.setAlpha(0.5);
            tileGlow.setVisible(false);
            
            // Animate letter moving to slot
            scene.tweens.add({
              targets: tileContainer,
              scale: { from: 0.95, to: 0.8 },
              duration: 300,
              ease: 'Power2.easeOut'
            });
            
            // Check if puzzle is complete
            if (!userAnswer.includes('')) {
              setTimeout(() => checkPuzzle(), 300);
            }
          }
        });

        letterTiles.push(tileContainer);
      });

      // Create enhanced answer slots
      letters.forEach((_, index) => {
        const x = 250 + index * 60;
        const y = 380;
        
        const slotContainer = scene.add.container(x, y);
        
        // Shadow layer
        const slotShadow = scene.add.graphics();
        slotShadow.fillStyle(0x000000, 0.1);
        slotShadow.fillRoundedRect(-24, -22, 48, 44, 8);
        
        // Main slot
        const slot = scene.add.graphics();
        slot.fillGradientStyle(0xf9fafb, 0xf9fafb, 0xf3f4f6, 0xf3f4f6, 1);
        slot.fillRoundedRect(-25, -25, 50, 50, 8);
        slot.lineStyle(2, 0xd1d5db, 0.8);
        slot.strokeRoundedRect(-25, -25, 50, 50, 8);
        
        // Glow effect for interactions
        const slotGlow = scene.add.graphics();
        slotGlow.lineStyle(4, 0xf59e0b, 0.6);
        slotGlow.strokeRoundedRect(-27, -27, 54, 54, 10);
        slotGlow.setVisible(false);
        
        const text = scene.add.text(0, 0, '', {
          fontSize: '24px',
          color: '#1f2937',
          fontStyle: 'bold',
          shadow: { offsetX: 1, offsetY: 1, color: '#f3f4f6', blur: 1 }
        }).setOrigin(0.5);

        slotContainer.add([slotShadow, slot, slotGlow, text]);
        slotContainer.setSize(50, 50);
        slotContainer.setInteractive();
        
        // Store references
        slotContainer.setData('text', text);
        slotContainer.setData('glow', slotGlow);

        // Enhanced hover effects
        slotContainer.on('pointerover', () => {
          if (userAnswer[index] !== '') {
            slotGlow.setVisible(true);
            scene.tweens.add({
              targets: slotContainer,
              scale: { from: 1, to: 1.05 },
              duration: 150
            });
          }
        });

        slotContainer.on('pointerout', () => {
          slotGlow.setVisible(false);
          scene.tweens.add({
            targets: slotContainer,
            scale: { from: slotContainer.scale, to: 1 },
            duration: 150
          });
        });

        slotContainer.on('pointerdown', () => {
          if (userAnswer[index] !== '') {
            // Press animation
            scene.tweens.add({
              targets: slotContainer,
              scale: { from: 1.05, to: 0.95 },
              duration: 100,
              yoyo: true
            });
            
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
              scene.tweens.add({
                targets: tile,
                scale: { from: 0.8, to: 1 },
                duration: 300,
                ease: 'Back.easeOut'
              });
            }
          }
        });

        answerSlots.push(slotContainer);
      });

      // Enhanced clear button
      const clearButtonContainer = scene.add.container(450, 450);
      
      const clearButtonShadow = scene.add.graphics();
      clearButtonShadow.fillStyle(0x000000, 0.3);
      clearButtonShadow.fillRoundedRect(-57, -22, 114, 44, 12);
      
      const clearButton = scene.add.graphics();
      clearButton.fillGradientStyle(0xef4444, 0xef4444, 0xdc2626, 0xdc2626, 1);
      clearButton.fillRoundedRect(-60, -25, 120, 50, 12);
      clearButton.lineStyle(2, 0xf87171, 0.8);
      clearButton.strokeRoundedRect(-60, -25, 120, 50, 12);
      
      const clearButtonGlow = scene.add.graphics();
      clearButtonGlow.lineStyle(6, 0xf87171, 0.6);
      clearButtonGlow.strokeRoundedRect(-63, -28, 126, 56, 15);
      clearButtonGlow.setVisible(false);
      
      const clearButtonText = scene.add.text(0, 0, '🗑️ CLEAR', {
        fontSize: '18px',
        color: '#ffffff',
        fontStyle: 'bold',
        shadow: { offsetX: 1, offsetY: 1, color: '#991b1b', blur: 2 }
      }).setOrigin(0.5);

      clearButtonContainer.add([clearButtonShadow, clearButton, clearButtonGlow, clearButtonText]);
      clearButtonContainer.setSize(120, 50);
      clearButtonContainer.setInteractive();

      // Button interactions
      clearButtonContainer.on('pointerover', () => {
        clearButtonGlow.setVisible(true);
        scene.tweens.add({
          targets: clearButtonContainer,
          scale: { from: 1, to: 1.05 },
          duration: 200
        });
      });

      clearButtonContainer.on('pointerout', () => {
        clearButtonGlow.setVisible(false);
        scene.tweens.add({
          targets: clearButtonContainer,
          scale: { from: clearButtonContainer.scale, to: 1 },
          duration: 200
        });
      });

      clearButtonContainer.on('pointerdown', () => {
        // Press animation
        scene.tweens.add({
          targets: clearButtonContainer,
          scale: { from: 1.05, to: 0.95 },
          duration: 100,
          yoyo: true
        });
        
        // Clear all answers
        userAnswer.fill('');
        answerSlots.forEach(slot => {
          const text = slot.getData('text');
          text.setText('');
        });
        
        // Re-enable all tiles
        letterTiles.forEach(tile => {
          tile.setData('used', false);
          tile.setAlpha(1);
          scene.tweens.add({
            targets: tile,
            scale: { from: 0.8, to: 1 },
            duration: 300,
            ease: 'Back.easeOut'
          });
        });
      });
    };

    const checkPuzzle = () => {
      const currentWord = words[currentWordIndex];
      const userWord = userAnswer.join('');
      const isCorrect = userWord === currentWord.translation.toLowerCase();

      // Create result display container
      const resultContainer = scene.add.container(450, 520);
      
      if (isCorrect) {
        correctAnswers++;
        score += 30;
        
        // Update score display
        scoreTextRef.setText(`Score: ${score}`);
        
        // Success feedback with particles
        this.particles.emitParticleAt(450, 520, 15);
        
        // Success message with enhanced styling
        const successBg = scene.add.graphics();
        successBg.fillGradientStyle(0x10b981, 0x10b981, 0x059669, 0x059669, 1);
        successBg.fillRoundedRect(-120, -25, 240, 50, 15);
        successBg.lineStyle(2, 0x34d399, 0.8);
        successBg.strokeRoundedRect(-120, -25, 240, 50, 15);
        
        const successText = scene.add.text(0, 0, '✨ Perfect! Well done!', {
          fontSize: '24px',
          color: '#ffffff',
          fontStyle: 'bold',
          shadow: { offsetX: 2, offsetY: 2, color: '#065f46', blur: 3 }
        }).setOrigin(0.5);
        
        resultContainer.add([successBg, successText]);
        
        // Celebrate with tile animations
        letterTiles.forEach((tile, index) => {
          scene.tweens.add({
            targets: tile,
            scale: { from: 0.8, to: 1.2 },
            rotation: { from: 0, to: Math.PI * 2 },
            duration: 800,
            delay: index * 100,
            ease: 'Back.easeOut'
          });
        });
        
        // Speak the correct answer
        this.speak(currentWord.translation, 'en');
        
      } else {
        // Error feedback
        const errorBg = scene.add.graphics();
        errorBg.fillGradientStyle(0xef4444, 0xef4444, 0xdc2626, 0xdc2626, 1);
        errorBg.fillRoundedRect(-150, -25, 300, 50, 15);
        errorBg.lineStyle(2, 0xf87171, 0.8);
        errorBg.strokeRoundedRect(-150, -25, 300, 50, 15);
        
        const errorText = scene.add.text(0, 0, `❌ Correct: ${currentWord.translation}`, {
          fontSize: '20px',
          color: '#ffffff',
          fontStyle: 'bold',
          shadow: { offsetX: 2, offsetY: 2, color: '#991b1b', blur: 3 }
        }).setOrigin(0.5);
        
        resultContainer.add([errorBg, errorText]);
        
        // Shake animation for incorrect answer
        scene.tweens.add({
          targets: this.gameContainer,
          x: { from: 450, to: 460 },
          duration: 50,
          yoyo: true,
          repeat: 5
        });
        
        // Speak the correct answer
        this.speak(currentWord.translation, 'en');
      }

      // Continue to next word or complete game
      setTimeout(() => {
        currentWordIndex++;
        if (currentWordIndex < words.length) {
          // Clean up current puzzle
          [...letterTiles, ...answerSlots].forEach(obj => obj.destroy());
          letterTiles = [];
          answerSlots = [];
          
          // Clean up text elements
          scene.children.list.forEach(child => {
            if (child instanceof Phaser.GameObjects.Graphics || 
                child instanceof Phaser.GameObjects.Text) {
              if (child.x === 450 && (child.y === 180 || child.y === 520)) {
                child.destroy();
              }
            }
            if (child instanceof Phaser.GameObjects.Container && 
                (child.x === 450 && child.y === 520)) {
              child.destroy();
            }
          });
          
          // Update progress
          progressTextRef.setText(`Word: ${currentWordIndex + 1}/${words.length}`);
          
          // Reset game container position
          this.gameContainer.setPosition(450, 350);
          
          // Create next puzzle
          createPuzzle();
        } else {
          // Game complete with enhanced finale
          const accuracy = (correctAnswers / words.length) * 100;
          
          // Create finale container
          const finaleContainer = scene.add.container(450, 400);
          
          // Finale background
          const finaleBg = scene.add.graphics();
          finaleBg.fillGradientStyle(0x8b5cf6, 0x8b5cf6, 0x7c3aed, 0x7c3aed, 1);
          finaleBg.fillRoundedRect(-200, -80, 400, 160, 20);
          finaleBg.lineStyle(3, 0xa855f7, 0.9);
          finaleBg.strokeRoundedRect(-200, -80, 400, 160, 20);
          
          // Final celebration particles
          this.particles.emitParticleAt(450, 400, 25);
          
          const completeText = scene.add.text(0, -30, '🎉 Puzzle Complete!', {
            fontSize: '32px',
            color: '#ffffff',
            fontStyle: 'bold',
            shadow: { offsetX: 3, offsetY: 3, color: '#581c87', blur: 5 }
          }).setOrigin(0.5);
          
          const statsText = scene.add.text(0, 20, `🏆 Final Score: ${score} | Accuracy: ${accuracy.toFixed(1)}%`, {
            fontSize: '18px',
            color: '#ffffff',
            fontStyle: 'bold',
            shadow: { offsetX: 2, offsetY: 2, color: '#581c87', blur: 3 }
          }).setOrigin(0.5);
          
          finaleContainer.add([finaleBg, completeText, statsText]);
          
          // Finale animation
          scene.tweens.add({
            targets: finaleContainer,
            scale: { from: 0, to: 1 },
            duration: 800,
            ease: 'Back.easeOut'
          });
          
          setTimeout(() => gameInstance.onGameComplete(score, accuracy), 3000);
        }
      }, 2500);
    };

    createPuzzle();
  }
}

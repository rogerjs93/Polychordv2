import { BaseGame, GameConfig } from './BaseGame';
import { detectLanguageFromVocabulary, getLanguageCodeForSpeech } from '../utils/languageDetection';

export class ListeningGame extends BaseGame {
  constructor(config: GameConfig) {
    super(config);
  }

  create(scene: Phaser.Scene): void {
    this.createTextures(scene);
    this.createListeningGame(scene);
  }

  private createListeningGame(scene: Phaser.Scene): void {
    // Store reference to game instance methods for callbacks
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const gameInstance = this;

    // Enhanced vocabulary selection with better difficulty distribution
    const allWords = this.vocabulary.filter(w => w.word && w.translation);
    const beginnerWords = allWords.filter(w => w.difficulty === 'beginner');
    const intermediateWords = allWords.filter(w => w.difficulty === 'intermediate');
    const advancedWords = allWords.filter(w => w.difficulty === 'advanced');
    
    // Mix difficulties for better learning progression (more beginner, some intermediate)
    const selectedWords = [
      ...beginnerWords.slice(0, 6),
      ...intermediateWords.slice(0, 3),
      ...advancedWords.slice(0, 1)
    ].slice(0, Math.min(10, allWords.length)); // Max 10 words
    
    const words = selectedWords.length >= 4 ? selectedWords : allWords.slice(0, Math.max(4, allWords.length));
    
    let currentWordIndex = 0;
    let score = 0;
    let correctAnswers = 0;
    let startTime = Date.now();
    let lives = 3;
    let streak = 0;
    let highestStreak = 0;
    
    // Game state
    let gamePhase: 'waiting' | 'playing' | 'answering' | 'complete' = 'waiting';

    // Enhanced game background with multiple layers
    const backgroundContainer = scene.add.container(450, 350);
    
    // Main background with gradient effect
    const mainBg = scene.add.graphics();
    mainBg.fillGradientStyle(0xfef3ff, 0xfef3ff, 0xf0f9ff, 0xf0f9ff, 1);
    mainBg.fillRoundedRect(-430, -330, 860, 660, 20);
    mainBg.lineStyle(4, 0xe0e7ff, 1);
    mainBg.strokeRoundedRect(-430, -330, 860, 660, 20);
    backgroundContainer.add(mainBg);
    
    // Add subtle pattern overlay
    const patternOverlay = scene.add.graphics();
    patternOverlay.lineStyle(1, 0xddd6fe, 0.3);
    for (let i = -400; i < 400; i += 40) {
      for (let j = -300; j < 300; j += 40) {
        patternOverlay.strokeCircle(i, j, 15);
      }
    }
    backgroundContainer.add(patternOverlay);
    
    // Animated floating particles in background
    const particles = scene.add.particles(0, 0, 'sparkle', {
      x: { min: 20, max: 880 },
      y: { min: 20, max: 680 },
      scale: { start: 0.1, end: 0.3 },
      alpha: { start: 0.3, end: 0 },
      lifespan: 3000,
      frequency: 2000,
      quantity: 1
    });
    
    // Header section with enhanced styling
    const headerContainer = scene.add.container(450, 75);
    
    // Title background
    const titleBg = scene.add.graphics();
    titleBg.fillGradientStyle(0x4f46e5, 0x4f46e5, 0x7c3aed, 0x7c3aed, 1);
    titleBg.fillRoundedRect(-200, -25, 400, 50, 25);
    titleBg.lineStyle(3, 0x3730a3, 1);
    titleBg.strokeRoundedRect(-200, -25, 400, 50, 25);
    headerContainer.add(titleBg);
    
    // Header with improved styling and glow effect
    const titleText = scene.add.text(450, 75, '🎧 Listen & Choose Challenge', {
      fontSize: '26px',
      color: '#ffffff',
      fontStyle: 'bold',
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#1e1b4b',
        blur: 4,
        stroke: true,
        fill: true
      }
    }).setOrigin(0.5);
    headerContainer.add(titleText);

    // Animated subtitle with typewriter effect
    const subtitleText = scene.add.text(450, 110, '', {
      fontSize: '16px',
      color: '#6366f1',
      fontStyle: 'italic'
    }).setOrigin(0.5);
    
    const fullSubtitle = 'Listen carefully and choose the correct translation!';
    let charIndex = 0;
    
    const typeWriter = scene.time.addEvent({
      delay: 50,
      callback: () => {
        if (charIndex < fullSubtitle.length) {
          subtitleText.setText(fullSubtitle.substring(0, charIndex + 1));
          charIndex++;
        } else {
          typeWriter.destroy();
        }
      },
      repeat: fullSubtitle.length - 1
    });

    // Enhanced HUD with visual progress indicators and containers
    const hudContainer = scene.add.container(80, 160);
    
    // Score display with background and icon
    const scoreBg = scene.add.graphics();
    scoreBg.fillGradientStyle(0x059669, 0x059669, 0x047857, 0x047857, 1);
    scoreBg.fillRoundedRect(-10, -20, 180, 40, 20);
    scoreBg.lineStyle(2, 0x065f46, 1);
    scoreBg.strokeRoundedRect(-10, -20, 180, 40, 20);
    hudContainer.add(scoreBg);
    
    const scoreIcon = scene.add.text(-5, 0, '💎', {
      fontSize: '18px'
    }).setOrigin(0, 0.5);
    hudContainer.add(scoreIcon);
    
    const scoreText = scene.add.text(25, 0, `Score: ${score}`, {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
      shadow: {
        offsetX: 1,
        offsetY: 1,
        color: '#000000',
        blur: 2
      }
    }).setOrigin(0, 0.5);
    hudContainer.add(scoreText);

    // Progress display with visual progress bar
    const progressContainer = scene.add.container(80, 210);
    
    const progressBg = scene.add.image(0, 0, 'progress-bg').setOrigin(0, 0.5);
    progressContainer.add(progressBg);
    
    const progressFill = scene.add.image(0, 0, 'progress-fill').setOrigin(0, 0.5);
    progressFill.setScale((currentWordIndex + 1) / words.length, 1);
    progressContainer.add(progressFill);
    
    const progressText = scene.add.text(100, 0, `Round: ${currentWordIndex + 1}/${words.length}`, {
      fontSize: '14px',
      color: '#374151',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    progressContainer.add(progressText);
    
    // Lives display with animated hearts
    const livesContainer = scene.add.container(80, 250);
    const livesIcons: Phaser.GameObjects.Text[] = [];
    
    for (let i = 0; i < 3; i++) {
      const heart = scene.add.text(i * 30, 0, '❤️', {
        fontSize: '20px'
      }).setOrigin(0.5);
      
      // Add heartbeat animation
      scene.tweens.add({
        targets: heart,
        scale: { from: 1, to: 1.2 },
        duration: 800,
        yoyo: true,
        repeat: -1,
        delay: i * 200
      });
      
      livesContainer.add(heart);
      livesIcons.push(heart);
    }
    
    const livesText = scene.add.text(100, 0, 'Lives', {
      fontSize: '14px',
      color: '#dc2626',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);
    livesContainer.add(livesText);
    
    // Streak counter with fire effect
    const streakContainer = scene.add.container(80, 290);
    
    const streakBg = scene.add.graphics();
    streakBg.fillGradientStyle(0x7c3aed, 0x7c3aed, 0x5b21b6, 0x5b21b6, 1);
    streakBg.fillRoundedRect(-10, -15, 160, 30, 15);
    streakBg.lineStyle(2, 0x4c1d95, 1);
    streakBg.strokeRoundedRect(-10, -15, 160, 30, 15);
    streakContainer.add(streakBg);
    
    const streakIcon = scene.add.text(0, 0, '🔥', {
      fontSize: '16px'
    }).setOrigin(0, 0.5);
    streakContainer.add(streakIcon);
    
    const streakText = scene.add.text(25, 0, `Streak: ${streak}`, {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);
    streakContainer.add(streakText);

    // Enhanced play button with animations and effects
    const playButtonContainer = scene.add.container(450, 230);
    
    const playButtonShadow = scene.add.graphics();
    playButtonShadow.fillStyle(0x000000, 0.3);
    playButtonShadow.fillRoundedRect(-76, -36, 152, 72, 20);
    playButtonContainer.add(playButtonShadow);
    
    const playButton = scene.add.graphics();
    playButton.fillGradientStyle(0x3b82f6, 0x3b82f6, 0x1d4ed8, 0x1d4ed8, 1);
    playButton.fillRoundedRect(-80, -40, 160, 80, 20);
    playButton.lineStyle(4, 0x1e40af, 1);
    playButton.strokeRoundedRect(-80, -40, 160, 80, 20);
    playButtonContainer.add(playButton);
    
    // Add glow effect
    const playButtonGlow = scene.add.graphics();
    playButtonGlow.lineStyle(8, 0x60a5fa, 0.5);
    playButtonGlow.strokeRoundedRect(-84, -44, 168, 88, 24);
    playButtonContainer.add(playButtonGlow);
    playButtonGlow.setVisible(false);
    
    const playButtonText = scene.add.text(0, 0, '🔊 LISTEN', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#1e40af',
        blur: 3
      }
    }).setOrigin(0.5);
    playButtonContainer.add(playButtonText);
    
    // Pulse animation for play button
    scene.tweens.add({
      targets: playButtonContainer,
      scale: { from: 1, to: 1.05 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    playButtonContainer.setInteractive(new Phaser.Geom.Rectangle(-80, -40, 160, 80), Phaser.Geom.Rectangle.Contains);

    // Enhanced replay button with better positioning and effects
    const replayButtonContainer = scene.add.container(580, 230);
    
    const replayButtonShadow = scene.add.graphics();
    replayButtonShadow.fillStyle(0x000000, 0.2);
    replayButtonShadow.fillRoundedRect(-36, -21, 72, 42, 15);
    replayButtonContainer.add(replayButtonShadow);
    
    const replayButton = scene.add.graphics();
    replayButton.fillGradientStyle(0x6366f1, 0x6366f1, 0x4f46e5, 0x4f46e5, 1);
    replayButton.fillRoundedRect(-40, -25, 80, 50, 15);
    replayButton.lineStyle(3, 0x3730a3, 1);
    replayButton.strokeRoundedRect(-40, -25, 80, 50, 15);
    replayButtonContainer.add(replayButton);

    const replayIcon = scene.add.text(0, 0, '🔄', {
      fontSize: '20px'
    }).setOrigin(0.5);
    replayButtonContainer.add(replayIcon);
    
    replayButtonContainer.setInteractive(new Phaser.Geom.Rectangle(-40, -25, 80, 50), Phaser.Geom.Rectangle.Contains);

    replayButtonContainer.on('pointerdown', () => {
      if (gamePhase === 'answering' && currentWordIndex < words.length) {
        const currentWord = words[currentWordIndex];
        
        // Use enhanced language detection
        const detectedLanguage = detectLanguageFromVocabulary(this.vocabulary);
        const langCode = getLanguageCodeForSpeech(detectedLanguage);
        
        console.log(`🔄 Replaying with language: ${detectedLanguage} -> ${langCode}`);
        
        this.speak(currentWord.word, langCode);
        
        // Button press animation
        scene.tweens.add({
          targets: replayButtonContainer,
          scale: { from: 1, to: 0.9 },
          duration: 100,
          yoyo: true
        });
      }
    });

    replayButtonContainer.on('pointerover', () => {
      scene.tweens.add({
        targets: replayButtonContainer,
        scale: { from: replayButtonContainer.scale, to: 1.1 },
        duration: 200
      });
    });

    replayButtonContainer.on('pointerout', () => {
      scene.tweens.add({
        targets: replayButtonContainer,
        scale: { from: replayButtonContainer.scale, to: 1 },
        duration: 200
      });
    });

    // Enhanced option creation with better distractors
    const createOptions = () => {
      const currentWord = words[currentWordIndex];
      const options = [currentWord.translation];
      
      // Create smarter distractors based on category and difficulty
      const sameCategory = this.vocabulary.filter(w => 
        w.category === currentWord.category && 
        w.id !== currentWord.id &&
        w.translation !== currentWord.translation
      );
      
      const sameDifficulty = this.vocabulary.filter(w => 
        w.difficulty === currentWord.difficulty && 
        w.id !== currentWord.id &&
        w.translation !== currentWord.translation
      );
      
      // Prioritize same category, then same difficulty, then random
      const potentialDistractors = [
        ...sameCategory.slice(0, 2),
        ...sameDifficulty.slice(0, 2),
        ...this.vocabulary.filter(w => w.id !== currentWord.id && w.translation !== currentWord.translation).slice(0, 3)
      ];
      
      // Remove duplicates and add to options
      const uniqueDistractors = Array.from(new Set(potentialDistractors.map(w => w.translation)))
        .filter(translation => translation !== currentWord.translation)
        .slice(0, 3);
      
      options.push(...uniqueDistractors);
      
      // If we don't have enough options, add more random ones
      while (options.length < 4) {
        const randomWords = this.vocabulary.filter(w => 
          w.id !== currentWord.id && 
          !options.includes(w.translation)
        );
        if (randomWords.length > 0) {
          const randomWord = randomWords[Math.floor(Math.random() * randomWords.length)];
          options.push(randomWord.translation);
        } else {
          break;
        }
      }
      
      // Shuffle options
      return options.sort(() => Math.random() - 0.5);
    };

    let optionButtons: Phaser.GameObjects.Container[] = [];
    let optionTexts: Phaser.GameObjects.Text[] = [];

    const showOptions = () => {
      const options = createOptions();
      const currentWord = words[currentWordIndex];
      
      // Clear previous options
      optionButtons.forEach(btn => btn.destroy());
      optionTexts.forEach(txt => txt.destroy());
      optionButtons = [];
      optionTexts = [];
      
      // Enhanced option buttons with better visual design
      options.forEach((option, index) => {
        const x = 225 + (index % 2) * 350;
        const y = 380 + Math.floor(index / 2) * 110;
        
        // Create button container for layered effects
        const buttonContainer = scene.add.container(x, y);
        
        // Button shadow
        const buttonShadow = scene.add.graphics();
        buttonShadow.fillStyle(0x000000, 0.15);
        buttonShadow.fillRoundedRect(-134, -34, 268, 68, 15);
        buttonContainer.add(buttonShadow);
        
        // Main button background
        const button = scene.add.graphics();
        button.fillGradientStyle(0xffffff, 0xffffff, 0xf8fafc, 0xf8fafc, 1);
        button.fillRoundedRect(-140, -40, 280, 80, 15);
        button.lineStyle(3, 0xe5e7eb, 1);
        button.strokeRoundedRect(-140, -40, 280, 80, 15);
        buttonContainer.add(button);
        
        // Button glow effect (initially hidden)
        const buttonGlow = scene.add.graphics();
        buttonGlow.lineStyle(6, 0x60a5fa, 0.6);
        buttonGlow.strokeRoundedRect(-144, -44, 288, 88, 19);
        buttonContainer.add(buttonGlow);
        buttonGlow.setVisible(false);

        const text = scene.add.text(0, 0, option, {
          fontSize: '16px',
          color: '#1f2937',
          fontStyle: 'bold',
          wordWrap: { width: 260 },
          align: 'center'
        }).setOrigin(0.5);
        buttonContainer.add(text);
        
        // Make container interactive
        buttonContainer.setInteractive(new Phaser.Geom.Rectangle(-140, -40, 280, 80), Phaser.Geom.Rectangle.Contains);

        buttonContainer.on('pointerdown', () => {
          // Only allow answers during answering phase
          if (gamePhase !== 'answering') return;
          
          const isCorrect = option === currentWord.translation;
          const answerTime = Date.now() - startTime;
          const timePoints = Math.max(0, 50 - Math.floor(answerTime / 1000) * 5);
          
          if (isCorrect) {
            correctAnswers++;
            streak++;
            highestStreak = Math.max(highestStreak, streak);
            
            // Calculate score with bonuses
            let points = 25 + timePoints + (streak > 1 ? streak * 5 : 0);
            if (currentWord.difficulty === 'intermediate') points *= 1.5;
            if (currentWord.difficulty === 'advanced') points *= 2;
            
            score += Math.floor(points);
            scoreText.setText(`Score: ${score}`);
            streakText.setText(`Streak: ${streak} 🔥`);
            
            // Correct answer visual feedback
            button.clear();
            button.fillGradientStyle(0x10b981, 0x10b981, 0x059669, 0x059669, 1);
            button.fillRoundedRect(-140, -40, 280, 80, 15);
            button.lineStyle(3, 0x047857, 1);
            button.strokeRoundedRect(-140, -40, 280, 80, 15);
            text.setColor('#ffffff');
            
            // Success animation
            scene.tweens.add({
              targets: buttonContainer,
              scale: { from: 1, to: 1.1 },
              duration: 200,
              yoyo: true
            });
            
            // Add sparkle effects
            particles.emitParticleAt(x, y, 8);
            
            // Enhanced feedback
            const feedbackMessages = [
              '🎉 Excellent!',
              '⭐ Perfect!',
              '💯 Amazing!',
              '🚀 Outstanding!',
              '✨ Brilliant!'
            ];
            
            const feedback = streak > 1 ? 
              `${feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)]} +${Math.floor(points)} pts (${streak}x streak!)` :
              `${feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)]} +${Math.floor(points)} pts`;
            
            scene.add.text(450, 550, feedback, {
              fontSize: '22px',
              color: '#10b981',
              fontStyle: 'bold'
            }).setOrigin(0.5);
            
          } else {
            streak = 0;
            lives--;
            livesIcons[lives].setText('🖤'); // Update heart display
            streakText.setText(`Streak: ${streak}`);
            
            // Wrong answer visual feedback
            button.clear();
            button.fillGradientStyle(0xef4444, 0xef4444, 0xdc2626, 0xdc2626, 1);
            button.fillRoundedRect(-140, -40, 280, 80, 15);
            button.lineStyle(3, 0xb91c1c, 1);
            button.strokeRoundedRect(-140, -40, 280, 80, 15);
            text.setColor('#ffffff');
            
            // Show correct answer with highlighting
            const correctButtonIndex = options.findIndex(opt => opt === currentWord.translation);
            if (correctButtonIndex !== -1 && optionButtons[correctButtonIndex]) {
              const correctContainer = optionButtons[correctButtonIndex];
              const correctButton = correctContainer.list[1] as Phaser.GameObjects.Graphics; // Get button from container
              const correctText = correctContainer.list[3] as Phaser.GameObjects.Text; // Get text from container
              
              correctButton.clear();
              correctButton.fillGradientStyle(0x10b981, 0x10b981, 0x059669, 0x059669, 1);
              correctButton.fillRoundedRect(-140, -40, 280, 80, 15);
              correctButton.lineStyle(3, 0x047857, 1);
              correctButton.strokeRoundedRect(-140, -40, 280, 80, 15);
              correctText.setColor('#ffffff');
            }
            
            scene.add.text(450, 550, `❌ Incorrect! Correct: "${currentWord.translation}"`, {
              fontSize: '18px',
              color: '#ef4444',
              fontStyle: 'bold',
              wordWrap: { width: 600 },
              align: 'center'
            }).setOrigin(0.5);
            
            // Game over check
            if (lives <= 0) {
              setTimeout(() => {
                scene.add.text(450, 400, '💀 Game Over!', {
                  fontSize: '32px',
                  color: '#ef4444',
                  fontStyle: 'bold'
                }).setOrigin(0.5);
                
                const finalAccuracy = (correctAnswers / (currentWordIndex + 1)) * 100;
                setTimeout(() => gameInstance.onGameComplete(score, finalAccuracy), 2000);
              }, 1500);
              return;
            }
          }

          // Disable all buttons and update game phase
          optionButtons.forEach(btn => btn.disableInteractive());
          gamePhase = 'waiting';

          setTimeout(() => {
            currentWordIndex++;
            progressText.setText(`Round: ${currentWordIndex + 1}/${words.length}`);
            
            if (currentWordIndex < words.length) {
              // Clear feedback and prepare next round
              scene.children.list.forEach(child => {
                if (child instanceof Phaser.GameObjects.Text && 
                    (child.text.includes('🎉') || child.text.includes('❌') || 
                     child.text.includes('⭐') || child.text.includes('💯') ||
                     child.text.includes('🚀') || child.text.includes('✨'))) {
                  child.destroy();
                }
              });
              
              startTime = Date.now();
              showOptions();
            } else {
              // Enhanced game completion
              gamePhase = 'complete';
              const accuracy = (correctAnswers / words.length) * 100;
              let completionMessage = '';
              
              if (accuracy >= 90) completionMessage = '🏆 Masterful Performance!';
              else if (accuracy >= 75) completionMessage = '🥇 Excellent Work!';
              else if (accuracy >= 60) completionMessage = '🥈 Good Job!';
              else if (accuracy >= 45) completionMessage = '🥉 Keep Practicing!';
              else completionMessage = '📚 Try Again Soon!';
              
              scene.add.text(450, 380, completionMessage, {
                fontSize: '28px',
                color: '#4f46e5',
                fontStyle: 'bold'
              }).setOrigin(0.5);
              
              scene.add.text(450, 420, `Final Score: ${score} | Accuracy: ${accuracy.toFixed(1)}%`, {
                fontSize: '20px',
                color: '#6b7280'
              }).setOrigin(0.5);
              
              scene.add.text(450, 450, `Best Streak: ${highestStreak} | Words Mastered: ${correctAnswers}/${words.length}`, {
                fontSize: '16px',
                color: '#6b7280'
              }).setOrigin(0.5);
              
              setTimeout(() => gameInstance.onGameComplete(score, accuracy), 3000);
            }
          }, 2500);
        });

        buttonContainer.on('pointerover', () => {
          if (buttonContainer.input?.enabled) {
            buttonGlow.setVisible(true);
            scene.tweens.add({
              targets: buttonContainer,
              scale: { from: buttonContainer.scale, to: 1.05 },
              duration: 200
            });
          }
        });

        buttonContainer.on('pointerout', () => {
          if (buttonContainer.input?.enabled) {
            buttonGlow.setVisible(false);
            scene.tweens.add({
              targets: buttonContainer,
              scale: { from: buttonContainer.scale, to: 1 },
              duration: 200
            });
          }
        });

        optionButtons.push(buttonContainer);
        optionTexts.push(text);
      });
    };

    playButtonContainer.on('pointerdown', () => {
      const currentWord = words[currentWordIndex];
      gamePhase = 'playing';
      
      // Enhanced language detection
      const detectedLanguage = detectLanguageFromVocabulary(this.vocabulary);
      const langCode = getLanguageCodeForSpeech(detectedLanguage);
      
      console.log(`🎯 Detected language: ${detectedLanguage} -> Using voice: ${langCode}`);
      
      // Enhanced play button animation
      playButtonText.setText('🎵 PLAYING...');
      playButtonGlow.setVisible(true);
      
      // Button press animation
      scene.tweens.add({
        targets: playButtonContainer,
        scale: { from: 1, to: 0.95 },
        duration: 100,
        yoyo: true
      });
      
      // Clear any previous audio indicators
      scene.children.list.forEach(child => {
        if (child instanceof Phaser.GameObjects.Text && child.text.includes('🔊 Playing')) {
          child.destroy();
        }
      });
      
      // Audio indicator with animation
      const audioIndicator = scene.add.text(450, 300, `🎵 Now Playing: "${currentWord.word}"`, {
        fontSize: '18px',
        color: '#3b82f6',
        fontStyle: 'bold',
        shadow: {
          offsetX: 1,
          offsetY: 1,
          color: '#1e40af',
          blur: 2
        }
      }).setOrigin(0.5);
      
      // Add subtle animation to audio indicator
      scene.tweens.add({
        targets: audioIndicator,
        alpha: { from: 0.5, to: 1 },
        duration: 500,
        yoyo: true,
        repeat: 2
      });
      
      this.speak(currentWord.word, langCode);
      startTime = Date.now(); // Reset timer for this round
      
      setTimeout(() => {
        playButtonText.setText('🔊 LISTEN');
        playButtonGlow.setVisible(false);
        audioIndicator.destroy();
        gamePhase = 'answering';
        showOptions();
      }, 2000);
    });

    playButtonContainer.on('pointerover', () => {
      playButtonGlow.setVisible(true);
      scene.tweens.add({
        targets: playButtonContainer,
        scale: { from: playButtonContainer.scale, to: 1.1 },
        duration: 200
      });
    });

    playButtonContainer.on('pointerout', () => {
      if (gamePhase !== 'playing') {
        playButtonGlow.setVisible(false);
      }
      scene.tweens.add({
        targets: playButtonContainer,
        scale: { from: playButtonContainer.scale, to: 1 },
        duration: 200
      });
    });
  }
}

import { BaseGame, GameConfig } from './BaseGame';

export class MemoryGame extends BaseGame {
  constructor(config: GameConfig) {
    super(config);
  }

  create(scene: Phaser.Scene): void {
    this.createTextures(scene);
    this.createMemoryGame(scene);
  }

  private createMemoryGame(scene: Phaser.Scene): void {
    // Store reference to game instance methods for nested callbacks
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const gameInstance = this;

    // Smart word selection with difficulty progression
    const getMemoryWords = () => {
      const beginnerWords = this.vocabulary.filter(w => w.difficulty === 'beginner');
      const intermediateWords = this.vocabulary.filter(w => w.difficulty === 'intermediate');
      
      // Start with 2 beginner words, add 2 intermediate if available
      let selectedWords = beginnerWords.slice(0, 2);
      if (intermediateWords.length > 0) {
        selectedWords = selectedWords.concat(intermediateWords.slice(0, 2));
      }
      
      // If we don't have enough, fill with remaining words
      if (selectedWords.length < 4) {
        const remaining = this.vocabulary.filter(w => !selectedWords.includes(w));
        selectedWords = selectedWords.concat(remaining.slice(0, 4 - selectedWords.length));
      }
      
      return selectedWords.slice(0, 4);
    };

    const words = getMemoryWords();
    const cards: Array<{ 
      word: string; 
      translation: string; 
      type: 'word' | 'translation';
      difficulty: string;
      category: string;
    }> = [];
    
    // Game background panel
    scene.add.rectangle(450, 350, 860, 660, 0xf8fafc).setStrokeStyle(2, 0xe2e8f0);
    
    // Enhanced header with category information
    const categories = [...new Set(words.map(w => w.category))];
    const categoryText = categories.length > 1 ? 
      `Categories: ${categories.slice(0, 2).join(', ')}${categories.length > 2 ? '...' : ''}` : 
      `Category: ${categories[0]}`;
    
    scene.add.text(450, 65, 'Memory Challenge', {
      fontSize: '24px',
      color: '#1e293b',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    scene.add.text(450, 90, 'Find matching pairs by flipping cards!', {
      fontSize: '16px',
      color: '#64748b'
    }).setOrigin(0.5);

    scene.add.text(450, 110, categoryText, {
      fontSize: '12px',
      color: '#059669',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // Create enhanced card data with difficulty and category info
    words.forEach(item => {
      cards.push({ 
        word: item.word, 
        translation: '', 
        type: 'word',
        difficulty: item.difficulty,
        category: item.category
      });
      cards.push({ 
        word: item.word, 
        translation: item.translation, 
        type: 'translation',
        difficulty: item.difficulty,
        category: item.category
      });
    });

    cards.sort(() => Math.random() - 0.5);

    let flippedCards: Array<{ card: Phaser.GameObjects.Rectangle, index: number, text: Phaser.GameObjects.Text }> = [];
    let matches = 0;
    let attempts = 0;
    let score = 0;
    let streak = 0;
    let timeLeft = 90; // 90 seconds for memory game
    let feedbackTexts: Phaser.GameObjects.Text[] = [];

    // Enhanced UI panels
    scene.add.rectangle(150, 180, 220, 120, 0xffffff).setStrokeStyle(1, 0xd1d5db);
    
    const scoreText = scene.add.text(80, 150, `Score: ${score}`, {
      fontSize: '18px',
      color: '#1e293b',
      fontStyle: 'bold'
    });

    const attemptsText = scene.add.text(80, 170, `Attempts: ${attempts}`, {
      fontSize: '16px',
      color: '#64748b'
    });

    const streakText = scene.add.text(80, 190, `Streak: ${streak}`, {
      fontSize: '16px',
      color: '#059669',
      fontStyle: 'bold'
    });

    const timerText = scene.add.text(80, 210, `Time: ${timeLeft}s`, {
      fontSize: '16px',
      color: '#ef4444',
      fontStyle: 'bold'
    });

    // Instructions panel
    scene.add.rectangle(750, 180, 200, 120, 0xfef3c7).setStrokeStyle(1, 0xfbbf24);
    scene.add.text(750, 145, 'Memory Tips:', {
      fontSize: '14px',
      color: '#92400e',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    scene.add.text(750, 165, '• Remember positions', {
      fontSize: '11px',
      color: '#92400e'
    }).setOrigin(0.5);
    scene.add.text(750, 180, '• Match word pairs', {
      fontSize: '11px',
      color: '#92400e'
    }).setOrigin(0.5);
    scene.add.text(750, 195, '• Build your streak!', {
      fontSize: '11px',
      color: '#92400e'
    }).setOrigin(0.5);
    scene.add.text(750, 210, '• Beat the clock!', {
      fontSize: '11px',
      color: '#92400e'
    }).setOrigin(0.5);

    // Start the timer
    const timer = scene.time.addEvent({
      delay: 1000,
      callback: () => {
        timeLeft--;
        timerText.setText(`Time: ${timeLeft}s`);
        
        if (timeLeft <= 0) {
          // Time's up - end game
          scene.add.text(450, 400, '⏰ Time\'s Up!', {
            fontSize: '32px',
            color: '#ef4444',
            fontStyle: 'bold'
          }).setOrigin(0.5);
          
          scene.add.text(450, 440, `Final Score: ${score} points`, {
            fontSize: '20px',
            color: '#6b7280'
          }).setOrigin(0.5);
          
          setTimeout(() => {
            const accuracy = matches > 0 ? (matches / attempts) * 100 : 0;
            gameInstance.onGameComplete(score, accuracy);
          }, 2000);
        }
      },
      repeat: 89
    });

    // Clear previous feedback
    const clearFeedback = () => {
      feedbackTexts.forEach(text => text.destroy());
      feedbackTexts = [];
    };

    // Enhanced card creation with difficulty-based colors and animations
    cards.forEach((cardData, index) => {
      const col = index % 4;
      const row = Math.floor(index / 4);
      const x = 250 + col * 150;
      const y = 280 + row * 140;

      // Difficulty-based card back colors
      const difficultyColors: { [key: string]: number } = {
        'beginner': 0x6b7280,
        'intermediate': 0x7c3aed,
        'advanced': 0xef4444
      };
      const cardBackColor = difficultyColors[cardData.difficulty] || 0x6b7280;

      // Card shadow for depth
      const cardShadow = scene.add.rectangle(x + 3, y + 3, 130, 90, 0x000000, 0.2);

      const cardBack = scene.add.rectangle(x, y, 130, 90, cardBackColor)
        .setInteractive()
        .setData('index', index)
        .setData('revealed', false)
        .setData('matched', false)
        .setStrokeStyle(2, 0x374151);

      // Enhanced card text with better styling
      const displayText = cardData.type === 'word' ? cardData.word : cardData.translation;
      const cardText = scene.add.text(x, y - 5, displayText, {
        fontSize: '14px',
        color: '#ffffff',
        fontStyle: 'bold',
        wordWrap: { width: 115 },
        align: 'center'
      }).setOrigin(0.5).setVisible(false);

      // Card type indicator
      const typeIndicator = scene.add.text(x, y + 35, cardData.type === 'word' ? 'W' : 'T', {
        fontSize: '10px',
        color: '#d1d5db',
        fontStyle: 'bold'
      }).setOrigin(0.5).setVisible(false);

      // Card difficulty indicator
      scene.add.rectangle(x + 55, y - 35, 20, 15, 0x000000, 0.4);
      scene.add.text(x + 55, y - 35, cardData.difficulty.charAt(0).toUpperCase(), {
        fontSize: '9px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      cardBack.on('pointerdown', () => {
        if (cardBack.getData('revealed') || cardBack.getData('matched') || flippedCards.length >= 2) return;

        clearFeedback();

        // Enhanced flip animation
        scene.tweens.add({
          targets: cardBack,
          scaleX: 0,
          duration: 150,
          ease: 'Power2',
          onComplete: () => {
            cardBack.setFillStyle(0x4f46e5);
            cardText.setVisible(true);
            typeIndicator.setVisible(true);
            cardBack.setData('revealed', true);
            
            scene.tweens.add({
              targets: cardBack,
              scaleX: 1,
              duration: 150,
              ease: 'Power2'
            });
          }
        });

        flippedCards.push({ card: cardBack, index, text: cardText });

        if (flippedCards.length === 2) {
          attempts++;
          attemptsText.setText(`Attempts: ${attempts}`);
          
          setTimeout(() => {
            const [first, second] = flippedCards;
            const firstData = cards[first.index];
            const secondData = cards[second.index];
            
            const isMatch = firstData.word === secondData.word && 
                           firstData.type !== secondData.type;

            if (isMatch) {
              matches++;
              streak++;
              
              // Difficulty-based scoring with streak bonus
              const basePoints = firstData.difficulty === 'beginner' ? 15 : 
                               firstData.difficulty === 'intermediate' ? 20 : 25;
              const streakBonus = Math.min(streak * 3, 25);
              const timeBonus = timeLeft > 60 ? 10 : timeLeft > 30 ? 5 : 0;
              const points = basePoints + streakBonus + timeBonus;
              
              score += points;
              scoreText.setText(`Score: ${score}`);
              streakText.setText(`Streak: ${streak}`);
              
              first.card.setData('matched', true);
              second.card.setData('matched', true);
              
              // Enhanced match animation
              scene.tweens.add({
                targets: [first.card, second.card],
                alpha: 0.7,
                scale: 0.95,
                duration: 800,
                ease: 'Power2'
              });

              // Success feedback with points breakdown
              const successText = scene.add.text(450, 140, `✓ Perfect Match! +${points} points!`, {
                fontSize: '18px',
                color: '#10b981',
                fontStyle: 'bold'
              }).setOrigin(0.5);
              
              feedbackTexts.push(successText);

              if (streakBonus > 0) {
                const bonusText = scene.add.text(450, 160, `Streak Bonus: +${streakBonus}`, {
                  fontSize: '14px',
                  color: '#8b5cf6',
                  fontStyle: 'bold'
                }).setOrigin(0.5);
                feedbackTexts.push(bonusText);
              }

              if (timeBonus > 0) {
                const timeBonusText = scene.add.text(450, 180, `Speed Bonus: +${timeBonus}`, {
                  fontSize: '14px',
                  color: '#f59e0b',
                  fontStyle: 'bold'
                }).setOrigin(0.5);
                feedbackTexts.push(timeBonusText);
              }

              // Particle effect for successful match
              const particles = scene.add.particles(450, 350, 'button-green', {
                speed: { min: 40, max: 80 },
                scale: { start: 0.1, end: 0 },
                lifespan: 600,
                quantity: 8
              });
              
              setTimeout(() => particles.destroy(), 800);
              
              if (matches === words.length) {
                timer.destroy();
                const accuracy = Math.round((matches / attempts) * 100);
                const finalBonus = timeLeft * 2;
                score += finalBonus;
                
                scene.add.text(450, 420, 'Memory Master! 🧠✨', {
                  fontSize: '32px',
                  color: '#4f46e5',
                  fontStyle: 'bold'
                }).setOrigin(0.5);
                
                scene.add.text(450, 460, `Perfect Memory! +${finalBonus} time bonus`, {
                  fontSize: '18px',
                  color: '#10b981',
                  fontStyle: 'bold'
                }).setOrigin(0.5);
                
                scene.add.text(450, 485, `Final Score: ${score} | Accuracy: ${accuracy}%`, {
                  fontSize: '16px',
                  color: '#6b7280'
                }).setOrigin(0.5);
                
                setTimeout(() => gameInstance.onGameComplete(score, accuracy), 3000);
              }
            } else {
              // Wrong match - reset streak
              streak = 0;
              streakText.setText(`Streak: ${streak}`);
              
              const errorText = scene.add.text(450, 140, '✗ Not a match - try to remember!', {
                fontSize: '16px',
                color: '#ef4444',
                fontStyle: 'bold'
              }).setOrigin(0.5);
              
              feedbackTexts.push(errorText);

              // Enhanced flip back animation
              scene.tweens.add({
                targets: [first.card, second.card],
                scaleX: 0,
                duration: 200,
                ease: 'Power2',
                onComplete: () => {
                  first.card.setFillStyle(cardBackColor);
                  second.card.setFillStyle(cardBackColor);
                  first.text.setVisible(false);
                  second.text.setVisible(false);
                  scene.children.list.forEach(child => {
                    if (child instanceof Phaser.GameObjects.Text && 
                        (child.text === 'W' || child.text === 'T')) {
                      child.setVisible(false);
                    }
                  });
                  first.card.setData('revealed', false);
                  second.card.setData('revealed', false);
                  
                  scene.tweens.add({
                    targets: [first.card, second.card],
                    scaleX: 1,
                    duration: 200,
                    ease: 'Power2'
                  });
                }
              });
            }
            
            flippedCards = [];
            
            // Clear feedback after delay
            setTimeout(clearFeedback, 2500);
          }, 1200);
        }
      });

      // Enhanced hover effects
      cardBack.on('pointerover', () => {
        if (!cardBack.getData('revealed') && !cardBack.getData('matched')) {
          cardBack.setScale(1.05);
          cardShadow.setAlpha(0.3);
        }
      });

      cardBack.on('pointerout', () => {
        if (!cardBack.getData('revealed') && !cardBack.getData('matched')) {
          cardBack.setScale(1);
          cardShadow.setAlpha(0.2);
        }
      });
    });
  }
}

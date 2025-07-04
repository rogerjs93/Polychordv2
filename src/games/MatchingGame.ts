import { BaseGame, GameConfig } from './BaseGame';

export class MatchingGame extends BaseGame {
  constructor(config: GameConfig) {
    super(config);
  }

  create(scene: Phaser.Scene): void {
    this.createTextures(scene);
    this.createMatchingGame(scene);
  }

  private createMatchingGame(scene: Phaser.Scene): void {
    // Smart word selection based on difficulty and categories
    const getMatchingWords = () => {
      // Group words by difficulty
      const beginnerWords = this.vocabulary.filter(w => w.difficulty === 'beginner');
      const intermediateWords = this.vocabulary.filter(w => w.difficulty === 'intermediate');
      
      // Start with 3 beginner words, add 2 intermediate if available
      let selectedWords = beginnerWords.slice(0, 3);
      if (intermediateWords.length > 0) {
        selectedWords = selectedWords.concat(intermediateWords.slice(0, 2));
      }
      
      // If we don't have enough, fill with remaining words
      if (selectedWords.length < 5) {
        const remaining = this.vocabulary.filter(w => !selectedWords.includes(w));
        selectedWords = selectedWords.concat(remaining.slice(0, 5 - selectedWords.length));
      }
      
      return selectedWords.slice(0, 5);
    };

    const words = getMatchingWords();
    let score = 0;
    let attempts = 0;
    let matches = 0;
    let streak = 0;
    let feedbackTexts: Phaser.GameObjects.Text[] = [];

    // Create a clean background panel for the game area
    scene.add.rectangle(450, 350, 860, 660, 0xf8fafc).setStrokeStyle(2, 0xe2e8f0);

    // Enhanced instructions with better spacing and layout
    const categories = [...new Set(words.map(w => w.category))];
    const categoryText = categories.length > 1 ? 
      `Categories: ${categories.slice(0, 2).join(', ')}${categories.length > 2 ? '...' : ''}` : 
      `Category: ${categories[0]}`;
    
    // Header section with clear hierarchy
    scene.add.text(450, 65, 'Word Matching Challenge', {
      fontSize: '24px',
      color: '#1e293b',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    scene.add.text(450, 90, 'Match words with their translations', {
      fontSize: '16px',
      color: '#64748b'
    }).setOrigin(0.5);

    scene.add.text(450, 110, '🔊 Click audio icons to hear pronunciation', {
      fontSize: '14px',
      color: '#7c3aed',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    scene.add.text(450, 130, categoryText, {
      fontSize: '12px',
      color: '#059669',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // Stats panel with organized layout
    scene.add.rectangle(150, 180, 220, 100, 0xffffff).setStrokeStyle(1, 0xd1d5db);
    
    const scoreText = scene.add.text(80, 155, `Score: ${score}`, {
      fontSize: '16px',
      color: '#1e293b',
      fontStyle: 'bold'
    });

    const attemptsText = scene.add.text(80, 175, `Attempts: ${attempts}`, {
      fontSize: '14px',
      color: '#64748b'
    });

    const streakText = scene.add.text(80, 195, `Streak: ${streak}`, {
      fontSize: '14px',
      color: '#059669',
      fontStyle: 'bold'
    });

    // Instructions panel
    scene.add.rectangle(750, 180, 200, 100, 0xfef3c7).setStrokeStyle(1, 0xfbbf24);
    scene.add.text(750, 155, 'How to Play:', {
      fontSize: '14px',
      color: '#92400e',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    scene.add.text(750, 175, '1. Click a word card', {
      fontSize: '12px',
      color: '#92400e'
    }).setOrigin(0.5);
    scene.add.text(750, 190, '2. Click its translation', {
      fontSize: '12px',
      color: '#92400e'
    }).setOrigin(0.5);
    scene.add.text(750, 205, '3. Build your streak!', {
      fontSize: '12px',
      color: '#92400e'
    }).setOrigin(0.5);

    // Word cards section with improved spacing and layout
    scene.add.text(200, 240, 'Target Words', {
      fontSize: '18px',
      color: '#1e293b',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    scene.add.text(700, 240, 'Translations', {
      fontSize: '18px',
      color: '#1e293b',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Enhanced word cards with better spacing and cleaner design
    words.forEach((item, index) => {
      const yPos = 280 + index * 80; // Better spacing between cards
      
      // Color based on difficulty with better color scheme
      const difficultyColors = {
        'beginner': 0x059669,    // Emerald green
        'intermediate': 0x2563eb, // Blue  
        'advanced': 0x7c3aed     // Purple
      };
      const cardColor = difficultyColors[item.difficulty] || 0x64748b;
      
      // Word card with shadow effect
      const cardShadow = scene.add.rectangle(205, yPos + 3, 200, 65, 0x000000, 0.1);
      const card = scene.add.rectangle(200, yPos, 200, 65, cardColor)
        .setInteractive()
        .setData('word', item.word)
        .setData('type', 'word')
        .setData('matched', false)
        .setData('item', item);

      // Clean word text layout
      scene.add.text(200, yPos - 10, item.word, {
        fontSize: '15px',
        color: '#ffffff',
        fontStyle: 'bold',
        wordWrap: { width: 180 }
      }).setOrigin(0.5);

      // Difficulty indicator with better styling
      scene.add.rectangle(260, yPos - 20, 28, 18, 0x000000, 0.3);
      scene.add.text(260, yPos - 20, item.difficulty.charAt(0).toUpperCase(), {
        fontSize: '11px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // Better positioned audio button
      const audioIcon = scene.add.rectangle(260, yPos + 20, 22, 22, 0xfbbf24)
        .setInteractive()
        .setStrokeStyle(1, 0xf59e0b);
      
      scene.add.text(260, yPos + 20, '🔊', {
        fontSize: '11px'
      }).setOrigin(0.5);

      // Audio click handler with visual feedback
      audioIcon.on('pointerdown', () => {
        const targetLanguage = 'es';
        const langCode = targetLanguage === 'es' ? 'es-ES' : 
                        targetLanguage === 'fr' ? 'fr-FR' : 
                        targetLanguage === 'de' ? 'de-DE' : 'en-US';
        this.speak(item.word, langCode);
        
        // Enhanced visual feedback
        audioIcon.setFillStyle(0xf59e0b);
        scene.tweens.add({
          targets: audioIcon,
          scaleX: 1.2,
          scaleY: 1.2,
          duration: 100,
          yoyo: true,
          onComplete: () => {
            audioIcon.setFillStyle(0xfbbf24);
          }
        });
      });

      // Improved hover effects
      card.on('pointerdown', () => selectCard(card));
      card.on('pointerover', () => {
        if (!card.getData('matched')) {
          card.setFillStyle(0x7c3aed);
          cardShadow.setAlpha(0.2);
        }
      });
      card.on('pointerout', () => {
        if (!card.getData('matched')) {
          card.setFillStyle(cardColor);
          cardShadow.setAlpha(0.1);
        }
      });
    });

    // Enhanced translation cards with better layout
    const shuffledTranslations = [...words].sort(() => Math.random() - 0.5);
    shuffledTranslations.forEach((item, index) => {
      const yPos = 280 + index * 80;
      
      // Translation card with shadow
      const cardShadow = scene.add.rectangle(705, yPos + 3, 200, 65, 0x000000, 0.1);
      const card = scene.add.rectangle(700, yPos, 200, 65, 0x059669)
        .setInteractive()
        .setData('translation', item.translation)
        .setData('word', item.word)
        .setData('type', 'translation')
        .setData('matched', false)
        .setData('item', item);

      // Clean translation text
      scene.add.text(700, yPos - 8, item.translation, {
        fontSize: '15px',
        color: '#ffffff',
        fontStyle: 'bold',
        wordWrap: { width: 180 }
      }).setOrigin(0.5);

      // Category hint with better styling
      scene.add.text(700, yPos + 18, item.category, {
        fontSize: '11px',
        color: '#d1fae5',
        fontStyle: 'italic'
      }).setOrigin(0.5);

      // Improved interaction
      card.on('pointerdown', () => selectCard(card));
      card.on('pointerover', () => {
        if (!card.getData('matched')) {
          card.setFillStyle(0x10b981);
          cardShadow.setAlpha(0.2);
        }
      });
      card.on('pointerout', () => {
        if (!card.getData('matched')) {
          card.setFillStyle(0x059669);
          cardShadow.setAlpha(0.1);
        }
      });
    });

    let selectedCard: Phaser.GameObjects.Rectangle | null = null;

    // Clear previous feedback
    const clearFeedback = () => {
      feedbackTexts.forEach(text => text.destroy());
      feedbackTexts = [];
    };

    const selectCard = (card: Phaser.GameObjects.Rectangle) => {
      if (card.getData('matched')) return;

      clearFeedback();

      if (!selectedCard) {
        selectedCard = card;
        card.setStrokeStyle(4, 0xfbbf24);
        
        // Play pronunciation when selecting a word
        if (card.getData('type') === 'word') {
          const item = card.getData('item');
          const targetLanguage = 'es';
          const langCode = targetLanguage === 'es' ? 'es-ES' : 
                          targetLanguage === 'fr' ? 'fr-FR' : 
                          targetLanguage === 'de' ? 'de-DE' : 'en-US';
          speak(item.word, langCode);
        }
      } else if (selectedCard === card) {
        selectedCard.setStrokeStyle(0);
        selectedCard = null;
      } else {
        attempts++;
        attemptsText.setText(`Attempts: ${attempts}`);
        
        const wordCard = selectedCard.getData('type') === 'word' ? selectedCard : card;
        const translationCard = selectedCard.getData('type') === 'translation' ? selectedCard : card;

        if (wordCard.getData('word') === translationCard.getData('word')) {
          // Correct match!
          matches++;
          streak++;
          
          // Difficulty-based scoring with streak bonus
          const item = wordCard.getData('item');
          const basePoints = item.difficulty === 'beginner' ? 10 : 
                           item.difficulty === 'intermediate' ? 15 : 20;
          const streakBonus = Math.min(streak * 2, 20);
          const points = basePoints + streakBonus;
          
          score += points;
          scoreText.setText(`Score: ${score}`);
          streakText.setText(`Streak: ${streak}`);
          
          // Enhanced visual feedback with animation
          wordCard.setData('matched', true);
          translationCard.setData('matched', true);
          
          // Smooth fade animation
          scene.tweens.add({
            targets: [wordCard, translationCard],
            alpha: 0.4,
            scale: 0.95,
            duration: 500,
            ease: 'Power2'
          });

          // Success feedback with points
          const successText = scene.add.text(450, 140, `✓ Excellent! +${points} points!`, {
            fontSize: '20px',
            color: '#10b981',
            fontStyle: 'bold'
          }).setOrigin(0.5);
          
          if (streakBonus > 0) {
            const bonusText = scene.add.text(450, 165, `Streak Bonus: +${streakBonus}`, {
              fontSize: '16px',
              color: '#8b5cf6',
              fontStyle: 'bold'
            }).setOrigin(0.5);
            feedbackTexts.push(bonusText);
          }
          
          feedbackTexts.push(successText);
          
          // Particle effect for correct match
          const particles = scene.add.particles(450, 350, 'button-green', {
            speed: { min: 50, max: 100 },
            scale: { start: 0.1, end: 0 },
            lifespan: 800,
            quantity: 5
          });
          
          setTimeout(() => particles.destroy(), 1000);
          
          if (matches === words.length) {
            const accuracy = Math.round((matches / attempts) * 100);
            scene.add.text(450, 380, 'Perfect Match! 🎉', {
              fontSize: '32px',
              color: '#4f46e5',
              fontStyle: 'bold'
            }).setOrigin(0.5);
            
            scene.add.text(450, 420, `Final Streak: ${streak} | Accuracy: ${accuracy}%`, {
              fontSize: '18px',
              color: '#6b7280'
            }).setOrigin(0.5);
            
            setTimeout(() => this.onGameComplete(score, accuracy), 2500);
          }
        } else {
          // Wrong match
          streak = 0;
          streakText.setText(`Streak: ${streak}`);
          
          const errorText = scene.add.text(450, 140, '✗ Not quite right, try again!', {
            fontSize: '18px',
            color: '#ef4444',
            fontStyle: 'bold'
          }).setOrigin(0.5);
          
          feedbackTexts.push(errorText);
          
          // Shake animation for wrong match
          scene.tweens.add({
            targets: [selectedCard, card],
            x: '+=10',
            duration: 50,
            yoyo: true,
            repeat: 3
          });
        }

        selectedCard.setStrokeStyle(0);
        card.setStrokeStyle(0);
        selectedCard = null;
        
        // Clear feedback after delay
        setTimeout(clearFeedback, 2000);
      }
    }

    // Bind the speak function to the scene context
    const speak = this.speak.bind(this);
  }
}

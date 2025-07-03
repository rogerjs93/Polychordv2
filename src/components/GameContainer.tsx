import React, { useRef, useEffect } from 'react';
import Phaser from 'phaser';
import { VocabularyItem } from '../types';
import { useSpeech } from '../hooks/useSpeech';

interface GameContainerProps {
  gameType: 'matching' | 'memory' | 'typing' | 'listening' | 'puzzle' | 'quiz';
  vocabulary: VocabularyItem[];
  onGameComplete: (score: number, accuracy: number) => void;
}

export const GameContainer: React.FC<GameContainerProps> = ({
  gameType,
  vocabulary,
  onGameComplete
}) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGame = useRef<Phaser.Game | null>(null);
  const { speak } = useSpeech();

  useEffect(() => {
    if (!gameRef.current || vocabulary.length === 0) return;

    // Clean up previous game
    if (phaserGame.current) {
      phaserGame.current.destroy(true);
      phaserGame.current = null;
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 900,
      height: 700,
      parent: gameRef.current,
      backgroundColor: '#f8fafc',
      scene: {
        preload: function(this: Phaser.Scene) {
          // Create enhanced textures with gradients and shadows
          
          // Card textures with gradients
          const cardFrontGraphics = this.add.graphics();
          cardFrontGraphics.fillGradientStyle(0x4f46e5, 0x4f46e5, 0x6366f1, 0x6366f1, 1);
          cardFrontGraphics.fillRect(0, 0, 120, 80);
          cardFrontGraphics.lineStyle(2, 0x3730a3, 1);
          cardFrontGraphics.strokeRoundedRect(1, 1, 118, 78, 8);
          cardFrontGraphics.generateTexture('card-front', 120, 80);
          cardFrontGraphics.destroy();
          
          const cardBackGraphics = this.add.graphics();
          cardBackGraphics.fillGradientStyle(0x6b7280, 0x6b7280, 0x9ca3af, 0x9ca3af, 1);
          cardBackGraphics.fillRect(0, 0, 120, 80);
          cardBackGraphics.lineStyle(2, 0x4b5563, 1);
          cardBackGraphics.strokeRoundedRect(1, 1, 118, 78, 8);
          cardBackGraphics.generateTexture('card-back', 120, 80);
          cardBackGraphics.destroy();

          // Enhanced button textures with shadows and gradients
          const buttonGreen = this.add.graphics();
          buttonGreen.fillStyle(0x000000, 0.2);
          buttonGreen.fillRoundedRect(4, 6, 146, 46, 12); // Shadow
          buttonGreen.fillGradientStyle(0x10b981, 0x10b981, 0x059669, 0x059669, 1);
          buttonGreen.fillRoundedRect(0, 0, 150, 50, 12);
          buttonGreen.lineStyle(2, 0x047857, 1);
          buttonGreen.strokeRoundedRect(1, 1, 148, 48, 12);
          buttonGreen.generateTexture('button-green', 154, 56);
          buttonGreen.destroy();

          const buttonRed = this.add.graphics();
          buttonRed.fillStyle(0x000000, 0.2);
          buttonRed.fillRoundedRect(4, 6, 146, 46, 12);
          buttonRed.fillGradientStyle(0xef4444, 0xef4444, 0xdc2626, 0xdc2626, 1);
          buttonRed.fillRoundedRect(0, 0, 150, 50, 12);
          buttonRed.lineStyle(2, 0xb91c1c, 1);
          buttonRed.strokeRoundedRect(1, 1, 148, 48, 12);
          buttonRed.generateTexture('button-red', 154, 56);
          buttonRed.destroy();

          const buttonBlue = this.add.graphics();
          buttonBlue.fillStyle(0x000000, 0.2);
          buttonBlue.fillRoundedRect(4, 6, 196, 56, 15);
          buttonBlue.fillGradientStyle(0x3b82f6, 0x3b82f6, 0x1d4ed8, 0x1d4ed8, 1);
          buttonBlue.fillRoundedRect(0, 0, 200, 60, 15);
          buttonBlue.lineStyle(3, 0x1e40af, 1);
          buttonBlue.strokeRoundedRect(2, 2, 196, 56, 15);
          buttonBlue.generateTexture('button-blue', 204, 66);
          buttonBlue.destroy();

          // Create particle textures for effects
          const sparkle = this.add.graphics();
          sparkle.fillStyle(0xfbbf24, 1);
          sparkle.fillCircle(4, 4, 4);
          sparkle.fillStyle(0xfde047, 1);
          sparkle.fillCircle(4, 4, 2);
          sparkle.generateTexture('sparkle', 8, 8);
          sparkle.destroy();

          // Create progress bar textures
          const progressBg = this.add.graphics();
          progressBg.fillStyle(0xe5e7eb, 1);
          progressBg.fillRoundedRect(0, 0, 200, 12, 6);
          progressBg.generateTexture('progress-bg', 200, 12);
          progressBg.destroy();

          const progressFill = this.add.graphics();
          progressFill.fillGradientStyle(0x10b981, 0x10b981, 0x059669, 0x059669, 1);
          progressFill.fillRoundedRect(0, 0, 200, 12, 6);
          progressFill.generateTexture('progress-fill', 200, 12);
          progressFill.destroy();
        },
        create: function(this: Phaser.Scene) {
          // Game title
          const gameTitle = {
            'matching': 'Word Matching Game',
            'memory': 'Memory Game',
            'typing': 'Type the Translation',
            'listening': 'Listen & Choose',
            'puzzle': 'Word Puzzle',
            'quiz': 'Quick Quiz'
          }[gameType] || 'Mini Game';

          this.add.text(450, 30, gameTitle, {
            fontSize: '28px',
            color: '#1f2937',
            fontStyle: 'bold'
          }).setOrigin(0.5);

          // Game-specific creation
          switch (gameType) {
            case 'matching':
              createMatchingGame.call(this);
              break;
            case 'memory':
              createMemoryGame.call(this);
              break;
            case 'typing':
              createTypingGame.call(this);
              break;
            case 'listening':
              createListeningGame.call(this);
              break;
            case 'puzzle':
              createPuzzleGame.call(this);
              break;
            case 'quiz':
              createQuizGame.call(this);
              break;
          }
        }
      }
    };

    // IMPROVED: Enhanced Matching Game with Difficulty Progression & Audio
    const createMatchingGame = function(this: Phaser.Scene) {
      // Smart word selection based on difficulty and categories
      const getMatchingWords = () => {
        // Group words by difficulty
        const beginnerWords = vocabulary.filter(w => w.difficulty === 'beginner');
        const intermediateWords = vocabulary.filter(w => w.difficulty === 'intermediate');
        
        // Start with 3 beginner words, add 2 intermediate if available
        let selectedWords = beginnerWords.slice(0, 3);
        if (intermediateWords.length > 0) {
          selectedWords = selectedWords.concat(intermediateWords.slice(0, 2));
        }
        
        // If we don't have enough, fill with remaining words
        if (selectedWords.length < 5) {
          const remaining = vocabulary.filter(w => !selectedWords.includes(w));
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
      this.add.rectangle(450, 350, 860, 660, 0xf8fafc).setStrokeStyle(2, 0xe2e8f0);

      // Enhanced instructions with better spacing and layout
      const categories = [...new Set(words.map(w => w.category))];
      const categoryText = categories.length > 1 ? 
        `Categories: ${categories.slice(0, 2).join(', ')}${categories.length > 2 ? '...' : ''}` : 
        `Category: ${categories[0]}`;
      
      // Header section with clear hierarchy
      this.add.text(450, 65, 'Word Matching Challenge', {
        fontSize: '24px',
        color: '#1e293b',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      this.add.text(450, 90, 'Match words with their translations', {
        fontSize: '16px',
        color: '#64748b'
      }).setOrigin(0.5);

      this.add.text(450, 110, '🔊 Click audio icons to hear pronunciation', {
        fontSize: '14px',
        color: '#7c3aed',
        fontStyle: 'italic'
      }).setOrigin(0.5);

      this.add.text(450, 130, categoryText, {
        fontSize: '12px',
        color: '#059669',
        fontStyle: 'italic'
      }).setOrigin(0.5);

      // Stats panel with organized layout
      this.add.rectangle(150, 180, 220, 100, 0xffffff).setStrokeStyle(1, 0xd1d5db);
      
      const scoreText = this.add.text(80, 155, `Score: ${score}`, {
        fontSize: '16px',
        color: '#1e293b',
        fontStyle: 'bold'
      });

      const attemptsText = this.add.text(80, 175, `Attempts: ${attempts}`, {
        fontSize: '14px',
        color: '#64748b'
      });

      const streakText = this.add.text(80, 195, `Streak: ${streak}`, {
        fontSize: '14px',
        color: '#059669',
        fontStyle: 'bold'
      });

      // Instructions panel
      this.add.rectangle(750, 180, 200, 100, 0xfef3c7).setStrokeStyle(1, 0xfbbf24);
      this.add.text(750, 155, 'How to Play:', {
        fontSize: '14px',
        color: '#92400e',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      this.add.text(750, 175, '1. Click a word card', {
        fontSize: '12px',
        color: '#92400e'
      }).setOrigin(0.5);
      this.add.text(750, 190, '2. Click its translation', {
        fontSize: '12px',
        color: '#92400e'
      }).setOrigin(0.5);
      this.add.text(750, 205, '3. Build your streak!', {
        fontSize: '12px',
        color: '#92400e'
      }).setOrigin(0.5);

      // Word cards section with improved spacing and layout
      this.add.text(200, 240, 'Target Words', {
        fontSize: '18px',
        color: '#1e293b',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      this.add.text(700, 240, 'Translations', {
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
        const cardShadow = this.add.rectangle(205, yPos + 3, 200, 65, 0x000000, 0.1);
        const card = this.add.rectangle(200, yPos, 200, 65, cardColor)
          .setInteractive()
          .setData('word', item.word)
          .setData('type', 'word')
          .setData('matched', false)
          .setData('item', item);

        // Clean word text layout
        this.add.text(200, yPos - 10, item.word, {
          fontSize: '15px',
          color: '#ffffff',
          fontStyle: 'bold',
          wordWrap: { width: 180 }
        }).setOrigin(0.5);

        // Difficulty indicator with better styling
        this.add.rectangle(260, yPos - 20, 28, 18, 0x000000, 0.3);
        this.add.text(260, yPos - 20, item.difficulty.charAt(0).toUpperCase(), {
          fontSize: '11px',
          color: '#ffffff',
          fontStyle: 'bold'
        }).setOrigin(0.5);

        // Better positioned audio button
        const audioIcon = this.add.rectangle(260, yPos + 20, 22, 22, 0xfbbf24)
          .setInteractive()
          .setStrokeStyle(1, 0xf59e0b);
        
        this.add.text(260, yPos + 20, '🔊', {
          fontSize: '11px'
        }).setOrigin(0.5);

        // Audio click handler with visual feedback
        audioIcon.on('pointerdown', () => {
          const targetLanguage = 'es';
          const langCode = targetLanguage === 'es' ? 'es-ES' : 
                          targetLanguage === 'fr' ? 'fr-FR' : 
                          targetLanguage === 'de' ? 'de-DE' : 'en-US';
          speak(item.word, langCode);
          
          // Enhanced visual feedback
          audioIcon.setFillStyle(0xf59e0b);
          this.tweens.add({
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
        card.on('pointerdown', () => selectCard.call(this, card));
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
        const cardShadow = this.add.rectangle(705, yPos + 3, 200, 65, 0x000000, 0.1);
        const card = this.add.rectangle(700, yPos, 200, 65, 0x059669)
          .setInteractive()
          .setData('translation', item.translation)
          .setData('word', item.word)
          .setData('type', 'translation')
          .setData('matched', false)
          .setData('item', item);

        // Clean translation text
        this.add.text(700, yPos - 8, item.translation, {
          fontSize: '15px',
          color: '#ffffff',
          fontStyle: 'bold',
          wordWrap: { width: 180 }
        }).setOrigin(0.5);

        // Category hint with better styling
        this.add.text(700, yPos + 18, item.category, {
          fontSize: '11px',
          color: '#d1fae5',
          fontStyle: 'italic'
        }).setOrigin(0.5);

        // Improved interaction
        card.on('pointerdown', () => selectCard.call(this, card));
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

      function selectCard(this: Phaser.Scene, card: Phaser.GameObjects.Rectangle) {
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
            this.tweens.add({
              targets: [wordCard, translationCard],
              alpha: 0.4,
              scale: 0.95,
              duration: 500,
              ease: 'Power2'
            });

            // Success feedback with points
            const successText = this.add.text(450, 140, `✓ Excellent! +${points} points!`, {
              fontSize: '20px',
              color: '#10b981',
              fontStyle: 'bold'
            }).setOrigin(0.5);
            
            if (streakBonus > 0) {
              const bonusText = this.add.text(450, 165, `Streak Bonus: +${streakBonus}`, {
                fontSize: '16px',
                color: '#8b5cf6',
                fontStyle: 'bold'
              }).setOrigin(0.5);
              feedbackTexts.push(bonusText);
            }
            
            feedbackTexts.push(successText);
            
            // Particle effect for correct match
            const particles = this.add.particles(450, 350, 'button-green', {
              speed: { min: 50, max: 100 },
              scale: { start: 0.1, end: 0 },
              lifespan: 800,
              quantity: 5
            });
            
            setTimeout(() => particles.destroy(), 1000);
            
            if (matches === words.length) {
              const accuracy = Math.round((matches / attempts) * 100);
              this.add.text(450, 380, 'Perfect Match! 🎉', {
                fontSize: '32px',
                color: '#4f46e5',
                fontStyle: 'bold'
              }).setOrigin(0.5);
              
              this.add.text(450, 420, `Final Streak: ${streak} | Accuracy: ${accuracy}%`, {
                fontSize: '18px',
                color: '#6b7280'
              }).setOrigin(0.5);
              
              setTimeout(() => onGameComplete(score, accuracy), 2500);
            }
          } else {
            // Wrong match
            streak = 0;
            streakText.setText(`Streak: ${streak}`);
            
            const errorText = this.add.text(450, 140, '✗ Not quite right, try again!', {
              fontSize: '18px',
              color: '#ef4444',
              fontStyle: 'bold'
            }).setOrigin(0.5);
            
            feedbackTexts.push(errorText);
            
            // Shake animation for wrong match
            this.tweens.add({
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
    };

    // ENHANCED: Memory Game with Advanced Features
    const createMemoryGame = function(this: Phaser.Scene) {
      // Smart word selection with difficulty progression
      const getMemoryWords = () => {
        const beginnerWords = vocabulary.filter(w => w.difficulty === 'beginner');
        const intermediateWords = vocabulary.filter(w => w.difficulty === 'intermediate');
        
        // Start with 2 beginner words, add 2 intermediate if available
        let selectedWords = beginnerWords.slice(0, 2);
        if (intermediateWords.length > 0) {
          selectedWords = selectedWords.concat(intermediateWords.slice(0, 2));
        }
        
        // If we don't have enough, fill with remaining words
        if (selectedWords.length < 4) {
          const remaining = vocabulary.filter(w => !selectedWords.includes(w));
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
      this.add.rectangle(450, 350, 860, 660, 0xf8fafc).setStrokeStyle(2, 0xe2e8f0);
      
      // Enhanced header with category information
      const categories = [...new Set(words.map(w => w.category))];
      const categoryText = categories.length > 1 ? 
        `Categories: ${categories.slice(0, 2).join(', ')}${categories.length > 2 ? '...' : ''}` : 
        `Category: ${categories[0]}`;
      
      this.add.text(450, 65, 'Memory Challenge', {
        fontSize: '24px',
        color: '#1e293b',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      this.add.text(450, 90, 'Find matching pairs by flipping cards!', {
        fontSize: '16px',
        color: '#64748b'
      }).setOrigin(0.5);

      this.add.text(450, 110, categoryText, {
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
      this.add.rectangle(150, 180, 220, 120, 0xffffff).setStrokeStyle(1, 0xd1d5db);
      
      const scoreText = this.add.text(80, 150, `Score: ${score}`, {
        fontSize: '18px',
        color: '#1e293b',
        fontStyle: 'bold'
      });

      const attemptsText = this.add.text(80, 170, `Attempts: ${attempts}`, {
        fontSize: '16px',
        color: '#64748b'
      });

      const streakText = this.add.text(80, 190, `Streak: ${streak}`, {
        fontSize: '16px',
        color: '#059669',
        fontStyle: 'bold'
      });

      const timerText = this.add.text(80, 210, `Time: ${timeLeft}s`, {
        fontSize: '16px',
        color: '#ef4444',
        fontStyle: 'bold'
      });

      // Instructions panel
      this.add.rectangle(750, 180, 200, 120, 0xfef3c7).setStrokeStyle(1, 0xfbbf24);
      this.add.text(750, 145, 'Memory Tips:', {
        fontSize: '14px',
        color: '#92400e',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      this.add.text(750, 165, '• Remember positions', {
        fontSize: '11px',
        color: '#92400e'
      }).setOrigin(0.5);
      this.add.text(750, 180, '• Match word pairs', {
        fontSize: '11px',
        color: '#92400e'
      }).setOrigin(0.5);
      this.add.text(750, 195, '• Build your streak!', {
        fontSize: '11px',
        color: '#92400e'
      }).setOrigin(0.5);
      this.add.text(750, 210, '• Beat the clock!', {
        fontSize: '11px',
        color: '#92400e'
      }).setOrigin(0.5);

      // Start the timer
      const timer = this.time.addEvent({
        delay: 1000,
        callback: () => {
          timeLeft--;
          timerText.setText(`Time: ${timeLeft}s`);
          
          if (timeLeft <= 0) {
            // Time's up - end game
            this.add.text(450, 400, '⏰ Time\'s Up!', {
              fontSize: '32px',
              color: '#ef4444',
              fontStyle: 'bold'
            }).setOrigin(0.5);
            
            this.add.text(450, 440, `Final Score: ${score} points`, {
              fontSize: '20px',
              color: '#6b7280'
            }).setOrigin(0.5);
            
            setTimeout(() => {
              const accuracy = matches > 0 ? (matches / attempts) * 100 : 0;
              onGameComplete(score, accuracy);
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
        const cardShadow = this.add.rectangle(x + 3, y + 3, 130, 90, 0x000000, 0.2);

        const cardBack = this.add.rectangle(x, y, 130, 90, cardBackColor)
          .setInteractive()
          .setData('index', index)
          .setData('revealed', false)
          .setData('matched', false)
          .setStrokeStyle(2, 0x374151);

        // Enhanced card text with better styling
        const displayText = cardData.type === 'word' ? cardData.word : cardData.translation;
        const cardText = this.add.text(x, y - 5, displayText, {
          fontSize: '14px',
          color: '#ffffff',
          fontStyle: 'bold',
          wordWrap: { width: 115 },
          align: 'center'
        }).setOrigin(0.5).setVisible(false);

        // Card type indicator
        const typeIndicator = this.add.text(x, y + 35, cardData.type === 'word' ? 'W' : 'T', {
          fontSize: '10px',
          color: '#d1d5db',
          fontStyle: 'bold'
        }).setOrigin(0.5).setVisible(false);

        // Card difficulty indicator
        this.add.rectangle(x + 55, y - 35, 20, 15, 0x000000, 0.4);
        this.add.text(x + 55, y - 35, cardData.difficulty.charAt(0).toUpperCase(), {
          fontSize: '9px',
          color: '#ffffff',
          fontStyle: 'bold'
        }).setOrigin(0.5);

        cardBack.on('pointerdown', () => {
          if (cardBack.getData('revealed') || cardBack.getData('matched') || flippedCards.length >= 2) return;

          clearFeedback();

          // Enhanced flip animation
          this.tweens.add({
            targets: cardBack,
            scaleX: 0,
            duration: 150,
            ease: 'Power2',
            onComplete: () => {
              cardBack.setFillStyle(0x4f46e5);
              cardText.setVisible(true);
              typeIndicator.setVisible(true);
              cardBack.setData('revealed', true);
              
              this.tweens.add({
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
                this.tweens.add({
                  targets: [first.card, second.card],
                  alpha: 0.7,
                  scale: 0.95,
                  duration: 800,
                  ease: 'Power2'
                });

                // Success feedback with points breakdown
                const successText = this.add.text(450, 140, `✓ Perfect Match! +${points} points!`, {
                  fontSize: '18px',
                  color: '#10b981',
                  fontStyle: 'bold'
                }).setOrigin(0.5);
                
                feedbackTexts.push(successText);

                if (streakBonus > 0) {
                  const bonusText = this.add.text(450, 160, `Streak Bonus: +${streakBonus}`, {
                    fontSize: '14px',
                    color: '#8b5cf6',
                    fontStyle: 'bold'
                  }).setOrigin(0.5);
                  feedbackTexts.push(bonusText);
                }

                if (timeBonus > 0) {
                  const timeBonusText = this.add.text(450, 180, `Speed Bonus: +${timeBonus}`, {
                    fontSize: '14px',
                    color: '#f59e0b',
                    fontStyle: 'bold'
                  }).setOrigin(0.5);
                  feedbackTexts.push(timeBonusText);
                }

                // Particle effect for successful match
                const particles = this.add.particles(450, 350, 'button-green', {
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
                  
                  this.add.text(450, 420, 'Memory Master! 🧠✨', {
                    fontSize: '32px',
                    color: '#4f46e5',
                    fontStyle: 'bold'
                  }).setOrigin(0.5);
                  
                  this.add.text(450, 460, `Perfect Memory! +${finalBonus} time bonus`, {
                    fontSize: '18px',
                    color: '#10b981',
                    fontStyle: 'bold'
                  }).setOrigin(0.5);
                  
                  this.add.text(450, 485, `Final Score: ${score} | Accuracy: ${accuracy}%`, {
                    fontSize: '16px',
                    color: '#6b7280'
                  }).setOrigin(0.5);
                  
                  setTimeout(() => onGameComplete(score, accuracy), 3000);
                }
              } else {
                // Wrong match - reset streak
                streak = 0;
                streakText.setText(`Streak: ${streak}`);
                
                const errorText = this.add.text(450, 140, '✗ Not a match - try to remember!', {
                  fontSize: '16px',
                  color: '#ef4444',
                  fontStyle: 'bold'
                }).setOrigin(0.5);
                
                feedbackTexts.push(errorText);

                // Enhanced flip back animation
                this.tweens.add({
                  targets: [first.card, second.card],
                  scaleX: 0,
                  duration: 200,
                  ease: 'Power2',
                  onComplete: () => {
                    first.card.setFillStyle(cardBackColor);
                    second.card.setFillStyle(cardBackColor);
                    first.text.setVisible(false);
                    second.text.setVisible(false);
                    this.children.list.forEach(child => {
                      if (child instanceof Phaser.GameObjects.Text && 
                          (child.text === 'W' || child.text === 'T')) {
                        child.setVisible(false);
                      }
                    });
                    first.card.setData('revealed', false);
                    second.card.setData('revealed', false);
                    
                    this.tweens.add({
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
    };

    // IMPROVED: Typing Game with Better Layout
    const createTypingGame = function(this: Phaser.Scene) {
      const words = vocabulary.slice(0, 5);
      let currentWordIndex = 0;
      let score = 0;
      let correctAnswers = 0;
      let userInput = '';

      // Game background panel
      this.add.rectangle(450, 350, 860, 660, 0xf8fafc).setStrokeStyle(2, 0xe2e8f0);

      this.add.text(450, 75, 'Type the translation of the word shown!', {
        fontSize: '18px',
        color: '#6b7280'
      }).setOrigin(0.5);

      const scoreText = this.add.text(80, 120, `Score: ${score}`, {
        fontSize: '20px',
        color: '#1f2937',
        fontStyle: 'bold'
      });

      const progressText = this.add.text(80, 145, `Word: ${currentWordIndex + 1}/${words.length}`, {
        fontSize: '18px',
        color: '#1f2937'
      });

      const currentWordText = this.add.text(450, 180, words[currentWordIndex].word, {
        fontSize: '40px',
        color: '#4f46e5',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      this.add.rectangle(450, 250, 350, 55, 0xf3f4f6)
        .setStrokeStyle(2, 0xd1d5db);

      const inputText = this.add.text(450, 250, '', {
        fontSize: '22px',
        color: '#1f2937'
      }).setOrigin(0.5);

      const hintText = this.add.text(450, 300, `Hint: ${words[currentWordIndex].pronunciation}`, {
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
          
          const key = this.add.rectangle(x, y, 38, 45, 0xe5e7eb)
            .setStrokeStyle(1, 0x9ca3af)
            .setInteractive();

          this.add.text(x, y, letter.toUpperCase(), {
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
      const backspaceKey = this.add.rectangle(650, 540, 90, 45, 0xfca5a5)
        .setStrokeStyle(1, 0xef4444)
        .setInteractive();

      this.add.text(650, 540, 'DELETE', {
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
      const submitKey = this.add.rectangle(760, 540, 90, 45, 0x86efac)
        .setStrokeStyle(1, 0x10b981)
        .setInteractive();

      this.add.text(760, 540, 'SUBMIT', {
        fontSize: '14px',
        color: '#059669',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      submitKey.on('pointerdown', () => checkAnswer.call(this));

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
            
            setTimeout(() => onGameComplete(score, accuracy), 2000);
          }
        }, 2000);
      };
    };

    // IMPROVED: Listening Game with Real Audio and Better Layout
    const createListeningGame = function(this: Phaser.Scene) {
      // Enhanced vocabulary selection with better difficulty distribution
      const allWords = vocabulary.filter(w => w.word && w.translation);
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
      const backgroundContainer = this.add.container(450, 350);
      
      // Main background with gradient effect
      const mainBg = this.add.graphics();
      mainBg.fillGradientStyle(0xfef3ff, 0xfef3ff, 0xf0f9ff, 0xf0f9ff, 1);
      mainBg.fillRoundedRect(-430, -330, 860, 660, 20);
      mainBg.lineStyle(4, 0xe0e7ff, 1);
      mainBg.strokeRoundedRect(-430, -330, 860, 660, 20);
      backgroundContainer.add(mainBg);
      
      // Add subtle pattern overlay
      const patternOverlay = this.add.graphics();
      patternOverlay.lineStyle(1, 0xddd6fe, 0.3);
      for (let i = -400; i < 400; i += 40) {
        for (let j = -300; j < 300; j += 40) {
          patternOverlay.strokeCircle(i, j, 15);
        }
      }
      backgroundContainer.add(patternOverlay);
      
      // Animated floating particles in background
      const particles = this.add.particles(0, 0, 'sparkle', {
        x: { min: 20, max: 880 },
        y: { min: 20, max: 680 },
        scale: { start: 0.1, end: 0.3 },
        alpha: { start: 0.3, end: 0 },
        lifespan: 3000,
        frequency: 2000,
        quantity: 1
      });
      
      // Header section with enhanced styling
      const headerContainer = this.add.container(450, 75);
      
      // Title background
      const titleBg = this.add.graphics();
      titleBg.fillGradientStyle(0x4f46e5, 0x4f46e5, 0x7c3aed, 0x7c3aed, 1);
      titleBg.fillRoundedRect(-200, -25, 400, 50, 25);
      titleBg.lineStyle(3, 0x3730a3, 1);
      titleBg.strokeRoundedRect(-200, -25, 400, 50, 25);
      headerContainer.add(titleBg);
      
      // Header with improved styling and glow effect
      const titleText = this.add.text(450, 75, '🎧 Listen & Choose Challenge', {
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
      const subtitleText = this.add.text(450, 110, '', {
        fontSize: '16px',
        color: '#6366f1',
        fontStyle: 'italic'
      }).setOrigin(0.5);
      
      const fullSubtitle = 'Listen carefully and choose the correct translation!';
      let charIndex = 0;
      
      const typeWriter = this.time.addEvent({
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
      const hudContainer = this.add.container(80, 160);
      
      // Score display with background and icon
      const scoreBg = this.add.graphics();
      scoreBg.fillGradientStyle(0x059669, 0x059669, 0x047857, 0x047857, 1);
      scoreBg.fillRoundedRect(-10, -20, 180, 40, 20);
      scoreBg.lineStyle(2, 0x065f46, 1);
      scoreBg.strokeRoundedRect(-10, -20, 180, 40, 20);
      hudContainer.add(scoreBg);
      
      const scoreIcon = this.add.text(-5, 0, '💎', {
        fontSize: '18px'
      }).setOrigin(0, 0.5);
      hudContainer.add(scoreIcon);
      
      const scoreText = this.add.text(25, 0, `Score: ${score}`, {
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
      const progressContainer = this.add.container(80, 210);
      
      const progressBg = this.add.image(0, 0, 'progress-bg').setOrigin(0, 0.5);
      progressContainer.add(progressBg);
      
      const progressFill = this.add.image(0, 0, 'progress-fill').setOrigin(0, 0.5);
      progressFill.setScale((currentWordIndex + 1) / words.length, 1);
      progressContainer.add(progressFill);
      
      const progressText = this.add.text(100, 0, `Round: ${currentWordIndex + 1}/${words.length}`, {
        fontSize: '14px',
        color: '#374151',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      progressContainer.add(progressText);
      
      // Lives display with animated hearts
      const livesContainer = this.add.container(80, 250);
      const livesIcons: Phaser.GameObjects.Text[] = [];
      
      for (let i = 0; i < 3; i++) {
        const heart = this.add.text(i * 30, 0, '❤️', {
          fontSize: '20px'
        }).setOrigin(0.5);
        
        // Add heartbeat animation
        this.tweens.add({
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
      
      const livesText = this.add.text(100, 0, 'Lives', {
        fontSize: '14px',
        color: '#dc2626',
        fontStyle: 'bold'
      }).setOrigin(0, 0.5);
      livesContainer.add(livesText);
      
      // Streak counter with fire effect
      const streakContainer = this.add.container(80, 290);
      
      const streakBg = this.add.graphics();
      streakBg.fillGradientStyle(0x7c3aed, 0x7c3aed, 0x5b21b6, 0x5b21b6, 1);
      streakBg.fillRoundedRect(-10, -15, 160, 30, 15);
      streakBg.lineStyle(2, 0x4c1d95, 1);
      streakBg.strokeRoundedRect(-10, -15, 160, 30, 15);
      streakContainer.add(streakBg);
      
      const streakIcon = this.add.text(0, 0, '🔥', {
        fontSize: '16px'
      }).setOrigin(0, 0.5);
      streakContainer.add(streakIcon);
      
      const streakText = this.add.text(25, 0, `Streak: ${streak}`, {
        fontSize: '14px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0, 0.5);
      streakContainer.add(streakText);

      // Enhanced play button with animations and effects
      const playButtonContainer = this.add.container(450, 230);
      
      const playButtonShadow = this.add.graphics();
      playButtonShadow.fillStyle(0x000000, 0.3);
      playButtonShadow.fillRoundedRect(-76, -36, 152, 72, 20);
      playButtonContainer.add(playButtonShadow);
      
      const playButton = this.add.graphics();
      playButton.fillGradientStyle(0x3b82f6, 0x3b82f6, 0x1d4ed8, 0x1d4ed8, 1);
      playButton.fillRoundedRect(-80, -40, 160, 80, 20);
      playButton.lineStyle(4, 0x1e40af, 1);
      playButton.strokeRoundedRect(-80, -40, 160, 80, 20);
      playButtonContainer.add(playButton);
      
      // Add glow effect
      const playButtonGlow = this.add.graphics();
      playButtonGlow.lineStyle(8, 0x60a5fa, 0.5);
      playButtonGlow.strokeRoundedRect(-84, -44, 168, 88, 24);
      playButtonContainer.add(playButtonGlow);
      playButtonGlow.setVisible(false);
      
      const playButtonText = this.add.text(0, 0, '🔊 LISTEN', {
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
      this.tweens.add({
        targets: playButtonContainer,
        scale: { from: 1, to: 1.05 },
        duration: 1500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      
      playButtonContainer.setInteractive(new Phaser.Geom.Rectangle(-80, -40, 160, 80), Phaser.Geom.Rectangle.Contains);

      // Enhanced replay button with better positioning and effects
      const replayButtonContainer = this.add.container(580, 230);
      
      const replayButtonShadow = this.add.graphics();
      replayButtonShadow.fillStyle(0x000000, 0.2);
      replayButtonShadow.fillRoundedRect(-36, -21, 72, 42, 15);
      replayButtonContainer.add(replayButtonShadow);
      
      const replayButton = this.add.graphics();
      replayButton.fillGradientStyle(0x6366f1, 0x6366f1, 0x4f46e5, 0x4f46e5, 1);
      replayButton.fillRoundedRect(-40, -25, 80, 50, 15);
      replayButton.lineStyle(3, 0x3730a3, 1);
      replayButton.strokeRoundedRect(-40, -25, 80, 50, 15);
      replayButtonContainer.add(replayButton);

      const replayIcon = this.add.text(0, 0, '🔄', {
        fontSize: '20px'
      }).setOrigin(0.5);
      replayButtonContainer.add(replayIcon);
      
      replayButtonContainer.setInteractive(new Phaser.Geom.Rectangle(-40, -25, 80, 50), Phaser.Geom.Rectangle.Contains);

      replayButtonContainer.on('pointerdown', () => {
        if (gamePhase === 'answering' && currentWordIndex < words.length) {
          const currentWord = words[currentWordIndex];
          
          // Determine language and speak
          const getLanguageCode = (targetLang: string): string => {
            const langMap: { [key: string]: string } = {
              'es': 'es-ES', 'fr': 'fr-FR', 'de': 'de-DE', 'it': 'it-IT',
              'pt': 'pt-PT', 'nl': 'nl-NL', 'ru': 'ru-RU', 'ja': 'ja-JP',
              'ko': 'ko-KR', 'zh': 'zh-CN', 'sv': 'sv-SE', 'no': 'no-NO',
              'da': 'da-DK', 'fi': 'fi-FI', 'uk': 'uk-UA', 'en': 'en-US'
            };
            return langMap[targetLang] || 'en-US';
          };
          
          const detectedLanguage = vocabulary[0]?.word ? 'es' : 'es'; // Could be improved
          const langCode = getLanguageCode(detectedLanguage);
          
          speak(currentWord.word, langCode);
          
          // Button press animation
          this.tweens.add({
            targets: replayButtonContainer,
            scale: { from: 1, to: 0.9 },
            duration: 100,
            yoyo: true
          });
        }
      });

      replayButtonContainer.on('pointerover', () => {
        this.tweens.add({
          targets: replayButtonContainer,
          scale: { from: replayButtonContainer.scale, to: 1.1 },
          duration: 200
        });
      });

      replayButtonContainer.on('pointerout', () => {
        this.tweens.add({
          targets: replayButtonContainer,
          scale: { from: replayButtonContainer.scale, to: 1 },
          duration: 200
        });
      });

      // Enhanced game instructions with better styling
      const instructionsContainer = this.add.container(450, 650);
      
      const instructionsBg = this.add.graphics();
      instructionsBg.fillGradientStyle(0xfef3ff, 0xfef3ff, 0xf0f9ff, 0xf0f9ff, 0.8);
      instructionsBg.fillRoundedRect(-350, -25, 700, 50, 20);
      instructionsBg.lineStyle(2, 0xc084fc, 0.6);
      instructionsBg.strokeRoundedRect(-350, -25, 700, 50, 20);
      instructionsContainer.add(instructionsBg);
      
      const mainInstructions = this.add.text(0, -8, 'Instructions: Click 🔊 LISTEN to hear the word, then choose the correct translation. Use 🔄 to replay.', {
        fontSize: '14px',
        color: '#6366f1',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: 680 }
      }).setOrigin(0.5);
      instructionsContainer.add(mainInstructions);

      const tipsText = this.add.text(0, 12, 'Tips: Answer quickly for bonus points! Longer streaks = higher scores!', {
        fontSize: '12px',
        color: '#7c3aed',
        align: 'center',
        fontStyle: 'italic'
      }).setOrigin(0.5);
      instructionsContainer.add(tipsText);

      // Enhanced option creation with better distractors
      const createOptions = () => {
        const currentWord = words[currentWordIndex];
        const options = [currentWord.translation];
        
        // Create smarter distractors based on category and difficulty
        const sameCategory = vocabulary.filter(w => 
          w.category === currentWord.category && 
          w.id !== currentWord.id &&
          w.translation !== currentWord.translation
        );
        
        const sameDifficulty = vocabulary.filter(w => 
          w.difficulty === currentWord.difficulty && 
          w.id !== currentWord.id &&
          w.translation !== currentWord.translation
        );
        
        // Prioritize same category, then same difficulty, then random
        const potentialDistractors = [
          ...sameCategory.slice(0, 2),
          ...sameDifficulty.slice(0, 2),
          ...vocabulary.filter(w => w.id !== currentWord.id && w.translation !== currentWord.translation).slice(0, 3)
        ];
        
        // Remove duplicates and add to options
        const uniqueDistractors = Array.from(new Set(potentialDistractors.map(w => w.translation)))
          .filter(translation => translation !== currentWord.translation)
          .slice(0, 3);
        
        options.push(...uniqueDistractors);
        
        // If we don't have enough options, add more random ones
        while (options.length < 4) {
          const randomWords = vocabulary.filter(w => 
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
        
        // Update difficulty badge
        const difficultyColors = {
          beginner: { bg: 0x10b981, text: '#ffffff' },
          intermediate: { bg: 0xf59e0b, text: '#ffffff' },
          advanced: { bg: 0xef4444, text: '#ffffff' }
        };
        
        const diffColor = difficultyColors[currentWord.difficulty as keyof typeof difficultyColors] || difficultyColors.beginner;
        
        this.add.rectangle(450, 320, 120, 30, diffColor.bg)
          .setStrokeStyle(2, diffColor.bg);
        
        this.add.text(450, 320, currentWord.difficulty.toUpperCase(), {
          fontSize: '14px',
          color: diffColor.text,
          fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Enhanced option buttons with better visual design
        options.forEach((option, index) => {
          const x = 225 + (index % 2) * 350;
          const y = 380 + Math.floor(index / 2) * 110;
          
          // Create button container for layered effects
          const buttonContainer = this.add.container(x, y);
          
          // Button shadow
          const buttonShadow = this.add.graphics();
          buttonShadow.fillStyle(0x000000, 0.15);
          buttonShadow.fillRoundedRect(-134, -34, 268, 68, 15);
          buttonContainer.add(buttonShadow);
          
          // Main button background
          const button = this.add.graphics();
          button.fillGradientStyle(0xffffff, 0xffffff, 0xf8fafc, 0xf8fafc, 1);
          button.fillRoundedRect(-140, -40, 280, 80, 15);
          button.lineStyle(3, 0xe5e7eb, 1);
          button.strokeRoundedRect(-140, -40, 280, 80, 15);
          buttonContainer.add(button);
          
          // Button glow effect (initially hidden)
          const buttonGlow = this.add.graphics();
          buttonGlow.lineStyle(6, 0x60a5fa, 0.6);
          buttonGlow.strokeRoundedRect(-144, -44, 288, 88, 19);
          buttonContainer.add(buttonGlow);
          buttonGlow.setVisible(false);

          const text = this.add.text(0, 0, option, {
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
              this.tweens.add({
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
              
              this.add.text(450, 550, feedback, {
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
              
              this.add.text(450, 550, `❌ Incorrect! Correct: "${currentWord.translation}"`, {
                fontSize: '18px',
                color: '#ef4444',
                fontStyle: 'bold',
                wordWrap: { width: 600 },
                align: 'center'
              }).setOrigin(0.5);
              
              // Game over check
              if (lives <= 0) {
                setTimeout(() => {
                  this.add.text(450, 400, '💀 Game Over!', {
                    fontSize: '32px',
                    color: '#ef4444',
                    fontStyle: 'bold'
                  }).setOrigin(0.5);
                  
                  const finalAccuracy = (correctAnswers / (currentWordIndex + 1)) * 100;
                  setTimeout(() => onGameComplete(score, finalAccuracy), 2000);
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
                this.children.list.forEach(child => {
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
                
                this.add.text(450, 380, completionMessage, {
                  fontSize: '28px',
                  color: '#4f46e5',
                  fontStyle: 'bold'
                }).setOrigin(0.5);
                
                this.add.text(450, 420, `Final Score: ${score} | Accuracy: ${accuracy.toFixed(1)}%`, {
                  fontSize: '20px',
                  color: '#6b7280'
                }).setOrigin(0.5);
                
                this.add.text(450, 450, `Best Streak: ${highestStreak} | Words Mastered: ${correctAnswers}/${words.length}`, {
                  fontSize: '16px',
                  color: '#6b7280'
                }).setOrigin(0.5);
                
                setTimeout(() => onGameComplete(score, accuracy), 3000);
              }
            }, 2500);
          });

          buttonContainer.on('pointerover', () => {
            if (buttonContainer.input?.enabled) {
              buttonGlow.setVisible(true);
              this.tweens.add({
                targets: buttonContainer,
                scale: { from: buttonContainer.scale, to: 1.05 },
                duration: 200
              });
            }
          });

          buttonContainer.on('pointerout', () => {
            if (buttonContainer.input?.enabled) {
              buttonGlow.setVisible(false);
              this.tweens.add({
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
        
        // Dynamic language detection based on current vocabulary
        const getLanguageCode = (targetLang: string): string => {
          const langMap: { [key: string]: string } = {
            'es': 'es-ES', 'fr': 'fr-FR', 'de': 'de-DE', 'it': 'it-IT',
            'pt': 'pt-PT', 'nl': 'nl-NL', 'ru': 'ru-RU', 'ja': 'ja-JP',
            'ko': 'ko-KR', 'zh': 'zh-CN', 'sv': 'sv-SE', 'no': 'no-NO',
            'da': 'da-DK', 'fi': 'fi-FI', 'uk': 'uk-UA', 'en': 'en-US'
          };
          return langMap[targetLang] || 'en-US';
        };
        
        // Try to detect target language from vocabulary
        const detectedLanguage = vocabulary[0]?.word ? 
          // Simple heuristic - could be improved with actual language detection
          vocabulary.length > 0 ? Object.keys(vocabulary[0]).find(key => key.includes('lang')) || 'es' : 'es'
          : 'es';
        
        const langCode = getLanguageCode(detectedLanguage);
        
        // Enhanced play button animation
        playButtonText.setText('🎵 PLAYING...');
        playButtonGlow.setVisible(true);
        
        // Button press animation
        this.tweens.add({
          targets: playButtonContainer,
          scale: { from: 1, to: 0.95 },
          duration: 100,
          yoyo: true
        });
        
        // Clear any previous audio indicators
        this.children.list.forEach(child => {
          if (child instanceof Phaser.GameObjects.Text && child.text.includes('🔊 Playing')) {
            child.destroy();
          }
        });
        
        // Audio indicator with animation
        const audioIndicator = this.add.text(450, 300, `🎵 Now Playing: "${currentWord.word}"`, {
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
        this.tweens.add({
          targets: audioIndicator,
          alpha: { from: 0.5, to: 1 },
          duration: 500,
          yoyo: true,
          repeat: 2
        });
        
        speak(currentWord.word, langCode);
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
        this.tweens.add({
          targets: playButtonContainer,
          scale: { from: playButtonContainer.scale, to: 1.1 },
          duration: 200
        });
      });

      playButtonContainer.on('pointerout', () => {
        if (gamePhase !== 'playing') {
          playButtonGlow.setVisible(false);
        }
        this.tweens.add({
          targets: playButtonContainer,
          scale: { from: playButtonContainer.scale, to: 1 },
          duration: 200
        });
      });
    };

    // IMPROVED: Puzzle Game with Better Layout
    const createPuzzleGame = function(this: Phaser.Scene) {
      const words = vocabulary.slice(0, 3);
      let currentWordIndex = 0;
      let score = 0;
      let correctAnswers = 0;

      // Game background panel
      this.add.rectangle(450, 350, 860, 660, 0xf8fafc).setStrokeStyle(2, 0xe2e8f0);

      this.add.text(450, 75, 'Unscramble the letters to form the correct translation!', {
        fontSize: '18px',
        color: '#6b7280'
      }).setOrigin(0.5);

      const scoreText = this.add.text(80, 120, `Score: ${score}`, {
        fontSize: '20px',
        color: '#1f2937',
        fontStyle: 'bold'
      });

      const progressText = this.add.text(80, 145, `Word: ${currentWordIndex + 1}/${words.length}`, {
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
        this.add.text(450, 170, `Translate: "${currentWord.word}"`, {
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
          
          const tile = this.add.rectangle(x, y, 45, 45, 0x3b82f6)
            .setStrokeStyle(2, 0x1d4ed8)
            .setInteractive();

          const text = this.add.text(x, y, letter.toUpperCase(), {
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
          
          const slot = this.add.rectangle(x, y, 45, 45, 0xf3f4f6)
            .setStrokeStyle(2, 0xd1d5db)
            .setInteractive();

          const text = this.add.text(x, y, '', {
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
        const clearButton = this.add.rectangle(450, 420, 110, 45, 0xef4444)
          .setStrokeStyle(2, 0xdc2626)
          .setInteractive();

        this.add.text(450, 420, 'CLEAR', {
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
          
          this.add.text(450, 480, '✓ Correct!', {
            fontSize: '26px',
            color: '#10b981',
            fontStyle: 'bold'
          }).setOrigin(0.5);
        } else {
          this.add.text(450, 480, `✗ Correct answer: ${currentWord.translation}`, {
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
            
            this.children.list.forEach(child => {
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
            this.add.text(450, 400, 'Game Complete!', {
              fontSize: '36px',
              color: '#4f46e5',
              fontStyle: 'bold'
            }).setOrigin(0.5);
            
            setTimeout(() => onGameComplete(score, accuracy), 2000);
          }
        }, 2000);
      };

      createPuzzle();
    };

    // IMPROVED: Quiz Game with Better Layout
    const createQuizGame = function(this: Phaser.Scene) {
      const words = vocabulary.slice(0, 5);
      let currentQuestionIndex = 0;
      let score = 0;
      let correctAnswers = 0;
      let timeLeft = 30; // 30 seconds per question
      let timer: Phaser.Time.TimerEvent;

      // Game background panel
      this.add.rectangle(450, 350, 860, 660, 0xf8fafc).setStrokeStyle(2, 0xe2e8f0);

      this.add.text(450, 75, 'Quick Quiz - Answer as fast as you can!', {
        fontSize: '18px',
        color: '#6b7280'
      }).setOrigin(0.5);

      const scoreText = this.add.text(80, 120, `Score: ${score}`, {
        fontSize: '20px',
        color: '#1f2937',
        fontStyle: 'bold'
      });

      const progressText = this.add.text(80, 145, `Question: ${currentQuestionIndex + 1}/${words.length}`, {
        fontSize: '18px',
        color: '#1f2937'
      });

      const timerText = this.add.text(720, 120, `Time: ${timeLeft}s`, {
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
        this.add.text(450, 180, questionText, {
          fontSize: '22px',
          color: '#1f2937',
          fontStyle: 'bold',
          wordWrap: { width: 700 }
        }).setOrigin(0.5);

        // Create answer buttons with better spacing
        options.forEach((option, index) => {
          const x = 280 + (index % 2) * 340;
          const y = 280 + Math.floor(index / 2) * 90;
          
          const button = this.add.rectangle(x, y, 200, 70, 0xe5e7eb)
            .setStrokeStyle(2, 0x9ca3af)
            .setInteractive();

          const text = this.add.text(x, y, option, {
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
              
              this.add.text(450, 450, `✓ Correct! (+${20 + timeBonus} points)`, {
                fontSize: '22px',
                color: '#10b981',
                fontStyle: 'bold'
              }).setOrigin(0.5);
            } else {
              button.setFillStyle(0xef4444);
              
              this.add.text(450, 450, `✗ Correct answer: ${correctAnswer}`, {
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
        timer = this.time.addEvent({
          delay: 1000,
          callback: () => {
            timeLeft--;
            timerText.setText(`Time: ${timeLeft}s`);
            
            if (timeLeft <= 0) {
              // Time's up
              this.add.text(450, 450, '⏰ Time\'s up!', {
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
          
          this.children.list.forEach(child => {
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
          this.add.text(450, 350, 'Quiz Complete!', {
            fontSize: '36px',
            color: '#4f46e5',
            fontStyle: 'bold'
          }).setOrigin(0.5);
          
          this.add.text(450, 390, `Final Score: ${score} points`, {
            fontSize: '22px',
            color: '#1f2937',
            fontStyle: 'bold'
          }).setOrigin(0.5);
          
          setTimeout(() => onGameComplete(score, accuracy), 2000);
        }
      };

      createQuestion();
    };

    phaserGame.current = new Phaser.Game(config);

    return () => {
      if (phaserGame.current) {
        phaserGame.current.destroy(true);
        phaserGame.current = null;
      }
    };
  }, [gameType, vocabulary, onGameComplete, speak]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <div ref={gameRef} className="w-full max-w-4xl mx-auto" />
    </div>
  );
};
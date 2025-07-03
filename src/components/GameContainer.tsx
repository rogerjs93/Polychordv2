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
          // Create simple colored rectangles for cards and UI elements
          this.add.graphics()
            .fillStyle(0x4f46e5)
            .fillRect(0, 0, 120, 80)
            .generateTexture('card-front', 120, 80);
          
          this.add.graphics()
            .fillStyle(0x6b7280)
            .fillRect(0, 0, 120, 80)
            .generateTexture('card-back', 120, 80);

          // Create button textures
          this.add.graphics()
            .fillStyle(0x10b981)
            .fillRect(0, 0, 150, 50)
            .generateTexture('button-green', 150, 50);

          this.add.graphics()
            .fillStyle(0xef4444)
            .fillRect(0, 0, 150, 50)
            .generateTexture('button-red', 150, 50);

          this.add.graphics()
            .fillStyle(0x3b82f6)
            .fillRect(0, 0, 200, 60)
            .generateTexture('button-blue', 200, 60);
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
      const words = vocabulary.slice(0, 4);
      let currentWordIndex = 0;
      let score = 0;
      let correctAnswers = 0;

      // Game background panel
      this.add.rectangle(450, 350, 860, 660, 0xf8fafc).setStrokeStyle(2, 0xe2e8f0);

      this.add.text(450, 75, 'Listen to the word and choose the correct translation!', {
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

      const playButton = this.add.rectangle(450, 180, 140, 70, 0x3b82f6)
        .setStrokeStyle(2, 0x1d4ed8)
        .setInteractive();

      this.add.text(450, 180, '🔊 PLAY', {
        fontSize: '22px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // Create answer options
      const createOptions = () => {
        const currentWord = words[currentWordIndex];
        const options = [currentWord.translation];
        
        // Add 3 random wrong answers
        const otherWords = words.filter(w => w.id !== currentWord.id);
        while (options.length < 4 && otherWords.length > 0) {
          const randomWord = otherWords.splice(Math.floor(Math.random() * otherWords.length), 1)[0];
          options.push(randomWord.translation);
        }
        
        // Shuffle options
        return options.sort(() => Math.random() - 0.5);
      };

      let optionButtons: Phaser.GameObjects.Rectangle[] = [];
      let optionTexts: Phaser.GameObjects.Text[] = [];

      const showOptions = () => {
        const options = createOptions();
        const currentWord = words[currentWordIndex];
        
        options.forEach((option, index) => {
          const x = 280 + (index % 2) * 340;
          const y = 320 + Math.floor(index / 2) * 90;
          
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
            const isCorrect = option === currentWord.translation;
            
            if (isCorrect) {
              correctAnswers++;
              score += 25;
              scoreText.setText(`Score: ${score}`);
              button.setFillStyle(0x10b981);
              
              this.add.text(450, 520, '✓ Correct!', {
                fontSize: '26px',
                color: '#10b981',
                fontStyle: 'bold'
              }).setOrigin(0.5);
            } else {
              button.setFillStyle(0xef4444);
              
              this.add.text(450, 520, `✗ Correct answer: ${currentWord.translation}`, {
                fontSize: '20px',
                color: '#ef4444',
                fontStyle: 'bold'
              }).setOrigin(0.5);
            }

            // Disable all buttons
            optionButtons.forEach(btn => btn.disableInteractive());

            setTimeout(() => {
              currentWordIndex++;
              if (currentWordIndex < words.length) {
                // Clear previous options and feedback
                optionButtons.forEach(btn => btn.destroy());
                optionTexts.forEach(txt => txt.destroy());
                optionButtons = [];
                optionTexts = [];
                
                this.children.list.forEach(child => {
                  if (child instanceof Phaser.GameObjects.Text && 
                      (child.text.includes('✓') || child.text.includes('✗'))) {
                    child.destroy();
                  }
                });
                
                progressText.setText(`Word: ${currentWordIndex + 1}/${words.length}`);
                showOptions();
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
          });

          button.on('pointerover', () => {
            if (button.input?.enabled) button.setFillStyle(0xf3f4f6);
          });

          button.on('pointerout', () => {
            if (button.input?.enabled) button.setFillStyle(0xe5e7eb);
          });

          optionButtons.push(button);
          optionTexts.push(text);
        });
      };

      playButton.on('pointerdown', () => {
        const currentWord = words[currentWordIndex];
        
        // Use real speech synthesis
        const targetLanguage = 'es'; // You can make this dynamic based on the current language pair
        const langCode = targetLanguage === 'es' ? 'es-ES' : 
                        targetLanguage === 'fr' ? 'fr-FR' : 
                        targetLanguage === 'de' ? 'de-DE' :
                        targetLanguage === 'fi' ? 'fi-FI' : 'en-US';
        
        speak(currentWord.word, langCode);
        
        playButton.setFillStyle(0x1d4ed8);
        this.add.text(450, 240, `🔊 Playing: "${currentWord.word}"`, {
          fontSize: '20px',
          color: '#3b82f6',
          fontStyle: 'bold'
        }).setOrigin(0.5);
        
        setTimeout(() => {
          playButton.setFillStyle(0x3b82f6);
          showOptions();
        }, 1500);
      });

      playButton.on('pointerover', () => playButton.setFillStyle(0x2563eb));
      playButton.on('pointerout', () => playButton.setFillStyle(0x3b82f6));
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
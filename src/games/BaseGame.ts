import { VocabularyItem } from '../types';

export interface GameConfig {
  vocabulary: VocabularyItem[];
  onGameComplete: (score: number, accuracy: number) => void;
  speak: (text: string, lang: string) => void;
}

export interface GameScene extends Phaser.Scene {
  vocabulary: VocabularyItem[];
  onGameComplete: (score: number, accuracy: number) => void;
  speak: (text: string, lang: string) => void;
  gameInstance?: BaseGame;
}

export abstract class BaseGame {
  protected vocabulary: VocabularyItem[];
  protected onGameComplete: (score: number, accuracy: number) => void;
  protected speak: (text: string, lang: string) => void;

  constructor(config: GameConfig) {
    this.vocabulary = config.vocabulary;
    this.onGameComplete = config.onGameComplete;
    this.speak = config.speak;
  }

  abstract create(scene: Phaser.Scene): void;
  
  protected createTextures(scene: Phaser.Scene): void {
    // Card textures with gradients
    const cardFrontGraphics = scene.add.graphics();
    cardFrontGraphics.fillGradientStyle(0x4f46e5, 0x4f46e5, 0x6366f1, 0x6366f1, 1);
    cardFrontGraphics.fillRect(0, 0, 120, 80);
    cardFrontGraphics.lineStyle(2, 0x3730a3, 1);
    cardFrontGraphics.strokeRoundedRect(1, 1, 118, 78, 8);
    cardFrontGraphics.generateTexture('card-front', 120, 80);
    cardFrontGraphics.destroy();
    
    const cardBackGraphics = scene.add.graphics();
    cardBackGraphics.fillGradientStyle(0x6b7280, 0x6b7280, 0x9ca3af, 0x9ca3af, 1);
    cardBackGraphics.fillRect(0, 0, 120, 80);
    cardBackGraphics.lineStyle(2, 0x4b5563, 1);
    cardBackGraphics.strokeRoundedRect(1, 1, 118, 78, 8);
    cardBackGraphics.generateTexture('card-back', 120, 80);
    cardBackGraphics.destroy();

    // Enhanced button textures with shadows and gradients
    const buttonGreen = scene.add.graphics();
    buttonGreen.fillStyle(0x000000, 0.2);
    buttonGreen.fillRoundedRect(4, 6, 146, 46, 12); // Shadow
    buttonGreen.fillGradientStyle(0x10b981, 0x10b981, 0x059669, 0x059669, 1);
    buttonGreen.fillRoundedRect(0, 0, 150, 50, 12);
    buttonGreen.lineStyle(2, 0x047857, 1);
    buttonGreen.strokeRoundedRect(1, 1, 148, 48, 12);
    buttonGreen.generateTexture('button-green', 154, 56);
    buttonGreen.destroy();

    const buttonRed = scene.add.graphics();
    buttonRed.fillStyle(0x000000, 0.2);
    buttonRed.fillRoundedRect(4, 6, 146, 46, 12);
    buttonRed.fillGradientStyle(0xef4444, 0xef4444, 0xdc2626, 0xdc2626, 1);
    buttonRed.fillRoundedRect(0, 0, 150, 50, 12);
    buttonRed.lineStyle(2, 0xb91c1c, 1);
    buttonRed.strokeRoundedRect(1, 1, 148, 48, 12);
    buttonRed.generateTexture('button-red', 154, 56);
    buttonRed.destroy();

    const buttonBlue = scene.add.graphics();
    buttonBlue.fillStyle(0x000000, 0.2);
    buttonBlue.fillRoundedRect(4, 6, 196, 56, 15);
    buttonBlue.fillGradientStyle(0x3b82f6, 0x3b82f6, 0x1d4ed8, 0x1d4ed8, 1);
    buttonBlue.fillRoundedRect(0, 0, 200, 60, 15);
    buttonBlue.lineStyle(3, 0x1e40af, 1);
    buttonBlue.strokeRoundedRect(2, 2, 196, 56, 15);
    buttonBlue.generateTexture('button-blue', 204, 66);
    buttonBlue.destroy();

    // Create particle textures for effects
    const sparkle = scene.add.graphics();
    sparkle.fillStyle(0xfbbf24, 1);
    sparkle.fillCircle(4, 4, 4);
    sparkle.fillStyle(0xfde047, 1);
    sparkle.fillCircle(4, 4, 2);
    sparkle.generateTexture('sparkle', 8, 8);
    sparkle.destroy();

    // Create progress bar textures
    const progressBg = scene.add.graphics();
    progressBg.fillStyle(0xe5e7eb, 1);
    progressBg.fillRoundedRect(0, 0, 200, 12, 6);
    progressBg.generateTexture('progress-bg', 200, 12);
    progressBg.destroy();

    const progressFill = scene.add.graphics();
    progressFill.fillStyle(0x3b82f6, 1);
    progressFill.fillRoundedRect(0, 0, 200, 12, 6);
    progressFill.generateTexture('progress-fill', 200, 12);
    progressFill.destroy();
  }
}

import Phaser from "phaser";
import { VisualEffects } from "../effects/VisualEffects";
import { generateParticleTextures } from "../effects/ParticleEffects";
import { generateBlockTextures } from "../levels/BlockTextures";
import { LevelManager } from "../levels/LevelManager";

// --- Interfaces ---
interface BlockState {
  isChanged: boolean;
  type: 'normal' | 'special' | 'goal';
  points: number;
}

// --- Constants ---
// Define the visual size of our isometric tiles
const TILE_WIDTH_HALF = 32; // Half the width of the tile image
const TILE_HEIGHT_HALF = 16; // Half the height of the tile image
const PLAYER_VERTICAL_OFFSET = -TILE_HEIGHT_HALF * 0.8; // Negative value shifts UP. Adjust multiplier (0.8) as needed.

export class GameScene extends Phaser.Scene {
    private levelManager: LevelManager;
    private currentScore: number = 0;
  private playerSprite?: Phaser.GameObjects.Sprite; // Reference to the player sprite
  private gridSprites: (Phaser.GameObjects.Sprite | null)[][] = []; // To store references to block sprites

  // --- Game State Properties ---
  private playerGridX: number = 0; // Current logical X position of the player
  private playerGridY: number = 0; // Current logical Y position of the player
  private blockStates: (BlockState | null)[][] = []; // Logical state for each block cell

  // --- Input Property ---
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys; //

  // Keep track of player state (IDLE, JUMPING) to prevent multiple jumps
  private playerState: "IDLE" | "JUMPING" = "IDLE";

  // --- NEW: Idle Bounce Tween Property ---
  private idleBounceTween?: Phaser.Tweens.Tween;
  private visualEffects!: VisualEffects;

  constructor() {
    super({ key: "GameScene" });
    this.levelManager = new LevelManager();
  }

  preload(): void {
    console.log("GameScene: preload");

    // Generate particle textures
    generateParticleTextures(this);
    
    // Generate block textures
    generateBlockTextures(this);

    // --- Adjust Block Texture Generation ---
    const blockWidth = TILE_WIDTH_HALF * 2; // 64
    const blockHeight = TILE_HEIGHT_HALF * 2; // 32 (Actual visual height of the diamond)

    // Yellow Block
    const graphicsYellow = this.make.graphics({ x: 0, y: 0, add: false });
    graphicsYellow.fillStyle(0xffff00);
    // Draw diamond points relative to top-left (0,0) of the graphic context
    graphicsYellow.fillPoints(
      [
        { x: TILE_WIDTH_HALF, y: 0 }, // Top point (center-top)
        { x: blockWidth, y: TILE_HEIGHT_HALF }, // Right point (right-middle)
        { x: TILE_WIDTH_HALF, y: blockHeight }, // Bottom point (center-bottom)
        { x: 0, y: TILE_HEIGHT_HALF } // Left point (left-middle)
      ],
      true
    );
    // Generate texture matching the drawing dimensions
    graphicsYellow.generateTexture("block_yellow", blockWidth, blockHeight);
    graphicsYellow.destroy(); // Clean up graphics object

    // Pink Block
    const graphicsPink = this.make.graphics({ x: 0, y: 0, add: false });
    graphicsPink.fillStyle(0xff00ff);
    graphicsPink.fillPoints(
      [
        { x: TILE_WIDTH_HALF, y: 0 },
        { x: blockWidth, y: TILE_HEIGHT_HALF },
        { x: TILE_WIDTH_HALF, y: blockHeight },
        { x: 0, y: TILE_HEIGHT_HALF }
      ],
      true
    );
    graphicsPink.generateTexture("block_pink", blockWidth, blockHeight);
    graphicsPink.destroy();

    // --- Adjust Player Texture Generation ---
    // Make a simple circle texture centered in its frame
    const playerRadius = TILE_WIDTH_HALF * 0.4; // e.g., 12.8
    const playerDiameter = playerRadius * 2; // e.g., 25.6
    const graphicsPlayer = this.make.graphics({ x: 0, y: 0, add: false });
    graphicsPlayer.fillStyle(0x0000ff); // Blue
    // Draw circle centered within the texture dimensions
    graphicsPlayer.fillCircle(playerRadius, playerRadius, playerRadius);
    graphicsPlayer.generateTexture("player", playerDiameter, playerDiameter);
    graphicsPlayer.destroy();
  }

  private startIdleBounce(): void {
    // Stop any existing bounce tween first
    this.stopIdleBounce();

    if (!this.playerSprite) return; // Safety check

    // Define the bounce height (adjust as needed)
    const bounceHeight = 8; // Pixels to move up
    const bounceDuration = 400; // Milliseconds for one up/down cycle

    console.log("Starting idle bounce tween");
    this.idleBounceTween = this.tweens.add({
      targets: this.playerSprite,
      y: this.playerSprite.y - bounceHeight, // Target Y position (higher on screen)
      duration: bounceDuration,
      ease: "Sine.easeInOut", // Smooth easing
      yoyo: true, // Automatically tweens back to the original 'y'
      repeat: -1 // Loop indefinitely (-1 means infinite repeats)
    });
  }

  // --- Helper function to stop the idle bounce ---
  private stopIdleBounce(): void {
    if (this.idleBounceTween?.isPlaying()) {
      console.log("Stopping idle bounce tween (without forcing Y reset)");
      this.idleBounceTween.stop();
      // REMOVED the explicit setY call again. Let the jump tween handle final position.
    }
    this.idleBounceTween = undefined; // Clear the reference
  }

  create(): void {
    console.log("GameScene: create - Initializing State");
    
    // Initialize visual effects system
    this.visualEffects = new VisualEffects(this);

    // Get current level configuration
    const currentLevel = this.levelManager.getCurrentLevel();
    if (!currentLevel) {
        console.error('No level configuration found!');
        return;
    }

    // Initialize player position from level config
    this.playerGridX = currentLevel.startPosition.x;
    this.playerGridY = currentLevel.startPosition.y;
    this.playerState = "IDLE";
    this.currentScore = 0;

    const originX = this.cameras.main.width / 2;
    const originY = this.cameras.main.height / 2 - 50;

    this.gridSprites = [];
    this.blockStates = [];

    const gridHeight = currentLevel.layout.length;

    for (let gridY = 0; gridY < gridHeight; gridY++) {
        this.gridSprites[gridY] = [];
        this.blockStates[gridY] = [];
        const gridWidth = currentLevel.layout[gridY]?.length ?? 0;

      for (let gridX = 0; gridX < gridWidth; gridX++) {
        const blockType = currentLevel.layout[gridY][gridX];
        if (blockType !== 0) {
          const screenX = originX + (gridX - gridY) * TILE_WIDTH_HALF;
          const blockBaseScreenY = originY + (gridX + gridY) * TILE_HEIGHT_HALF;

          const blockConfig = currentLevel.blockTypes[blockType];
          const blockSprite = this.add.sprite(
            screenX,
            blockBaseScreenY,
            blockConfig.textureKey
          );
          
          blockSprite.setOrigin(0.5, 0.5);
          blockSprite.setDepth(blockBaseScreenY);

          this.gridSprites[gridY][gridX] = blockSprite;
          this.blockStates[gridY][gridX] = { 
            isChanged: false,
            type: blockConfig.type,
            points: blockConfig.points || 0
          };
          
          if (blockConfig.type === 'goal') {
            this.visualEffects.createGlowEffect(blockSprite);
          }
        } else {
          this.gridSprites[gridY][gridX] = null;
          this.blockStates[gridY][gridX] = null;
        }
      }
    }

    // --- Player Rendering ---
    const playerScreenX =
      originX + (this.playerGridX - this.playerGridY) * TILE_WIDTH_HALF;
    // Calculate base Y (for depth) AND offset Y (for visual position)
    const basePlayerScreenY =
      originY + (this.playerGridX + this.playerGridY) * TILE_HEIGHT_HALF;
    const playerVisualScreenY = basePlayerScreenY + PLAYER_VERTICAL_OFFSET; // Visual Y

    this.playerSprite = this.add.sprite(
      playerScreenX,
      playerVisualScreenY,
      "player"
    ); // Position using VISUAL Y
    this.playerSprite.setOrigin(0.5, 0.5);
    // --- Adjust Depth Calculation ---
    // Base depth on the *BASE* Y position of the tile, plus a bias
    this.playerSprite.setDepth(basePlayerScreenY + 1); // Use BASE Y for depth calculation

    console.log(
      `Player starting at grid (${this.playerGridX}, ${this.playerGridY})`
    );
    console.log(
      `Player base Y: ${basePlayerScreenY}, Visual Y: ${playerVisualScreenY}, Depth: ${this.playerSprite.depth}`
    );
    console.log("Block states initialized.");

    this.cursors = this.input.keyboard.createCursorKeys();
    console.log("Cursor keys initialized.");

    // Add floating animation to player
    this.visualEffects.createFloatingAnimation(this.playerSprite);

    // --- Start initial idle bounce ---
    this.startIdleBounce();
  }

  update(time: number, delta: number): void {
    // --- Guard: Only process input if player is IDLE ---
    if (this.playerState === "JUMPING" || !this.playerSprite || !this.cursors) {
      return; // Do nothing if jumping, or if sprites/cursors aren't ready
    }

    let targetGridX: number = this.playerGridX;
    let targetGridY: number = this.playerGridY;
    let directionPressed: boolean = false;

    // --- Check for Input (using JustDown to trigger once per press) ---
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      // Visual Down-Left -> Decrease gridX
      targetGridX = this.playerGridX - 1;
      targetGridY = this.playerGridY; // Y does not change
      directionPressed = true;
      console.log(
        "Input: Left Arrow -> Try move to:",
        targetGridX,
        targetGridY
      );
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      // Visual Up-Right -> Increase gridX
      targetGridX = this.playerGridX + 1;
      targetGridY = this.playerGridY; // Y does not change
      directionPressed = true;
      console.log(
        "Input: Right Arrow -> Try move to:",
        targetGridX,
        targetGridY
      );
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      // Visual Up-Left -> Decrease gridY
      targetGridX = this.playerGridX; // X does not change
      targetGridY = this.playerGridY - 1;
      directionPressed = true;
      console.log("Input: Up Arrow -> Try move to:", targetGridX, targetGridY);
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      // Visual Down-Right -> Increase gridY
      targetGridX = this.playerGridX; // X does not change
      targetGridY = this.playerGridY + 1;
      directionPressed = true;
      console.log(
        "Input: Down Arrow -> Try move to:",
        targetGridX,
        targetGridY
      );
    }

    // If no direction was pressed, exit update
    if (!directionPressed) {
      return;
    }

    const currentLevel = this.levelManager.getCurrentLevel();
    if (!currentLevel) return;

    // --- Validate Target ---
    const isValidTarget =
      targetGridY >= 0 &&
      targetGridY < currentLevel.layout.length && // Check Y bounds
      targetGridX >= 0 &&
      targetGridX < (currentLevel.layout[targetGridY]?.length ?? 0) && // Check X bounds
      currentLevel.layout[targetGridY]?.[targetGridX] !== 0; // Check if it's not empty

    if (isValidTarget) {
      // --- Initiate Jump ---
      console.log(`Attempting jump to (${targetGridX}, ${targetGridY})`);
      this.playerState = "JUMPING";

      // Calculate target screen coordinates (use the same logic as in create)
      const originX = this.cameras.main.width / 2;
      const originY = this.cameras.main.height / 2 - 50; // Keep consistent with create
      const targetScreenX =
        originX + (targetGridX - targetGridY) * TILE_WIDTH_HALF;
      // Calculate base target Y and apply offset
      const baseTargetScreenY =
        originY + (targetGridX + targetGridY) * TILE_HEIGHT_HALF;
      const targetScreenY = baseTargetScreenY + PLAYER_VERTICAL_OFFSET; // Apply offset

      // Play jump effect at current position
      this.visualEffects.playJumpEffect(this.playerSprite.x, this.playerSprite.y);

      // --- Animate the Jump using Phaser Tweens ---
      this.tweens.add({
        targets: this.playerSprite,
        x: targetScreenX,
        y: targetScreenY, // Tween to the *offset* position
        duration: 250,
        ease: "Linear",
        onComplete: () => {
          // --- Jump Completion Logic ---
          console.log(`Jump completed to (${targetGridX}, ${targetGridY})`);

          this.playerGridX = targetGridX;
          this.playerGridY = targetGridY;

                    // Change Block State and Appearance...
          const blockState = this.blockStates[this.playerGridY]?.[this.playerGridX];
          const currentLevel = this.levelManager.getCurrentLevel();
          
          if (blockState && currentLevel) {
            const blockSprite = this.gridSprites[this.playerGridY]?.[this.playerGridX];
            if (blockSprite && !blockState.isChanged) {
              const blockType = currentLevel.layout[this.playerGridY][this.playerGridX];
              const blockConfig = currentLevel.blockTypes[blockType];
              
              // Update block appearance
              blockSprite.setTexture(blockConfig.transformedTextureKey);
              
              // Update state and score
              blockState.isChanged = true;
              this.currentScore += blockConfig.points || 0;
              
              // Play appropriate effects
              if (blockConfig.type === 'special') {
                this.visualEffects.playBlockTransform(blockSprite.x, blockSprite.y);
                this.visualEffects.createGlowEffect(blockSprite);
              } else {
                this.visualEffects.playBlockTransform(blockSprite.x, blockSprite.y);
              }
              
              console.log(
                `Block at (${this.playerGridX}, ${this.playerGridY}) transformed. Score: ${this.currentScore}`
              );
            }
          }

          // Update Player Depth based on new position...
          // IMPORTANT: Calculate the BASE Y for depth calculation
          const baseNewPlayerScreenY =
            originY + (this.playerGridX + this.playerGridY) * TILE_HEIGHT_HALF;
          this.playerSprite?.setDepth(baseNewPlayerScreenY + 1); // Use BASE Y for depth

          // --- Check for Win Condition ---
          if (this.checkWinCondition()) {
            // --- Level Complete! ---
            console.log("*************************");
            console.log("**** MVP LEVEL CLEAR! ****");
            console.log("*************************");
            this.playerState = "JUMPING"; // Disable input for MVP

            // --- *** Force Stop Bounce & Set Final Position *** ---
            console.log(
              "Win condition met: Forcing stop bounce and final position."
            );
            this.stopIdleBounce(); // Explicitly stop bounce again just in case

            if (this.playerSprite) {
              // Recalculate the final target position including offset
              const finalTargetX =
                originX +
                (this.playerGridX - this.playerGridY) * TILE_WIDTH_HALF;
              const finalBaseTargetY =
                originY +
                (this.playerGridX + this.playerGridY) * TILE_HEIGHT_HALF;
              const finalVisualTargetY =
                finalBaseTargetY + PLAYER_VERTICAL_OFFSET;

              console.log(
                `Setting final position to: (${finalTargetX}, ${finalVisualTargetY})`
              );
              this.playerSprite.setPosition(finalTargetX, finalVisualTargetY); // Set final position explicitly
              this.playerSprite.setDepth(baseNewPlayerScreenY + 1); // Re-assert depth based on BASE Y
            }
          } else {
            // Only allow next jump if the level is NOT complete
            this.playerState = "IDLE";
            console.log("Player state set to IDLE.");
            // --- *** Restart Idle Bounce *** ---
            this.startIdleBounce();
          }
        }
      }); // End of tween config
    } else {
      console.log(`Invalid jump target: (${targetGridX}, ${targetGridY})`);
      // Ensure player stays IDLE if jump is invalid
      this.playerState = "IDLE";
    }
  }

  private checkWinCondition(): boolean {
    const currentLevel = this.levelManager.getCurrentLevel();
    if (!currentLevel) return false;

    console.log("Checking win condition...");
    const requiredScore = currentLevel.requiredScore || this.calculateRequiredScore();

    // First, check if we've met the score requirement
    if (this.currentScore < requiredScore) {
      console.log(`Score requirement not met. Current: ${this.currentScore}, Required: ${requiredScore}`);
      return false;
    }

    // Then check if we're on a goal block
    const currentBlock = this.blockStates[this.playerGridY]?.[this.playerGridX];
    if (!currentBlock || currentBlock.type !== 'goal') {
      return false;
    }

    console.log("Win condition met!");
    this.handleLevelComplete();
    return true;
  }

  private calculateRequiredScore(): number {
    const currentLevel = this.levelManager.getCurrentLevel();
    if (!currentLevel) return 0;

    let totalPoints = 0;
    for (let gridY = 0; gridY < currentLevel.layout.length; gridY++) {
      for (let gridX = 0; gridX < currentLevel.layout[gridY].length; gridX++) {
        const blockType = currentLevel.layout[gridY][gridX];
        if (blockType !== 0) {
          totalPoints += currentLevel.blockTypes[blockType].points || 0;
        }
      }
    }
    return Math.floor(totalPoints * 0.7); // 70% of total possible points
  }

  private handleLevelComplete(): void {
    // Stop player movement
    this.playerState = "JUMPING";

    // Show completion message
    const text = this.add.text(
      this.cameras.main.centerX,
      100,
      `Level Complete!\nScore: ${this.currentScore}`,
      {
        align: 'center',
        fontSize: '32px',
        fill: '#fff'
      }
    ).setOrigin(0.5);

    // Add continue button if there's a next level
    if (!this.levelManager.isLastLevel()) {
      const button = this.add.text(
        this.cameras.main.centerX,
        150,
        'Continue to Next Level',
        {
          fontSize: '24px',
          fill: '#fff',
          backgroundColor: '#000'
        }
      )
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => {
        this.levelManager.nextLevel();
        this.scene.restart();
      });
    }
  }
}

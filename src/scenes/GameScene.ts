import Phaser from 'phaser';

// --- Constants ---
// Define the visual size of our isometric tiles
const TILE_WIDTH_HALF = 32; // Half the width of the tile image
const TILE_HEIGHT_HALF = 16; // Half the height of the tile image

// Define the grid layout (1 = block, 0 = empty)
const levelLayout: number[][] = [
    [1, 1, 1, 0],
    [1, 1, 1, 1],
    [1, 1, 0, 1],
    [0, 1, 1, 1]
];

// Player's starting position on the grid
const PLAYER_START_GRID_X = 1;
const PLAYER_START_GRID_Y = 1;

export class GameScene extends Phaser.Scene {
    private playerSprite?: Phaser.GameObjects.Sprite; // Reference to the player sprite
    private gridSprites: (Phaser.GameObjects.Sprite | null)[][] = []; // To store references to block sprites

    constructor() {
        super({ key: 'GameScene' });
    }

    // --- Helper Function: Cartesian to Isometric ---
    private cartesianToIsometric(cartX: number, cartY: number): { isoX: number, isoY: number } {
        const isoX = (cartX - cartY);
        const isoY = (cartX + cartY) / 2;
        return { isoX, isoY };
    }

    preload(): void {
      console.log('GameScene: preload');

      // --- Adjust Block Texture Generation ---
      const blockWidth = TILE_WIDTH_HALF * 2; // 64
      const blockHeight = TILE_HEIGHT_HALF * 2; // 32 (Actual visual height of the diamond)

      // Yellow Block
      const graphicsYellow = this.make.graphics({ x: 0, y: 0, add: false });
      graphicsYellow.fillStyle(0xffff00);
      // Draw diamond points relative to top-left (0,0) of the graphic context
      graphicsYellow.fillPoints([
          { x: TILE_WIDTH_HALF, y: 0 },              // Top point (center-top)
          { x: blockWidth,      y: TILE_HEIGHT_HALF }, // Right point (right-middle)
          { x: TILE_WIDTH_HALF, y: blockHeight },      // Bottom point (center-bottom)
          { x: 0,               y: TILE_HEIGHT_HALF }  // Left point (left-middle)
      ], true);
      // Generate texture matching the drawing dimensions
      graphicsYellow.generateTexture('block_yellow', blockWidth, blockHeight);
      graphicsYellow.destroy(); // Clean up graphics object

      // Pink Block
      const graphicsPink = this.make.graphics({ x: 0, y: 0, add: false });
      graphicsPink.fillStyle(0xff00ff);
      graphicsPink.fillPoints([
          { x: TILE_WIDTH_HALF, y: 0 },
          { x: blockWidth,      y: TILE_HEIGHT_HALF },
          { x: TILE_WIDTH_HALF, y: blockHeight },
          { x: 0,               y: TILE_HEIGHT_HALF }
      ], true);
      graphicsPink.generateTexture('block_pink', blockWidth, blockHeight);
      graphicsPink.destroy();

      // --- Adjust Player Texture Generation ---
      // Make a simple circle texture centered in its frame
      const playerRadius = TILE_WIDTH_HALF * 0.4; // e.g., 12.8
      const playerDiameter = playerRadius * 2;   // e.g., 25.6
      const graphicsPlayer = this.make.graphics({ x: 0, y: 0, add: false });
      graphicsPlayer.fillStyle(0x0000ff); // Blue
      // Draw circle centered within the texture dimensions
      graphicsPlayer.fillCircle(playerRadius, playerRadius, playerRadius);
      graphicsPlayer.generateTexture('player', playerDiameter, playerDiameter);
      graphicsPlayer.destroy();
  }

  create(): void {
    console.log('GameScene: create');

    const originX = this.cameras.main.width / 2;
    // Let's try centering the origin Y a bit more too, maybe helps visualization
    const originY = this.cameras.main.height / 2 - 50; // Pull up slightly from true center

    this.gridSprites = [];
    const gridHeight = levelLayout.length;

    for (let gridY = 0; gridY < gridHeight; gridY++) {
        this.gridSprites[gridY] = [];
        const gridWidth = levelLayout[gridY]?.length ?? 0;

        for (let gridX = 0; gridX < gridWidth; gridX++) {
            if (levelLayout[gridY][gridX] === 1) {
                // Calculate the screen center for this grid cell
                const screenX = originX + (gridX - gridY) * TILE_WIDTH_HALF;
                const screenY = originY + (gridX + gridY) * TILE_HEIGHT_HALF;

                const blockSprite = this.add.sprite(screenX, screenY, 'block_yellow');

                // --- *** Set the origin back to center (default) *** ---
                blockSprite.setOrigin(0.5, 0.5);

                // --- Depth Sorting based on calculated center Y ---
                blockSprite.setDepth(screenY);

                this.gridSprites[gridY][gridX] = blockSprite;
            } else {
                this.gridSprites[gridY][gridX] = null;
            }
        }
    }

    // --- Player Rendering ---
    // Calculate player's center screen position based on grid
    const playerScreenX = originX + (PLAYER_START_GRID_X - PLAYER_START_GRID_Y) * TILE_WIDTH_HALF;
    const playerScreenY = originY + (PLAYER_START_GRID_X + PLAYER_START_GRID_Y) * TILE_HEIGHT_HALF;

    this.playerSprite = this.add.sprite(playerScreenX, playerScreenY, 'player');

    // --- *** Set player origin to center *** ---
    this.playerSprite.setOrigin(0.5, 0.5);

    // --- Player Depth ---
    // Depth based on its center screenY position, plus a small bias
    this.playerSprite.setDepth(playerScreenY + 1);

    console.log('Grid and player rendered (Origin 0.5, 0.5 applied).');
}

    update(time: number, delta: number): void {
        // Player movement logic will go here in Phase 3
    }
}


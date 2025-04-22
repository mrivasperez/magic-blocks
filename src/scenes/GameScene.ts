import Phaser from "phaser";

// --- Interfaces ---
interface BlockState {
  isChanged: boolean;
  // We could add other properties later, like:
  // type: 'NORMAL' | 'HOLE' | 'SPECIAL';
  // initialTextureKey: string;
  // changedTextureKey: string;
}

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

  // --- Game State Properties ---
  private playerGridX: number = 0; // Current logical X position of the player
  private playerGridY: number = 0; // Current logical Y position of the player
  private blockStates: (BlockState | null)[][] = []; // Logical state for each block cell

  // --- Input Property ---
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys; //

  // Keep track of player state (IDLE, JUMPING) to prevent multiple jumps
  private playerState: "IDLE" | "JUMPING" = "IDLE";

  constructor() {
    super({ key: "GameScene" });
  }

  // --- Helper Function: Cartesian to Isometric ---
  private cartesianToIsometric(
    cartX: number,
    cartY: number
  ): { isoX: number; isoY: number } {
    const isoX = cartX - cartY;
    const isoY = (cartX + cartY) / 2;
    return { isoX, isoY };
  }

  preload(): void {
    console.log("GameScene: preload");

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

  create(): void {
    console.log("GameScene: create - Initializing State");

    // --- Initialize Player Logical Position ---
    this.playerGridX = PLAYER_START_GRID_X;
    this.playerGridY = PLAYER_START_GRID_Y;
    this.playerState = "IDLE"; // Ensure player starts idle

    const originX = this.cameras.main.width / 2;
    const originY = this.cameras.main.height / 2 - 50;

    this.gridSprites = [];
    // --- Initialize Block States Array ---
    this.blockStates = []; // Clear/initialize block states

    const gridHeight = levelLayout.length;

    for (let gridY = 0; gridY < gridHeight; gridY++) {
      this.gridSprites[gridY] = [];
      // --- Initialize Row for Block States ---
      this.blockStates[gridY] = []; // Initialize state row

      const gridWidth = levelLayout[gridY]?.length ?? 0;

      for (let gridX = 0; gridX < gridWidth; gridX++) {
        if (levelLayout[gridY][gridX] === 1) {
          const screenX = originX + (gridX - gridY) * TILE_WIDTH_HALF;
          const screenY = originY + (gridX + gridY) * TILE_HEIGHT_HALF;

          const blockSprite = this.add.sprite(screenX, screenY, "block_yellow");
          blockSprite.setOrigin(0.5, 0.5);
          blockSprite.setDepth(screenY);

          this.gridSprites[gridY][gridX] = blockSprite;

          // --- Create and Store Logical Block State ---
          this.blockStates[gridY][gridX] = { isChanged: false };
        } else {
          this.gridSprites[gridY][gridX] = null;
          // --- Store Null for Empty Grid Cells in State ---
          this.blockStates[gridY][gridX] = null;
        }
      }
    }

    // --- Player Rendering (using initialized state) ---
    const playerScreenX =
      originX + (this.playerGridX - this.playerGridY) * TILE_WIDTH_HALF;
    const playerScreenY =
      originY + (this.playerGridX + this.playerGridY) * TILE_HEIGHT_HALF;

    this.playerSprite = this.add.sprite(playerScreenX, playerScreenY, "player");
    this.playerSprite.setOrigin(0.5, 0.5);
    this.playerSprite.setDepth(playerScreenY + 1);

    console.log(
      `Player starting at grid (${this.playerGridX}, ${this.playerGridY})`
    );
    console.log("Block states initialized.");

    this.cursors = this.input.keyboard.createCursorKeys();
    console.log("Cursor keys initialized.");
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
  console.log("Input: Left Arrow -> Try move to:", targetGridX, targetGridY);
} else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
  // Visual Up-Right -> Increase gridX
  targetGridX = this.playerGridX + 1;
  targetGridY = this.playerGridY; // Y does not change
  directionPressed = true;
   console.log("Input: Right Arrow -> Try move to:", targetGridX, targetGridY);
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
   console.log("Input: Down Arrow -> Try move to:", targetGridX, targetGridY);
}

    // If no direction was pressed, exit update
    if (!directionPressed) {
      return;
    }

    // --- Validate Target ---
    const isValidTarget =
      targetGridY >= 0 &&
      targetGridY < levelLayout.length && // Check Y bounds
      targetGridX >= 0 &&
      targetGridX < (levelLayout[targetGridY]?.length ?? 0) && // Check X bounds
      levelLayout[targetGridY]?.[targetGridX] === 1; // Check if it's a block (not 0/empty)

    if (isValidTarget) {
      // --- Initiate Jump ---
      console.log(`Attempting jump to (${targetGridX}, ${targetGridY})`);
      this.playerState = "JUMPING";

      // Calculate target screen coordinates (use the same logic as in create)
      const originX = this.cameras.main.width / 2;
      const originY = this.cameras.main.height / 2 - 50; // Keep consistent with create
      const targetScreenX =
        originX + (targetGridX - targetGridY) * TILE_WIDTH_HALF;
      const targetScreenY =
        originY + (targetGridX + targetGridY) * TILE_HEIGHT_HALF;

      // --- Animate the Jump using Phaser Tweens ---
      this.tweens.add({
        targets: this.playerSprite,
        x: targetScreenX,
        y: targetScreenY, // Phaser handles tweening both x and y
        duration: 250, // Jump duration in milliseconds (adjust as needed)
        ease: "Linear", // You can experiment with eases like 'Power2'
        onComplete: () => {
          // --- Jump Completion Logic ---
          console.log(`Jump completed to (${targetGridX}, ${targetGridY})`);

          // Update logical player position
          this.playerGridX = targetGridX;
          this.playerGridY = targetGridY;

          // Change Block State and Appearance
          const blockState =
            this.blockStates[this.playerGridY]?.[this.playerGridX];
          if (blockState) {
            // Check if state exists (not null)
            blockState.isChanged = true;

            // Update visual sprite
            const blockSprite =
              this.gridSprites[this.playerGridY]?.[this.playerGridX];
            if (blockSprite) {
              blockSprite.setTexture("block_pink");
              console.log(
                `Block at (${this.playerGridX}, ${this.playerGridY}) changed to pink.`
              );
            }
          }

          // Update Player Depth based on new position
          // We need to recalculate the base screen Y for depth
          const newPlayerScreenY =
            originY + (this.playerGridX + this.playerGridY) * TILE_HEIGHT_HALF;
          this.playerSprite?.setDepth(newPlayerScreenY + 1); // Use optional chaining just in case

          // Allow next jump
          this.playerState = "IDLE";
          console.log("Player state set to IDLE.");

          // MVP Win Condition Check can go here later
        }
      });
    } else {
      console.log(`Invalid jump target: (${targetGridX}, ${targetGridY})`);
    }
  }
}

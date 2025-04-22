import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene'; // Import our scene

// Phaser Game Configuration
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO, // Automatically choose WebGL or Canvas
    width: 800,        // Game width in pixels
    height: 600,       // Game height in pixels
    parent: 'game-container', // ID of the DOM element to add the canvas to
    backgroundColor: '#1a1a2e', // A dark blue/purple background
    scene: [GameScene], // Add our scene to the game
    physics: {
        default: 'arcade', // Using Arcade Physics
        arcade: {
            debug: true, // Set to true for physics debugging visuals
            gravity: { x: 0, y: 0, } // No global gravity needed for isometric top-down
        }
    },
    // Optional: Improve pixel art rendering
    render: {
        pixelArt: true,
        antialias: false,
    }
};

// Instantiate the Phaser Game
const game = new Phaser.Game(config);

console.log('Phaser game initialized:', game);

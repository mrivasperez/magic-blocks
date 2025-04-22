import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
    constructor() {
        // The key 'GameScene' is used to identify this scene
        super({ key: 'GameScene' });
    }

    preload(): void {
        // Called once before the scene objects are created.
        // Load your assets here (images, audio, etc.)
        console.log('GameScene: preload');
    }

    create(): void {
        // Called once when the scene objects are created.
        // Set up your game objects, physics, input, etc.
        console.log('GameScene: create');

        // Example: Add some text to confirm it's working
        this.add.text(100, 100, 'Hello from GameScene!', {
            color: '#ffffff',
            fontSize: '24px'
        });
    }

    update(time: number, delta: number): void {
        // Called every frame. The core game loop logic goes here.
        // 'time' is the total time elapsed since game start
        // 'delta' is the time elapsed since the last frame (in ms)
        // console.log('GameScene: update', delta); // Avoid logging every frame unless debugging
    }
}

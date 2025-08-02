import Phaser from 'phaser';

const TILE_WIDTH = 64;  // Full width of the tile
const TILE_HEIGHT = 32; // Full height of the tile

interface BlockTextureConfig {
    mainColor: number;
    accentColor?: number;
    pattern?: 'none' | 'striped' | 'dotted' | 'starred';
}

export function generateBlockTextures(scene: Phaser.Scene): void {
    // Normal block textures
    createBlockTexture(scene, 'block_yellow', {
        mainColor: 0xffff00
    });
    createBlockTexture(scene, 'block_pink', {
        mainColor: 0xff00ff
    });

    // Special block textures
    createBlockTexture(scene, 'block_special', {
        mainColor: 0x00ffff,
        accentColor: 0x0000ff,
        pattern: 'starred'
    });
    createBlockTexture(scene, 'block_special_active', {
        mainColor: 0x0000ff,
        accentColor: 0x00ffff,
        pattern: 'starred'
    });

    // Goal block textures
    createBlockTexture(scene, 'block_goal', {
        mainColor: 0x00ff00,
        accentColor: 0xffffff,
        pattern: 'dotted'
    });
    createBlockTexture(scene, 'block_goal_active', {
        mainColor: 0x00ff00,
        accentColor: 0xffff00,
        pattern: 'dotted'
    });
}

function createBlockTexture(scene: Phaser.Scene, key: string, config: BlockTextureConfig): void {
    const graphics = scene.add.graphics();
    
    // Draw main diamond shape
    graphics.fillStyle(config.mainColor);
    graphics.beginPath();
    graphics.moveTo(TILE_WIDTH/2, 0);
    graphics.lineTo(TILE_WIDTH, TILE_HEIGHT/2);
    graphics.lineTo(TILE_WIDTH/2, TILE_HEIGHT);
    graphics.lineTo(0, TILE_HEIGHT/2);
    graphics.closePath();
    graphics.fill();

    // Add patterns if specified
    if (config.pattern && config.accentColor) {
        graphics.lineStyle(2, config.accentColor);
        
        switch (config.pattern) {
            case 'striped':
                for (let i = 1; i < 4; i++) {
                    const y = (i * TILE_HEIGHT) / 4;
                    graphics.beginPath();
                    graphics.moveTo(TILE_WIDTH/4, y);
                    graphics.lineTo(3 * TILE_WIDTH/4, y);
                    graphics.strokePath();
                }
                break;

            case 'dotted':
                const radius = 2;
                for (let i = 1; i < 4; i++) {
                    for (let j = 1; j < 4; j++) {
                        const x = (j * TILE_WIDTH) / 4;
                        const y = (i * TILE_HEIGHT) / 4;
                        graphics.fillCircle(x, y, radius);
                    }
                }
                break;

            case 'starred':
                const centerX = TILE_WIDTH/2;
                const centerY = TILE_HEIGHT/2;
                const size = 8;
                graphics.beginPath();
                graphics.moveTo(centerX - size, centerY);
                graphics.lineTo(centerX + size, centerY);
                graphics.moveTo(centerX, centerY - size);
                graphics.lineTo(centerX, centerY + size);
                graphics.moveTo(centerX - size/2, centerY - size/2);
                graphics.lineTo(centerX + size/2, centerY + size/2);
                graphics.moveTo(centerX - size/2, centerY + size/2);
                graphics.lineTo(centerX + size/2, centerY - size/2);
                graphics.strokePath();
                break;
        }
    }

    graphics.generateTexture(key, TILE_WIDTH, TILE_HEIGHT);
    graphics.destroy();
}

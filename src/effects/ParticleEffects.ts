// Base size for our particle textures
const SIZE = 32;

export function generateParticleTextures(scene: Phaser.Scene): void {
    try {
        // Create sparkle texture - now with a more complex, star-like pattern
        const sparkleGraphics = scene.add.graphics();
        sparkleGraphics.lineStyle(2, 0xFFFFFF);
        
        // Draw main cross
        sparkleGraphics.beginPath();
        sparkleGraphics.moveTo(SIZE/2, 0);
        sparkleGraphics.lineTo(SIZE/2, SIZE);
        sparkleGraphics.moveTo(0, SIZE/2);
        sparkleGraphics.lineTo(SIZE, SIZE/2);
        
        // Draw diagonal lines
        sparkleGraphics.moveTo(SIZE/4, SIZE/4);
        sparkleGraphics.lineTo(3*SIZE/4, 3*SIZE/4);
        sparkleGraphics.moveTo(3*SIZE/4, SIZE/4);
        sparkleGraphics.lineTo(SIZE/4, 3*SIZE/4);
        
        sparkleGraphics.strokePath();
        sparkleGraphics.generateTexture('sparkle', SIZE, SIZE);
        sparkleGraphics.destroy();
        
        console.log('Sparkle texture generated successfully');
    } catch (error) {
        console.error('Failed to generate sparkle texture:', error);
    }

    try {
        // Create dust particle texture - now with a softer gradient
        const dustGraphics = scene.add.graphics();
        
        // Create a radial gradient effect
        const gradient = dustGraphics.createGradient({
            x0: SIZE/2,
            y0: SIZE/2,
            r0: 0,
            x1: SIZE/2,
            y1: SIZE/2,
            r1: SIZE/4,
            colorStops: [
                { offset: 0, color: 0xFFFFFF, alpha: 1 },
                { offset: 1, color: 0xFFFFFF, alpha: 0 }
            ]
        });
        
        dustGraphics.fillStyle(0xFFFFFF, 1);
        dustGraphics.fillCircle(SIZE/2, SIZE/2, SIZE/4);
        dustGraphics.generateTexture('dust', SIZE, SIZE);
        dustGraphics.destroy();
        
        console.log('Dust texture generated successfully');
    } catch (error) {
        console.error('Failed to generate dust texture:', error);
    }
}

import Phaser from 'phaser';

export class VisualEffects {
    private scene: Phaser.Scene;
    private emitters: Map<string, Phaser.GameObjects.Particles.ParticleEmitter>;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.emitters = new Map();
        this.createParticleSystems();
    }

    private createParticleSystems(): void {
        try {
            // Block transformation particles
            const blockParticles = this.scene.add.particles(0, 0, 'sparkle', {
                lifespan: { min: 400, max: 600 },
                speed: { min: 50, max: 100 },
                scale: { start: 0.6, end: 0 },
                blendMode: 'ADD',
                tint: [ 0xffff00, 0xff00ff, 0x00ffff ],  // Yellow, Pink, Cyan
                rotate: { min: -180, max: 180 },
                emitting: false
            });
            this.emitters.set('block', blockParticles);

            // Jump particles
            const jumpParticles = this.scene.add.particles(0, 0, 'dust', {
                lifespan: { min: 300, max: 400 },
                speed: { min: 20, max: 40 },
                scale: { start: 0.4, end: 0 },
                alpha: { start: 0.6, end: 0 },
                angle: { min: 0, max: 360 },
                tint: 0xcccccc,  // Light gray
                emitting: false
            });
            this.emitters.set('jump', jumpParticles);
            
            console.log('Particle systems initialized successfully');
        } catch (error) {
            console.error('Failed to create particle systems:', error);
        }
    }

    public playBlockTransform(x: number, y: number): void {
        const emitter = this.emitters.get('block');
        if (emitter) {
            try {
                emitter.setPosition(x, y);
                emitter.explode(15);  // Increased particle count
                
                // Add a quick flash effect
                const flash = this.scene.add.sprite(x, y, 'sparkle').setScale(2);
                flash.setBlendMode('ADD');
                this.scene.tweens.add({
                    targets: flash,
                    alpha: 0,
                    scale: 3,
                    duration: 200,
                    onComplete: () => flash.destroy()
                });
            } catch (error) {
                console.error('Error playing block transform effect:', error);
            }
        }
    }

    public playJumpEffect(x: number, y: number): void {
        const emitter = this.emitters.get('jump');
        if (emitter) {
            try {
                emitter.setPosition(x, y + 16); // Offset to ground level
                emitter.explode(8);  // Increased slightly for better visibility
                
                // Add a small impact ring
                const ring = this.scene.add.sprite(x, y + 16, 'dust').setScale(0.1);
                this.scene.tweens.add({
                    targets: ring,
                    alpha: 0,
                    scale: 1,
                    duration: 300,
                    onComplete: () => ring.destroy()
                });
            } catch (error) {
                console.error('Error playing jump effect:', error);
            }
        }
    }

    public createFloatingAnimation(target: Phaser.GameObjects.Sprite): void {
        this.scene.tweens.add({
            targets: target,
            y: '+=4',
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    public createGlowEffect(target: Phaser.GameObjects.Sprite): void {
        this.scene.tweens.add({
            targets: target,
            alpha: 0.8,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
}

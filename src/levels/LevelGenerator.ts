import { BlockConfig, LevelConfig } from './LevelManager';

interface DifficultyParams {
    minSize: number;
    maxSize: number;
    specialBlockChance: number;
    gapChance: number;
    maxGapSize: number;
}

const commonBlocks = {
    normal: {
        type: 'normal' as const,
        textureKey: 'block_yellow',
        transformedTextureKey: 'block_pink',
        points: 10
    },
    special: {
        type: 'special' as const,
        textureKey: 'block_special',
        transformedTextureKey: 'block_special_active',
        points: 25
    },
    goal: {
        type: 'goal' as const,
        textureKey: 'block_goal',
        transformedTextureKey: 'block_goal_active',
        points: 50
    }
};

export class LevelGenerator {
    private static getDifficultyParams(levelNumber: number): DifficultyParams {
        // Increase difficulty with level number
        return {
            minSize: Math.min(4 + Math.floor(levelNumber / 3), 8),
            maxSize: Math.min(5 + Math.floor(levelNumber / 2), 10),
            specialBlockChance: Math.min(0.1 + (levelNumber * 0.05), 0.4),
            gapChance: Math.min(0.1 + (levelNumber * 0.03), 0.3),
            maxGapSize: Math.min(1 + Math.floor(levelNumber / 5), 3)
        };
    }

    private static generateLayout(params: DifficultyParams): number[][] {
        const size = Phaser.Math.Between(params.minSize, params.maxSize);
        const layout: number[][] = [];

        // Initialize with all normal blocks
        for (let y = 0; y < size; y++) {
            layout[y] = [];
            for (let x = 0; x < size; x++) {
                layout[y][x] = 1; // Normal block
            }
        }

        // Add gaps
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (Math.random() < params.gapChance) {
                    const gapSize = Phaser.Math.Between(1, params.maxGapSize);
                    for (let g = 0; g < gapSize && x < size; g++) {
                        layout[y][x + g] = 0;
                    }
                    x += gapSize;
                }
            }
        }

        // Add special blocks
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (layout[y][x] === 1 && Math.random() < params.specialBlockChance) {
                    layout[y][x] = 2; // Special block
                }
            }
        }

        // Ensure the level is solvable by creating a guaranteed path
        const path = this.generateSafePath(layout);
        path.forEach(([x, y]) => {
            if (layout[y][x] === 0) {
                layout[y][x] = 1;
            }
        });

        // Place goal at the end of the path
        const [endX, endY] = path[path.length - 1];
        layout[endY][endX] = 3; // Goal block

        return layout;
    }

    private static generateSafePath(layout: number[][]): [number, number][] {
        const size = layout.length;
        const start: [number, number] = [
            Phaser.Math.Between(0, Math.floor(size/2)), 
            Phaser.Math.Between(0, Math.floor(size/2))
        ];
        const end: [number, number] = [
            Phaser.Math.Between(Math.floor(size/2), size-1),
            Phaser.Math.Between(Math.floor(size/2), size-1)
        ];

        const path: [number, number][] = [start];
        let current = start;

        while (current[0] !== end[0] || current[1] !== end[1]) {
            const [x, y] = current;
            const nextX = x < end[0] ? x + 1 : x > end[0] ? x - 1 : x;
            const nextY = y < end[1] ? y + 1 : y > end[1] ? y - 1 : y;
            
            if (x !== nextX && y !== nextY) {
                // Move diagonally
                current = [nextX, nextY];
            } else if (x !== nextX) {
                // Move horizontally
                current = [nextX, y];
            } else {
                // Move vertically
                current = [x, nextY];
            }
            
            path.push(current);
        }

        return path;
    }

    public static generateLevel(levelNumber: number): LevelConfig {
        const params = this.getDifficultyParams(levelNumber);
        const layout = this.generateLayout(params);

        // Find start position (first block in the safe path)
        const path = this.generateSafePath(layout);
        const [startX, startY] = path[0];

        const levelConfig: LevelConfig = {
            id: levelNumber,
            name: `Level ${levelNumber}`,
            layout: layout,
            startPosition: { x: startX, y: startY },
            blockTypes: {
                1: commonBlocks.normal,
                2: commonBlocks.special,
                3: commonBlocks.goal
            },
            requiredScore: this.calculateRequiredScore(layout),
            timeLimit: Math.max(60, 120 - (levelNumber * 5)) // Decreasing time limit with minimum of 60 seconds
        };

        return levelConfig;
    }

    private static calculateRequiredScore(layout: number[][]): number {
        let totalPossibleScore = 0;
        for (let y = 0; y < layout.length; y++) {
            for (let x = 0; x < layout[y].length; x++) {
                switch (layout[y][x]) {
                    case 1: totalPossibleScore += commonBlocks.normal.points; break;
                    case 2: totalPossibleScore += commonBlocks.special.points; break;
                    case 3: totalPossibleScore += commonBlocks.goal.points; break;
                }
            }
        }
        return Math.floor(totalPossibleScore * 0.7); // Require 70% of possible points
    }
}

import { LevelConfig } from './LevelManager';

// Common block configurations
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

export const levelConfigs: LevelConfig[] = [
    // Level 1: Tutorial - Simple Path
    {
        id: 1,
        name: "First Steps",
        layout: [
            [1, 1, 1, 0],
            [1, 1, 1, 1],
            [1, 1, 0, 1],
            [0, 1, 1, 3]
        ],
        startPosition: { x: 1, y: 1 },
        blockTypes: {
            1: commonBlocks.normal,
            3: commonBlocks.goal
        }
    },

    // Level 2: Introducing Special Blocks
    {
        id: 2,
        name: "Special Blocks",
        layout: [
            [1, 1, 2, 0],
            [1, 1, 1, 2],
            [2, 1, 0, 1],
            [0, 2, 1, 3]
        ],
        startPosition: { x: 1, y: 1 },
        blockTypes: {
            1: commonBlocks.normal,
            2: commonBlocks.special,
            3: commonBlocks.goal
        },
        requiredScore: 150
    },

    // Level 3: The Challenge
    {
        id: 3,
        name: "The Challenge",
        layout: [
            [0, 1, 1, 2, 0],
            [1, 2, 1, 1, 1],
            [1, 1, 2, 1, 1],
            [1, 2, 1, 2, 1],
            [0, 1, 1, 1, 3]
        ],
        startPosition: { x: 2, y: 2 },
        blockTypes: {
            1: commonBlocks.normal,
            2: commonBlocks.special,
            3: commonBlocks.goal
        },
        requiredScore: 250,
        timeLimit: 60
    }
];

// Helper function to validate a level layout
export function validateLevelConfig(config: LevelConfig): boolean {
    // Check if the layout is valid (rectangular)
    const width = config.layout[0]?.length ?? 0;
    if (width === 0) return false;

    // Check all rows have the same width
    if (!config.layout.every(row => row.length === width)) return false;

    // Check if start position is valid
    const { x, y } = config.startPosition;
    if (y < 0 || y >= config.layout.length || x < 0 || x >= width) return false;
    if (config.layout[y][x] === 0) return false;

    // Check if all block types used in the layout are defined
    const usedTypes = new Set(config.layout.flat().filter(n => n !== 0));
    const definedTypes = new Set(Object.keys(config.blockTypes).map(Number));
    
    for (const type of usedTypes) {
        if (!definedTypes.has(type)) return false;
    }

    return true;
}

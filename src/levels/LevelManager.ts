export interface BlockConfig {
    type: 'normal' | 'special' | 'goal';
    textureKey: string;
    transformedTextureKey: string;
    points?: number;
}

export interface LevelConfig {
    id: number;
    name: string;
    layout: number[][];  // 0 = empty, 1 = normal block, 2 = special block, 3 = goal block
    startPosition: { x: number; y: number };
    blockTypes: { [key: number]: BlockConfig };
    requiredScore?: number;
    timeLimit?: number;  // in seconds, optional
}

export class LevelManager {
    private levels: Map<number, LevelConfig>;
    private currentLevelId: number;

    constructor() {
        this.levels = new Map();
        this.currentLevelId = 1;
        this.initializeLevels();
    }

    private initializeLevels(): void {
        // Level 1: Tutorial Level
        const level1: LevelConfig = {
            id: 1,
            name: "First Steps",
            layout: [
                [1, 1, 1, 0],
                [1, 1, 1, 1],
                [1, 1, 0, 1],
                [0, 1, 1, 3]  // 3 is the goal block
            ],
            startPosition: { x: 1, y: 1 },
            blockTypes: {
                1: {
                    type: 'normal',
                    textureKey: 'block_yellow',
                    transformedTextureKey: 'block_pink',
                    points: 10
                },
                3: {
                    type: 'goal',
                    textureKey: 'block_goal',
                    transformedTextureKey: 'block_goal_active',
                    points: 50
                }
            }
        };
        this.addLevel(level1);

        // Level 2: Introducing Special Blocks
        const level2: LevelConfig = {
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
                1: {
                    type: 'normal',
                    textureKey: 'block_yellow',
                    transformedTextureKey: 'block_pink',
                    points: 10
                },
                2: {
                    type: 'special',
                    textureKey: 'block_special',
                    transformedTextureKey: 'block_special_active',
                    points: 25
                },
                3: {
                    type: 'goal',
                    textureKey: 'block_goal',
                    transformedTextureKey: 'block_goal_active',
                    points: 50
                }
            },
            requiredScore: 150
        };
        this.addLevel(level2);
    }

    public addLevel(config: LevelConfig): void {
        this.levels.set(config.id, config);
    }

    public getLevel(id: number): LevelConfig | undefined {
        return this.levels.get(id);
    }

    public getCurrentLevel(): LevelConfig | undefined {
        return this.getLevel(this.currentLevelId);
    }

    public nextLevel(): LevelConfig | undefined {
        const nextId = this.currentLevelId + 1;
        if (this.levels.has(nextId)) {
            this.currentLevelId = nextId;
            return this.getCurrentLevel();
        }
        return undefined;
    }

    public resetProgress(): void {
        this.currentLevelId = 1;
    }

    public isLastLevel(): boolean {
        return !this.levels.has(this.currentLevelId + 1);
    }

    public getLevelCount(): number {
        return this.levels.size;
    }
}

# Otto's Magic Blocks Clone (Phaser 3 + TypeScript)

A recreation of the classic WildTangent game "Otto's Magic Blocks" (circa 2004), built using modern web technologies. This project aims to replicate the core gameplay mechanics, featuring an isometric perspective where the player jumps between blocks to change their color.

This project was developed collaboratively with assistance from Gemini 2.5 Pro in Google AI Studio.

## Features (Current MVP)

- **Isometric Grid Rendering:** Displays a multi-level grid using isometric projection.
- **Player Movement:** Control the player character (Otto placeholder) using arrow keys to jump between adjacent tiles.
- **Block Color Changing:** Landing on a tile changes its color (from yellow to pink in the current version).
- **Win Condition:** Detects when all eligible blocks on the level have been changed color.
- **Idle Bounce Animation:** The player character performs a subtle bounce animation when not moving.
- **Scoring System:**
  - Awards base points for changing a new block.
  - Implements a consecutive streak bonus (e.g., "In a row: X x 10").
  - Resets the streak upon landing on an already changed block.
- **Basic UI:** Displays the current score and the active consecutive streak bonus.
- **Placeholder Graphics:** Uses dynamically generated shapes via Phaser's Graphics API for blocks and the player (intended to be replaced with actual sprites).

## Technologies Used

- **Game Framework:** [Phaser 3](https://phaser.io/phaser3)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Build Tool / Dev Server:** [Vite](https://vitejs.dev/)
- **Rendering:** HTML5 Canvas (via Phaser)
- **Package Manager:** npm

## Setup Instructions

To set up the project locally, follow these steps:

1.  **Prerequisites:**

    - Ensure you have [Node.js](https://nodejs.org/) installed (which includes npm). LTS version is recommended.
    - Git (for cloning the repository).

2.  **Clone the Repository:**

    ```bash
    git clone <your-repository-url>
    cd <repository-directory-name>
    ```

3.  **Install Dependencies:**
    Using npm:
    ```bash
    npm install
    ```
    Or using yarn:
    ```bash
    yarn install
    ```

## Running the Game (Development Mode)

Once dependencies are installed, you can run the local development server:

Using npm:

```bash
npm run dev
```

This will typically start a server (Vite usually provides the URL, often http://localhost:5173 or similar). Open the provided URL in your web browser to play the game.

### Controls

- **Up Arrow**: Jump Visually Up-Left (Decreases Grid Y)
- **Down Arrow**: Jump Visually Down-Right (Increases Grid Y)
- **Left Arrow**: Jump Visually Down-Left (Decreases Grid X)
- **Right Arrow**: Jump Visually Up-Right (Increases Grid X)

import { Scene } from "phaser";

interface Tile {
    value: number;
    sprite: Phaser.GameObjects.Rectangle;
    text: Phaser.GameObjects.Text;
    mergedThisTurn: boolean;
}

export class Game extends Scene {
    background: Phaser.GameObjects.Image;
    gridSize: number = 4;
    tileSize: number = 100;
    tiles: Tile[][] = [];
    score: number = 0;
    scoreText: Phaser.GameObjects.Text;
    private gameOver: boolean = false;
    private readonly ANIMATION_DURATION = 200;
    private isMoving: boolean = false;
    private readonly COLORS = {
        0: 0xcdc1b4,
        2: 0xeee4da,
        4: 0xede0c8,
        8: 0xf2b179,
        16: 0xf59563,
        32: 0xf67c5f,
        64: 0xf65e3b,
        128: 0xedcf72,
        256: 0xedcc61,
        512: 0xedc850,
        1024: 0xedc53f,
        2048: 0xedc22e,
    };

    constructor() {
        super({ key: "Game" });
    }

    private checkGameOver(): boolean {
        // First check if there are any empty cells
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.tiles[row][col].value === 0) {
                    return false;
                }
            }
        }

        // Then check if any adjacent tiles can be merged
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const currentValue = this.tiles[row][col].value;

                // Check right
                if (
                    col < this.gridSize - 1 &&
                    this.tiles[row][col + 1].value === currentValue
                ) {
                    return false;
                }
                // Check down
                if (
                    row < this.gridSize - 1 &&
                    this.tiles[row + 1][col].value === currentValue
                ) {
                    return false;
                }
            }
        }

        return true;
    }

    private resetMergeFlags() {
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                this.tiles[row][col].mergedThisTurn = false;
            }
        }
    }

    private getTraverseOrder(rowDir: number, colDir: number) {
        const traverseRows =
            rowDir === 1
                ? [...Array(this.gridSize).keys()].reverse()
                : [...Array(this.gridSize).keys()];
        const traverseCols =
            colDir === 1
                ? [...Array(this.gridSize).keys()].reverse()
                : [...Array(this.gridSize).keys()];
        return { traverseRows, traverseCols };
    }

    private processTiles(
        traverseOrder: { traverseRows: number[]; traverseCols: number[] },
        rowDir: number,
        colDir: number
    ): boolean {
        let moved = false;
        for (let row of traverseOrder.traverseRows) {
            for (let col of traverseOrder.traverseCols) {
                if (this.moveTile(row, col, rowDir, colDir)) {
                    moved = true;
                }
            }
        }
        return moved;
    }

    create() {
        this.background = this.add.image(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            "background"
        ).setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        this.createBackground();
        this.createGrid();
        this.createScoreBoard();
        this.spawnTile();
        this.spawnTile();
        this.input.keyboard?.on("keydown", this.handleInput, this);

        // Add touch input handling
        let startX: number = 0;
        let startY: number = 0;
        const swipeThreshold = 50; // Minimum distance for a swipe

        //Add touch input
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            startX = pointer.x;
            startY = pointer.y;
        });

        this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            const deltaX = pointer.x - startX;
            const deltaY = pointer.y - startY;
            
            // Only process if we have a significant swipe
            if (Math.abs(deltaX) > swipeThreshold || Math.abs(deltaY) > swipeThreshold) {
                // Determine which direction had the larger movement
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    // Horizontal swipe
                    if (deltaX > 0) {
                        this.handleInput({ key: 'ArrowRight' } as KeyboardEvent);
                    } else {
                        this.handleInput({ key: 'ArrowLeft' } as KeyboardEvent);
                    }
                } else {
                    // Vertical swipe
                    if (deltaY > 0) {
                        this.handleInput({ key: 'ArrowDown' } as KeyboardEvent);
                    } else {
                        this.handleInput({ key: 'ArrowUp' } as KeyboardEvent);
                    }
                }
            }
        });
    }

    createBackground() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        const width = this.tileSize * 4 + 20;
        const height = this.tileSize * 4 + 20;

        // Create outer glow effect
        const glowSize = 30;
        this.add
            .rectangle(
                centerX,
                centerY,
                width + glowSize,
                height + glowSize,
                0x8f7a66,
                0.2
            )
            .setOrigin(0.5);

        // Main background with slight transparency
        this.add
            .rectangle(centerX, centerY, width, height, 0xbbada0, 0.95)
            .setOrigin(0.5);

        // Add subtle inner shadow
        this.add
            .rectangle(
                centerX + 2,
                centerY + 2,
                width - 4,
                height - 4,
                0x8f7a66,
                0.1
            )
            .setOrigin(0.5);
    }

    createGrid() {
        const startX = this.cameras.main.centerX - this.tileSize * 2;
        const startY = this.cameras.main.centerY - this.tileSize * 2;

        for (let row = 0; row < this.gridSize; row++) {
            this.tiles[row] = [];
            for (let col = 0; col < this.gridSize; col++) {
                const x = startX + col * this.tileSize + this.tileSize / 2;
                const y = startY + row * this.tileSize + this.tileSize / 2;
                const tileSprite = this.add.rectangle(
                    x,
                    y,
                    this.tileSize - 10,
                    this.tileSize - 10,
                    this.COLORS[0]
                );
                const tileText = this.add
                    .text(x, y, "", { fontSize: "48px", color: "#776E65" })
                    .setOrigin(0.5);
                this.tiles[row][col] = {
                    value: 0,
                    sprite: tileSprite,
                    text: tileText,
                    mergedThisTurn: false,
                };
            }
        }
    }

    createScoreBoard() {
        // Add the score text with a shadow for better visibility
        this.scoreText = this.add
            .text(
                this.cameras.main.centerX,
                this.cameras.main.centerY - this.tileSize * 2 - 50,
                "Score: 0",
                {
                    fontSize: "32px",
                    color: "#ffffff",
                    fontStyle: "bold",
                    stroke: "#000000",
                    strokeThickness: 6,
                    shadow: {
                        offsetX: 2,
                        offsetY: 2,
                        color: "#00000050",
                        blur: 2,
                        fill: true,
                    },
                }
            )
            .setOrigin(0.5);

        // Add a simple bounce animation when score changes
        this.scoreText.setData("previousScore", 0);
        this.scoreText.setData("updateScore", (newScore: number) => {
            if (newScore > this.scoreText.getData("previousScore")) {
                this.tweens.add({
                    targets: this.scoreText,
                    scaleX: 1.2,
                    scaleY: 1.2,
                    duration: 100,
                    yoyo: true,
                    ease: "Quad.easeOut",
                });
            }
            this.scoreText.setText(`Score: ${newScore}`);
            this.scoreText.setData("previousScore", newScore);
        });
    }

    spawnTile() {
        const emptyTiles: { row: number; col: number }[] = [];
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.tiles[row][col].value === 0) {
                    emptyTiles.push({ row, col });
                }
            }
        }
        if (emptyTiles.length > 0) {
            const { row, col } = Phaser.Utils.Array.GetRandom(emptyTiles);
            const value = Math.random() < 0.9 ? 2 : 4;
            this.tiles[row][col].value = value;
            this.updateTileVisuals(row, col);
            this.tiles[row][col].sprite.setScale(0);
            this.tweens.add({
                targets: this.tiles[row][col].sprite,
                scaleX: 1,
                scaleY: 1,
                duration: this.ANIMATION_DURATION,
                ease: "Back.easeOut",
                overshoot: 1.7,
            });
        }
    }

    handleInput(event: KeyboardEvent) {
        if (this.isMoving || this.gameOver) return;
        let moved = false;
        switch (event.key) {
            case "ArrowUp":
                moved = this.moveTiles(-1, 0);
                break;
            case "ArrowDown":
                moved = this.moveTiles(1, 0);
                break;
            case "ArrowLeft":
                moved = this.moveTiles(0, -1);
                break;
            case "ArrowRight":
                moved = this.moveTiles(0, 1);
                break;
        }
        if (moved) {
            this.isMoving = true;
            this.time.delayedCall(this.ANIMATION_DURATION + 50, () => {
                this.isMoving = false;
                this.spawnTile();
                // Check for game over after spawning new tile
                if (this.checkGameOver()) {
                    this.gameOver = true;
                    this.time.delayedCall(500, () => {
                        this.scene.start("GameOver", { score: this.score });
                    });
                }
            });
        }
    }

    moveTiles(rowDir: number, colDir: number): boolean {
        this.resetMergeFlags();
        const traverseOrder = this.getTraverseOrder(rowDir, colDir);
        let moved = this.processTiles(traverseOrder, rowDir, colDir);
        return moved;
    }

    moveTile(
        row: number,
        col: number,
        rowOffset: number,
        colOffset: number
    ): boolean {
        let moved = false;
        const currentTile = this.tiles[row][col];
        if (currentTile.value === 0) return moved;

        let newRow = row;
        let newCol = col;
        let canMerge = true;

        // Find the farthest position
        while (this.isWithinBounds(newRow + rowOffset, newCol + colOffset)) {
            const nextTile = this.tiles[newRow + rowOffset][newCol + colOffset];
            if (nextTile.value === 0) {
                // Move to empty space
                newRow += rowOffset;
                newCol += colOffset;
                moved = true;
            } else if (
                nextTile.value === currentTile.value &&
                canMerge &&
                !nextTile.mergedThisTurn
            ) {
                // Merge with matching tile
                newRow += rowOffset;
                newCol += colOffset;
                moved = true;
                break;
            } else {
                break;
            }
        }

        if (moved) {
            // Reset the original position's visuals
            currentTile.sprite.setPosition(
                this.cameras.main.centerX -
                    this.tileSize * 2 +
                    col * this.tileSize +
                    this.tileSize / 2,
                this.cameras.main.centerY -
                    this.tileSize * 2 +
                    row * this.tileSize +
                    this.tileSize / 2
            );
            currentTile.text.setPosition(
                this.cameras.main.centerX -
                    this.tileSize * 2 +
                    col * this.tileSize +
                    this.tileSize / 2,
                this.cameras.main.centerY -
                    this.tileSize * 2 +
                    row * this.tileSize +
                    this.tileSize / 2
            );
            // Create new empty tile at the original position
            const emptyTileSprite = this.add.rectangle(
                this.cameras.main.centerX -
                    this.tileSize * 2 +
                    col * this.tileSize +
                    this.tileSize / 2,
                this.cameras.main.centerY -
                    this.tileSize * 2 +
                    row * this.tileSize +
                    this.tileSize / 2,
                this.tileSize - 10,
                this.tileSize - 10,
                this.COLORS[0]
            );
            const emptyTileText = this.add
                .text(
                    this.cameras.main.centerX -
                        this.tileSize * 2 +
                        col * this.tileSize +
                        this.tileSize / 2,
                    this.cameras.main.centerY -
                        this.tileSize * 2 +
                        row * this.tileSize +
                        this.tileSize / 2,
                    "",
                    { fontSize: "48px", color: "#776E65" }
                )
                .setOrigin(0.5);

            // Handle merging
            if (this.tiles[newRow][newCol].value === currentTile.value) {
                this.tiles[newRow][newCol].value *= 2;
                this.tiles[newRow][newCol].mergedThisTurn = true;
                this.score += this.tiles[newRow][newCol].value;
                this.scoreText.setText(`Score: ${this.score}`);
                currentTile.value = 0;
            } else {
                this.tiles[newRow][newCol].value = currentTile.value;
                currentTile.value = 0;
            }
            // Update the tiles array with new empty tile
            this.tiles[row][col] = {
                value: 0,
                sprite: emptyTileSprite,
                text: emptyTileText,
                mergedThisTurn: false,
            };
            this.updateTileVisuals(newRow, newCol);

            this.tweens.add({
                targets: [currentTile.sprite, currentTile.text],
                x:
                    this.cameras.main.centerX -
                    this.tileSize * 2 +
                    newCol * this.tileSize +
                    this.tileSize / 2,
                y:
                    this.cameras.main.centerY -
                    this.tileSize * 2 +
                    newRow * this.tileSize +
                    this.tileSize / 2,
                duration: this.ANIMATION_DURATION,
                ease: "Back.easeOut",
                onComplete: () => {
                    currentTile.sprite.setVisible(false);
                    currentTile.text.setVisible(false);

                    if (
                        this.tiles[newRow][newCol].value ===
                        currentTile.value * 2
                    ) {
                        this.tweens.add({
                            targets: this.tiles[newRow][newCol].sprite,
                            scaleX: 1.3,
                            scaleY: 1.3,
                            duration: this.ANIMATION_DURATION / 2,
                            yoyo: true,
                            ease: "Back.easeOut",
                            overshoot: 1.7,
                        });
                    }
                },
            });
        }

        return moved;
    }

    updateTileVisuals(row: number, col: number) {
        const tile = this.tiles[row][col];
        tile.sprite.setVisible(true); // Make sure sprite is visible
        tile.text.setVisible(true); // Make sure text is visible
        tile.text.setText(tile.value ? tile.value.toString() : "");
        tile.sprite.setFillStyle(
            this.COLORS[tile.value as keyof typeof this.COLORS] ||
                this.COLORS[0]
        );
        // Reset scale to 1 if it's not already
        tile.sprite.setScale(1);
    }

    isWithinBounds(row: number, col: number): boolean {
        return (
            row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize
        );
    }
}


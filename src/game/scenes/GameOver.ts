import { EventBus } from "../EventBus";
import { Scene } from "phaser";

export class GameOver extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameOverText: Phaser.GameObjects.Text;

    constructor() {
        super("GameOver");
    }

    create() {
        this.camera = this.cameras.main;
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        this.camera.setBackgroundColor(0xff0000);

        this.background = this.add
            .image(centerX, centerY, "background")
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        this.background.setAlpha(0.5);

        this.gameOverText = this.add
            .text(centerX, centerY - 100, "Game Over", {
                fontFamily: "Arial Black",
                fontSize: 64,
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 8,
                align: "center",
            })
            .setOrigin(0.5)
            .setDepth(100);

        // Add play again button
        const playText = this.add
            .text(centerX - 200, centerY, "Play Again", {
                fontFamily: "Arial",
                fontSize: "32px",
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 4,
            })
            .setOrigin(0, 0.5);

        // Update interactive events to use the container
        playText
            .setInteractive({ useHandCursor: true })
            .on("pointerover", () => {
                playText.setColor("#000000");
            })
            .on("pointerout", () => {
                playText.setColor("#ffffff");
            })
            .on("pointerdown", () => {
                this.scene.start("Game");
            });

        // Add play again button with icon
        const homeText = this.add
            .text(centerX + 50, centerY, "Main Menu", {
                fontFamily: "Arial",
                fontSize: "32px",
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 4,
            })
            .setOrigin(0, 0.5);

        // Update interactive events to use the container
        homeText
            .setInteractive({ useHandCursor: true })
            .on("pointerover", () => {
                homeText.setColor("#000000");
            })
            .on("pointerout", () => {
                homeText.setColor("#ffffff");
            })
            .on("pointerdown", () => {
                this.scene.start("MainMenu");
            });
        EventBus.emit("current-scene-ready", this);
    }
}


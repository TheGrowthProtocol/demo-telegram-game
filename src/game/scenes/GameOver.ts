import { EventBus } from "../EventBus";
import { Scene } from "phaser";

export class GameOver extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameOverText: Phaser.GameObjects.Text;

    constructor() {
        super("GameOver");
    }

    preload() {
        this.load.image('play-icon', '/assets/icons/play.png');
        this.load.image('home-icon', '/assets/icons/home.png');
    }

    create() {
        this.camera = this.cameras.main;
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        this.camera.setBackgroundColor(0xff0000);

        this.background = this.add.image(512, 384, "background");
        this.background.setAlpha(0.5);

        this.gameOverText = this.add
            .text(512, 384, "Game Over", {
                fontFamily: "Arial Black",
                fontSize: 64,
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 8,
                align: "center",
            })
            .setOrigin(0.5)
            .setDepth(100);

        // Add play again button with icon
        const playIcon = this.add
            .image(centerX-75, centerY+50, 'play-icon')
            .setScale(0.1)
            .setOrigin(0.1);

        // Update interactive events to use the container
        playIcon
            .setInteractive({ useHandCursor: true })
            .on("pointerover", () => {
                playIcon.setScale(0.11);
            })
            .on("pointerout", () => {
                playIcon.setScale(0.1);
            })
            .on("pointerdown", () => {
                this.scene.start("Game");
            });

        // Add animation to play button
        this.tweens.add({
            targets: playIcon,
            scale: 0.11,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
        });

        // Add play again button with icon
        const homeIcon = this.add
            .image(centerX+50, centerY+50, 'home-icon')
            .setScale(0.1)
            .setOrigin(0.1);

        // Update interactive events to use the container
        homeIcon
            .setInteractive({ useHandCursor: true })
            .on("pointerover", () => {
                homeIcon.setScale(0.11);
            })
            .on("pointerout", () => {
                homeIcon.setScale(0.1);
            })
            .on("pointerdown", () => {
                this.scene.start("MainMenu");
            });

        // Add animation to play button
        this.tweens.add({
            targets: homeIcon,
            scale: 0.11,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: "Sine.easeInOut",
        });

        EventBus.emit("current-scene-ready", this);
    }

}


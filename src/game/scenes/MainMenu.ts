import { GameObjects, Scene } from "phaser";

import { EventBus } from "../EventBus";

export class MainMenu extends Scene {
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    playButton: GameObjects.Text;
    logoTween: Phaser.Tweens.Tween | null;

    constructor() {
        super("MainMenu");
    }

    preload() {
        this.load.image("play-icon", "/assets/icons/play.png");
    }

    create() {
        this.background = this.add.image(512, 384, "background");
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        // Add title
        this.title = this.add
            .text(512, 200, "2048", {
                fontFamily: "Arial Black",
                fontSize: 120,
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 8,
                align: "center",
            })
            .setOrigin(0.5)
            .setDepth(100);

        /// Add play again button with icon
        const playIcon = this.add
            .image(centerX, centerY + 50, "play-icon")
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
                this.changeScene();
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

        EventBus.emit("current-scene-ready", this);
    }

    changeScene() {
        if (this.logoTween) {
            this.logoTween.stop();
            this.logoTween = null;
        }

        // Add a simple fade out transition
        this.cameras.main.fadeOut(500);
        this.cameras.main.once("camerafadeoutcomplete", () => {
            this.scene.start("GameOver");
        });
    }

    // ... rest of the code remains the same
}


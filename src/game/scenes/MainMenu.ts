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
        this.background = this.background = this.add
            .image(
                this.cameras.main.centerX,
                this.cameras.main.centerY,
                "background"
            )
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        // Add title
        this.title = this.add
            .text(
                this.cameras.main.centerX,
                this.cameras.main.centerY - 100,
                "2048",
                {
                    fontFamily: "Arial Black",
                    fontSize: 120,
                    color: "#ffffff",
                    stroke: "#000000",
                    strokeThickness: 8,
                    align: "center",
                }
            )
            .setOrigin(0.5)
            .setDepth(100);

        /// Add play button
        const playText = this.add
            .text(
                this.cameras.main.centerX - 75,
                this.cameras.main.centerY,
                "Play Game",
                {
                    fontFamily: "Arial",
                    fontSize: "32px",
                    color: "#ffffff",
                    stroke: "#000000",
                    strokeThickness: 4,
                }
            )
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
                this.changeScene();
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
            this.scene.start("Game");
        });
    }
}


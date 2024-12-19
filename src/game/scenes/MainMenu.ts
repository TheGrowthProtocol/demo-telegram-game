import { GameObjects, Scene } from "phaser";

import { EventBus } from "../EventBus";

export class MainMenu extends Scene {
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    playButton: GameObjects.Text;
    logoTween: Phaser.Tweens.Tween | null;
    private walletText: Phaser.GameObjects.Text;

    constructor() {
        super("MainMenu");
    }

    preload() {
        this.load.image("play-icon", "/assets/icons/play.png");
    }

    create() {
        this.background = this.background = this.add.image(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            "background"
        ).setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        // Add title
        this.title = this.add
            .text(this.cameras.main.centerX, this.cameras.main.centerY -100, "2048", {
                fontFamily: "Arial Black",
                fontSize: 120,
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 8,
                align: "center",
            })
            .setOrigin(0.5)
            .setDepth(100);

        /// Add play button 
        const playText = this.add
            .text(this.cameras.main.centerX - 75, this.cameras.main.centerY, "Play Game", {
                fontFamily: "Arial",
                fontSize: "32px",
                color: "#ffffff",
                stroke: "#000000",
                strokeThickness: 4
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
                this.changeScene();
            });

        // Add wallet connect button
        const connectButton = this.add.text(
            this.cameras.main.width - 20, // Position from right edge
            20, // Position from top
            'Connect Wallet',
            {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff',
                backgroundColor: '#4CAF50',
                padding: { x: 20, y: 10 }
            }
        )
            .setOrigin(1, 0) // Align to top-right corner
            .setInteractive({ useHandCursor: true });

        // Add wallet status text
        this.walletText = this.add.text(
            this.cameras.main.width - 20,
            60, // Position below connect button
            '',
            {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#ffffff'
            }
        ).setOrigin(1, 0); // Align to right edge

        // Handle button click
        connectButton.on('pointerdown', async () => {
            try {
                const account = null;
                if (account) {
                    this.walletText.setText(`Connected: ${this.shortenAddress(account)}`);
                    connectButton.setVisible(false);
                }
            } catch (error) {
                console.error('Failed to connect wallet:', error);
                this.walletText.setText('Failed to connect wallet');
            }
        });

        // Handle hover effects
        connectButton
            .on('pointerover', () => {
                connectButton.setStyle({ backgroundColor: '#45a049' });
            })
            .on('pointerout', () => {
                connectButton.setStyle({ backgroundColor: '#4CAF50' });
            });

        EventBus.emit("current-scene-ready", this);
    }

    updateWalletStatus(address: string | null) {
        const text = address 
            ? `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`
            : 'Not Connected';
        this.walletText.setText(text);
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

    private shortenAddress(address: string): string {
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }
}


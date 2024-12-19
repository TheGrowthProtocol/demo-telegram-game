import { useRef, useState } from "react";
import { IRefPhaserGame, PhaserGame } from "./game/PhaserGame";
import WalletConnect from "./components/WalletConnect";

function App() {
    // The sprite can only be moved in the MainMenu Scene
    const [canMoveSprite, setCanMoveSprite] = useState(true);

    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);

    // Event emitted from the PhaserGame component
    const currentScene = (scene: Phaser.Scene) => {
        setCanMoveSprite(scene.scene.key !== "MainMenu");
    };

    return (
        <div id="app">
            <div className="outer-container">
                <div className="header-container">
                    <WalletConnect />
                </div>
                <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
            </div>
        </div>
    );
}

export default App;


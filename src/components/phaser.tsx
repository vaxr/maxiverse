import React, {useEffect, useRef, useState} from "react";
import {Game} from "phaser";
import {initPhaser} from "@/phaser";

export default function PhaserCanvas() {
    const [game, setGame] = useState<Game>();
    const initCalledRef = useRef(false);

    useEffect(() => {
        // If ReactMode.Strict is enabled, useEffect() is called twice in dev mode because the component
        // is unmounted and remounted. This would lead to two Phaser instances and canvases. To prevent that,
        // we use a reference to make sure to call initPhaser() only once.
        if (!game && !initCalledRef.current) {
            (async () => {
                const phaserGame = await initPhaser()
                setGame(phaserGame);
            })()
            initCalledRef.current = true
        }
    }, [game]);

    return <div id="phaser-canvas" key="phaser-canvas"/>
}

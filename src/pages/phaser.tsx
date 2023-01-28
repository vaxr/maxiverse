import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import React, {useEffect, useRef, useState} from "react";
import {Game} from 'phaser'
import {initPhaser} from "@/phaser";


export default function Phaser() {
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

    return (
        <>
            <Head>
                <title>Maxiverse</title>
                <meta name="description" content="SuiMax Maxiverse Client"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>
            <main className={styles.main}>
                <div id="phaser-canvas" key="phaser-canvas"/>
            </main>
        </>
    )
}
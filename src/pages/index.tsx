import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import React from "react";
import PhaserCanvas from "@/components/phaser";

export default function Home() {
    return (
        <>
            <Head>
                <title>Suimax Maxiverse</title>
                <meta name="description" content="SuiMax Maxiverse Client"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>
            <main className={styles.main}>
                <PhaserCanvas/>
                <p><b>Walk:</b> Arrow keys, <b>Run:</b> Shift</p>
            </main>
        </>
    )
}

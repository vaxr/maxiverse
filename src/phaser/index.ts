export const initPhaser = async () => {
    const Phaser = await import('phaser');
    // TODO import more phaser dependencies here
    const {default: Preloader} = await import('./scenes/preloader')
    const {default: HelloScene} = await import('./scenes/hello')

    return new Phaser.Game({
        type: Phaser.AUTO,
        title: 'Maxiverse',
        parent: 'phaser-canvas',
        width: 800,
        height: 600,
        pixelArt: true,
        scale: {
            zoom: 1, // TODO set to 2
        },
        scene: [
            Preloader,
            HelloScene,
        ],
        // TODO remove physics if unnecessary
        physics: {
            default: 'arcade',
            arcade: {
                gravity: {y: 200}
            }
        },
    });
}

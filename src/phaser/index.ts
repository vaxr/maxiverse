export const initPhaser = async () => {
    const Phaser = await import('phaser');
    // TODO import more phaser dependencies here
    const {default: Preloader} = await import('./scenes/preloader')
    const {default: HelloScene} = await import('./scenes/hello')
    const {default: DemoScene} = await import('./scenes/demo')

    return new Phaser.Game({
        type: Phaser.AUTO,
        title: 'Maxiverse',
        parent: 'phaser-canvas',
        width: 768,
        height: 512,
        pixelArt: true,
        scale: {
            zoom: 1, // TODO set to 2
        },
        scene: [
            Preloader,
            HelloScene,
            DemoScene,
        ],
        // TODO remove physics if unnecessary
        physics: {
            default: 'arcade',
            arcade: {
                gravity: {y: 200}
            }
        },
        fps: {
            target: 60,
            forceSetTimeOut: true
        },
    });
}

export const initPhaser = async () => {
    const Phaser = await import('phaser');
    // TODO import more phaser dependencies here
    const {default: Preloader} = await import('./scenes/preloader')
    const {default: DemoScene} = await import('./scenes/demo')

    return new Phaser.Game({
        type: Phaser.AUTO,
        title: 'Maxiverse',
        parent: 'phaser-canvas',
        width: 768,
        height: 512,
        pixelArt: true,
        scale: {
            zoom: 1,
        },
        scene: [
            Preloader,
            DemoScene,
        ],
        fps: {
            target: 60,
            forceSetTimeOut: true
        },
    });
}

export const initPhaser = async () => {
    const Phaser = await import('phaser');
    // TODO import more phaser dependencies here
    const {default: Preloader} = await import('./scenes/preloader')
    const {default: MapScene} = await import('./scenes/map')

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
            MapScene,
        ],
        fps: {
            target: 60,
            forceSetTimeOut: true
        },
    });
}

/**
 * Takes away Phaser's keyboard if any element on the page uses focus.
 * Allows input elements to capture keys, without delegating them to Phaser.
 *
 * @param game
 */
export const disableKeyboardOnBlur = (game: Phaser.Game) => {
    document.addEventListener('focusin', () => {
        game.input.keyboard.enabled = false
    })
    document.addEventListener('focusout', () => {
        game.input.keyboard.enabled = true
    })
}

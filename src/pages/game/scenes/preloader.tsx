import { Scene } from 'phaser';

export default class Preloader extends Scene {
    constructor() {
        super('preloader');
    }

    preload() {
        // TODO load assets here
    }

    create() {
        console.log('Preloader created.')
        this.scene.start('hello')
    }
}

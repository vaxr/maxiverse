import {Scene} from 'phaser';
import {LdtkRoot} from "@/core/ldtk";
import Sprite = Phaser.GameObjects.Sprite;

export default class DemoScene extends Scene {
    constructor() {
        super('demo');
    }

    private static Images = [
        'assets/stock/modern-tiles/interior.png',
        'assets/stock/modern-tiles/rooms.png',
    ]
    private static SpriteSheets = [
        'assets/stock/modern-tiles/char.png',
    ]

    preload() {
        for (const path of DemoScene.Images) {
            this.load.image(path, path);
        }
        for (const path of DemoScene.SpriteSheets) {
            this.load.spritesheet(path, path, {frameWidth: 48, frameHeight: 96});
        }
        this.load.json('ldtk', 'demo.ldtk');
    }

    create() {
        const ldtk = new LdtkRoot(this.cache.json.get('ldtk'))
        const map = this.make.tilemap({
            tileWidth: 32,
            tileHeight: 32,
            width: 24,
            height: 16,
        })
        this.addLdtkLayer(map, ldtk, 'bg0')
        this.addLdtkLayer(map, ldtk, 'bg1')
        this.addLdtkLayer(map, ldtk, 'bg2')

        this.addAnimations()
        this.addSprite(0, 5, 6)
        this.addSprite(1, 6, 6)
        this.addSprite(2, 5, 7)
        this.addSprite(3, 7, 3)
    }

    private addLdtkLayer(map: Phaser.Tilemaps.Tilemap, ldtk: LdtkRoot, name: string) {
        const layerData = ldtk.level(0).layer(name)
        const tileSet = map.addTilesetImage(layerData.tilesetName)
        const mapLayer = map.createBlankLayer(name, tileSet)
        mapLayer.putTilesAt(layerData.tileData, 0, 0)
    }

    private addAnimations() {
        const dirs: [number, string][] = [[0, 'down'], [1, 'left'], [2, 'right'], [3, 'up']]
        for (let i = 0; i < 4; i++) {
            for (let [row, dir] of dirs) {
                const off = row * 12 + i * 3
                this.anims.create({
                    key: `${i}_walk-${dir}`,
                    frames: this.anims.generateFrameNumbers(DemoScene.SpriteSheets[0], {
                        frames: [off + 1, off, off + 1, off + 2]
                    }),
                    frameRate: 5,
                    repeat: -1,
                })
            }
        }
    }

    private addSprite(i: number, x: number, y: number): Sprite {
        const sprite = this.add.sprite(16 + 32 * x, 32 * y - 4, DemoScene.SpriteSheets[0]).setScale(0.75, 0.75)
        sprite.play(`${i}_walk-down`)
        return sprite
    }
}


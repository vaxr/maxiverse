import {Scene} from 'phaser';
import {LdtkRoot} from "@/core/ldtk";
import Sprite = Phaser.GameObjects.Sprite;
import CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys;

type Direction = 'left' | 'right' | 'up' | 'down'

export default class DemoScene extends Scene {

    cursors?: CursorKeys
    player?: {
        sprite: Sprite
        dir: Direction
        walking: boolean
    }

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
        this.addSprite(1, 3, 3).play('1_idle-down')
        this.addSprite(2, 9, 7).play('2_idle-up')
        this.addSprite(3, 2, 3).play('3_idle-down')

        this.cursors = this.input.keyboard.createCursorKeys()
        this.player = {
            sprite: this.addSprite(0, 5, 6),
            dir: 'down',
            walking: false,
        }
    }

    update(time: number, delta: number) {
        super.update(time, delta);

        const pxPerMs = 4 * 32 / 1000 // TODO implement running
        if (this.player?.walking) {
            this.walkPlayer(pxPerMs * delta)
        }

        if (this.cursors?.down.isDown) {
            this.updatePlayerAnim(true, 'down')
        } else if (this.cursors?.up.isDown) {
            this.updatePlayerAnim(true, 'up')
        } else if (this.cursors?.right.isDown) {
            this.updatePlayerAnim(true, 'right')
        } else if (this.cursors?.left.isDown) {
            this.updatePlayerAnim(true, 'left')
        } else if (this.player?.walking) {
            this.updatePlayerAnim(false)
        }
    }

    private updatePlayerAnim(walking: boolean, dir?: Direction) {
        if (walking != this.player?.walking || dir && dir != this.player.dir) {
            this.player!.walking = walking
            this.player!.dir = dir || this.player!.dir
            this.player!.sprite.play(`0_${this.player?.walking ? 'walk' : 'idle'}-${this.player?.dir}`)
        }
    }

    private walkPlayer(px: number) {
        switch (this.player!.dir) {
            case 'down':
                this.player!.sprite.y += px
                break;
            case 'up':
                this.player!.sprite.y -= px
                break;
            case 'right':
                this.player!.sprite.x += px
                break;
            case 'left':
                this.player!.sprite.x -= px
                break;
        }
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
                this.anims.create({
                    key: `${i}_idle-${dir}`,
                    frames: this.anims.generateFrameNumbers(DemoScene.SpriteSheets[0], {
                        frames: [off + 1]
                    }),
                    frameRate: 5,
                    repeat: -1,
                })
            }

        }
    }

    private addSprite(i: number, x: number, y: number): Sprite {
        const sprite = this.add.sprite(16 + 32 * x, 32 * y - 6, DemoScene.SpriteSheets[0]).setScale(0.75, 0.75)
        sprite.play(`${i}_idle-down`)
        return sprite
    }
}

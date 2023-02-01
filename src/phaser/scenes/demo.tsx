import {Scene} from 'phaser';
import {LdtkRoot} from "@/core/ldtk";
import Sprite = Phaser.GameObjects.Sprite;
import CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys;

type Direction = 'left' | 'right' | 'up' | 'down'
type XY = { x: number, y: number }

export default class DemoScene extends Scene {

    cursors?: CursorKeys
    player?: {
        sprite: Sprite
        dir: Direction
        walking: boolean
        speed: XY
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
            speed: {x: 0, y: 0}
        }
    }

    update(time: number, delta: number) {
        super.update(time, delta);

        const pxPerMs = 4 * 32 / 1000 // TODO implement running
        const totalSpeed = pxPerMs * delta
        const speed = {x: 0, y: 0}
        if (this.cursors?.down.isDown) {
            speed.y += totalSpeed
        }
        if (this.cursors?.up.isDown) {
            speed.y -= totalSpeed
        }
        if (this.cursors?.right.isDown) {
            speed.x += totalSpeed
        }
        if (this.cursors?.left.isDown) {
            speed.x -= totalSpeed
        }
        if (speed.x != 0 && speed.y != 0) {
            speed.x *= Math.sqrt(0.5)
            speed.y *= Math.sqrt(0.5)
        }
        this.updatePlayerSpeed(speed)
        this.walkPlayer()
    }

    private getAnimForSpeed(i: number, speed: XY, defaultDir: Direction = 'down') {
        const type = speed.x != 0 || speed.y != 0 ? 'walk' : 'idle'
        const dir = this.getXYDir(speed) || defaultDir
        return `${i}_${type}-${dir}`
    }

    private getXYDir(xy: XY): Direction | undefined {
        if (xy.x == 0 && xy.y == 0) return undefined
        if (Math.abs(xy.x) > Math.abs(xy.y)) {
            if (xy.x > 0) return 'right'
            return 'left'
        }
        if (xy.y > 0) return 'down'
        return 'up'
    }

    private updatePlayerSpeed(speed: XY) {
        if (speed != this.player!.speed) {
            const anim = this.getAnimForSpeed(0, speed, this.player!.dir)
            if (anim != this.getAnimForSpeed(0, this.player!.speed, this.player!.dir)) {
                this.player?.sprite.play(anim)
            }
            this.player!.speed = speed
        }
    }

    private walkPlayer() {
        this.player!.sprite.x += this.player!.speed.x
        this.player!.sprite.y += this.player!.speed.y
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

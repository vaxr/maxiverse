import {Scene} from 'phaser';
import {LdtkRoot} from "@/core/ldtk";
import {CardinalDirection, Player, XY} from "@/core/model/game";
import Sprite = Phaser.GameObjects.Sprite;
import CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys;
import Key = Phaser.Input.Keyboard.Key;
import Map = Phaser.Structs.Map;

export default class DemoScene extends Scene {

    cursors?: CursorKeys
    shift?: Key
    player?: {
        sprite: Sprite
        dir: CardinalDirection
        walking: boolean
        speed: XY
    }
    walkable?: boolean[][]

    sprites: Map<string, Sprite> = new Map([])
    players: Map<string, Player> = new Map([])

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

        this.walkable = ldtk.level(0).layer('collision').intGridCsv.map((row) => {
            return row.map((tile) => tile == 1)
        })

        this.addAnimations()
        this.addSprite(1, 3, 4).play(`1_idle-${CardinalDirection.down}`)
        this.addSprite(2, 9, 8).play(`2_idle-${CardinalDirection.up}`)
        this.addSprite(3, 2, 4).play(`3_idle-${CardinalDirection.down}`)

        this.cursors = this.input.keyboard.createCursorKeys()
        this.shift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        this.player = {
            sprite: this.addSprite(0, 5, 6),
            dir: CardinalDirection.down,
            walking: false,
            speed: {x: 0, y: 0}
        }
    }

    update(time: number, delta: number) {
        super.update(time, delta);

        const pxPerMs = 4 * 32 / 1000 // TODO implement running
        const totalSpeed = pxPerMs * delta * (this.shift!.isDown ? 2.5 : 1)
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

    private getAnimForSpeed(i: number, speed: XY, defaultDir: CardinalDirection = CardinalDirection.down) {
        const type = speed.x != 0 || speed.y != 0 ? 'walk' : 'idle'
        const dir = this.getXYDir(speed) || defaultDir
        return `${i}_${type}-${dir}`
    }

    private getXYDir(xy: XY): CardinalDirection | undefined {
        if (xy.x == 0 && xy.y == 0) return undefined
        if (Math.abs(xy.x) > Math.abs(xy.y)) {
            if (xy.x > 0) return CardinalDirection.right
            return CardinalDirection.left
        }
        if (xy.y > 0) return CardinalDirection.down
        return CardinalDirection.up
    }

    private updatePlayerSpeed(speed: XY) {
        if (speed != this.player!.speed) {
            const anim = this.getAnimForSpeed(0, speed, this.player!.dir)
            if (anim != this.getAnimForSpeed(0, this.player!.speed, this.player!.dir)) {
                this.player?.sprite.play(anim)
            }
            this.player!.speed = speed
            this.player!.dir = this.getXYDir(speed) || this.player!.dir
        }
    }

    private walkPlayer() {
        const targetPx = {
            x: this.player!.sprite.x + this.player!.speed.x,
            y: this.player!.sprite.y + this.player!.speed.y,
        }
        const targetTile = {
            x: Math.floor(targetPx.x / 32),
            y: Math.floor(targetPx.y / 32),
        }
        // TODO handle multiple tiles
        if (this.walkable![targetTile.y][targetTile.x]) {
            this.player!.sprite.x = targetPx.x
            this.player!.sprite.y = targetPx.y
            if (!this.walkable![targetTile.y][targetTile.x - 1]) {
                this.player!.sprite.x = Math.max(this.player!.sprite.x, targetTile.x * 32 + 16)
            }
            if (!this.walkable![targetTile.y][targetTile.x + 1]) {
                this.player!.sprite.x = Math.min(this.player!.sprite.x, targetTile.x * 32 + 16)
            }
            if (!this.walkable![targetTile.y - 1][targetTile.x]) {
                this.player!.sprite.y = Math.max(this.player!.sprite.y, targetTile.y * 32 + 8)
            }
            if (!this.walkable![targetTile.y + 1][targetTile.x]) {
                this.player!.sprite.y = Math.min(this.player!.sprite.y, targetTile.y * 32 + 24)
            }
        } else {
            // TODO walk closest possible
        }
    }

    private addLdtkLayer(map: Phaser.Tilemaps.Tilemap, ldtk: LdtkRoot, name: string) {
        const layerData = ldtk.level(0).layer(name)
        const tileSet = map.addTilesetImage(layerData.tilesetName)
        const mapLayer = map.createBlankLayer(name, tileSet)
        mapLayer.putTilesAt(layerData.tileData, 0, 0)
    }

    private addAnimations() {
        const dirs: [number, CardinalDirection][] = [
            [0, CardinalDirection.down],
            [1, CardinalDirection.left],
            [2, CardinalDirection.right],
            [3, CardinalDirection.up],
        ]
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
        sprite.play(`${i}_idle-${CardinalDirection.down}`)
        sprite.setOrigin(0.5, 0.90)
        return sprite
    }
}

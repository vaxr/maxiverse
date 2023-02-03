import {Scene} from 'phaser';
import {LdtkRoot} from "@/core/ldtk";
import {CardinalDirection, Player, XY} from "@/core/model/game";
import {KeyBinding} from "@/core/model/input";
import {KeyMapper} from "@/phaser/keymapper";
import Sprite = Phaser.GameObjects.Sprite;
import CursorKeys = Phaser.Types.Input.Keyboard.CursorKeys;
import Key = Phaser.Input.Keyboard.Key;
import Map = Phaser.Structs.Map;


export default class DemoScene extends Scene {

    keymap: KeyMapper = new KeyMapper(this)

    cursors?: CursorKeys
    shift?: Key
    walkable?: boolean[][]

    sprites: Map<string, Sprite> = new Map([])
    player?: Player
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
        this.keymap.bindDefaults()

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
        this.addSprite('npc_client-girl', '1', 3, 4).play(`1_idle-${CardinalDirection.DOWN}`)
        this.addSprite('npc_receptionist', '2', 9, 8).play(`2_idle-${CardinalDirection.UP}`)
        this.addSprite('npc_client-boy', '3', 2, 4).play(`3_idle-${CardinalDirection.DOWN}`)

        const username = "Max" + `${Math.random()}`.substr(-6);
        const playerSprite = this.addSprite(`player_${username}`, '0', 7, 4)
        const player: Player = {
            username: username,
            nick: username,
            sprite: 'player0',
            position: {x: playerSprite.x, y: playerSprite.y},
            speed: {x: 0, y: 0},
            facing: CardinalDirection.DOWN
        }
        this.player = player
        this.players.set(`player_${player.username}`, player)
        this.sprites.set(`player_${player.username}`, playerSprite)
    }

    update(time: number, delta: number) {
        super.update(time, delta);
        this.keymap.update()

        const pxPerMs = 4 * 32 / 1000
        const totalSpeed = pxPerMs * delta * (this.keymap.isDown(KeyBinding.RUN) ? 2.5 : 1)
        const speed = {x: 0, y: 0}
        if (this.keymap.isDown(KeyBinding.DOWN)) {
            speed.y += totalSpeed
        }
        if (this.keymap.isDown(KeyBinding.UP)) {
            speed.y -= totalSpeed
        }
        if (this.keymap.isDown(KeyBinding.RIGHT)) {
            speed.x += totalSpeed
        }
        if (this.keymap.isDown(KeyBinding.LEFT)) {
            speed.x -= totalSpeed
        }
        if (speed.x != 0 && speed.y != 0) {
            speed.x *= Math.sqrt(0.5)
            speed.y *= Math.sqrt(0.5)
        }
        this.updatePlayerSpeed(speed)
        this.walkPlayer()

        {
            const receptionist = this.sprites.get('npc_receptionist')!
            const player = this.getPlayerSprite()
            const newFacing = this.getXYDir({
                x: player.x - receptionist.x,
                y: player.y - receptionist.y,
            })
            if (newFacing === CardinalDirection.UP || newFacing === CardinalDirection.LEFT) {
                receptionist.play(`2_idle-${newFacing}`)
            }
        }
    }

    private getAnimForSpeed(i: number, speed: XY, defaultDir: CardinalDirection = CardinalDirection.DOWN) {
        const type = speed.x != 0 || speed.y != 0 ? 'walk' : 'idle'
        const dir = this.getXYDir(speed) || defaultDir
        return `${i}_${type}-${dir}`
    }

    private getXYDir(xy: XY): CardinalDirection | undefined {
        if (xy.x == 0 && xy.y == 0) return undefined
        if (Math.abs(xy.x) > Math.abs(xy.y)) {
            if (xy.x > 0) return CardinalDirection.RIGHT
            return CardinalDirection.LEFT
        }
        if (xy.y > 0) return CardinalDirection.DOWN
        return CardinalDirection.UP
    }

    private updatePlayerSpeed(speed: XY) {
        if (speed != this.player!.speed) {
            const anim = this.getAnimForSpeed(0, speed, this.player!.facing)
            const needsUpdate = anim != this.getAnimForSpeed(0, this.player!.speed, this.player!.facing)
            this.player!.speed = speed
            this.player!.facing = this.getXYDir(speed) || this.player!.facing
            if (needsUpdate) {
                this.getPlayerSprite().play(anim)
            }
        }
    }

    private getPlayerSprite() {
        return this.sprites.get(`player_${this.player!.username}`)
    }

    private updatePlayerSprite() {
        const sprite = this.getPlayerSprite()
        sprite.x = this.player!.position.x
        sprite.y = this.player!.position.y
    }

    private walkPlayer() {
        const targetPx = {
            x: this.player!.position.x + this.player!.speed.x,
            y: this.player!.position.y + this.player!.speed.y,
        }
        const targetTile = {
            x: Math.floor(targetPx.x / 32),
            y: Math.floor(targetPx.y / 32),
        }
        // TODO handle multiple tiles
        if (this.walkable![targetTile.y][targetTile.x]) {
            this.player!.position.x = targetPx.x
            this.player!.position.y = targetPx.y
            if (!this.walkable![targetTile.y][targetTile.x - 1]) {
                this.player!.position.x = Math.max(this.player!.position.x, targetTile.x * 32 + 16)
            }
            if (!this.walkable![targetTile.y][targetTile.x + 1]) {
                this.player!.position.x = Math.min(this.player!.position.x, targetTile.x * 32 + 16)
            }
            if (!this.walkable![targetTile.y - 1][targetTile.x]) {
                this.player!.position.y = Math.max(this.player!.position.y, targetTile.y * 32 + 8)
            }
            if (!this.walkable![targetTile.y + 1][targetTile.x]) {
                this.player!.position.y = Math.min(this.player!.position.y, targetTile.y * 32 + 24)
            }
            this.updatePlayerSprite()
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
            [0, CardinalDirection.DOWN],
            [1, CardinalDirection.LEFT],
            [2, CardinalDirection.RIGHT],
            [3, CardinalDirection.UP],
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

    private addSprite(id: string, charset: string, x: number, y: number): Sprite {
        const sprite = this.add.sprite(16 + 32 * x, 32 * y - 6, DemoScene.SpriteSheets[0]).setScale(0.75, 0.75)
        sprite.play(`${charset}_idle-${CardinalDirection.DOWN}`)
        sprite.setOrigin(0.5, 0.90)
        this.sprites.set(id, sprite)
        return sprite
    }
}

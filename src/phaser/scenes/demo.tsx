import {Scene} from 'phaser';
import {LdtkRoot} from "@/core/ldtk";
import {KeyBindings, MoveKeyBindings} from "@/core/model/input";
import {KeyMapper} from "@/phaser/keymapper";
import {CardinalDirection, getXYDir, gridMapPos, MapPosition} from "@/core/model/map";
import {Charset, getAnimForPlayer, Player} from "@/core/model/player";
import GameClient from "@/core/client";
import Sprite = Phaser.GameObjects.Sprite;
import Map = Phaser.Structs.Map;


export default class DemoScene extends Scene {

    client: GameClient = new GameClient()
    keymap: KeyMapper = new KeyMapper(this)
    sprites: Map<string, Sprite> = new Map([])

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
        this.client.map = {
            id: 'demo_map',
            tileWidth: map.tileWidth,
            tileHeight: map.tileHeight,
            width: map.width,
            height: map.height,
            walkable: ldtk.level(0).layer('collision').intGridCsv.map((row) => {
                return row.map((tile) => tile == 1)
            })
        }
        this.addLdtkLayer(map, ldtk, 'bg0')
        this.addLdtkLayer(map, ldtk, 'bg1')
        this.addLdtkLayer(map, ldtk, 'bg2')

        this.addAnimations()
        const charset1 = new Charset(DemoScene.SpriteSheets[0])
        charset1.sheetOffset = 1
        const charset2 = new Charset(DemoScene.SpriteSheets[0])
        charset2.sheetOffset = 2
        charset2.direction = CardinalDirection.UP
        const charset3 = new Charset(DemoScene.SpriteSheets[0])
        charset3.sheetOffset = 3

        this.addSprite('npc_client-girl', charset1, gridMapPos(this.client.map, 3, 4))
        this.addSprite('npc_receptionist', charset2, gridMapPos(this.client.map, 9, 8))
        this.addSprite('npc_client-boy', charset3, gridMapPos(this.client.map, 2, 4))

        const username = "Max" + `${Math.random()}`.substr(-6);
        const player: Player = {
            username: username,
            nick: username,
            spriteId: `player_${username}`,
            charset: new Charset(DemoScene.SpriteSheets[0]),
            mapPosition: gridMapPos(this.client.map, 7, 4),
            speed: {x: 0, y: 0},
            facing: CardinalDirection.DOWN,
        }
        this.client.player = player
        this.client.players.set(player.username, player)
    }

    update(time: number, deltaMs: number) {
        super.update(time, deltaMs);
        this.keymap.update()
        this.client.updatePlayerMoveKeys(this.determinePlayerMoveKeys())
        this.client.movePlayers(deltaMs)
        this.updatePlayerSprites()
        {
            const receptionist = this.sprites.get('npc_receptionist')!
            const newFacing = getXYDir({
                x: this.client.player!.mapPosition.x - receptionist.x,
                y: this.client.player!.mapPosition.y - receptionist.y,
            })
            if (newFacing === CardinalDirection.UP || newFacing === CardinalDirection.LEFT) {
                receptionist.play(`2_idle-${newFacing}`)
            }
        }
    }

    private determinePlayerMoveKeys(): KeyBindings {
        const result: KeyBindings = new Set()
        for (const binding of MoveKeyBindings) {
            if (this.keymap.isDown(binding)) {
                result.add(binding)
            }
        }
        return result
    }

    private updatePlayerSprites() {
        const handledPlayerSprites = new Set<string>()
        for (const player of Array.from(this.client.players.values())) {
            let sprite = this.sprites.get(player.spriteId) || this.addPlayerSprite(player)
            this.updatePlayerSprite(player, sprite)
            handledPlayerSprites.add(player.spriteId)
        }
        // remove sprites without corresponding player
        for (const spriteId of this.sprites.keys()) {
            if (spriteId.startsWith('player_') && !handledPlayerSprites.has(spriteId)) {
                const sprite = this.sprites.get(spriteId)
                sprite.removedFromScene()
                this.sprites.delete(spriteId)
            }
        }
    }

    private updatePlayerSprite(player: Player, sprite: Sprite) {
        sprite.x = player.mapPosition.x
        sprite.y = player.mapPosition.y
        const newAnim = getAnimForPlayer(player)
        if (sprite.anims.currentAnim.key != newAnim) {
            sprite.play(newAnim)
        }
    }

    private addPlayerSprite(player: Player): Sprite {
        const sprite = this.addSprite(player.spriteId, player.charset, player.mapPosition)
        this.sprites.set(player.spriteId, sprite)
        return sprite
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

    private addSprite(id: string, charset: Charset, mapPosition: MapPosition): Sprite {
        const sprite = this.add.sprite(mapPosition.x, mapPosition.y, charset.sheetId)
            .setScale(0.75, 0.75) // TODO artificial scaling
        sprite.setOrigin(0.5, 0.90) // TODO customize
        sprite.play(charset.toString())
        this.sprites.set(id, sprite)
        return sprite
    }
}

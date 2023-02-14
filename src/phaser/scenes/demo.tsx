import {Scene} from 'phaser';
import {LdtkRoot} from "@/core/ldtk";
import {KeyBindings, MoveKeyBindings} from "@/core/model/input";
import {KeyMapper} from "@/phaser/keymapper";
import {CardinalDirection, Charset, getAnimForEntity, getXYDir, gridMapPos, MapEntity} from "@/core/model/map";
import GameClient from "@/core/client";
import Sprite = Phaser.GameObjects.Sprite;
import Map = Phaser.Structs.Map;


export default class DemoScene extends Scene {

    client: GameClient = new GameClient(DemoScene.SpriteSheets[0])
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
        const ldtk = new LdtkRoot(this.cache.json.get('ldtk'))
        this.client.init(ldtk)

        const map = this.make.tilemap({
            tileWidth: this.client.map!.tileWidth,
            tileHeight: this.client.map!.tileHeight,
            width: this.client.map!.width,
            height: this.client.map!.height,
        })
        this.addLdtkLayer(map, ldtk, 'bg0')
        this.addLdtkLayer(map, ldtk, 'bg1')
        this.addLdtkLayer(map, ldtk, 'bg2')
        this.addAnimations()

        this.keymap.bindDefaults()
    }

    update(time: number, deltaMs: number) {
        super.update(time, deltaMs);
        this.keymap.update()
        this.client.updatePlayerMoveKeys(this.determinePlayerMoveKeys())
        this.client.updateLogic(deltaMs)
        this.updateSprites()
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

    private updateSprites() {
        const unhandledSpriteIds = new Set(this.sprites.keys())
        for (const ent of Array.from(this.client.entities.values())) {
            let sprite = this.sprites.get(ent.entityId) || this.addSprite(ent)
            this.updateEntitySprite(ent, sprite)
            unhandledSpriteIds.delete(ent.entityId)
        }
        // remove sprites without corresponding entity
        unhandledSpriteIds.forEach((spriteId) => {
            const sprite = this.sprites.get(spriteId)
            sprite.removedFromScene()
            this.sprites.delete(spriteId)
        })
    }

    private updateEntitySprite(ent: MapEntity, sprite: Sprite) {
        sprite.x = ent.mapPosition.x
        sprite.y = ent.mapPosition.y
        const newAnim = getAnimForEntity(ent)
        if (sprite.anims.currentAnim.key != newAnim) {
            sprite.play(newAnim)
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

    private addSprite(ent: MapEntity): Sprite {
        const sprite = this.add.sprite(ent.mapPosition.x, ent.mapPosition.y, ent.charset.sheetId)
            .setScale(0.75, 0.75) // TODO artificial scaling
        sprite.setOrigin(0.5, 0.90) // TODO customize
        sprite.play(ent.charset.toString())
        this.sprites.set(ent.entityId, sprite)
        return sprite
    }
}

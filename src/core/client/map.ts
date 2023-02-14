import {CardinalDirection, Charset, GameMap, getXYDir, gridMapPos, MapEntity} from "@/core/model/map";
import {Player, playerMoveKeysToXYSpeed} from "@/core/model/player";
import {KeyBindings} from "@/core/model/input";
import {LdtkRoot} from "@/core/ldtk";
import {ClientSocket, CreatePlayerRequest, CreatePlayerResponse, MessageType, TimestampMs} from "@/core/model/protocol";

export default class MapClient {
    player?: Player
    entities: Map<string, MapEntity> = new Map([])
    map?: GameMap
    socket: ClientSocket

    defaultSpriteSheet: string

    constructor(socket: ClientSocket, defaultSpriteSheet: string) {
        this.socket = socket
        this.defaultSpriteSheet = defaultSpriteSheet
    }

    public init(ldtk: LdtkRoot) {
        this.initMap(ldtk)
        this.initPlayer()
    }

    private initMap(ldtk: LdtkRoot) {
        this.map = {
            id: 'demo_map', // TODO
            tileWidth: 32, // TODO load from LDTK
            tileHeight: 32, // TODO load from LDTK
            width: 24, // TODO load from LDTK
            height: 16, // TODO load from LDTK
            walkable: ldtk.level(0).layer('collision').intGridCsv.map((row) => {
                return row.map((tile) => tile == 1)
            })
        }
        this.addEntity({
            entityId: 'npc_client-girl',
            charset: new Charset(this.defaultSpriteSheet, 1),
            mapPosition: gridMapPos(this.map!, 3, 4),
            speed: {x: 0, y: 0},
            facing: CardinalDirection.DOWN,
        })
        this.addEntity({
            entityId: 'npc_client-boy',
            charset: new Charset(this.defaultSpriteSheet, 3),
            mapPosition: gridMapPos(this.map!, 2, 4),
            speed: {x: 0, y: 0},
            facing: CardinalDirection.DOWN,
        })
        this.addEntity({
            entityId: 'npc_receptionist',
            charset: new Charset(this.defaultSpriteSheet, 2),
            mapPosition: gridMapPos(this.map!, 9, 8),
            speed: {x: 0, y: 0},
            facing: CardinalDirection.UP,
        })
    }

    private getTimestamp(): TimestampMs {
        // TODO Use NTP
        return new Date().getTime()
    }

    private initPlayer() {
        const username = "Max" + `${Math.random()}`.substr(-6);
        this.socket.request({
            type: MessageType.CREATE_PLAYER,
            timestamp: this.getTimestamp(),
            username,
        } as CreatePlayerRequest).then((res: CreatePlayerResponse) => {
            if (res.error) {
                console.error(`${res.error.code}: ${res.error.message}`)
                return
            }
            if (res.player) {
                this.player = res.player
                this.entities.set(this.player.entityId, this.player)
            } else {
                console.error('Response didn\'t contain player information:', res)
            }
        })
    }

    private addEntity(ent: MapEntity): MapEntity {
        this.entities.set(ent.entityId, ent)
        return ent
    }

    public updatePlayerMoveKeys(keys: KeyBindings) {
        const player = this.player
        if (!player) return
        // TODO send keys to server
        player.speed = playerMoveKeysToXYSpeed(keys)
        player.facing = getXYDir(player.speed) || player.facing
    }

    public updateLogic(deltaMs: number) {
        this.updateReceptionist()
        this.updateEntityPositions(deltaMs)
    }

    private updateReceptionist() {
        if (!this.player) return
        const receptionist = this.entities.get('npc_receptionist')!
        const newFacing = getXYDir({
            x: this.player.mapPosition.x - receptionist.mapPosition.x,
            y: this.player.mapPosition.y - receptionist.mapPosition.y,
        })
        if (newFacing === CardinalDirection.UP || newFacing === CardinalDirection.LEFT) {
            receptionist.facing = newFacing
        }
    }

    private updateEntityPositions(deltaMs: number) {
        for (const ent of Array.from(this.entities.values())) {
            this.updateEntityPosition(ent, deltaMs)
        }
    }

    private updateEntityPosition(ent: MapEntity, deltaMs: number) {
        const th = this.map!.tileHeight
        const tw = this.map!.tileWidth
        const targetPx = {
            x: ent.mapPosition.x + ent.speed.x * deltaMs,
            y: ent.mapPosition.y + ent.speed.y * deltaMs,
        }
        const targetTile = {
            x: Math.floor(targetPx.x / tw),
            y: Math.floor(targetPx.y / th),
        }
        // TODO handle multiple tiles
        if (this.map!.walkable![targetTile.y][targetTile.x]) {
            ent.mapPosition.x = targetPx.x
            ent.mapPosition.y = targetPx.y
            if (!this.map!.walkable![targetTile.y][targetTile.x - 1]) {
                ent.mapPosition.x = Math.max(ent.mapPosition.x, targetTile.x * tw + 0.5 * tw)
            }
            if (!this.map!.walkable![targetTile.y][targetTile.x + 1]) {
                ent.mapPosition.x = Math.min(ent.mapPosition.x, targetTile.x * tw + 0.5 * tw)
            }
            if (!this.map!.walkable![targetTile.y - 1][targetTile.x]) {
                ent.mapPosition.y = Math.max(ent.mapPosition.y, targetTile.y * th + 0.25 * th)
            }
            if (!this.map!.walkable![targetTile.y + 1][targetTile.x]) {
                ent.mapPosition.y = Math.min(ent.mapPosition.y, targetTile.y * th + 0.75 * th)
            }
        } else {
            // TODO walk closest possible
        }
    }
}

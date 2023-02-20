import {CardinalDirection, Charset, GameMap, getXYDir, gridMapPos, MapEntity} from "@/core/model/map";
import {Player} from "@/core/model/player";
import {KeyBindings} from "@/core/model/input";
import {LdtkRoot} from "@/core/ldtk";
import {
    ClientSocket,
    CreatePlayerRequest,
    CreatePlayerResponse, EntitiesUpdate,
    Message,
    MessageType,
    PlayerMovementRequest,
    TimestampMs
} from "@/core/model/protocol";
import {updatePlayerIntent, updateEntityPosition} from "@/core/map";
import {setsAreEqual} from "@/core/util";

export default class MapClient {
    player?: Player
    entities: Map<string, MapEntity> = new Map([])
    map?: GameMap
    socket: ClientSocket
    lastPlayerIntent: KeyBindings = new Set()

    defaultSpriteSheet: string

    constructor(socket: ClientSocket, defaultSpriteSheet: string) {
        this.socket = socket
        this.defaultSpriteSheet = defaultSpriteSheet
        this.handleMessage = this.handleMessage.bind(this) // necessary for callback
    }

    public init(ldtk: LdtkRoot) {
        this.socket.onMessage(this.handleMessage)
        this.initMap(ldtk)
        this.initPlayer()
    }

    public handleMessage(message: Message) {
        switch (message.type) {
            case MessageType.ENTITIES_UPDATE:
                return this.handleEntitiesUpdate(message as EntitiesUpdate)
            default:
                console.error(`Incoming message with unknown type (${message.type}):`, message)
        }
    }

    private handleEntitiesUpdate(msg: EntitiesUpdate) {
        this.entities.clear()
        for (const ent of msg.entities) {
            this.entities.set(ent.entityId, ent)
        }
        // TODO compare timestamps and move entities
    }

    private initMap(ldtk: LdtkRoot) {
        this.map = ldtk.level(0).toGameMap('demo.ldtk') // TODO
        // TODO add entities back in
        // this.addEntity({
        //     entityId: 'npc_client-girl',
        //     charset: new Charset(this.defaultSpriteSheet, 1),
        //     mapPosition: gridMapPos(this.map!, 3, 4),
        //     speed: {x: 0, y: 0},
        //     facing: CardinalDirection.DOWN,
        // })
        // this.addEntity({
        //     entityId: 'npc_client-boy',
        //     charset: new Charset(this.defaultSpriteSheet, 3),
        //     mapPosition: gridMapPos(this.map!, 2, 4),
        //     speed: {x: 0, y: 0},
        //     facing: CardinalDirection.DOWN,
        // })
        // this.addEntity({
        //     entityId: 'npc_receptionist',
        //     charset: new Charset(this.defaultSpriteSheet, 2),
        //     mapPosition: gridMapPos(this.map!, 9, 8),
        //     speed: {x: 0, y: 0},
        //     facing: CardinalDirection.UP,
        // })
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
        if (setsAreEqual(keys, this.lastPlayerIntent)) return
        this.socket.request({
            type: MessageType.PLAYER_MOVEMENT,
            timestamp: this.getTimestamp(),
            moveKeys: Array.from(keys.keys()),
            username: player.username,
        } as PlayerMovementRequest)
        updatePlayerIntent(player, keys)
        this.lastPlayerIntent = keys
    }

    public updateLogic(deltaMs: number) {
        // this.updateReceptionist()
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
            updateEntityPosition(this.map!, ent, deltaMs)
        }
    }
}

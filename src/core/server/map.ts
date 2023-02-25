import {Player} from "@/core/model/player";
import {CardinalDirection, Charset, GameMap, getXYDir, gridMapPos, MapEntity} from "@/core/model/map";
import {
    CreatePlayerRequest,
    CreatePlayerResponse,
    EntitiesUpdate,
    MessageType,
    PlayerMovementRequest,
    Request,
    Response,
    ServerSocket,
    TimestampMs
} from "@/core/model/protocol";
import {readFileSync} from "fs";
import {LdtkRoot} from "@/core/ldtk";
import {updateEntityPosition, updatePlayerIntent} from "@/core/map";
import {Clock, SystemClock} from "@/core/util/clock";
import container from "@/di";

export default class MapServer {

    static DefaultSpriteSheet = 'assets/stock/modern-tiles/char.png' // TODO

    clock: Clock
    socket: ServerSocket
    players: Map<string, Player> = new Map([])
    maps: Map<string, GameMap> = new Map([])
    entities: Map<string, Map<string, MapEntity>> = new Map([])
    lastUpdateMs: TimestampMs = 0

    constructor(socket: ServerSocket) {
        this.clock = container.get<Clock>(SystemClock);
        this.socket = socket;
    }

    public init() {
        this.loadMap('demo.ldtk')
        this.lastUpdateMs = this.clock.getTimestampMs()
    }

    private loadMap(path: string) {
        const rawJson = JSON.parse(readFileSync(`public/${path}`).toString())
        const ldtk = new LdtkRoot(rawJson)
        const map = ldtk.level(0).toGameMap(path) // TODO
        this.maps.set(path, map)
        this.entities.set(map.id, new Map())
        {
            this.addEntity(map.id, {
                entityId: 'npc_client-girl',
                charset: new Charset(MapServer.DefaultSpriteSheet, 1),
                mapPosition: gridMapPos(map, 3, 4),
                speed: {x: 0, y: 0},
                facing: CardinalDirection.DOWN,
            })
            this.addEntity(map.id, {
                entityId: 'npc_client-boy',
                charset: new Charset(MapServer.DefaultSpriteSheet, 3),
                mapPosition: gridMapPos(map, 2, 4),
                speed: {x: 0, y: 0},
                facing: CardinalDirection.DOWN,
            })
            this.addEntity(map.id, {
                entityId: 'npc_receptionist',
                charset: new Charset(MapServer.DefaultSpriteSheet, 2),
                mapPosition: gridMapPos(map, 9, 8),
                speed: {x: 0, y: 0},
                facing: CardinalDirection.UP,
            })

        }
    }

    private defaultResponse(request: Request): Response {
        return {
            request,
            type: request.type,
            error: null,
            timestamp: this.clock.getTimestampMs(),
        }
    }

    public handleRequest(req: Request): Response {
        switch (req.type) {
            case MessageType.CREATE_PLAYER:
                return this.handleCreatePlayerRequest(req as CreatePlayerRequest)
            case MessageType.PLAYER_MOVEMENT:
                return this.handlePlayerMovement(req as PlayerMovementRequest)
            default:
                return {
                    ...this.defaultResponse(req),
                    error: {
                        code: 'invalid request type',
                        message: `invalid message type: ${req.type}`
                    }
                }
        }
    }

    public handleCreatePlayerRequest(req: CreatePlayerRequest): CreatePlayerResponse {
        if (this.players.has(req.username)) {
            return {
                ...this.defaultResponse(req),
                error: {
                    code: 'username taken',
                    message: `username "${req.username}" already exists`
                }
            }
        }
        const map: GameMap = this.maps.values().next().value // TODO
        const player = {
            username: req.username,
            nick: req.username,
            entityId: `player_${req.username}`,
            charset: new Charset(MapServer.DefaultSpriteSheet),
            mapPosition: gridMapPos(map, 7, 4), // TODO
            speed: {x: 0, y: 0},
            facing: CardinalDirection.DOWN,
        }
        this.players.set(player.username, player)
        this.entities.get(map.id)!.set(player.entityId, player)
        this.updateEntityPositions(map.id)
        this.emitEntities(Array.from(this.entities.get(map.id)!.values()))
        // TODO notify others of new player
        return {
            ...this.defaultResponse(req),
            player,
        }
    }

    private getRequestPlayer(req: Request): Player | undefined {
        return this.players.get(req.username)
    }

    private handlePlayerMovement(req: PlayerMovementRequest): Response {
        const keys = new Set(req.moveKeys)
        const player = this.getRequestPlayer(req)!
        const mapId = player.mapPosition.mapId
        this.updateEntityPositions(mapId)
        updatePlayerIntent(player, keys)
        this.updateEntityPositions(mapId)
        this.emitEntities(Array.from(this.entities.get(mapId)!.values()))
        return this.defaultResponse(req)
    }

    private updateEntityPositions(mapId: string) {
        const now = this.clock.getTimestampMs()
        const delta = now - this.lastUpdateMs
        const map = this.maps.get(mapId)!
        const entities = this.entities.get(mapId)!
        for (const ent of Array.from(entities.values())) {
            updateEntityPosition(map, ent, delta)
        }
        this.lastUpdateMs = now
        // TODO emit EntitiesUpdate
        this.socket.broadcast({
            type: MessageType.ENTITIES_UPDATE,
            timestamp: now,
            entities: Array.from(entities.values())
        } as EntitiesUpdate)
        {
            if (this.players.size < 1) return;
            const player = this.players.values().next().value
            if (!player) return
            const receptionist = entities.get('npc_receptionist')!
            const newFacing = getXYDir({
                x: player.mapPosition.x - receptionist.mapPosition.x,
                y: player.mapPosition.y - receptionist.mapPosition.y,
            })
            if (newFacing === CardinalDirection.UP || newFacing === CardinalDirection.LEFT) {
                receptionist.facing = newFacing
            }
        }
    }

    private emitEntities(entities: MapEntity[]) {
        this.socket.broadcast({
            type: MessageType.ENTITIES_UPDATE,
            timestamp: this.clock.getTimestampMs(),
            entities: Array.from(entities.values())
        } as EntitiesUpdate)
    }

    private addEntity(mapId: string, ent: MapEntity): MapEntity {
        this.entities.get(mapId)!.set(ent.entityId, ent)
        return ent
    }
}

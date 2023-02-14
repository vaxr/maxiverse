import {Player} from "@/core/model/player";
import {CardinalDirection, Charset, GameMap, gridMapPos, MapEntity} from "@/core/model/map";
import {
    CreatePlayerRequest,
    CreatePlayerResponse,
    MessageType,
    Request,
    Response,
    TimestampMs
} from "@/core/model/protocol";

export default class MapServer {

    static DefaultSpriteSheet = 'assets/stock/modern-tiles/char.png' // TODO

    players: Map<string, Player> = new Map([])
    maps: Map<string, GameMap> = new Map([])
    entities: Map<string, Map<string, MapEntity>> = new Map([])

    public init() {
        // TODO killme
        this.maps.set('demo_map', {
            id: 'demo_map', // TODO
            tileWidth: 32,
            tileHeight: 32,
            width: 24,
            height: 16,
            walkable: [],
        })
    }

    private getTimestamp(): TimestampMs {
        // TODO Use NTP
        return new Date().getTime()
    }

    private defaultResponse(request: Request): Response {
        return {
            request,
            type: request.type,
            error: null,
            timestamp: this.getTimestamp(),
        }
    }

    public handleRequest(req: Request): Response {
        switch (req.type) {
            case MessageType.CREATE_PLAYER:
                return this.handleCreatePlayerRequest(req as CreatePlayerRequest)
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
        const map: GameMap = this.maps.get('demo_map')! // TODO
        // TODO notify all other players
        return {
            ...this.defaultResponse(req),
            player: {
                username: req.username,
                nick: req.username,
                entityId: `player_${req.username}`,
                charset: new Charset(MapServer.DefaultSpriteSheet),
                mapPosition: gridMapPos(map, 7, 4), // TODO
                speed: {x: 0, y: 0},
                facing: CardinalDirection.DOWN,
            }
        }
    }
}

import {Player} from "@/core/model/player";
import {MapEntity} from "@/core/model/map";
import {KeyBinding} from "@/core/model/input";


export interface ClientSocket {
    request(req: Request): Promise<Response>

    onMessage(callback: (message: Message) => void): void
}

export interface ServerSocket {
    // TODO broadcast to map only
    broadcast(msg: Message): void
}

export type Error = null | { code: string, message: string }

export type TimestampMs = number

export enum MessageType {
    UNDEFINED,
    CREATE_PLAYER,
    PLAYER_MOVEMENT,
    ENTITIES_UPDATE,
}

export interface Message {
    type: MessageType
    timestamp: TimestampMs
}

export interface Request extends Message {
    username: string
    timestamp: TimestampMs
}

export interface Response extends Message {
    timestamp: TimestampMs
    request: Request
    error: Error
}

export interface CreatePlayerRequest extends Request {
}

export interface CreatePlayerResponse extends Response {
    player?: Player
}

export interface PlayerMovementRequest extends Request {
    moveKeys: KeyBinding[]
}

export interface EntitiesUpdate extends Message {
    entities: MapEntity[]
}

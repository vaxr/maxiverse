import {Player} from "@/core/model/player";


export interface ClientSocket {
    request(req: Request): Promise<Response>
}

export type Error = null | { code: string, message: string }

export type TimestampMs = number

export enum MessageType {
    UNDEFINED,
    CREATE_PLAYER,
}

export interface Message {
    type: MessageType
    timestamp: TimestampMs
}

export interface Request extends Message {
    timestamp: TimestampMs
}

export interface Response extends Message {
    timestamp: TimestampMs
    request: Request
    error: Error
}

export interface CreatePlayerRequest extends Request {
    username: string
}

export interface CreatePlayerResponse extends Response {
    player?: Player
}

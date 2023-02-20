import {MapEntity} from "@/core/model/map";

export type Player = MapEntity & {
    username: string
    nick: string
}


export const PlayerWalkPxPerMs = 4 * 32 / 1000
export const PlayerRunPxPerMs = PlayerWalkPxPerMs * 2.5

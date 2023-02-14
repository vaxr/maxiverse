import {CardinalDirection, MapPosition, XY} from "@/core/model/map";
import {KeyBinding, KeyBindings} from "@/core/model/input";

export type Player = {
    username: string
    nick: string
    sprite: string
    mapPosition: MapPosition
    speed: XY
    facing: CardinalDirection
    moveKeys: KeyBindings
}

export const PlayerWalkPxPerMs = 4 * 32 / 1000
export const PlayerRunPxPerMs = PlayerWalkPxPerMs * 2.5

export const playerMoveKeysToXYSpeed = (intent: KeyBindings): XY => {
    const pxPerMs = intent.has(KeyBinding.RUN) ? PlayerRunPxPerMs : PlayerWalkPxPerMs
    const result = {x: 0, y: 0}
    if (intent.has(KeyBinding.DOWN)) {
        result.y += pxPerMs
    }
    if (intent.has(KeyBinding.UP)) {
        result.y -= pxPerMs
    }
    if (intent.has(KeyBinding.RIGHT)) {
        result.x += pxPerMs
    }
    if (intent.has(KeyBinding.LEFT)) {
        result.x -= pxPerMs
    }
    if (result.x != 0 && result.y != 0) {
        result.x *= Math.sqrt(0.5)
        result.y *= Math.sqrt(0.5)
    }
    return result
}

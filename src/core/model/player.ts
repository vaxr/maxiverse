import {CardinalDirection, getXYDir, MapPosition, XY} from "@/core/model/map";
import {KeyBinding, KeyBindings} from "@/core/model/input";

export type Player = {
    username: string
    nick: string
    spriteId: string
    charset: Charset
    mapPosition: MapPosition
    speed: XY
    facing: CardinalDirection
}

export type AnimType = 'idle' | 'walk'

export class Charset {
    sheetId: string
    sheetOffset: number = 0
    animType: AnimType = 'idle'
    direction: CardinalDirection = CardinalDirection.DOWN

    constructor(sheetId: string) {
        this.sheetId = sheetId;
    }

    public toString(): string {
        return `${this.sheetOffset}_${this.animType}-${this.direction}`
    }
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

export const getAnimForPlayer = (player: Player): string => {
    const anim = new Charset(player.charset.sheetId)
    anim.direction = getXYDir(player.speed) || player.facing || CardinalDirection.DOWN
    anim.animType = player.speed.x != 0 || player.speed.y != 0 ? 'walk' : 'idle'
    return anim.toString()
}

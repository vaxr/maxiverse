export enum CardinalDirection { UNDEFINED, UP, DOWN, LEFT, RIGHT }

export type XY = { x: number, y: number }

export type MapPosition = XY & { mapId: string }

export type GameMap = {
    id: string
    tileWidth: number
    tileHeight: number
    width: number
    height: number
    walkable: boolean[][]
}

export type MapEntity = {
    entityId: string
    charset: Charset
    mapPosition: MapPosition
    speed: XY
    facing: CardinalDirection
}


export type AnimType = 'idle' | 'walk'

export class Charset {
    sheetId: string
    sheetOffset
    animType: AnimType = 'idle'
    direction: CardinalDirection

    constructor(sheetId: string, sheetOffset = 0, direction = CardinalDirection.DOWN) {
        this.sheetId = sheetId
        this.sheetOffset = sheetOffset
        this.direction = direction
    }

    public toString(): string {
        return `${this.sheetOffset}_${this.animType}-${this.direction}`
    }
}

export function getXYDir(xy: XY): CardinalDirection | undefined {
    if (xy.x == 0 && xy.y == 0) return undefined
    if (Math.abs(xy.x) > Math.abs(xy.y)) {
        if (xy.x > 0) return CardinalDirection.RIGHT
        return CardinalDirection.LEFT
    }
    if (xy.y > 0) return CardinalDirection.DOWN
    return CardinalDirection.UP
}

export function gridMapPos(map: GameMap, x: number, y: number) {
    return {
        x: Math.round((x + 0.5) * map.tileWidth),
        y: Math.round((y - 0.2) * map.tileHeight),
        mapId: map.id
    }
}


export const getAnimForEntity = (ent: MapEntity): string => {
    const anim = new Charset(ent.charset.sheetId)
    anim.sheetOffset = ent.charset.sheetOffset
    anim.direction = getXYDir(ent.speed) || ent.facing || CardinalDirection.DOWN
    anim.animType = ent.speed.x != 0 || ent.speed.y != 0 ? 'walk' : 'idle'
    return anim.toString()
}

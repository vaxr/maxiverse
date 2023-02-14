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

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

export enum CardinalDirection { UNDEFINED, UP, DOWN, LEFT, RIGHT }

export type XY = { x: number, y: number }


export type Player = {
    username: string
    nick: string
    sprite: string
    position: XY
    speed: XY
    facing: CardinalDirection
}

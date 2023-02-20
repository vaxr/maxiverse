import {GameMap, getXYDir, MapEntity, XY} from "@/core/model/map";
import {KeyBinding, KeyBindings} from "@/core/model/input";
import {Player, PlayerRunPxPerMs, PlayerWalkPxPerMs} from "@/core/model/player";

export const updateEntityPosition = (map: GameMap, ent: MapEntity, deltaMs: number) => {
    const MAX_MS_PER_FRAME = 100
    while (deltaMs > MAX_MS_PER_FRAME) {
        updateEntityPosition(map, ent, MAX_MS_PER_FRAME)
        deltaMs -= MAX_MS_PER_FRAME
    }

    const th = map.tileHeight
    const tw = map.tileWidth
    const targetPx = {
        x: ent.mapPosition.x + ent.speed.x * deltaMs,
        y: ent.mapPosition.y + ent.speed.y * deltaMs,
    }
    const targetTile = {
        x: Math.floor(targetPx.x / tw),
        y: Math.floor(targetPx.y / th),
    }
    // TODO handle multiple tiles
    if (map.walkable![targetTile.y][targetTile.x]) {
        ent.mapPosition.x = targetPx.x
        ent.mapPosition.y = targetPx.y
        if (!map.walkable![targetTile.y][targetTile.x - 1]) {
            ent.mapPosition.x = Math.max(ent.mapPosition.x, targetTile.x * tw + 0.5 * tw)
        }
        if (!map.walkable![targetTile.y][targetTile.x + 1]) {
            ent.mapPosition.x = Math.min(ent.mapPosition.x, targetTile.x * tw + 0.5 * tw)
        }
        if (!map.walkable![targetTile.y - 1][targetTile.x]) {
            ent.mapPosition.y = Math.max(ent.mapPosition.y, targetTile.y * th + 0.25 * th)
        }
        if (!map.walkable![targetTile.y + 1][targetTile.x]) {
            ent.mapPosition.y = Math.min(ent.mapPosition.y, targetTile.y * th + 0.75 * th)
        }
    } else {
        // TODO walk closest possible
    }
}

export const updatePlayerIntent = (player: Player, intent: KeyBindings) => {
    player.speed = playerMoveKeysToXYSpeed(intent)
    player.facing = getXYDir(player.speed) || player.facing
}

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
